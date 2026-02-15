/**
 * 📅 Utilidades de Fecha y Hora
 * Funciones centralizadas para capturar y formatear fecha/hora del dispositivo
 * Útil para auditoría, registros y control del sistema
 */

/**
 * Obtiene la fecha y hora actual del dispositivo
 * @returns {Date} Objeto Date con la hora actual
 */
export const obtenerFechaHoraActual = () => {
  return new Date();
};

/**
 * Obtiene la fecha actual en formato DD/MM/YYYY
 * @returns {string} Fecha formateada
 */
export const obtenerFecha = () => {
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, "0");
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const anio = ahora.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

/**
 * Obtiene la hora actual en formato HH:MM:SS
 * @returns {string} Hora formateada
 */
export const obtenerHora = () => {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");
  return `${horas}:${minutos}:${segundos}`;
};

/**
 * Obtiene fecha y hora combinadas en formato: DD/MM/YYYY HH:MM:SS
 * @returns {string} Fecha y hora formateadas
 */
export const obtenerFechaHoraFormato = () => {
  return `${obtenerFecha()} ${obtenerHora()}`;
};

/**
 * Obtiene fecha y hora en formato ISO (útil para base de datos)
 * @returns {string} Formato ISO: YYYY-MM-DDTHH:MM:SS.sssZ
 */
export const obtenerFechaHoraISO = () => {
  return new Date().toISOString();
};

/**
 * Obtiene solo la hora en formato corto HH:MM
 * @returns {string} Hora formateada sin segundos
 */
export const obtenerHoraCorta = () => {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
};

/**
 * Obtiene el día de la semana en español
 * @returns {string} Nombre del día (Lunes, Martes, etc.)
 */
export const obtenerDiaSemana = () => {
  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return dias[new Date().getDay()];
};

/**
 * Obtiene el mes actual en español
 * @returns {string} Nombre del mes
 */
export const obtenerMesActual = () => {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return meses[new Date().getMonth()];
};

/**
 * Obtiene fecha formateada en español: Lunes, 23 de Enero de 2026
 * @returns {string} Fecha en formato largo español
 */
export const obtenerFechaLargaEspanol = () => {
  const ahora = new Date();
  const dia = ahora.getDate();
  const diaSemana = obtenerDiaSemana();
  const mes = obtenerMesActual();
  const anio = ahora.getFullYear();
  return `${diaSemana}, ${dia} de ${mes} de ${anio}`;
};

/**
 * Obtiene el timestamp unix (milisegundos desde 1970)
 * @returns {number} Timestamp actual
 */
export const obtenerTimestamp = () => {
  return Date.now();
};

/**
 * Formatea una fecha pasada como parámetro
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada DD/MM/YYYY
 */
export const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

/**
 * Calcula la diferencia en minutos entre dos horas
 * @param {Date|string} fechaInicio - Fecha de inicio
 * @param {Date|string} fechaFin - Fecha de fin
 * @returns {number} Diferencia en minutos
 */
export const calcularDiferenciaMinutos = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  return Math.floor((fin - inicio) / (1000 * 60));
};

/**
 * Verifica si dos fechas son del mismo día
 * @param {Date|string} fecha1 - Primera fecha
 * @param {Date|string} fecha2 - Segunda fecha
 * @returns {boolean} true si son del mismo día
 */
export const mismoDay = (fecha1, fecha2) => {
  const f1 = new Date(fecha1);
  const f2 = new Date(fecha2);
  return (
    f1.getDate() === f2.getDate() &&
    f1.getMonth() === f2.getMonth() &&
    f1.getFullYear() === f2.getFullYear()
  );
};

/**
 * Obtiene el inicio del día (00:00:00)
 * @returns {Date} Fecha al inicio del día
 */
export const obtenerInicioDia = () => {
  const ahora = new Date();
  ahora.setHours(0, 0, 0, 0);
  return ahora;
};

/**
 * Obtiene el final del día (23:59:59)
 * @returns {Date} Fecha al final del día
 */
export const obtenerFinalDia = () => {
  const ahora = new Date();
  ahora.setHours(23, 59, 59, 999);
  return ahora;
};

/**
 * Genera un ID único basado en timestamp
 * @returns {string} ID único (ej: 20260123_153045_789)
 */
let contadorID = 0;
let ultimoMSID = 0;

export const generarIDTiempo = () => {
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, "0");
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const anio = ahora.getFullYear();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");
  const ms = String(ahora.getMilliseconds()).padStart(3, "0");

  const msActual = ahora.getTime();
  
  // Si el ms es igual al anterior, incrementar contador
  if (msActual === ultimoMSID) {
    contadorID++;
  } else {
    contadorID = 0;
    ultimoMSID = msActual;
  }

  const contador = String(contadorID).padStart(2, "0");
  return `${anio}${mes}${dia}_${horas}${minutos}${segundos}_${ms}_${contador}`;
};

/**
 * Convierte una fecha UTC de Supabase a formato local (Bolivia: America/La_Paz)
 * Uso: formatearFechaLocal(pedido.created_at)
 * @param {string|Date} fechaUTC - Fecha en UTC de Supabase
 * @param {string} formato - "completo" | "corto" | "solo-hora"
 * @returns {string} Fecha formateada en zona horaria local
 */
export const formatearFechaLocal = (fechaUTC, formato = "completo") => {
  if (!fechaUTC) return "";

  try {
    const fecha = new Date(fechaUTC);

    const opciones = {
      timeZone: "America/La_Paz",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };

    if (formato === "corto") {
      delete opciones.second;
    } else if (formato === "solo-hora") {
      return new Date(fechaUTC).toLocaleString("es-BO", {
        timeZone: "America/La_Paz",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return fecha.toLocaleString("es-BO", opciones);
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "";
  }
};

export default {
  obtenerFechaHoraActual,
  obtenerFecha,
  obtenerHora,
  obtenerFechaHoraFormato,
  obtenerFechaHoraISO,
  obtenerHoraCorta,
  obtenerDiaSemana,
  obtenerMesActual,
  obtenerFechaLargaEspanol,
  obtenerTimestamp,
  formatearFecha,
  calcularDiferenciaMinutos,
  mismoDay,
  obtenerInicioDia,
  obtenerFinalDia,
  generarIDTiempo,
  formatearFechaLocal,
};


