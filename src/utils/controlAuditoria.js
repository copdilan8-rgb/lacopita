/**
 * 🔒 Sistema de Control y Auditoría
 * Funciones para registrar eventos del sistema con fecha/hora
 */

import {
  obtenerFechaHoraFormato,
  obtenerFechaHoraISO,
  generarIDTiempo,
} from "./dateTimeUtils";

/**
 * Estructura para registros de auditoría
 * @typedef {Object} RegistroAuditoria
 * @property {string} id - ID único del registro
 * @property {string} evento - Tipo de evento (login, compra, cambio, etc.)
 * @property {string} usuario - Usuario que realizó la acción
 * @property {string} fechaHora - Fecha y hora del evento
 * @property {string} fechaHoraISO - ISO timestamp para BD
 * @property {string} detalles - Detalles adicionales
 * @property {string} estado - Estado (exitoso, error, pendiente)
 */

/**
 * Crea un registro de auditoría completo
 * @param {string} evento - Tipo de evento
 * @param {string} usuario - Usuario responsable
 * @param {string} detalles - Detalles del evento
 * @param {string} estado - Estado del evento (exitoso, error, pendiente)
 * @returns {RegistroAuditoria} Objeto de auditoría
 */
export const crearRegistroAuditoria = (
  evento,
  usuario,
  detalles = "",
  estado = "exitoso"
) => {
  return {
    id: generarIDTiempo(),
    evento,
    usuario,
    fechaHora: obtenerFechaHoraFormato(),
    fechaHoraISO: obtenerFechaHoraISO(),
    detalles,
    estado,
    timestamp: Date.now(),
  };
};

/**
 * Registra un evento en localStorage (para historial local)
 * @param {string} evento - Tipo de evento
 * @param {string} usuario - Usuario responsable
 * @param {string} detalles - Detalles del evento
 * @param {string} estado - Estado del evento
 */
export const registrarEventoLocal = (
  evento,
  usuario,
  detalles = "",
  estado = "exitoso"
) => {
  try {
    const registro = crearRegistroAuditoria(evento, usuario, detalles, estado);
    const historial = JSON.parse(localStorage.getItem("historialEventos") || "[]");
    historial.push(registro);

    // Mantener solo los últimos 1000 eventos
    if (historial.length > 1000) {
      historial.shift();
    }

    localStorage.setItem("historialEventos", JSON.stringify(historial));
    return registro;
  } catch (error) {
    console.error("Error registrando evento local:", error);
    return null;
  }
};

/**
 * Obtiene el historial de eventos del localStorage
 * @param {number} limite - Número máximo de eventos a retornar
 * @returns {Array} Array de registros
 */
export const obtenerHistorialEventos = (limite = 50) => {
  try {
    const historial = JSON.parse(localStorage.getItem("historialEventos") || "[]");
    return historial.slice(-limite).reverse();
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    return [];
  }
};

/**
 * Limpia el historial de eventos
 * @returns {boolean} true si se limpió correctamente
 */
export const limpiarHistorialEventos = () => {
  try {
    localStorage.removeItem("historialEventos");
    return true;
  } catch (error) {
    console.error("Error limpiando historial:", error);
    return false;
  }
};

/**
 * Registra un login de usuario
 * @param {string} usuario - Nombre de usuario
 * @param {string} exitoso - true si fue exitoso, false si falló
 * @returns {RegistroAuditoria} Registro del evento
 */
export const registrarLogin = (usuario, exitoso = true) => {
  const estado = exitoso ? "exitoso" : "error";
  const detalles = exitoso
    ? "Usuario ingresó al sistema"
    : "Intento de login fallido";

  return registrarEventoLocal("LOGIN", usuario, detalles, estado);
};

/**
 * Registra un logout de usuario
 * @param {string} usuario - Nombre de usuario
 * @returns {RegistroAuditoria} Registro del evento
 */
export const registrarLogout = (usuario) => {
  return registrarEventoLocal(
    "LOGOUT",
    usuario,
    "Usuario cerró sesión",
    "exitoso"
  );
};

