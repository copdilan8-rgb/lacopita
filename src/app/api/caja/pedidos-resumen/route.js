import supabase from "@/utils/supabase/client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const caja_id = searchParams.get("caja_id");

    if (!caja_id) {
      return Response.json(
        { error: "caja_id es requerido" },
        { status: 400 }
      );
    }

    // Obtener todos los pedidos cancelados sin caja_id
    const { data: pedidos, error: errorPedidos } = await supabase
      .from("pedidos")
      .select(
        `
        id,
        monto_total,
        metodo_pago,
        mesa_numero,
        tipo,
        creado_en,
        detalle_pedido(
          id,
          categoria,
          cantidad,
          precio_unitario,
          subtotal,
          nota
        )
      `
      )
      .eq("estado", "cancelado")
      .is("caja_id", null)
      .order("creado_en", { ascending: false });

    if (errorPedidos) {
      console.error("Error al obtener pedidos:", errorPedidos);
      return Response.json(
        { error: "Error al obtener pedidos" },
        { status: 500 }
      );
    }

    // Calcular totales
    let total_efectivo = 0;
    let total_qr = 0;
    let cantidad_pedidos = 0;

    for (const pedido of pedidos) {
      cantidad_pedidos++;
      if (pedido.metodo_pago === "efectivo") {
        total_efectivo += parseFloat(pedido.monto_total || 0);
      } else if (pedido.metodo_pago === "qr") {
        total_qr += parseFloat(pedido.monto_total || 0);
      }
    }

    return Response.json({
      success: true,
      pedidos: pedidos,
      resumen: {
        cantidad_pedidos: cantidad_pedidos,
        total_efectivo: total_efectivo,
        total_qr: total_qr,
        total_general: total_efectivo + total_qr,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/caja/pedidos-resumen:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
