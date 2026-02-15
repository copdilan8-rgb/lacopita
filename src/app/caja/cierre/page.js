"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase/client";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Loader,
  DollarSign,
  QrCode,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BotonVolver from "@/components/BotonVolver";
import PedidoDetalleModal from "@/app/pedidos/Estados_P/PedidoDetalleModal";
import { formatearFechaLocal } from "@/utils/dateTimeUtils";

export default function CierreCajaPage() {
  const [usuarioId, setUsuarioId] = useState(null);
  const [cajaId, setCajaId] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({
    cantidad_pedidos: 0,
    total_efectivo: 0,
    total_qr: 0,
    total_general: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [cerrando, setCerrando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });
  const [cajaInfo, setCajaInfo] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [estadoCaja, setEstadoCaja] = useState("abierta"); // Rastrear estado en tiempo real
  const [pollingActivo, setPollingActivo] = useState(true);
  const [nombreUsuarioApertura, setNombreUsuarioApertura] = useState(null); // Nombre del usuario que abrió
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [descuento, setDescuento] = useState("");
  const router = useRouter();

  // Contar pedidos sin procesar
  const pedidosSinProcesar = pedidos.filter(
    (p) => p.estado === "en_curso" || p.estado === "entregado"
  ).length;

  // Obtener usuario y caja_id
  useEffect(() => {
    const idDelSessionStorage = sessionStorage.getItem("idUsuario");
    let cajaDelSessionStorage = sessionStorage.getItem("caja_id");

    if (!idDelSessionStorage) {
      router.push("/login");
      return;
    }

    setUsuarioId(Number(idDelSessionStorage));

    // Si no hay caja_id en sessionStorage, buscar la caja abierta del sistema
    if (!cajaDelSessionStorage) {
      buscarCajaAbierta(Number(idDelSessionStorage));
    } else {
      setCajaId(Number(cajaDelSessionStorage));
      obtenerPedidos(Number(cajaDelSessionStorage));
    }
  }, [router]);

  // Buscar la caja abierta en el sistema (no solo la del usuario actual)
  const buscarCajaAbierta = async (userId) => {
    try {
      const response = await fetch(
        `/api/caja/obtener-actual?usuario_id=${userId}`
      );
      const data = await response.json();

      if (data.success && data.caja) {
        setCajaId(Number(data.caja.id));
        sessionStorage.setItem("caja_id", String(data.caja.id));
        obtenerPedidos(Number(data.caja.id));
      } else {
        setMensaje({
          tipo: "error",
          texto: "No hay caja abierta en el sistema",
        });
        setCargando(false);
      }
    } catch (error) {
      console.error("Error buscando caja abierta:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al buscar caja abierta",
      });
      setCargando(false);
    }
  };

  // Obtener pedidos pendientes
  const obtenerPedidos = async (caja_id) => {
    try {
      const response = await fetch(
        `/api/caja/pedidos-resumen?caja_id=${caja_id}`
      );
      const data = await response.json();

      if (data.success) {
        setPedidos(data.pedidos);
        setResumen(data.resumen);
      } else {
        setMensaje({
          tipo: "error",
          texto: data.error || "Error al obtener pedidos",
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

  // Obtener nombre del usuario que abrió la caja
  const obtenerNombreUsuario = async (usuarioId) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("nombre")
        .eq("id", usuarioId)
        .single();
      
      if (!error && data) {
        setNombreUsuarioApertura(data.nombre);
      }
    } catch (error) {
      console.error("Error obteniendo nombre usuario:", error);
    }
  };

  // Obtener información de la caja con polling en tiempo real
  useEffect(() => {
    if (!cajaId || !pollingActivo) return;

    const obtenerCajaInfo = async () => {
      if (!cajaId) return;

      try {
        const response = await fetch(
          `/api/caja/obtener-actual?usuario_id=${usuarioId}`
        );
        const data = await response.json();

        if (data.caja) {
          setCajaInfo(data.caja);
          setEstadoCaja(data.caja.estado);
          
          // Obtener el nombre del usuario que abrió la caja
          if (data.caja.abierta_por && !nombreUsuarioApertura) {
            obtenerNombreUsuario(data.caja.abierta_por);
          }
          
          // Si la caja fue cerrada, detener polling y notificar
          if (data.caja.estado === "cerrada") {
            setPollingActivo(false);
            setMensaje({
              tipo: "info",
              texto: `Caja cerrada. Redirigiendo al historial...`,
            });
            // Redirigir automáticamente después de 2 segundos
            setTimeout(() => {
              sessionStorage.removeItem("caja_id");
              router.push("/caja/historial");
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    obtenerCajaInfo();
    const intervalo = setInterval(obtenerCajaInfo, 3000);

    return () => clearInterval(intervalo);
  }, [usuarioId, cajaId, pollingActivo, router]);

  // Cerrar caja
  const handleCerrarCaja = async () => {
    if (pedidosSinProcesar > 0) {
      setMensaje({
        tipo: "error",
        texto: `No se puede cerrar caja. Hay ${pedidosSinProcesar} pedido(s) sin procesar. Todos los pedidos deben estar cancelados (pagados) antes de cerrar caja.`,
      });
      return;
    }

    setModalConfirmacion(true);
  };

  const confirmarCierreCaja = async () => {
    setModalConfirmacion(false);
    setCerrando(true);
    setMensaje({ tipo: null, texto: "" });

    try {
      const response = await fetch("/api/caja/cerrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caja_id: cajaId,
          usuario_id_cierre: usuarioId,
          observaciones: observaciones.trim() || null,
          m_descuento: descuento ? Number(descuento) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMensaje({
          tipo: "exito",
          texto: data.mensaje,
        });

        // Limpiar sessionStorage y estados
        sessionStorage.removeItem("caja_id");
        setObservaciones("");
        setDescuento("");

        // Redirigir al historial de caja después de 2 segundos
        setTimeout(() => {
          router.push("/caja/historial");
        }, 2000);
      } else {
        setMensaje({
          tipo: "error",
          texto: data.error || "Error al cerrar la caja",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al conectar con el servidor",
      });
    } finally {
      setCerrando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar perfilRoute="/PerfilSupervisor" />
        <div className="flex items-center justify-center h-screen">
          <Loader className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar perfilRoute="/PerfilSupervisor" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BotonVolver />
        </div>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Cierre de Caja</h1>
          <p className="text-slate-600 mt-2">
            Resumen de pedidos pendientes por procesar
          </p>
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

        {/* Info de caja */}
        {cajaInfo && (
          <Card className="p-6 mb-6 border-2 border-blue-200 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-3">
              Información de la Caja
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-semibold">Abierta por:</p>
                <p>{nombreUsuarioApertura ? nombreUsuarioApertura : `ID Usuario: ${cajaInfo.abierta_por}`}</p>
              </div>
              <div>
                <p className="font-semibold">Monto Inicial:</p>
                <p className="text-lg font-bold">
                  ${Number(cajaInfo.monto_inicial_efectivo).toFixed(2)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold">Hora de Apertura:</p>
                <p>
                  {formatearFechaLocal(cajaInfo.fecha_apertura, "completo")}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Resumen de Totales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Efectivo */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-semibold">
                  Total Efectivo
                </p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  ${resumen.total_efectivo.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600 opacity-30" />
            </div>
          </Card>

          {/* Total QR */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold">Total QR</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  ${resumen.total_qr.toFixed(2)}
                </p>
              </div>
              <QrCode className="h-10 w-10 text-blue-600 opacity-30" />
            </div>
          </Card>

          {/* Total General */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-semibold">
                  Total General
                </p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  ${resumen.total_general.toFixed(2)}
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-purple-600 opacity-30" />
            </div>
          </Card>
        </div>

        {/* Alerta de Pedidos Sin Procesar */}
        {pedidosSinProcesar > 0 && (
          <Card className="p-4 mb-6 bg-red-50 border-red-300 border-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">
                  ⚠️ No se puede cerrar caja
                </p>
                <p className="text-red-800 text-sm mt-1">
                  Hay {pedidosSinProcesar} pedido(s) sin procesar. Todos los
                  pedidos deben estar <strong>PAGADOS/CANCELADOS</strong> antes
                  de cerrar caja.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Contador de Pedidos */}
        <Card className="p-4 mb-6 bg-slate-100 border-slate-300">
          <p className="text-center text-slate-700">
            <span className="font-bold text-lg text-slate-900">
              {resumen.cantidad_pedidos}
            </span>{" "}
            pedidos pendientes de procesar
          </p>
        </Card>

        {/* Tabla de Pedidos */}
        {resumen.cantidad_pedidos > 0 ? (
          <Card className="p-6 mb-6 overflow-x-auto">
            <h3 className="font-semibold text-slate-900 mb-4">
              Detalle de Pedidos
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100">
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold">
                      #{pedido.id}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          pedido.tipo === "mesa"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {pedido.tipo === "mesa" ? "🍽️ Mesa" : "📦 Llevar"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {pedido.mesa_numero ? `#${pedido.mesa_numero}` : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                          pedido.metodo_pago === "efectivo"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {pedido.metodo_pago === "efectivo" ? (
                          <DollarSign className="h-4 w-4" />
                        ) : (
                          <QrCode className="h-4 w-4" />
                        )}
                        {pedido.metodo_pago === "efectivo"
                          ? "Efectivo"
                          : "QR"}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold">
                      ${Number(pedido.monto_total).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(pedido.creado_en).toLocaleTimeString(
                        "es-ES",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => setPedidoSeleccionado(pedido)}
                        className="text-sm bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded"
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="p-8 text-center bg-yellow-50 border-yellow-300 mb-6">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-semibold text-lg">
              No hay pedidos pendientes de procesar
            </p>
          </Card>
        )}

        {/* Modal de Detalle - Componente PedidoDetalleModal */}
        {pedidoSeleccionado && (
          <PedidoDetalleModal 
            pedidoId={pedidoSeleccionado.id}
            onClose={() => setPedidoSeleccionado(null)}
          />
        )}

        {/* Modal de Confirmación de Cierre */}
        {modalConfirmacion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-md w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">
                Confirmar Cierre de Caja
              </h3>
              <p className="text-center text-slate-600 mb-6">
                Se procesarán <span className="font-bold text-slate-900">{resumen.cantidad_pedidos}</span> pedido(s). Esta acción no se puede deshacer.
              </p>
              
              {/* Campo de Descuento */}
              <div className="mb-6 pb-4 border-b">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Monto de Descuento (Bs.)
                </label>
                <input
                  type="number"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {descuento && (
                  <p className="text-xs text-slate-600 mt-2">
                    Descuento: Bs. {Number(descuento).toFixed(2)}
                  </p>
                )}
              </div>
              
              {/* Campo de Observaciones */}
              <div className="mb-6 pb-4 border-b">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Observaciones (Detalles, etc.)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Descuento por compra de leche, gastos de cocina, etc."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  rows="4"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setModalConfirmacion(false);
                    setObservaciones("");
                    setDescuento("");
                  }}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900"
                >
                  Volver
                </Button>
                <Button
                  onClick={confirmarCierreCaja}
                  disabled={cerrando}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {cerrando ? "Procesando..." : "Cerrar Caja"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.back()}
            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Volver
          </Button>
          <Button
            onClick={() => router.push("/caja/historial")}
            className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            📊 Ver Historial
          </Button>
          <Button
            onClick={handleCerrarCaja}
            disabled={cerrando || resumen.cantidad_pedidos === 0 || pedidosSinProcesar > 0 || estadoCaja === "cerrada"}
            className="flex-1 bg-gradient-to-r from-red-400 to-rose-400 hover:from-red-500 hover:to-rose-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cerrando ? "Cerrando..." : estadoCaja === "cerrada" ? "Caja ya cerrada" : "Cerrar Caja"}
          </Button>
        </div>
      </div>
    </div>
  );
}
