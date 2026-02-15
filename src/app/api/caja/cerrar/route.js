import supabase from "@/utils/supabase/client";

export async function POST(request) {
  try {
    const { caja_id, usuario_id_cierre, observaciones, m_descuento } = await request.json();

    // Validaciones
    if (!caja_id || !usuario_id_cierre) {
      return Response.json(
        { error: "caja_id y usuario_id_cierre son requeridos" },
        { status: 400 }
      );
    }

    // Obtener la caja a cerrar
    const { data: caja, error: errorCaja } = await supabase
      .from("caja_sesiones")
      .select("*")
      .eq("id", caja_id)
      .eq("estado", "abierta")
      .single();

    if (errorCaja || !caja) {
      return Response.json(
        { error: "Caja no encontrada o ya está cerrada. Otro usuario puede estar cerrando la caja ahora." },
        { status: 404 }
      );
    }

    // Obtener todos los pedidos cancelados sin caja_id asignado
    const { data: pedidosCancelados, error: errorPedidos } = await supabase
      .from("pedidos")
      .select("id, monto_total, metodo_pago")
      .eq("estado", "cancelado")
      .is("caja_id", null);

    if (errorPedidos) {
      console.error("Error al obtener pedidos:", errorPedidos);
      return Response.json(
        { error: "Error al obtener pedidos" },
        { status: 500 }
      );
    }

    // Calcular totales
    let monto_final_efectivo = caja.monto_inicial_efectivo || 0;
    let monto_final_qr = 0;
    let sumatoria_dia_efectivo = 0; // Solo los pedidos en efectivo del día (sin monto inicial)

    // Separar por método de pago y sumar
    for (const pedido of pedidosCancelados) {
      if (pedido.metodo_pago === "efectivo") {
        monto_final_efectivo += pedido.monto_total;
        sumatoria_dia_efectivo += pedido.monto_total; // Suma de pedidos en efectivo
      } else if (pedido.metodo_pago === "qr") {
        monto_final_qr += pedido.monto_total;
      }
    }

    // Calcular monto neto si hay descuento
    const montoDescuentoIngresado = m_descuento ? Number(m_descuento) : 0;
    const montoNeto = monto_final_efectivo - montoDescuentoIngresado;

    // Actualizar pedidos para asignarles la caja
    const { error: errorUpdatePedidos } = await supabase
      .from("pedidos")
      .update({ caja_id: caja_id })
      .eq("estado", "cancelado")
      .is("caja_id", null);

    if (errorUpdatePedidos) {
      console.error("Error al actualizar pedidos:", errorUpdatePedidos);
      return Response.json(
        { error: "Error al actualizar pedidos" },
        { status: 500 }
      );
    }

    // Cerrar la caja
    const { data: cajaCerrada, error: errorCierre } = await supabase
      .from("caja_sesiones")
      .update({
        cerrada_por: usuario_id_cierre,
        fecha_cierre: new Date().toISOString(),
        monto_final_efectivo: monto_final_efectivo,
        monto_final_qr: monto_final_qr,
        sm_dia: sumatoria_dia_efectivo, // Sumatoria de pedidos en efectivo del día
        estado: "cerrada",
        observaciones: observaciones,
        m_descuento: montoNeto,
      })
      .eq("id", caja_id)
      .select()
      .single();

    if (errorCierre) {
      console.error("Error al cerrar caja:", errorCierre);
      return Response.json(
        { error: "Error al cerrar la caja" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      caja: cajaCerrada,
      pedidos_procesados: pedidosCancelados.length,
      resumen: {
        monto_inicial: caja.monto_inicial_efectivo,
        monto_final_efectivo: monto_final_efectivo,
        monto_final_qr: monto_final_qr,
        total_general: monto_final_efectivo + monto_final_qr,
        sumatoria_dia_efectivo: sumatoria_dia_efectivo, // Suma de pedidos en efectivo
      },
      mensaje: `Caja cerrada exitosamente. ${pedidosCancelados.length} pedidos procesados.`,
    });
  } catch (error) {
    console.error("Error en POST /api/caja/cerrar:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
