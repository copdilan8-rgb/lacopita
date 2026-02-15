"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import { UtensilsCrossed, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BotonVolver from "@/components/BotonVolver";
import { verificarCajaOptimizado } from "@/utils/cajaCache";

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const pollingRef = useRef(null); // Para el polling automático
  const broadcastChannelRef = useRef(null); // Para Broadcast Channel

  useEffect(() => {
    const verificar = async () => {
      const cajaAbierta = await verificarCajaOptimizado();
      setCajaAbierta(cajaAbierta);
      setCargando(false);
    };

    // Verificación inicial
    verificar();

    // 🔄 POLLING AUTOMÁTICO CADA 3 SEGUNDOS (muy rápido)
    pollingRef.current = setInterval(verificar, 3000);

    // 📡 BROADCAST CHANNEL para sincronización entre pestañas
    try {
      broadcastChannelRef.current = new BroadcastChannel("caja_estado");
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data.tipo === "caja_abierta" || event.data.tipo === "caja_cerrada") {
          // Revalidar inmediatamente cuando otra pestaña abre/cierra caja
          console.log("📡 Cambio detectado en otra pestaña:", event.data.tipo);
          verificar();
        }
      };
    } catch (e) {
      console.warn("Broadcast Channel no disponible");
    }

    // Verificar cuando vuelves a la pestaña (focus)
    const handleFocus = () => {
      console.log("🔍 Pestaña enfocada, verificando caja...");
      verificar();
    };
    window.addEventListener("focus", handleFocus);

    // Limpiar
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleSelectMesa = (mesa) => {
    if (!cajaAbierta) {
      alert("⚠️ Debes abrir caja antes de crear un pedido");
      router.push("/caja");
      return;
    }
    router.push(`/N_Pedido/menu?mesa=${mesa}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🧭 NAVBAR */}
      <Navbar perfilRoute="/PerfilSupervisor" />

      {/* 🔙 BOTÓN INICIO */}
      <div className="flex justify-end px-6 pt-4">
        <BotonVolver />
      </div>

      {/* ⚠️ ALERTA SI CAJA NO ESTÁ ABIERTA */}
      {!cargando && !cajaAbierta && (
        <div className="mx-6 mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Caja cerrada</p>
            <p className="text-sm text-red-700 mt-1">
              Debes abrir caja antes de crear un pedido
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

      {/* 📦 CONTENIDO PRINCIPAL */}
      <main className="flex flex-col flex-1 p-6 gap-8">
        {/* 🟦 SECCIÓN MESAS */}
        <section className={`bg-white rounded-3xl shadow-md p-6 flex flex-col ${!cajaAbierta ? "opacity-50 pointer-events-none" : ""}`}>
          {/* Encabezado */}
          <div className="flex items-center gap-3 mb-6">
            <UtensilsCrossed className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Selecciona una mesa
            </h2>
          </div>

          {/* GRID de mesas */}
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-6 flex-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((mesa) => (
              <motion.button
                key={mesa}
                whileHover={{ scale: cajaAbierta ? 1.05 : 1 }}
                whileTap={{ scale: cajaAbierta ? 0.97 : 1 }}
                onClick={() => handleSelectMesa(mesa)}
                disabled={!cajaAbierta}
                className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm hover:shadow-lg p-5 flex flex-col items-center justify-center transition-all ${
                  !cajaAbierta ? "cursor-not-allowed" : ""
                }`}
              >
                <span className="text-5xl mb-2">🍽️</span>
                <span className="text-lg font-semibold text-gray-800">
                  Mesa {mesa}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* 🟨 SECCIÓN PARA LLEVAR */}
        <section className={`bg-white rounded-3xl shadow-md p-6 flex flex-col items-center justify-center text-center ${!cajaAbierta ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-7 h-7 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Otras opciones
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: cajaAbierta ? 1.05 : 1 }}
            whileTap={{ scale: cajaAbierta ? 0.97 : 1 }}
            onClick={() => handleSelectMesa("llevar")}
            disabled={!cajaAbierta}
            className={`flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm hover:shadow-lg p-8 w-full sm:w-1/2 transition-all ${
              !cajaAbierta ? "cursor-not-allowed" : ""
            }`}
          >
            <span className="text-5xl mb-2">🥡</span>
            <span className="text-lg font-semibold text-gray-800">
              Para llevar
            </span>
          </motion.button>
        </section>
      </main>
    </div>
  );
}
