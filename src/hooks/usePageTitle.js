import { useMemo } from "react";

/**
 * Hook para determinar el título según la ruta
 * Centraliza la lógica repetida en múltiples componentes
 */
const ROUTE_TITLES = {
  "/batidos": "Batidos 🥤",
  "/promos": "Promos 🎉",
  "/cafeteria": "Cafetería ☕",
  "/comidas": "Comidas 🍽️",
  "/helados": "Helados 🍨",
  "/refrescos": "Refrescos 🧃",
  "/reposteria": "Repostería 🍰",
  "/sabores": "Sabores 🍓",
  "/sandwichs": "Sandwichs 🥯",
  "/usuarios": "Usuarios 👤",
  "/productos": "Productos 📦",
  "/perfilSupervisor": "Perfil Supervisor",
  "/supervisor": "Supervisor",
  "/menu": "Menú 📋",
  "/pedidos": "Pedidos 🧾",
  "/N_Pedido": "Pedido ✏️",
  "/caja": "Caja 💰",
};

export function usePageTitle(pathname) {
  return useMemo(() => {
    for (const [route, title] of Object.entries(ROUTE_TITLES)) {
      if (pathname.startsWith(route)) return title;
    }
    return "La Copita 🍷";
  }, [pathname]);
}
