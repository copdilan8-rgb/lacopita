"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // 🔗 Guardar rol en sessionStorage y redirigir al login SIN parámetros
  const handleRoleSelect = (rol) => {
    sessionStorage.setItem("rolSeleccionado", rol); // guarda temporalmente
    setOpen(false);
    router.push("/login"); // redirige al login limpio
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-red-100 text-center px-4 relative">
      <div className="space-y-6 w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold text-red-600">
          Bienvenido a <span className="text-red-700">La Copita 🍨</span>
        </h1>

        <p className="text-gray-600 text-lg">Sistema interno para el personal</p>

        <Button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg px-8 py-4 w-full sm:w-auto font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Iniciar
        </Button>
      </div>

      {/* Modal de selección de rol */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-semibold">
              Ingresar como?
            </DialogTitle>
            <DialogDescription className="sr-only">
              Selecciona tu rol para continuar
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => handleRoleSelect("Supervisor")}
            >
              Supervisor
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="absolute bottom-4 text-gray-400 text-sm text-center w-full">
        © {new Date().getFullYear()} La Copita — Sistema de Empleados
      </footer>
    </main>
  );
}
