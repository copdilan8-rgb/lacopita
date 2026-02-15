"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { Menu, ClipboardList, FilePlus2, Wallet } from "lucide-react";
import { openSideMenu } from "@/components/SideMenu";
import { useAuth } from "@/hooks/useAuth";

const ACTION_BUTTONS = [
  { icon: Menu, label: "Menú", action: "menu" },
  { icon: ClipboardList, label: "Pedidos", route: "/pedidos" },
  { icon: FilePlus2, label: "Nuevo Pedido", route: "/N_Pedido" },
  { icon: Wallet, label: "Caja", route: "/caja" },
];

export default function SupervisorPage() {
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const [showLogoutAnim, setShowLogoutAnim] = useState(false);

  const handleLogout = useCallback(() => {
    setShowLogoutAnim(true);
    setTimeout(() => {
      logout();
    }, 1200);
  }, [logout]);

  const handleButtonClick = useCallback(
    (button) => {
      if (button.action === "menu") {
        openSideMenu();
      } else if (button.route) {
        router.push(button.route);
      }
    },
    [router]
  );

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50 to-red-100">
      <NavBar perfilRoute="/PerfilSupervisor" />

      <main className="flex-grow flex flex-col items-center justify-center text-center p-8">
        {showLogoutAnim ? (
          <div className="flex flex-col items-center justify-center animate-fadeOut">
            <span className="text-4xl mb-4 animate-spin">🍨</span>
            <p className="text-red-600 text-xl font-semibold mb-2">
              Cerrando sesión...
            </p>
            <p className="text-gray-400 text-sm">Hasta pronto, Supervisor.</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold text-red-600 mb-2">
              Bienvenido, {usuario.nombre} 👋
            </h2>
            <p className="text-gray-600 mt-2 mb-8">Rol actual: {usuario.rol}</p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-md px-4">
              {ACTION_BUTTONS.map((button) => {
                const Icon = button.icon;
                return (
                  <Button
                    key={button.label}
                    className="flex flex-col items-center justify-center h-28 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 font-semibold"
                    onClick={() => handleButtonClick(button)}
                  >
                    <Icon className="w-8 h-8 mb-2" />
                    {button.label}
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
