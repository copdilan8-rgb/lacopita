"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  QrCode,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BotonVolver from "@/components/BotonVolver";
import PedidoDetalleModal from "@/app/pedidos/Estados_P/PedidoDetalleModal";
import { formatearFechaLocal } from "@/utils/dateTimeUtils";

export default function HistorialCajasPage() {
  const [cajas, setCajas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fecha, setFecha] = useState("");
  const [cajaExpandida, setCajaExpandida] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const router = useRouter();

  // Obtener historial de cajas
  const obtenerHistorial = async (fechaFiltro = "") => {
    setCargando(true);
    setMensaje({ tipo: null, texto: "" });

    try {
      let url = "/api/caja/historial-detallado?limit=50";

      if (fechaFiltro) {
        url += `&fecha=${fechaFiltro}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setCajas(data.cajas);
      } else {
        setMensaje({
          tipo: "error",
          texto: data.error || "Error al obtener historial",
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

  // Cargar historial al montar
  useEffect(() => {
    obtenerHistorial();
  }, []);

  // Filtrar por fecha
  const handleFiltrarPorFecha = (e) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);
    obtenerHistorial(nuevaFecha);
  };

  // Formatear fecha
  const formatearFecha = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formatear solo fecha
  const formatearSoloFecha = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calcular diferenciales
  const calcularDiferencial = (caja) => {
    const esperado =
      (caja.montoInicial || 0) + (caja.montoFinalQR || 0);
    const real = caja.montoFinalEfectivo || 0;
    return real - esperado;
  };

  // Obtener detalle de pedido
  const obtenerDetallePedido = (pedidoId) => {
    setPedidoDetalle(pedidoId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar perfilRoute="/PerfilSupervisor" />

      <div className="container mx-auto px-4 py-8">
        {/* Botón volver */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              📊 Historial de Cajas
            </h1>
            <p className="text-slate-600 mt-2">
              Consulta las cajas cerradas de días anteriores
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/caja")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              ← Volver
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {mensaje.texto && (
          <Alert
            className={`mb-6 ${
              mensaje.tipo === "error"
                ? "border-red-300 bg-red-50"
                : "border-blue-300 bg-blue-50"
            }`}
          >
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {mensaje.texto}
            </AlertDescription>
          </Alert>
        )}

        {/* Filtro por fecha */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-slate-600" />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filtrar por fecha (opcional):
              </label>
              <input
                type="date"
                value={fecha}
                onChange={handleFiltrarPorFecha}
                className="border rounded-lg px-4 py-2 w-full md:w-64"
              />
            </div>
            {fecha && (
              <Button
                onClick={() => {
                  setFecha("");
                  obtenerHistorial();
                }}
                className="bg-slate-400 hover:bg-slate-500 text-white"
              >
                Limpiar filtro
              </Button>
            )}
          </div>
        </Card>

        {/* Lista de cajas */}
        {cargando ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">Cargando historial...</p>
          </Card>
        ) : cajas.length === 0 ? (
          <Card className="p-8 text-center bg-yellow-50 border-yellow-300">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-semibold text-lg">
              No hay cajas para esta fecha
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {cajas.map((caja) => (
              <Card
                key={caja.id}
                className="overflow-hidden hover:shadow-lg transition"
              >
                {/* Header de caja */}
                <button
                  onClick={() =>
                    setCajaExpandida(
                      cajaExpandida === caja.id ? null : caja.id
                    )
                  }
                  className="w-full p-6 text-left hover:bg-slate-50 transition flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-bold text-lg text-slate-900">
                        Caja #{caja.id}
                      </span>
                      <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                        ✓ Cerrada
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">
                      {formatearFechaLocal(caja.fechaCierre, "completo")}
                    </p>

                    {/* Resumen rápido */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-600">Monto Inicial</p>
                        <p className="font-semibold text-slate-900">
                          ${caja.montoInicial?.toFixed(2) || "0.00"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600">
                          💵 Sumatoria Efectivo
                        </p>
                        <p className="font-semibold text-green-600">
                          ${caja.sumatoriaEfectivoDia?.toFixed(2) || "0.00"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600">
                          📱 Total QR
                        </p>
                        <p className="font-semibold text-blue-600">
                          ${caja.montoFinalQR?.toFixed(2) || "0.00"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600">💰 Total Ventas</p>
                        <p className="font-semibold text-purple-600 text-lg">
                          ${caja.totalVentas?.toFixed(2) || "0.00"}
                        </p>
                      </div>

                      {caja.montoDescuento && (
                        <div>
                          <p className="text-xs text-slate-600">💰 Efectivo Neto</p>
                          <p className="font-semibold text-orange-600">
                            ${caja.montoDescuento?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Información de usuarios */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-600">Abierta por:</p>
                        <p className="font-semibold text-slate-900">
                          {caja.abiertaPor}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Cerrada por:</p>
                        <p className="font-semibold text-slate-900">
                          {caja.cerradaPor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón expandir */}
                  <div className="ml-4">
                    {cajaExpandida === caja.id ? (
                      <ChevronUp className="h-6 w-6 text-slate-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-slate-600" />
                    )}
                  </div>
                </button>

                {/* Detalle expandido */}
                {cajaExpandida === caja.id && (
                  <div className="border-t border-slate-200 bg-slate-50 p-6">
                    {/* Estadísticas de pedidos */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-600">Total Pedidos</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {caja.totalPedidos}
                        </p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">Pedidos Efectivo</p>
                        <p className="text-2xl font-bold text-green-600">
                          {caja.pedidosEfectivo}
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">Pedidos QR</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {caja.pedidosQR}
                        </p>
                      </div>
                    </div>

                    {/* Listado de pedidos */}
                    {caja.pedidos && caja.pedidos.length > 0 ? (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-4">
                          📋 Pedidos en esta caja:
                        </h4>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {caja.pedidos.map((pedido, idx) => (
                            <div
                              key={pedido.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-sm"
                            >
                              <div>
                                <span className="font-semibold text-slate-900">
                                  Pedido #{idx + 1}
                                </span>

                                <div className="flex gap-2 mt-1">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      pedido.tipo === "mesa"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}
                                  >
                                    {pedido.tipo === "mesa"
                                      ? `🍽️ Mesa ${pedido.mesa_numero}`
                                      : "📦 Llevar"}
                                  </span>

                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                                      pedido.metodo_pago === "efectivo"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {pedido.metodo_pago === "efectivo" ? (
                                      <>💵 Efectivo</>
                                    ) : (
                                      <>📱 QR</>
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="font-bold text-slate-900">
                                  ${pedido.monto_total?.toFixed(2) || "0.00"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(
                                    pedido.creado_en
                                  ).toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <button
                                  onClick={() => obtenerDetallePedido(pedido.id)}
                                  className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                                >
                                  Ver detalle
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600 text-sm">
                        No hay pedidos registrados en esta caja
                      </p>
                    )}

                    {/* Observaciones */}
                    {caja.observaciones && (
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-sm font-semibold text-slate-700 mb-2">
                          📝 Observaciones:
                        </p>
                        <p className="text-slate-600">{caja.observaciones}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Detalle de Pedido */}
        {pedidoDetalle && (
          <PedidoDetalleModal
            pedidoId={pedidoDetalle}
            onClose={() => setPedidoDetalle(null)}
          />
        )}
      </div>
    </div>
  );
}
