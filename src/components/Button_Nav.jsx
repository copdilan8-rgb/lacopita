"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const menuItems = [
  { name: "Batidos", path: "/batidos" },
  { name: "Cafetería", path: "/cafeteria" },
  { name: "Comidas", path: "/comidas" },
  { name: "Helados", path: "/helados" },
  { name: "Paninis", path: "/paninis" },
  { name: "Refrescos", path: "/refrescos" },
  { name: "Repostería", path: "/reposteria" },
  { name: "Sabores", path: "/sabores" },
  { name: "Sandwichs", path: "/sandwichs" },
  { name: "Usuarios", path: "/usuarios" },
];

let openMenuExternal = null; // 👈 aquí guardaremos la función para abrir desde fuera

export function openSideMenu() {
  if (openMenuExternal) openMenuExternal(true);
}

export default function SideMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Exponer función global para abrir desde cualquier componente
    openMenuExternal = setOpen;
    return () => {
      openMenuExternal = null;
    };
  }, []);

  return (
    <>
      {/* Fondo difuminado */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20 transition"
        />
      )}

      {/* Panel lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menú</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
