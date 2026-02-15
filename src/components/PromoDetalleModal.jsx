"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Trash2, Plus, Minus, Check } from "lucide-react";

export default function PromoDetalleModal({ promo, onClose, onConfirm }) {
  const [sabores, setSabores] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);

  const [productoAEliminar, setProductoAEliminar] = useState(null);

  /* 🔄 Cargar promo */
  useEffect(() => {
    if (!promo) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: promoProductos } = await supabase
        .from("promo_productos")
        .select("*")
        .eq("promo_id", promo.id);

      const { data: saboresData } = await supabase
        .from("sabores")
        .select("*")
        .order("nombre");

      setSabores(saboresData || []);

      const detalleInicial = [];

      for (const p of promoProductos || []) {
        const { data: prod } = await supabase
          .from(p.categoria)
          .select("*")
          .eq("id", p.producto_id)
          .single();

        if (!prod) continue;

        detalleInicial.push({
          categoria: p.categoria,
          producto_id: prod.id,
          nombre: prod.nombre,
          tipo: prod.tipo || "fijo",
          cantidad: 1,
          saboresPorUnidad:
            prod.tipo === "s.eleccion" ? [[]] : [],
          confirmadoHasta: 0,
        });
      }

      setDetalle(detalleInicial);
      setLoading(false);
    };

    fetchData();
  }, [promo]);

  /* ➕ */
  const sumar = (i) => {
    setDetalle((prev) =>
      prev.map((item, index) =>
        index === i
          ? {
              ...item,
              cantidad: item.cantidad + 1,
              saboresPorUnidad:
                item.tipo === "s.eleccion"
                  ? [...item.saboresPorUnidad, []]
                  : item.saboresPorUnidad,
            }
          : item
      )
    );
  };

  /* ➖ (🧼 resetea sabores) */
  const restar = (i) => {
    setDetalle((prev) =>
      prev.map((item, index) => {
        if (index !== i || item.cantidad <= 1) return item;

        const nuevaCantidad = item.cantidad - 1;

        return {
          ...item,
          cantidad: nuevaCantidad,
          saboresPorUnidad:
            item.tipo === "s.eleccion"
              ? item.saboresPorUnidad.slice(0, nuevaCantidad)
              : item.saboresPorUnidad,
          confirmadoHasta: Math.min(
            item.confirmadoHasta,
            nuevaCantidad
          ),
        };
      })
    );
  };

  /* 🗑️ solicitar eliminación */
  const solicitarEliminar = (i) => {
    if (detalle.length === 1) return;
    setProductoAEliminar(i);
  };

  /* 🗑️ confirmar eliminación */
  const confirmarEliminar = () => {
    setDetalle((prev) =>
      prev.filter((_, i) => i !== productoAEliminar)
    );
    setProductoAEliminar(null);
  };

  /* 🍨 */
  const toggleSabor = (itemIndex, unidadIndex, sabor) => {
    setDetalle((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item;

        const saboresUnidad =
          item.saboresPorUnidad[unidadIndex];
        const existe = saboresUnidad.includes(sabor);

        const copia = [...item.saboresPorUnidad];
        copia[unidadIndex] = existe
          ? saboresUnidad.filter((s) => s !== sabor)
          : [...saboresUnidad, sabor];

        return { ...item, saboresPorUnidad: copia };
      })
    );
  };

  /* ✅ */
  const confirmarSabores = (i) => {
    setDetalle((prev) =>
      prev.map((item, index) =>
        index === i
          ? {
              ...item,
              confirmadoHasta: item.confirmadoHasta + 1,
            }
          : item
      )
    );
  };

  /* ✅ Confirmar promo */
  const handleConfirm = () => {
    for (const item of detalle) {
      if (
        item.tipo === "s.eleccion" &&
        item.confirmadoHasta < item.cantidad
      ) {
        return;
      }
    }

    onConfirm({
      tipo: "promo",
      promo_id: promo.id,
      nombre: promo.nombre,
      precio: promo.precio,
      cantidad: 1,
      subtotal: promo.precio,
      detalle,
    });

    onClose();
  };

  if (!promo) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-2xl w-[540px] p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold text-purple-700">
              {promo.nombre}
            </h2>
            <X onClick={onClose} className="cursor-pointer" />
          </div>

          {detalle.map((item, i) => (
            <div
              key={`${item.producto_id}-${i}`}
              className="border rounded-xl p-3 mb-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">{item.nombre}</h4>

                <div className="flex items-center gap-2">
                  <button onClick={() => restar(i)}>
                    <Minus size={14} />
                  </button>

                  <span className="font-semibold">
                    {item.cantidad}
                  </span>

                  <button onClick={() => sumar(i)}>
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => solicitarEliminar(i)}
                    disabled={detalle.length === 1}
                    className={`ml-2 ${
                      detalle.length === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-red-500"
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {item.tipo === "s.eleccion" &&
                item.saboresPorUnidad.map(
                  (saboresU, idx) => (
                    <div
                      key={idx}
                      className={`mt-3 p-2 rounded-lg border ${
                        idx < item.confirmadoHasta
                          ? "bg-green-50 border-green-400"
                          : ""
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {item.nombre} #{idx + 1}
                      </p>

                      {idx === item.confirmadoHasta && (
                        <>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {sabores.map((s) => (
                              <button
                                key={s.id}
                                onClick={() =>
                                  toggleSabor(
                                    i,
                                    idx,
                                    s.nombre
                                  )
                                }
                                className={`border rounded p-2 text-sm ${
                                  saboresU.includes(
                                    s.nombre
                                  )
                                    ? "bg-purple-100 border-purple-400"
                                    : ""
                                }`}
                              >
                                {s.nombre}
                              </button>
                            ))}
                          </div>

                          <Button
                            onClick={() =>
                              confirmarSabores(i)
                            }
                            className="mt-2 w-full"
                            disabled={saboresU.length === 0}
                          >
                            Confirmar sabores
                          </Button>
                        </>
                      )}
                    </div>
                  )
                )}
            </div>
          ))}

          <Button
            onClick={handleConfirm}
            className="w-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mt-4"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmar Promo
          </Button>
        </div>
      </div>

      {/* ⚠️ Modal de confirmación */}
      {productoAEliminar !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-[360px]">
            <h3 className="font-semibold mb-4">
              ¿Eliminar producto?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Este producto será quitado de la promo.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() =>
                  setProductoAEliminar(null)
                }
                className="bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-slate-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Cancelar
              </Button>
              <Button
                className="bg-gradient-to-r from-red-400 to-rose-400 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={confirmarEliminar}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
