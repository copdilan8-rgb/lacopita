"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase/client";
import { X } from "lucide-react";
import { formatearFechaLocal } from "@/utils/dateTimeUtils";

export default function PedidoDetalleModal({ pedidoId, onClose }) {
  const [pedido, setPedido] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pedidoId) return;

    const fetchDetalle = async () => {
      setLoading(true);

      /* 🔹 Pedido */
      const { data: pedidoData, error: pedidoError } =
        await supabase
          .from("pedidos")
          .select("*")
          .eq("id", pedidoId)
          .single();

      if (pedidoError) {
        console.error("Error pedido:", pedidoError);
        setLoading(false);
        return;
      }

      /* 🔹 Detalle */
      const { data: detalleData, error: detalleError } =
        await supabase
          .from("detalle_pedido")
          .select("*")
          .eq("pedido_id", pedidoId);

      if (detalleError) {
        console.error("Error detalle:", detalleError);
        setDetalle([]);
      } else {
        /* 🔹 Enriquecer datos con nombres y parsear JSON */
        const detalleEnriquecido = [];
        
        for (const item of detalleData || []) {
          let nombreProducto = item.categoria;
          let detalleParseado = null;
          
          try {
            if (item.categoria === "promos") {
              /* 🔹 Para promos, obtener nombre desde tabla promos */
              const { data: promos } = await supabase
                .from("promos")
                .select("nombre")
                .eq("id", item.producto_id);
              
              if (promos && promos.length > 0) {
                nombreProducto = promos[0].nombre;
              }

              /* 🔹 Parsear detalle JSON y enriquecer con nombres */
              if (item.detalle) {
                try {
                  detalleParseado = JSON.parse(item.detalle);
                  
                  /* Enriquecer cada producto con su nombre real */
                  for (const prod of detalleParseado || []) {
                    if (prod.categoria && prod.producto_id) {
                      const { data: productos } = await supabase
                        .from(prod.categoria)
                        .select("nombre")
                        .eq("id", prod.producto_id);
                      
                      if (productos && productos.length > 0) {
                        prod.nombreProducto = productos[0].nombre;
                      } else {
                        prod.nombreProducto = `${prod.categoria} #${prod.producto_id}`;
                      }
                    }
                  }
                } catch (e) {
                  console.error("Error parseando detalle JSON:", e);
                }
              }
            } else {
              /* 🔹 Para todos los demás (helados, batidos, cafeteria, etc.) */
              const { data: productos } = await supabase
                .from(item.categoria)
                .select("nombre")
                .eq("id", item.producto_id);
              
              if (productos && productos.length > 0) {
                nombreProducto = productos[0].nombre;
              }
            }
          } catch (e) {
            console.error(`Error obteniendo nombre de ${item.categoria}:`, e);
          }
          
          detalleEnriquecido.push({
            ...item,
            nombreProducto,
            detalleParseado,
          });
        }
        
        setDetalle(detalleEnriquecido);
      }

      setPedido(pedidoData);
      setLoading(false);
    };

    fetchDetalle();
  }, [pedidoId]);

  if (!pedidoId) return null;

  const total = detalle.reduce((sum, item) => sum + Number(item.subtotal), 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-5 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              🧾 Pedido #{pedidoId}
            </h2>
            <p className="text-sm text-gray-600">
              {pedido?.tipo === "llevar"
                ? "🥡 Para llevar"
                : `🍽️ Mesa ${pedido?.mesa_numero}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">
            ⏳ Cargando detalle...
          </p>
        ) : (
          <>
            {/* INFO GENERAL */}
            <div className="text-sm text-gray-600 mb-4 space-y-1 pb-4 border-b">
              <p>
                Estado:{" "}
                <span className="font-semibold capitalize">
                  {pedido?.estado}
                </span>
              </p>
              <p>
                Creado:{" "}
                {pedido?.creado_en
                  ? formatearFechaLocal(pedido.creado_en, "corto")
                  : "N/A"}
              </p>
            </div>

            {/* TABLA DE PRODUCTOS - MOBILE */}
            <div className="sm:hidden space-y-3 mb-6">
              {detalle.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-lg border p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {item.nombreProducto}
                      </h4>
                    </div>
                    <p className="font-semibold">x{item.cantidad}</p>
                  </div>

                  {/* DETALLE DE PROMO */}
                  {item.categoria === "promos" && item.detalleParseado && (
                    <div className="mt-2 text-sm text-gray-600 bg-purple-50 p-2 rounded">
                      {Array.isArray(item.detalleParseado) && item.detalleParseado.map((prod, pidx) => (
                        <div key={pidx} className="mb-2 pb-2 border-b border-purple-200 last:border-b-0">
                          <p className="font-semibold">{prod.nombreProducto || prod.nombre}</p>
                          {prod.sabores && Array.isArray(prod.sabores) && prod.sabores.length > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              🍨 {prod.sabores.map(s => Array.isArray(s) ? s.join(", ") : s).join(" | ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SABORES DE HELADO INDIVIDUAL */}
                  {item.categoria === "helados" && item.nota && item.nota.startsWith("Sabores:") && (
                    <div className="text-xs text-gray-600 mt-2 bg-blue-50 p-2 rounded">
                      <span className="font-medium">🍨 {item.nota}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm mt-2">
                    <span>Unitario: Bs. {Number(item.precio_unitario).toFixed(2)}</span>
                    <span className="font-semibold">Bs. {Number(item.subtotal).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* TABLA DE PRODUCTOS - DESKTOP */}
            <div className="hidden sm:block mb-6">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Producto</th>
                      <th className="px-4 py-2 text-left font-semibold">Detalle</th>
                      <th className="px-4 py-2 text-center font-semibold">Cantidad</th>
                      <th className="px-4 py-2 text-right font-semibold">Unitario</th>
                      <th className="px-4 py-2 text-right font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-semibold">
                          {item.nombreProducto}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {item.categoria === "promos" && item.detalleParseado ? (
                            <div className="bg-purple-50 p-1.5 rounded space-y-1">
                              {Array.isArray(item.detalleParseado) && item.detalleParseado.map((prod, pidx) => (
                                <div key={pidx} className="border-l-2 border-purple-300 pl-2">
                                  <p className="font-medium">{prod.nombreProducto || prod.nombre}</p>
                                  {prod.sabores && Array.isArray(prod.sabores) && prod.sabores.length > 0 && (
                                    <p className="text-gray-600">
                                      🍨 {prod.sabores.map(s => Array.isArray(s) ? s.join(", ") : s).join(" | ")}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : item.categoria === "helados" && item.nota && item.nota.startsWith("Sabores:") ? (
                            <div className="bg-blue-50 p-1.5 rounded font-medium">
                              🍨 {item.nota}
                            </div>
                          ) : item.categoria === "helados" ? (
                            <div className="text-gray-400 italic">Sin sabores especificados</div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center font-semibold">
                          {item.cantidad}
                        </td>
                        <td className="px-4 py-2 text-right">
                          Bs. {Number(item.precio_unitario).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          Bs. {Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTAL */}
            <div className="text-right font-semibold text-lg text-orange-700 mb-4 pb-4 border-b">
              Total: Bs. {total.toFixed(2)}
            </div>

            {/* NOTA GENERAL DEL PEDIDO - SEPARADA */}
            {pedido?.nota && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  📝 Nota General del Pedido
                </h3>
                <p className="text-sm text-amber-800">
                  {pedido.nota}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
