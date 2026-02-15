"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ClipboardList,
  PlusCircle,
  Home,
} from "lucide-react";

export default function AtajoSPPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-emerald-100">
      <Navbar perfilRoute="/PerfilSupervisor" />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center">
          {/* ✅ Confirmación */}
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pedido en curso
          </h1>

          <p className="text-gray-600 mb-8">
            El pedido fue registrado correctamente y ya está en preparación.
          </p>

          {/* 🚀 Acciones */}
          <div className="space-y-4">
            {/* 🔴 VER PEDIDOS */}
            <Button
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => router.push("/pedidos")}
            >
              <ClipboardList size={18} />
              Ver pedidos
            </Button>

            {/* 🟢 NUEVO PEDIDO */}
            <Button
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => router.push("/N_Pedido")}
            >
              <PlusCircle size={18} />
              Nuevo pedido
            </Button>

            {/* 🔵 INICIO */}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => router.push("supervisor/")}
            >
              <Home size={18} />
              Inicio
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
