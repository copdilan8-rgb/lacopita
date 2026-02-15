'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { ClipboardList, AlertCircle } from "lucide-react";
import { verificarCajaOptimizado } from "@/utils/cajaCache";

/**
 * 🧃 Mapa de categorías -> {label, emoji, path}
 */
const CATEGORIES = [
  { id: 1, path: "batidos_M", label: "🥤 Batidos" },
  { id: 2, path: "cafeteria_M", label: "☕ Cafetería" },
  { id: 3, path: "comidas_M", label: "🍛 Comidas" },
  { id: 4, path: "helados_M", label: "🍦 Helados" },
  { id: 5, path: "refrescos_M", label: "🧋 Refrescos" },
  { id: 6, path: "reposteria_M", label: "🍰 Repostería" },
  { id: 7, path: "sandwichs_M", label: "🥙 Sándwichs" },
  { id: 8, path: "productos_M", label: "📦 Productos" },
  { id: 9, path: "promos_M", label: "🎉 Promos" },
];

function MenuContent() {
  const router = useRouter();
  const params = useSearchParams();
  const mesaParam = params.get("mesa");
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const pollingRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  useEffect(() => {
    // Verificar caja abierta (usa caché optimizado)
    const verificar = async () => {
      const cajaAbierta = await verificarCajaOptimizado();
      setCajaAbierta(cajaAbierta);
      setCargando(false);
    };

    // Verificación inicial
    verificar();

    // 🔄 POLLING AUTOMÁTICO CADA 3 SEGUNDOS
    pollingRef.current = setInterval(verificar, 3000);

    // 📡 BROADCAST CHANNEL para sincronización entre pestañas
    try {
      broadcastChannelRef.current = new BroadcastChannel("caja_estado");
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data.tipo === "caja_abierta" || event.data.tipo === "caja_cerrada") {
          console.log("📡 Cambio detectado en otra pestaña:", event.data.tipo);
          verificar();
        }
      };
    } catch (e) {
      console.warn("Broadcast Channel no disponible");
    }

    // Limpiar
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);

  const handleOpenCategory = (path) => {
    if (!mesaParam) {
      alert("⚠️ Debes seleccionar una mesa antes de continuar.");
      return;
    }
    if (!cajaAbierta) {
      alert("⚠️ La caja está cerrada. Debes abrir caja antes de continuar.");
      router.push("/caja");
      return;
    }
    router.push(`/N_Pedido/menu/${path}?mesa=${mesaParam}`);
  };

  const handleVerPedido = () => {
    if (!mesaParam) {
      alert("⚠️ Primero selecciona una mesa o el pedido a llevar.");
      return;
    }
    if (!cajaAbierta) {
      alert("⚠️ La caja está cerrada. Debes abrir caja antes de continuar.");
      router.push("/caja");
      return;
    }
    router.push(`/N_Pedido/detalle_p?mesa=${mesaParam}`);
  };

  // 🔥 FUNCIÓN DE REINICIO TOTAL
  const handleResetPedido = () => {
    // Eliminar pedido temporal
    sessionStorage.removeItem("pedidoActual");

    // (opcional) limpiar cualquier otro dato relacionado
    // sessionStorage.removeItem("mesaSeleccionada");

    // Redirigir como si fuera la primera vez
    router.push("/N_Pedido");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar perfilRoute="/PerfilSupervisor" />

      <main className="p-6 flex-1">
        {/* ⚠️ ALERTA SI CAJA NO ESTÁ ABIERTA */}
        {!cargando && !cajaAbierta && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800">Caja cerrada</p>
              <p className="text-sm text-red-700 mt-1">
                No puedes crear pedidos sin caja abierta
              </p>
              <Button
                onClick={() => router.push("/caja")}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white"
              >
                Ir a abrir caja
              </Button>
            </div>
          </div>
        )}

        {/* Encabezado */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Menú</h1>
            <p className="text-sm text-gray-500 mt-1">
              {mesaParam
                ? mesaParam === "llevar"
                  ? "Pedido para llevar"
                  : `Pedido para mesa ${mesaParam}`
                : "Seleccione una mesa antes de continuar."}
            </p>
          </div>
        </div>

        {/* 🧩 Cuadrícula de categorías */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 ${!cajaAbierta ? "opacity-50 pointer-events-none" : ""}`}>
          {CATEGORIES.map(({ id, path, label }) => {
            const disabled = !mesaParam || !cajaAbierta;
            const [emoji, ...textParts] = label.split(" ");
            const text = textParts.join(" ");

            return (
              <button
                key={id}
                onClick={() => handleOpenCategory(path)}
                disabled={disabled}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-sm transition-all
                  ${
                    disabled
                      ? "bg-gray-100 cursor-not-allowed opacity-60"
                      : "bg-white hover:shadow-lg hover:-translate-y-1"
                  }
                `}
              >
                <span className="text-5xl">{emoji}</span>
                <span className="text-sm font-medium text-gray-800">{text}</span>
                {disabled && (
                  <span className="text-xs text-gray-400 mt-1">
                    Seleccione mesa primero
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 🛒 Botones inferiores */}
        <div className="mt-10 flex justify-center gap-4">
          {/* 🔥 BOTÓN CON REINICIO */}
          <Button
            onClick={handleResetPedido}
            className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            ← Volver a mesas
          </Button>

          <Button
            onClick={handleVerPedido}
            className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <ClipboardList size={18} />
            Ver pedido actual
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function MenuPage() {
  return <MenuContent />;
}
