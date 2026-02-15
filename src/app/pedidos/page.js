"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";

import EnCurso from "./Estados_P/EnCurso";
import Entregados from "./Estados_P/Entregados";
import Pagados from "./Estados_P/Pagados";

export default function PedidosPage() {
  const [vista, setVista] = useState("en_curso");
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-orange-100">
      {/* 🔝 NAVBAR */}
      <Navbar perfilRoute="/PerfilSupervisor" />

      <main className="flex-1 p-4 sm:p-6">
        {/* 🧾 ENCABEZADO */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              📋 Gestión de Pedidos
            </h1>
            <p className="text-sm text-gray-600">
              Visualiza y gestiona pedidos según su estado
            </p>
          </div>

          {/* 🔙 VOLVER A INICIO */}
          <Button
            variant="outline"
            onClick={() => router.push("/supervisor")}
          >
            ⬅ Volver al inicio
          </Button>
        </div>

        {/* 🔘 BOTONES DE ESTADO */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => setVista("en_curso")}
            className={
              vista === "en_curso"
                ? "bg-orange-600 text-white"
                : "bg-white border text-gray-700"
            }
          >
            🟡 En curso
          </Button>

          <Button
            onClick={() => setVista("entregados")}
            className={
              vista === "entregados"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-700"
            }
          >
            🟢 Entregados
          </Button>

          <Button
            onClick={() => setVista("pagados")}
            className={
              vista === "pagados"
                ? "bg-green-600 text-white"
                : "bg-white border text-gray-700"
            }
          >
            💰 Pagados
          </Button>
        </div>

        {/* 📦 CONTENIDO SEGÚN ESTADO */}
        <div className="bg-white rounded-2xl shadow p-4">
          {vista === "en_curso" && <EnCurso />}
          {vista === "entregados" && <Entregados />}
          {vista === "pagados" && <Pagados />}
        </div>
      </main>
    </div>
  );
}
