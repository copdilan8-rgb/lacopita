"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase/client";
import { Eye, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PedidoDetalleModal from "./PedidoDetalleModal";
import { formatearFechaLocal } from "@/utils/dateTimeUtils";
import { registrarEventoLocal } from "@/utils/controlAuditoria";

export default function Pagados() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroPago, setFiltroPago] = useState("todos");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [notificacion, setNotificacion] = useState(null);

  /* 🔔 Mostrar notificación */
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  /* 📅 Registrar acceso a la página */
  useEffect(() => {
    // Registrar acceso a esta página
    registrarEventoLocal(
      "ACCESO_PAGINA",
      "usuario",
      "Accedió a sección de Pedidos Pagados",
      "exitoso"
    );
    // Sin intervalo - panel de reloj removido
  }, []);

  /* 🔄 Cargar pedidos pagados */
  const fetchPedidos = async () => {
    setLoading(true);

    let query = supabase
      .from("pedidos")
      .select(`
        id,
        tipo,
        mesa_numero,
        monto_total,
        metodo_pago,
        cancelado_en
      `)
      .eq("estado", "cancelado")
      .is("caja_id", null)
      .order("cancelado_en", { ascending: false });

    if (filtroPago !== "todos") {
      query = query.eq("metodo_pago", filtroPago);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error cargando pedidos pagados:", error);
      mostrarNotificacion("Error al cargar pedidos pagados", "error");
      
      // Registrar el error
      registrarEventoLocal(
        "ERROR_CARGA",
        "usuario",
        `Error al cargar pedidos: ${error.message}`,
        "error"
      );
    } else {
      setPedidos(data || []);
      
      // Registrar carga exitosa
      registrarEventoLocal(
        "CARGA_PEDIDOS",
        "usuario",
        `Se cargaron ${data?.length || 0} pedidos pagados`,
        "exitoso"
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPedidos();
  }, [filtroPago]);

  /* 💰 Total recaudado */
  const totalRecaudado = pedidos.reduce(
    (acc, p) => acc + Number(p.monto_total),
    0
  );

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10">
        ⏳ Cargando pedidos pagados...
      </div>
    );
  }

  return (
    <>
      {/* 🔔 NOTIFICACIÓN TOAST */}
      {notificacion && (
        <div
          className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            notificacion.tipo === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notificacion.tipo === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{notificacion.mensaje}</span>
        </div>
      )}

      {/* 🔍 FILTROS */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <select
          value={filtroPago}
          onChange={(e) => setFiltroPago(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="efectivo">Efectivo</option>
          <option value="qr">QR</option>
        </select>

        <div className="ml-auto font-semibold text-green-700">
          Total: Bs. {totalRecaudado.toFixed(2)}
        </div>
      </div>

      {/* 📋 LISTADO */}
      {pedidos.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          📭 No hay pedidos pagados
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="border rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between gap-3"
            >
              {/* INFO */}
              <div>
                <h3 className="font-semibold text-gray-800">
                  Pedido #{pedido.id}
                </h3>

                <p className="text-sm text-gray-600">
                  {pedido.tipo === "llevar"
                    ? "🥡 Para llevar"
                    : `🍽 Mesa ${pedido.mesa_numero}`}
                </p>

                <p className="text-xs text-gray-500">
                  Pagado: {formatearFechaLocal(pedido.cancelado_en, "corto")}
                </p>
              </div>

              {/* MONTO + ACCIONES */}
              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-semibold text-orange-700">
                  Bs. {Number(pedido.monto_total).toFixed(2)}
                </p>

                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    pedido.metodo_pago === "efectivo"
                      ? "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {pedido.metodo_pago.toUpperCase()}
                </span>

                <Button
                  variant="outline"
                  onClick={() => setPedidoSeleccionado(pedido.id)}
                  className="flex items-center gap-2 mt-2"
                >
                  <Eye size={16} />
                  Ver detalle
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/*  MODAL DE DETALLE */}
      {pedidoSeleccionado && (
        <PedidoDetalleModal
          pedidoId={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </>
  );
}
