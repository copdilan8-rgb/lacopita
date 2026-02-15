import supabase from "@/utils/supabase/client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || 10;
    const offset = searchParams.get("offset") || 0;
    const fecha = searchParams.get("fecha"); // formato: YYYY-MM-DD

    // Obtener cajas cerradas con información de usuarios
    let query = supabase
      .from("caja_sesiones")
      .select(
        `
        id,
        fecha_apertura,
        fecha_cierre,
        monto_inicial_efectivo,
        monto_final_efectivo,
        monto_final_qr,
        sm_dia,
        m_descuento,
        total_v,
        observaciones,
        abierta_por,
        cerrada_por
      `
      )
      .eq("estado", "cerrada")
      .order("fecha_cierre", { ascending: false });

    if (fecha) {
      // Filtrar por fecha (solo el día)
      const fechaInicio = `${fecha}T00:00:00`;
      const fechaFin = `${fecha}T23:59:59`;

      query = query
        .gte("fecha_cierre", fechaInicio)
        .lte("fecha_cierre", fechaFin);
    }

    const { data: cajas, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error al obtener cajas:", error);
      return Response.json(
        { error: "Error al obtener cajas" },
        { status: 500 }
      );
    }

    // Obtener información de usuarios y pedidos para cada caja
    const cajasConDetalle = await Promise.all(
      cajas.map(async (caja) => {
        // Obtener nombre del usuario que abrió
        const { data: usuarioAbre } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", caja.abierta_por)
          .single();

        // Obtener nombre del usuario que cerró
        const { data: usuarioCierra } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", caja.cerrada_por)
          .single();

        // Obtener pedidos de esta caja
        const { data: pedidos } = await supabase
          .from("pedidos")
          .select(
            `
            id,
            monto_total,
            metodo_pago,
            mesa_numero,
            tipo,
            creado_en,
            cancelado_en
          `
          )
          .eq("caja_id", caja.id)
          .order("creado_en", { ascending: true });

        // Calcular estadísticas
        const pedidosEfectivo = (pedidos || []).filter(
          (p) => p.metodo_pago === "efectivo"
        ).length;
        const pedidosQR = (pedidos || []).filter(
          (p) => p.metodo_pago === "qr"
        ).length;

        return {
          id: caja.id,
          fechaApertura: caja.fecha_apertura,
          fechaCierre: caja.fecha_cierre,
          abiertaPor: usuarioAbre?.nombre || "Usuario desconocido",
          cerradaPor: usuarioCierra?.nombre || "Usuario desconocido",
          montoInicial: caja.monto_inicial_efectivo,
          montoFinalEfectivo: caja.monto_final_efectivo,
          montoFinalQR: caja.monto_final_qr,
          sumatoriaEfectivoDia: caja.sm_dia || 0, // Sumatoria de pedidos en efectivo del día
          montoDescuento: caja.m_descuento,
          totalVentas: caja.total_v || 0, // Total de ventas desde la BD (sm_dia + monto_final_qr)
          totalGeneral: caja.total_v || 0, // Para compatibilidad hacia atrás
          pedidosEfectivo: pedidosEfectivo,
          pedidosQR: pedidosQR,
          totalPedidos: (pedidos || []).length,
          pedidos: pedidos || [],
          observaciones: caja.observaciones,
        };
      })
    );

    return Response.json({
      success: true,
      cajas: cajasConDetalle,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error en GET /api/caja/historial-detallado:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