/**
 * Registra una transacción (venta, pago, etc.)
 * @param {string} usuario - Usuario responsable
 * @param {number} monto - Cantidad de dinero
 * @param {string} metodo - Método de pago
 * @param {string} detalles - Detalles adicionales
 * @returns {RegistroAuditoria} Registro del evento
 */
export const registrarTransaccion = (usuario, monto, metodo, detalles = "") => {
  const detallesCompletos = `Monto: $${monto}, Método: ${metodo}. ${detalles}`;
  return registrarEventoLocal(
    "TRANSACCION",
    usuario,
    detallesCompletos,
    "exitoso"
  );
};

/**
 * Registra un cambio en el sistema (edición de datos, etc.)
 * @param {string} usuario - Usuario responsable
 * @param {string} tipo - Tipo de cambio (PRODUCTO, USUARIO, PRECIO, etc.)
 * @param {string} descripcion - Descripción del cambio
 * @param {object} cambios - Objeto con antes y después {antes: {}, despues: {}}
 * @returns {RegistroAuditoria} Registro del evento
 */
export const registrarCambio = (usuario, tipo, descripcion, cambios = {}) => {
  const detalles = `Tipo: ${tipo}, Descripción: ${descripcion}`;
  const evento = `CAMBIO_${tipo}`;

  return registrarEventoLocal(evento, usuario, detalles, "exitoso");
};

/**
 * Registra un error del sistema
 * @param {string} seccion - Parte del sistema donde ocurrió el error
 * @param {string} mensaje - Mensaje de error
 * @param {string} usuario - Usuario afectado (opcional)
 * @returns {RegistroAuditoria} Registro del evento
 */
export const registrarError = (seccion, mensaje, usuario = "SISTEMA") => {
  const detalles = `Sección: ${seccion}, Error: ${mensaje}`;
  return registrarEventoLocal("ERROR", usuario, detalles, "error");
};

/**
 * Exporta historial a formato CSV
 * @param {Array} eventos - Array de eventos a exportar (usa todos si no se proporciona)
 * @returns {string} Contenido CSV
 */
export const exportarHistorialCSV = (eventos = null) => {
  const registros = eventos || obtenerHistorialEventos(Infinity);

  let csv = "ID,Evento,Usuario,Fecha/Hora,Detalles,Estado\n";

  registros.forEach((registro) => {
    const detalles = (registro.detalles || "").replace(/"/g, '""');
    csv += `"${registro.id}","${registro.evento}","${registro.usuario}","${registro.fechaHora}","${detalles}","${registro.estado}"\n`;
  });

  return csv;
};

/**
 * Descarga el historial como archivo CSV
 * @param {Array} eventos - Array de eventos a descargar
 */
export const descargarHistorialCSV = (eventos = null) => {
  const csv = exportarHistorialCSV(eventos);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `historial_eventos_${generarIDTiempo()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Obtiene estadísticas del sistema
 * @returns {object} Objeto con estadísticas
 */
export const obtenerEstadisticas = () => {
  const historial = obtenerHistorialEventos(Infinity);

  const estadisticas = {
    totalEventos: historial.length,
    eventos: {},
    usuariosActivos: new Set(),
    errores: 0,
    exitosos: 0,
  };

  historial.forEach((registro) => {
    // Contar por tipo de evento
    estadisticas.eventos[registro.evento] =
      (estadisticas.eventos[registro.evento] || 0) + 1;

    // Usuarios activos
    estadisticas.usuariosActivos.add(registro.usuario);

    // Contar por estado
    if (registro.estado === "error") {
      estadisticas.errores++;
    } else if (registro.estado === "exitoso") {
      estadisticas.exitosos++;
    }
  });

  estadisticas.usuariosActivos = Array.from(estadisticas.usuariosActivos);

  return estadisticas;
};

export default {
  crearRegistroAuditoria,
  registrarEventoLocal,
  obtenerHistorialEventos,
  limpiarHistorialEventos,
  registrarLogin,
  registrarLogout,
  registrarTransaccion,
  registrarCambio,
  registrarError,
  exportarHistorialCSV,
  descargarHistorialCSV,
  obtenerEstadisticas,
};
