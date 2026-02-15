"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye } from "lucide-react";
import PedidoDetalleModal from "./PedidoDetalleModal";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EnCurso() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [pedidoAConfirmar, setPedidoAConfirmar] = useState(null);

  // 🔔 Notificación visual
  const [mensaje, setMensaje] = useState(null);

  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  /* 🔄 Cargar pedidos en curso */
  const fetchPedidos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        id,
        tipo,
        mesa_numero,
        monto_total,
        creado_en
      `)
      .eq("estado", "en_curso")
      .order("creado_en", { ascending: true });

    if (error) {
      console.error(error);
      mostrarMensaje("No se pudieron cargar los pedidos.", "error");
    } else {
      setPedidos(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  /* ✅ Confirmar pedido entregado */
  const confirmarEntregado = async () => {
    if (!pedidoAConfirmar) return;

    const { error } = await supabase
      .from("pedidos")
      .update({
        estado: "entregado",
        entregado_en: new Date(),
      })
      .eq("id", pedidoAConfirmar);

    if (error) {
      console.error(error);
      mostrarMensaje("Error al marcar el pedido como entregado.", "error");
    } else {
      mostrarMensaje("Pedido marcado como entregado.");
      fetchPedidos();
    }

    setPedidoAConfirmar(null);
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10">
        ⏳ Cargando pedidos en curso...
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        ✅ No hay pedidos en curso
      </div>
    );
  }

  return (
    <>
      {/* 🔔 NOTIFICACIÓN */}
      {mensaje && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
            mensaje.tipo === "error"
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-green-100 text-green-700 border border-green-200"
          }`}
        >
          {mensaje.texto}
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
                Creado:{" "}
                {new Date(pedido.creado_en).toLocaleTimeString("es-ES", {
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
                onClick={() => setPedidoAConfirmar(pedido.id)}
                className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Marcar entregado
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

      {/* ✅ CONFIRMACIÓN */}
      <AlertDialog
        open={!!pedidoAConfirmar}
        onOpenChange={() => setPedidoAConfirmar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Marcar pedido como entregado?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción indicará que el pedido ya fue entregado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarEntregado}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
