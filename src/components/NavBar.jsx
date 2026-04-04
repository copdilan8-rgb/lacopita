"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  const menuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!usuario) return null;

  return (
    <nav className="w-full bg-[#C82909] border-b-4 border-[#701705] shadow-md px-4 sm:px-6 py-3 sm:py-4 relative">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
            {titulo}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0" ref={menuRef}>
          {usuario?.avatar ? (
            <img
              src={usuario.avatar}
              alt="Avatar"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/80 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white text-[#C82909] font-bold shadow-sm border-2 border-white/80">
              {getInitials(usuario?.nombre, usuario?.apellido)}
            </div>
          )}

          

          <div className="relative">
            <Button
              variant="outline"
              onClick={handleToggleMenu}
              aria-label="Abrir menú de usuario"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="rounded-full border-white/70 bg-white/10 hover:bg-white/20 text-white p-2 sm:p-2.5 backdrop-blur-sm transition-all duration-200"
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {usuario?.nombre}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {usuario?.rol}
                  </p>
                </div>

                <button
                  onClick={handleNavigatePerfil}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C82909] transition-colors"
                >
                  Perfil
                </button>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C82909] transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      
    </nav>
  );
}