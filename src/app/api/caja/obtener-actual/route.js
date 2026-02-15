import supabase from "@/utils/supabase/client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get("usuario_id");

    if (!usuario_id) {
      return Response.json(
        { error: "usuario_id es requerido" },
        { status: 400 }
      );
    }

    // Obtener cualquier caja abierta en el sistema (no solo la del usuario actual)
    // Esto permite que múltiples usuarios realicen pedidos si alguno abrió caja
    const { data: caja, error } = await supabase
      .from("caja_sesiones")
      .select("*")
      .eq("estado", "abierta")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 es "no rows found", que es normal
      console.error("Error al obtener caja:", error);
      return Response.json(
        { error: "Error al obtener caja" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      caja: caja || null,
    });
  } catch (error) {
    console.error("Error en GET /api/caja/obtener-actual:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
