'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import supabase from "@/utils/supabase/client";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

import PromoDetalleModal from "@/components/PromoDetalleModal";

export default function PromosMenuPage() {
  const [promos, setPromos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);

  const [promoSeleccionada, setPromoSeleccionada] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const params = useSearchParams();
  const router = useRouter();
  const mesaParam = params.get("mesa");

  /* 🔔 Notificaciones */
  const showNotification = (mensaje, tipo = "success") => {
    const id = Date.now();
    setNotificaciones((prev) => [...prev, { id, mensaje, tipo }]);

    setTimeout(() => {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  /* 🎉 Cargar promos */
  useEffect(() => {
    const fetchPromos = async () => {
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .order("id");

      if (!error) setPromos(data || []);
    };

    fetchPromos();
  }, []);

  /* 🧠 Cargar productos de la promo */
  const cargarDetallePromo = async (promo) => {
    // 1️⃣ Obtener relaciones promo-productos
    const { data: relaciones, error } = await supabase
      .from("promo_productos")
      .select("*")
      .eq("promo_id", promo.id);

    if (error || !relaciones) return;

    // 2️⃣ Agrupar por categoría
    const productosFinales = [];

    for (const rel of relaciones) {
      const { producto_id, categoria } = rel;

      const { data: producto } = await supabase
        .from(categoria)
        .select("id, nombre")
        .eq("id", producto_id)
        .single();

      if (producto) {
        productosFinales.push({
          id: producto.id,
          nombre: producto.nombre,
          categoria,
        });
      }
    }

    // 3️⃣ Armar promo completa
    setPromoSeleccionada({
      id: promo.id,
      nombre: promo.nombre,
      precio: promo.precio,
      productos: productosFinales,
    });

    setModalOpen(true);
  };

  /* 🛒 Confirmar promo desde el modal */
  const handleConfirmPromo = (promoFinal) => {
    const pedidoActual =
      JSON.parse(sessionStorage.getItem("pedidoActual")) || {
        mesa: mesaParam || "sin_mesa",
        items: [],
      };

    pedidoActual.items.push({
      ...promoFinal,
      categoria: "promos",
    });

    sessionStorage.setItem(
      "pedidoActual",
      JSON.stringify(pedidoActual)
    );

    showNotification(`🎉 ${promoFinal.nombre} agregada`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-purple-100">
      <Navbar perfilRoute="/PerfilSupervisor" />

      {/* 🔔 NOTIFICACIONES */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notificaciones.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow text-white
              ${n.tipo === "error" ? "bg-red-500" : "bg-green-600"}`}
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
          <h1 className="text-2xl font-semibold text-gray-800">
            🎉 Promociones
          </h1>
          <p className="text-sm text-gray-600">
            {mesaParam === "llevar"
              ? "Pedido para llevar"
              : `Pedido para mesa ${mesaParam}`}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            router.push(`/N_Pedido/menu?mesa=${mesaParam}`)
          }
        >
          ← Volver al menú
        </Button>
      </div>

      {/* 🎁 GRID PROMOS */}
      <main className="grid grid-cols-2 gap-6 p-6 place-items-center">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="bg-white w-full max-w-xs rounded-2xl shadow-md border p-4 flex flex-col justify-between"
          >
            <div className="flex justify-center mb-3">
              {promo.img ? (
                <img
                  src={promo.img}
                  alt={promo.nombre}
                  className="w-40 h-40 object-cover rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-purple-700 text-center">
              {promo.nombre}
            </h3>

            <p className="text-sm text-gray-600 text-center mb-2 line-clamp-3">
              {promo.descripcion}
            </p>

            <p className="text-center text-gray-800 font-bold mb-3">
              Bs. {promo.precio}
            </p>

            <Button
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => cargarDetallePromo(promo)}
            >
              ✒️ LISTAR
            </Button>
          </div>
        ))}
      </main>

      {/* 🔘 VER PEDIDO */}
      <div className="p-6">
        <Button
          onClick={() =>
            router.push(`/N_Pedido/detalle_p?mesa=${mesaParam || ""}`)
          }
          className="w-full bg-green-600 text-white hover:bg-green-700"
        >
          🗒️ Ver pedido actual
        </Button>
      </div>

      {/* 🧩 MODAL */}
      {modalOpen && promoSeleccionada && (
        <PromoDetalleModal
          promo={promoSeleccionada}
          onClose={() => {
            setModalOpen(false);
            setPromoSeleccionada(null);
          }}
          onConfirm={handleConfirmPromo}
        />
      )}
    </div>
  );
}
