"use client";
import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Navbar({ perfilRoute }) {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const titulo = usePageTitle(pathname);

  const getInitials = useCallback(
    (nombre, apellido) =>
      (nombre?.charAt(0).toUpperCase() || "") +
      (apellido?.charAt(0).toUpperCase() || ""),
    []
  );

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleNavigatePerfil = useCallback(() => {
    setMenuOpen(false);
    router.push(perfilRoute);
  }, [router, perfilRoute]);

  const handleLogout = useCallback(() => {
    setMenuOpen(false);
    sessionStorage.clear();
    router.push("/");
  }, [router]);

  if (!usuario) return null;

  return (
    <nav className="w-full bg-white shadow-sm py-4 px-6 flex justify-between items-center relative">
      <h1 className="text-2xl font-bold text-blue-600">{titulo}</h1>

      <div className="flex items-center gap-4 relative">
        {usuario?.avatar ? (
          <img
            src={usuario.avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white font-semibold">
            {getInitials(usuario?.nombre, usuario?.apellido)}
          </div>
        )}

        <div className="text-right">
          <p className="text-gray-800 font-semibold">{usuario?.nombre}</p>
          <p className="text-sm text-gray-500">{usuario?.rol}</p>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            onClick={handleToggleMenu}
            className="rounded-full border-gray-300 hover:bg-gray-100 p-2"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-md z-50">
              <p className="px-4 py-2 text-sm text-gray-400 border-b">
                Opciones
              </p>
              <button
                onClick={handleNavigatePerfil}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Perfil
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
