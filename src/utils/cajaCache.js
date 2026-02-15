/**
 * 🏪 Cache inteligente optimizado para estado de caja
 * Implementa patrón Stale-While-Revalidate para máxima velocidad
 * Con Broadcast Channel para sincronización entre pestañas
 */

const CACHE_KEY = "caja_abierta_cache";
const CACHE_TIMESTAMP_KEY = "caja_abierta_timestamp";
const CACHE_DURATION = 5000; // 5 segundos de caché (revalidación rápida)

let abortController = null; // Para cancelar requests anteriores
let broadcastChannel = null; // Para comunicación entre pestañas
let verificacionEnCurso = false; // Evita múltiples requests simultáneos

// Inicializar Broadcast Channel
const inicializarBroadcastChannel = () => {
  if (typeof window === "undefined") return;

  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel("caja_estado");
      broadcastChannel.onmessage = (event) => {
        if (event.data.tipo === "caja_abierta" || event.data.tipo === "caja_cerrada") {
          // Invalidar caché cuando se abre/cierra caja en otra pestaña
          invalidarCajaCache();
        }
      };
    } catch (e) {
      // Broadcast Channel no disponible en algunos navegadores
      console.warn("Broadcast Channel no disponible");
    }
  }
};

// Notificar a otras pestañas que se abrió/cerró una caja
const notificarCambioACaja = (tipo) => {
  inicializarBroadcastChannel();
  if (broadcastChannel) {
    broadcastChannel.postMessage({ tipo, timestamp: Date.now() });
  }
};

/**
 * Obtiene el estado de la caja con Stale-While-Revalidate
 * - Devuelve caché viejo INMEDIATAMENTE
 * - Revalida en background sin bloquear UI
 * @returns {Promise<boolean>} true si hay caja abierta, false si no
 */
export const verificarCajaOptimizado = async () => {
  const usuarioId = localStorage.getItem("usuario_id");

  if (!usuarioId) {
    return false;
  }

  inicializarBroadcastChannel();

  // ✅ PASO 1: Leer caché (respuesta instantánea)
  const cachedValue = sessionStorage.getItem(CACHE_KEY);
  const cacheTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
  const ahora = Date.now();

  // Si tenemos caché válido, devolverlo instantáneamente
  if (
    cachedValue !== null &&
    cacheTimestamp !== null &&
    ahora - parseInt(cacheTimestamp) < CACHE_DURATION
  ) {
    return cachedValue === "true";
  }

  // ✅ PASO 2: Revalidar en background (no bloquea)
  // Cancelar request anterior si existe
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  // Si tenemos caché viejo (expirado), devolverlo mientras revalidamos
  if (cachedValue !== null) {
    revalidarEnBackground(usuarioId, abortController.signal);
    return cachedValue === "true"; // Devolver caché viejo inmediatamente
  }

  // Si NO hay caché, esperar la primera verificación
  try {
    const resultado = await hacerLlamadaAPI(usuarioId, abortController.signal);
    return resultado;
  } catch (error) {
    console.error("Error verificando caja:", error);
    return false;
  }
};

/**
 * Hace la llamada API (interno)
 */
const hacerLlamadaAPI = async (usuarioId, signal) => {
  try {
    const res = await fetch(`/api/caja/obtener-actual?usuario_id=${usuarioId}`, {
      signal, // Permite abortar esta petición
    });
    const data = await res.json();

    const cajaAbierta = data.caja && data.caja.estado === "abierta";

    // Actualizar caché
    sessionStorage.setItem(CACHE_KEY, String(cajaAbierta));
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));

    return cajaAbierta;
  } catch (error) {
    if (error.name === "AbortError") {
      // Request fue cancelado, ignorar
      return null;
    }
    throw error;
  }
};

/**
 * Revalida en background sin bloquear la UI
 */
const revalidarEnBackground = (usuarioId, signal) => {
  // Usar setTimeout para no bloquear
  setTimeout(() => {
    hacerLlamadaAPI(usuarioId, signal).catch(() => {
      // Silenciar errores de revalidación en background
    });
  }, 0);
};

/**
 * Invalida el caché de caja
 * Úsalo cuando se abre/cierra una caja para forzar revalidación
 */
export const invalidarCajaCache = () => {
  sessionStorage.removeItem(CACHE_KEY);
  sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
  if (abortController) {
    abortController.abort();
  }
};

/**
 * Notifica que se abrió una caja (llamar desde la página de apertura)
 */
export const notificarCajaAbierta = () => {
  invalidarCajaCache();
  notificarCambioACaja("caja_abierta");
};

/**
 * Notifica que se cerró una caja (llamar desde la página de cierre)
 */
export const notificarCajaCerrada = () => {
  invalidarCajaCache();
  notificarCambioACaja("caja_cerrada");
};
