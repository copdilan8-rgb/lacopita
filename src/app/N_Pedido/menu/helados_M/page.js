"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import supabase from "@/utils/supabase/client";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import { NotificationContainer } from "@/components/NotificationContainer";

export default function HeladosMenuPage() {
  const router = useRouter();
  const params = useSearchParams();
  const mesaParam = params.get("mesa");
  const { notificaciones, showNotification } = useNotification();

  const [helados, setHelados] = useState([]);
  const [sabores, setSabores] = useState([]);
  const [cantidades, setCantidades] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [heladoSeleccionado, setHeladoSeleccionado] = useState(null);
  const [saboresSeleccionados, setSaboresSeleccionados] = useState([]);

  /* 📥 Cargar helados */
  useEffect(() => {
    const fetchHelados = async () => {
      const { data } = await supabase
        .from("helados")
        .select("*")
        .order("id", { ascending: true });

      if (data) setHelados(data);
    };

    fetchHelados();
  }, []);

  /* 📥 Cargar sabores */
  useEffect(() => {
    const fetchSabores = async () => {
      const { data } = await supabase
        .from("sabores")
        .select("*")
        .order("id", { ascending: true });

      if (data) setSabores(data);
    };

    fetchSabores();
  }, []);

  /* ➕➖ Cantidades (solo fijo) */
  const handleCantidad = (id, accion) => {
    setCantidades((prev) => {
      const actual = prev[id] || 0;
      if (accion === "sumar") return { ...prev, [id]: actual + 1 };
      if (accion === "restar" && actual > 0)
        return { ...prev, [id]: actual - 1 };
      return prev;
    });
  };

  /* 🍨 Toggle sabor */
  const toggleSabor = (sabor) => {
    setSaboresSeleccionados((prev) => {
      const existe = prev.find((s) => s.id === sabor.id);
      if (existe) return prev.filter((s) => s.id !== sabor.id);
      return [...prev, sabor];
    });
  };

  /* 🛒 Agregar helado fijo */
  const agregarHeladoFijo = (helado) => {
    const cantidad = cantidades[helado.id] || 0;
    if (cantidad === 0) return;

    const pedido =
      JSON.parse(sessionStorage.getItem("pedidoActual")) || {
        mesa: mesaParam,
        items: [],
      };

    pedido.items.push({
      id: helado.id,
      nombre: helado.nombre,
      categoria: "helados",
      tipo: "fijo",
      cantidad,
      precio: helado.precio,
      subtotal: cantidad * helado.precio,
    });

    sessionStorage.setItem("pedidoActual", JSON.stringify(pedido));
    setCantidades((prev) => ({ ...prev, [helado.id]: 0 }));
    
    // ✅ Notificación de éxito
    showNotification(`${helado.nombre} agregado ✅`, "success");
  };

  /* 🍧 Confirmar helado por elección */
  const confirmarSabores = () => {
    if (saboresSeleccionados.length === 0) return;

    const pedido =
      JSON.parse(sessionStorage.getItem("pedidoActual")) || {
        mesa: mesaParam,
        items: [],
      };

    pedido.items.push({
      id: heladoSeleccionado.id,
      nombre: heladoSeleccionado.nombre,
      categoria: "helados",
      tipo: "s.eleccion",
      sabores: saboresSeleccionados.map((s) => s.nombre),
      cantidad: 1,
      precio: heladoSeleccionado.precio,
      subtotal: heladoSeleccionado.precio,
    });

    sessionStorage.setItem("pedidoActual", JSON.stringify(pedido));
    setSaboresSeleccionados([]);
    setModalOpen(false);
    
    // ✅ Notificación de éxito
    showNotification(`${heladoSeleccionado.nombre} agregado ✅`, "success");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-50 to-blue-100">
      <Navbar perfilRoute="/PerfilSupervisor" />
      
      {/* 🔔 Contenedor de notificaciones */}
      <NotificationContainer notificaciones={notificaciones} />

      {/* 🧾 Encabezado */}
      <div className="px-6 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">🍨 Helados</h1>
          <p className="text-sm text-gray-600">
            {mesaParam === "llevar"
              ? "Pedido para llevar"
              : `Pedido para mesa ${mesaParam}`}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push(`/N_Pedido/menu?mesa=${mesaParam}`)}
        >
          ← Volver al menú
        </Button>
      </div>

      {/* 🧊 Grid helados */}
      <main className="grid grid-cols-2 gap-6 p-6">
        {helados.map((h) => (
          <div
            key={h.id}
            className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between"
          >
            {/* Imagen */}
            <div className="flex justify-center mb-3">
              {h.img ? (
                <img
                  src={h.img}
                  alt={h.nombre}
                  className="w-36 h-36 object-cover rounded-lg"
                />
              ) : (
                <div className="w-36 h-36 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>

            {/* Nombre */}
            <h3 className="text-center font-semibold text-blue-700">
              {h.nombre}
            </h3>

            {/* Precio */}
            <p className="text-center font-medium text-gray-700 mb-3">
              Bs. {h.precio}
            </p>

            {/* FIJO */}
            {h.tipo === "fijo" && (
              <>
                <div className="flex justify-center items-center gap-3 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCantidad(h.id, "restar")}
                    disabled={!cantidades[h.id]}
                  >
                    <Minus size={16} />
                  </Button>

                  <span className="font-semibold w-6 text-center">
                    {cantidades[h.id] || 0}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCantidad(h.id, "sumar")}
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => agregarHeladoFijo(h)}
                >
                  ✒️ LISTAR
                </Button>
              </>
            )}

            {/* SELECCIÓN */}
            {h.tipo === "s.eleccion" && (
              <Button
                className="bg-orange-600 text-white hover:bg-orange-700 mt-3"
                onClick={() => {
                  setHeladoSeleccionado(h);
                  setModalOpen(true);
                }}
              >
                <Plus size={16} className="mr-2" />
                Elegir sabores
              </Button>
            )}
          </div>
        ))}
      </main>
      {/* 🔘 BOTONES INFERIORES */}
      <div className="p-6 flex flex-col gap-3">
        <Button
          onClick={() =>
            router.push(`/N_Pedido/detalle_p?mesa=${mesaParam || ""}`)
          }
          className="w-full bg-green-600 text-white hover:bg-green-700"
        >
          🗒️ Ver pedido actual
        </Button>
      </div>

      {/* 🍓 MODAL SABORES */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Elige sabores</h2>
              <X
                className="cursor-pointer"
                onClick={() => {
                  setModalOpen(false);
                  setSaboresSeleccionados([]);
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {sabores.map((s) => {
                const activo = saboresSeleccionados.some(
                  (x) => x.id === s.id
                );

                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSabor(s)}
                    className={`w-full text-left p-3 rounded-lg border transition font-medium
                      ${
                        activo
                          ? "bg-orange-100 border-orange-500 text-orange-900"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    {s.nombre}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={confirmarSabores}
              disabled={saboresSeleccionados.length === 0}
              className="mt-4 bg-orange-600 text-white hover:bg-orange-700"
            >
              Agregar helado ({saboresSeleccionados.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
