"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, DollarSign, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ModalPago({
  pedidoId,
  monto,
  onClose,
  onPagoConfirmado,
}) {
  const [metodoPago, setMetodoPago] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });

  const handleConfirmarPago = async () => {
    if (!metodoPago) {
      setMensaje({
        tipo: "error",
        texto: "Selecciona un método de pago",
      });
      return;
    }

    setCargando(true);
    setMensaje({ tipo: null, texto: "" });

    try {
      const response = await fetch("/api/pedidos/marcar-pagado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedido_id: pedidoId,
          metodo_pago: metodoPago,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMensaje({
          tipo: "exito",
          texto: data.mensaje,
        });

        // Llamar callback después de 1 segundo
        setTimeout(() => {
          onPagoConfirmado(data.pedido);
          onClose();
        }, 1000);
      } else {
        setMensaje({
          tipo: "error",
          texto: data.error || "Error al procesar el pago",
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          Confirmar Pago
        </h3>

        {/* Monto */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-6 border border-blue-300">
          <p className="text-sm text-blue-700 font-semibold">Monto a pagar</p>
          <p className="text-3xl font-bold text-blue-900">
            ${Number(monto).toFixed(2)}
          </p>
        </div>

        {/* Alertas */}
        {mensaje.texto && (
          <Alert
            className={`mb-6 ${
              mensaje.tipo === "exito"
                ? "border-green-300 bg-green-50"
                : "border-red-300 bg-red-50"
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
                mensaje.tipo === "exito" ? "text-green-800" : "text-red-800"
              }
            >
              {mensaje.texto}
            </AlertDescription>
          </Alert>
        )}

        {/* Métodos de Pago */}
        <p className="text-sm font-semibold text-slate-700 mb-3">
          Selecciona método de pago:
        </p>

        <div className="space-y-3 mb-6">
          {/* Efectivo */}
          <button
            onClick={() => setMetodoPago("efectivo")}
            disabled={cargando}
            className={`w-full p-4 rounded-lg border-2 transition flex items-center gap-3 ${
              metodoPago === "efectivo"
                ? "border-green-600 bg-green-50"
                : "border-slate-300 bg-white hover:border-green-300"
            }`}
          >
            <DollarSign className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Efectivo</p>
              <p className="text-sm text-slate-600">Pago en efectivo</p>
            </div>
            {metodoPago === "efectivo" && (
              <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />
            )}
          </button>

          {/* QR */}
          <button
            onClick={() => setMetodoPago("qr")}
            disabled={cargando}
            className={`w-full p-4 rounded-lg border-2 transition flex items-center gap-3 ${
              metodoPago === "qr"
                ? "border-blue-600 bg-blue-50"
                : "border-slate-300 bg-white hover:border-blue-300"
            }`}
          >
            <QrCode className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Código QR</p>
              <p className="text-sm text-slate-600">Transferencia por QR</p>
            </div>
            {metodoPago === "qr" && (
              <CheckCircle2 className="h-5 w-5 text-blue-600 ml-auto" />
            )}
          </button>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={cargando}
            className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-slate-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarPago}
            disabled={cargando || !metodoPago}
            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
