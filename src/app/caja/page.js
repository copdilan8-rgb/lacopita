"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { History, Lock, Unlock } from "lucide-react";
import BotonVolver from "@/components/BotonVolver";

export default function CajaPage() {
  const router = useRouter();
  const [usuarioId, setUsuarioId] = useState(null);
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const idDelSessionStorage = sessionStorage.getItem("idUsuario");
    if (idDelSessionStorage) {
      setUsuarioId(Number(idDelSessionStorage));
      verificarCaja(Number(idDelSessionStorage));
    } else {
      router.push("/login");
    }
  }, [router]);

  const verificarCaja = async (userId) => {
    try {
      const res = await fetch(`/api/caja/obtener-actual?usuario_id=${userId}`);
      const data = await res.json();
      setCajaAbierta(data.caja && data.caja.estado === "abierta");
    } catch (error) {
      console.error("Error verificando caja:", error);
      setCajaAbierta(false);
    } finally {
      setCargando(false);
    }
  };

  const irApertura = () => router.push("/caja/apertura");
  const irCierre = () => router.push("/caja/cierre");
  const irHistorial = () => router.push("/caja/historial");

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">⏳ Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar perfilRoute="/PerfilSupervisor" />
      
      <div className="flex justify-end px-6 pt-4">
        <BotonVolver />
      </div>

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-6">
          {/* Estado actual */}
          {cajaAbierta ? (
            <Button
              onClick={irApertura}
              className="w-full p-6 rounded-2xl text-center bg-green-100 border-2 border-green-500 hover:bg-green-200 text-white"
            >
              <div className="flex items-center justify-center gap-3">
                <Unlock className="w-6 h-6 text-green-600" />
                <p className="text-lg font-bold text-green-700">Caja Abierta</p>
              </div>
            </Button>
          ) : (
            <div className={`p-6 rounded-2xl text-center bg-red-100 border-2 border-red-500`}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <Lock className="w-6 h-6 text-red-600" />
                <p className="text-lg font-bold text-red-700">Caja Cerrada</p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="grid grid-cols-1 gap-4">
            {!cajaAbierta ? (
              <Button
                onClick={irApertura}
                className="h-16 text-lg font-semibold bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl shadow-lg"
              >
                <Unlock className="w-5 h-5 mr-2" />
                Abrir Caja
              </Button>
            ) : (
              <Button
                onClick={irCierre}
                className="h-16 text-lg font-semibold bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500 text-white rounded-xl shadow-lg"
              >
                <Lock className="w-5 h-5 mr-2" />
                Cerrar Caja
              </Button>
            )}

            <Button
              onClick={irHistorial}
              className="h-16 text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl shadow-lg"
            >
              <History className="w-5 h-5 mr-2" />
              Ver Historial
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
