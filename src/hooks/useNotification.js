import { useState, useCallback } from "react";

/**
 * Hook para manejar notificaciones toast
 * Evita duplicar lógica de notificaciones en todos los componentes
 */
export function useNotification() {
  const [notificaciones, setNotificaciones] = useState([]);

  const showNotification = useCallback((mensaje, tipo = "success") => {
    const id = Date.now();
    setNotificaciones((prev) => [...prev, { id, mensaje, tipo }]);
    
    const timeout = setTimeout(() => {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return { notificaciones, showNotification };
}
