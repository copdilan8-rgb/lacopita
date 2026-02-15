/**
 * 🕐 Componente de Reloj y Panel de Control del Sistema
 * Muestra fecha, hora actual y acceso al historial de eventos
 */

"use client";

import { useEffect, useState } from "react";
import { obtenerFechaHoraFormato, obtenerFecha, obtenerHora } from "@/utils/dateTimeUtils";
import { obtenerHistorialEventos, descargarHistorialCSV } from "@/utils/controlAuditoria";

export default function PanelControlSistema({
  posicion = "bottom-right", // bottom-right, bottom-left, top-right, top-left
  mostrarPanel = true,
  colorTema = "orange", // orange, blue, green, red
}) {
  const [fechaHoraActual, setFechaHoraActual] = useState("");
  const [historial, setHistorial] = useState([]);
  const [expandido, setExpandido] = useState(false);

  const colores = {
    orange: {
      border: "border-orange-500",
      bg: "hover:bg-orange-50",
      text: "text-orange-700",
      btn: "bg-orange-100 hover:bg-orange-200",
    },
    blue: {
      border: "border-blue-500",
      bg: "hover:bg-blue-50",
      text: "text-blue-700",
      btn: "bg-blue-100 hover:bg-blue-200",
    },
    green: {
      border: "border-green-500",
      bg: "hover:bg-green-50",
      text: "text-green-700",
      btn: "bg-green-100 hover:bg-green-200",
    },
  };

  const estilos = colores[colorTema] || colores.orange;
  const posiciones = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  useEffect(() => {
    // Actualizar fecha y hora en tiempo real
    const actualizarReloj = () => {
      setFechaHoraActual(obtenerFechaHoraFormato());
      setHistorial(obtenerHistorialEventos(10));
    };

    actualizarReloj();
    const intervalo = setInterval(actualizarReloj, 1000);

    return () => clearInterval(intervalo);
  }, []);

  if (!mostrarPanel) return null;

  return (
    <div
      className={`fixed ${posiciones[posicion]} bg-white border-2 ${estilos.border} rounded-lg p-3 shadow-lg text-sm max-w-sm z-50 transition-all duration-300`}
    >
      {/* ENCABEZADO CON HORA */}
      <div
        className={`flex items-center gap-2 cursor-pointer ${estilos.bg} p-2 rounded -m-3 mb-2`}
        onClick={() => setExpandido(!expandido)}
      >
        <span className="text-lg">🕐</span>
        <div className="flex-1">
          <p className={`font-bold ${estilos.text}`}>{fechaHoraActual}</p>
          <p className="text-xs text-gray-500">Hora del dispositivo</p>
        </div>
        <span className="text-lg">{expandido ? "▼" : "▶"}</span>
      </div>

      {/* CONTENIDO EXPANDIBLE */}
      {expandido && (
        <>
          <hr className="border-gray-200 my-2" />

          {/* INFORMACIÓN DEL SISTEMA */}
          <div className="mb-3 p-2 bg-gray-50 rounded">
            <p className="font-semibold text-gray-700 mb-1">📊 Sistema</p>
            <p className="text-xs text-gray-600">
              Fecha: <span className="font-semibold">{obtenerFecha()}</span>
            </p>
            <p className="text-xs text-gray-600">
              Hora: <span className="font-semibold">{obtenerHora()}</span>
            </p>
            <p className="text-xs text-gray-600">
              Eventos: <span className="font-semibold">{historial.length}</span>
            </p>
          </div>

          {/* HISTORIAL DE EVENTOS */}
          <div className="mb-3">
            <p className="font-semibold text-gray-700 mb-2">📋 Últimos eventos</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {historial.length > 0 ? (
                historial.map((evento) => (
                  <div
                    key={evento.id}
                    className="border-l-2 border-gray-300 pl-2 py-1 hover:bg-gray-50 rounded"
                  >
                    <p className="font-semibold text-gray-700 text-xs">
                      {evento.evento}
                    </p>
                    <p className="text-gray-600 text-xs">{evento.fechaHora}</p>
                    {evento.detalles && (
                      <p className="text-gray-500 text-xs italic truncate">
                        {evento.detalles}
                      </p>
                    )}
                    <div className="flex gap-1 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          evento.estado === "exitoso"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {evento.estado === "exitoso" ? "✓" : "✕"}{" "}
                        {evento.estado}
                      </span>
                      {evento.usuario && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          👤 {evento.usuario}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-xs italic">
                  Sin eventos registrados
                </p>
              )}
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                descargarHistorialCSV();
              }}
              className={`flex-1 text-xs font-semibold py-1 px-2 rounded ${estilos.btn} transition`}
              title="Descargar historial en CSV"
            >
              📥 Descargar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
