"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, History } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatearFechaLocal } from "@/utils/dateTimeUtils";
import BotonVolver from "@/components/BotonVolver";
import { notificarCajaAbierta } from "@/utils/cajaCache";

export default function AperturaCajaPage() {
  const [montoInicial, setMontoInicial] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });
  const [cajaActiva, setCajaActiva] = useState(null);
  const router = useRouter();

  // Obtener usuario del sessionStorage
  useEffect(() => {
    const idDelSessionStorage = sessionStorage.getItem("idUsuario");
    if (idDelSessionStorage) {
      setUsuarioId(Number(idDelSessionStorage));
      verificarCajaActiva(Number(idDelSessionStorage));
    } else {
      router.push("/login");
    }
  }, [router]);

  // Verificar si ya hay caja abierta
  const verificarCajaActiva = async (userId) => {
    try {
      const response = await fetch(
        `/api/caja/obtener-actual?usuario_id=${userId}`
      );
      const data = await response.json();

      if (data.caja) {
        setCajaActiva(data.caja);
        setMensaje({
          tipo: "info",
          texto: `Caja abierta desde: ${new Date(
            data.caja.fecha_apertura
          ).toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })} con monto inicial: $${data.caja.monto_inicial_efectivo}`,
        });
      }
    } catch (error) {
      console.error("Error verificando caja activa:", error);
    }
  };

  // Abrir caja
  const handleAbrirCaja = async (e) => {
    e.preventDefault();

    if (!montoInicial || isNaN(montoInicial) || Number(montoInicial) < 0) {
      setMensaje({
        tipo: "error",
        texto: "Ingresa un monto válido",
      });
      return;
    }

    setCargando(true);
    setMensaje({ tipo: null, texto: "" });

    try {
      const response = await fetch("/api/caja/abrir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioId,
          monto_inicial_efectivo: Number(montoInicial),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMensaje({
          tipo: "exito",
          texto: data.mensaje,
        });
        setCajaActiva(data.caja);
        setMontoInicial("");

        // Guardar caja_id en sessionStorage
        sessionStorage.setItem("caja_id", data.caja.id);

        // 📡 NOTIFICAR A OTROS USUARIOS (Broadcast Channel)
        notificarCajaAbierta();
        console.log("✅ Caja abierta! Notificando a otras pestañas...");

        // Redirigir a cierre después de 2 segundos
        setTimeout(() => {
          router.push("/caja/cierre");
        }, 2000);
      } else {
        setMensaje({
          tipo: "error",
          texto: data.error || "Error al abrir la caja",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al conectar con el servidor",
      });
    } finally {
      setCargando(false);
    }
  };

  // Navegar a cierre si ya hay caja
  const handleIrACierre = () => {
    if (cajaActiva) {
      sessionStorage.setItem("caja_id", cajaActiva.id);
      router.push("/caja/cierre");
    }
  };

  const handleIrAlHistorial = () => {
    router.push("/caja/historial");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar perfilRoute="/PerfilSupervisor" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BotonVolver />
        </div>

        <div className="max-w-md mx-auto">
          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Apertura de Caja</h1>
            <p className="text-slate-600 mt-2">Ingresa el monto inicial de efectivo</p>
          </div>

          {/* Alertas */}
          {mensaje.texto && (
            <Alert
              className={`mb-6 ${
                mensaje.tipo === "exito"
                  ? "border-green-300 bg-green-50"
                  : mensaje.tipo === "error"
                  ? "border-red-300 bg-red-50"
                  : "border-blue-300 bg-blue-50"
              }`}
            >
              {mensaje.tipo === "exito" && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              {mensaje.tipo === "error" && (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  mensaje.tipo === "exito"
                    ? "text-green-800"
                    : mensaje.tipo === "error"
                    ? "text-red-800"
                    : "text-blue-800"
                }
              >
                {mensaje.texto}
              </AlertDescription>
            </Alert>
          )}

          {/* Card - Estado de caja */}
          {cajaActiva && (
            <Card className="p-6 mb-6 border-2 border-green-300 bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Caja Abierta</h3>
              </div>
              <div className="space-y-2 text-sm text-green-800">
                <p>
                  <span className="font-semibold">ID:</span> {cajaActiva.id}
                </p>
                <p>
                  <span className="font-semibold">Monto Inicial:</span> $
                  {cajaActiva.monto_inicial_efectivo}
                </p>
                <p>
                  <span className="font-semibold">Abierta a las:</span>{" "}
                  {formatearFechaLocal(cajaActiva.fecha_apertura, "solo-hora")}
                </p>
              </div>
            </Card>
          )}

          {/* Formulario - Solo si NO hay caja abierta */}
          {!cajaActiva ? (
            <Card className="p-6">
              <form onSubmit={handleAbrirCaja} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Monto Inicial de Efectivo
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={montoInicial}
                    onChange={(e) => setMontoInicial(e.target.value)}
                    placeholder="0.00"
                    className="text-lg"
                    disabled={cargando}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={cargando || !montoInicial}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? "Abriendo..." : "Abrir Caja"}
                </Button>
              </form>
            </Card>
          ) : (
            <>
              <Button
                onClick={handleIrACierre}
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mb-3"
              >
                Ir al Cierre de Caja
              </Button>
              
              <Button
                onClick={handleIrAlHistorial}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <History className="w-4 h-4 mr-2" />
                Ver Historial
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
