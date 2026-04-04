import { useMemo } from "react";

/**
 * Hook para determinar el título según la ruta
 * Centraliza la lógica repetida en múltiples componentes
 */
const ROUTE_TITLES = {
  "/batidos": "BATIDOS 🥤",
  "/promos": "PROMOS 🎉",
  "/cafeteria": "CAFETERIA ☕",
  "/comidas": "COMIDAS 🍽️",
  "/helados": "HELADOS 🍨",
  "/refrescos": "REFRESCO 🧃",
  "/reposteria": "REPOSTERIA 🍰",
  "/sabores": "SABORES 🍓",
  "/sandwichs": "SANDWICHS 🥯",
  "/usuarios": "USUARIOS 👤",
  "/productos": "PRODUCTOS 📦",
  "/perfilSupervisor": "Perfil Supervisor",
  "/supervisor": "SUPERVISOR",
  "/menu": "MENU 📋",
  "/pedidos": "PEDIDOS 🧾",
  "/N_Pedido": "PEDIDO ✏️",
  "/caja": "CAJA 💰",
};

export function usePageTitle(pathname) {
  return useMemo(() => {
    for (const [route, title] of Object.entries(ROUTE_TITLES)) {
      if (pathname.startsWith(route)) return title;
    }
    return "La Copita 🍷";
  }, [pathname]);
}
