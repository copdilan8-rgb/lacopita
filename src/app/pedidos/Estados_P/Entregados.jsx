"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, Eye, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import PedidoDetalleModal from "./PedidoDetalleModal";

export default function Entregados() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoACobrar, setPedidoACobrar] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);

  /* 🔔 Mostrar notificación */
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  /* 🔄 Cargar pedidos entregados */
  const fetchPedidos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        id,
        tipo,
        mesa_numero,
        monto_total,
        entregado_en
      `)
      .eq("estado", "entregado")
      .order("entregado_en", { ascending: true });

    if (error) {
      console.error("Error al cargar pedidos:", error);
      mostrarNotificacion("Error al cargar pedidos", "error");
    } else {
      setPedidos(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  /* 💰 Confirmar pago */
  const confirmarPago = async (metodo) => {
    if (!pedidoACobrar) return;

    const { error } = await supabase
      .from("pedidos")
      .update({
        estado: "cancelado",
        metodo_pago: metodo,
        cancelado_en: new Date(),
      })
      .eq("id", pedidoACobrar.id);

    if (error) {
      console.error("Error al confirmar pago:", error.message || error);
      mostrarNotificacion("Error al confirmar pago", "error");
      return;
    }

    mostrarNotificacion(`Pago confirmado por ${metodo === "efectivo" ? "Efectivo" : "QR"}`, "success");
    setPedidoACobrar(null);
    fetchPedidos();
  };

  /* 🗑️ Eliminar pedido */
  const eliminarPedido = async () => {
    if (!pedidoAEliminar) return;

    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("id", pedidoAEliminar.id);

    if (error) {
      console.error("Error al eliminar pedido:", error.message || error);
      mostrarNotificacion("Error al eliminar pedido", "error");
      return;
    }

    mostrarNotificacion("Pedido eliminado correctamente", "success");
    setPedidoAEliminar(null);
    fetchPedidos();
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10">
        ⏳ Cargando pedidos entregados...
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        📭 No hay pedidos entregados
      </div>
    );
  }

  return (
    <>
      {/* 🔔 NOTIFICACIÓN TOAST */}
      {notificacion && (
        <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          notificacion.tipo === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}>
          {notificacion.tipo === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{notificacion.mensaje}</span>
        </div>
      )}

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            {/* 📄 INFO */}
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
                Entregado:{" "}
                {new Date(pedido.entregado_en).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <p className="mt-1 font-semibold text-orange-700">
                Total: Bs. {Number(pedido.monto_total).toFixed(2)}
              </p>
            </div>

            {/* 🔘 ACCIONES */}
            <div className="flex gap-2">
              <Button
                onClick={() => setPedidoSeleccionado(pedido.id)}
                className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Eye size={18} />
                Ver detalle
              </Button>

              <Button
                onClick={() => setPedidoACobrar(pedido)}
                className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Cobrar
              </Button>

              <Button
                onClick={() => setPedidoAEliminar(pedido)}
                className="bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔍 MODAL DETALLE */}
      {pedidoSeleccionado && (
        <PedidoDetalleModal
          pedidoId={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}

      {/* 💳 MODAL COBRO */}
      {pedidoACobrar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-[360px]">
            <h3 className="font-semibold text-lg mb-2">
              Cobrar pedido #{pedidoACobrar.id}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Total a pagar:{" "}
              <span className="font-semibold text-orange-700">
                Bs. {Number(pedidoACobrar.monto_total).toFixed(2)}
              </span>
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => confirmarPago("efectivo")}
                className="w-full flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Banknote size={18} />
                Efectivo
              </Button>

              <Button
                onClick={() => confirmarPago("qr")}
                className="w-full flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <CreditCard size={18} />
                QR
              </Button>

              <Button
                onClick={() => setPedidoACobrar(null)}
                className="w-full bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-slate-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      {pedidoAEliminar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-[360px]">
            <h3 className="font-semibold text-lg mb-2 text-red-600">
              ⚠️ Eliminar pedido #{pedidoAEliminar.id}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.
            </p>

            <p className="text-sm text-gray-700 mb-4">
              <span className="font-semibold">Monto:</span> Bs. {Number(pedidoAEliminar.monto_total).toFixed(2)}
            </p>

            <div className="space-y-3">
              <Button
                onClick={eliminarPedido}
                className="w-full flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Trash2 size={18} />
                Sí, eliminar pedido
              </Button>

              <Button
                onClick={() => setPedidoACobrar(null)}
                className="w-full bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-slate-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >Elimin
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
