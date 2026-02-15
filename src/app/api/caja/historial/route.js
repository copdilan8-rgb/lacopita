import supabase from "@/utils/supabase/client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || 10;
    const offset = searchParams.get("offset") || 0;

    // Obtener cajas cerradas
    const { data: cajas, error, count } = await supabase
      .from("caja_sesiones")
      .select("*", { count: "exact" })
      .eq("estado", "cerrada")
      .order("fecha_cierre", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error al obtener cajas cerradas:", error);
      return Response.json(
        { error: "Error al obtener cajas" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      cajas: cajas,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error en GET /api/caja/historial:", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
