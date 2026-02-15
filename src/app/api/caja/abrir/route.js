import supabase from "@/utils/supabase/client";

export async function POST(request) {
  try {
    const { usuario_id, monto_inicial_efectivo } = await request.json();

    // Validaciones
    if (!usuario_id) {
      return Response.json(
        { error: "usuario_id es requerido" },
        { status: 400 }
      );
    }

    if (monto_inicial_efectivo === undefined || monto_inicial_efectivo < 0) {
      return Response.json(
        { error: "monto_inicial_efectivo debe ser un número >= 0" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya tiene una caja abierta
    const { data: cajaAbierta, error: errorVerify } = await supabase
      .from("caja_sesiones")
      .select("id")
      .eq("abierta_por", usuario_id)
      .eq("estado", "abierta")
      .single();

    if (cajaAbierta) {
      return Response.json(
        {
          error: "El usuario ya tiene una caja abierta",
          caja_id: cajaAbierta.id,
        },
        { status: 409 }
      );
    }

    // Crear nueva sesión de caja
    const { data: nuevaCaja, error: errorInsert } = await supabase
      .from("caja_sesiones")
      .insert({
        abierta_por: usuario_id,
        monto_inicial_efectivo: monto_inicial_efectivo,
        estado: "abierta",
      })
      .select()
      .single();

    if (errorInsert) {
      console.error("Error al abrir caja:", errorInsert);
      return Response.json(
        { error: "Error al abrir la caja" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      caja: nuevaCaja,
      mensaje: "Caja abierta exitosamente",
    });
  } catch (error) {
    console.error("Error en POST /api/caja/abrir:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
