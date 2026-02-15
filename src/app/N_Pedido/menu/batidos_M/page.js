'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import supabase from "@/utils/supabase/client";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Plus, Minus, CheckCircle, XCircle } from "lucide-react";

export default function BatidosMenuPage() {
  const [batidos, setBatidos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [notificaciones, setNotificaciones] = useState([]);

  const params = useSearchParams();
  const router = useRouter();
  const mesaParam = params.get("mesa");

  // 🔔 Mostrar notificación
  const showNotification = (mensaje, tipo = "success") => {
    const id = Date.now();
    setNotificaciones((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  // 📥 Cargar batidos
  useEffect(() => {
    const fetchBatidos = async () => {
      const { data, error } = await supabase
        .from("batidos")
        .select("*")
        .order("id", { ascending: true });

      if (!error && data) setBatidos(data);
    };
    fetchBatidos();
  }, []);

  // ➕➖ Cantidad
  const handleCantidad = (id, accion) => {
    setCantidades((prev) => {
      const actual = prev[id] || 0;
      if (accion === "sumar") return { ...prev, [id]: actual + 1 };
      if (accion === "restar" && actual > 0) return { ...prev, [id]: actual - 1 };
      return prev;
    });
  };

  // 🛒 Agregar al pedido
  const handleAgregar = (producto) => {
    const cantidad = cantidades[producto.id] || 0;

    if (cantidad === 0) {
      showNotification("Selecciona al menos 1 unidad 🍹", "error");
      return;
    }

    const pedidoActual = JSON.parse(sessionStorage.getItem("pedidoActual")) || {
      mesa: mesaParam || "sin_mesa",
      items: [],
    };

    const existente = pedidoActual.items.find(
      (i) => i.id === producto.id && i.categoria === "batidos"
    );

    if (existente) {
      existente.cantidad += cantidad;
      existente.subtotal = existente.cantidad * existente.precio;
    } else {
      pedidoActual.items.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        categoria: "batidos",
        cantidad,
        subtotal: cantidad * producto.precio,
      });
    }

    sessionStorage.setItem("pedidoActual", JSON.stringify(pedidoActual));
    setCantidades((prev) => ({ ...prev, [producto.id]: 0 }));

    showNotification(`✔ ${producto.nombre} agregado al pedido`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-amber-100">
      <Navbar perfilRoute="/PerfilSupervisor" />

      {/* 🔔 NOTIFICACIONES */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notificaciones.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow text-white
              ${n.tipo === "error" ? "bg-red-500" : "bg-green-600"}
            `}
          >
            {n.tipo === "error" ? (
              <XCircle size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            <span className="text-sm">{n.mensaje}</span>
          </div>
        ))}
      </div>

      {/* 🧾 Encabezado */}
      <div className="px-6 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">🥤Batidos</h1>
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

      {/* 🍹 GRID 2x2 */}
      <main className="grid grid-cols-2 gap-6 p-6 place-items-center">
        {batidos.map((item) => (
          <div
            key={item.id}
            className="bg-white w-full max-w-xs rounded-2xl shadow-md border p-4 flex flex-col justify-between"
          >
            {/* Imagen */}
            <div className="flex justify-center mb-3">
              {item.img ? (
                <img
                  src={item.img}
                  alt={item.nombre}
                  className="w-40 h-40 object-cover rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-orange-700 text-center">
              {item.nombre}
            </h3>

            <p className="text-center text-gray-700 font-medium mb-3">
              Bs. {item.precio}
            </p>

            {/* Controles */}
            <div className="flex justify-center items-center gap-3 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCantidad(item.id, "restar")}
                disabled={!cantidades[item.id]}
              >
                <Minus size={16} />
              </Button>

              <span className="text-lg font-semibold w-6 text-center">
                {cantidades[item.id] || 0}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCantidad(item.id, "sumar")}
              >
                <Plus size={16} />
              </Button>
            </div>

            <Button
              className="w-full bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => handleAgregar(item)}
            >
              ✒️ LISTAR
            </Button>
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
    </div>
  );
}
