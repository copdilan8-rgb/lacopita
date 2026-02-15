"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import supabase from "@/utils/supabase/client";

export default function DetallePedidoPage() {
  const [pedido, setPedido] = useState({
    mesa: "",
    items: [],
    nota: "",
  });
  const [usuarioId, setUsuarioId] = useState(null);

  const router = useRouter();
  const params = useSearchParams();
  const mesaParam = params.get("mesa");

  /* 🔐 Obtener ID del usuario logueado */
  useEffect(() => {
    const idDelSessionStorage = sessionStorage.getItem("idUsuario");
    setUsuarioId(idDelSessionStorage ? Number(idDelSessionStorage) : 1);
  }, []);

  /* 🔹 Cargar pedido */
  useEffect(() => {
    const pedidoGuardado = JSON.parse(
      sessionStorage.getItem("pedidoActual")
    );

    if (pedidoGuardado) {
      setPedido({
        mesa: pedidoGuardado.mesa,
        items: pedidoGuardado.items || [],
        nota: pedidoGuardado.nota || "",
      });
    } else {
      setPedido({
        mesa: mesaParam || "sin_mesa",
        items: [],
        nota: "",
      });
    }
  }, [mesaParam]);

  /* ❌ Eliminar item */
  const handleEliminar = (index) => {
    const nuevoPedido = {
      ...pedido,
      items: pedido.items.filter((_, i) => i !== index),
    };

    sessionStorage.setItem("pedidoActual", JSON.stringify(nuevoPedido));
    setPedido(nuevoPedido);
  };

  /* 🧹 Vaciar pedido */
  const handleVaciar = () => {
    const nuevoPedido = {
      mesa: pedido.mesa,
      items: [],
      nota: "",
    };

    sessionStorage.setItem("pedidoActual", JSON.stringify(nuevoPedido));
    setPedido(nuevoPedido);
  };

  /* 📝 Nota */
  const handleNotaChange = (e) => {
    const nuevoPedido = {
      ...pedido,
      nota: e.target.value,
    };

    sessionStorage.setItem("pedidoActual", JSON.stringify(nuevoPedido));
    setPedido(nuevoPedido);
  };

  /* 🧮 Total */
  const total = pedido.items.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );

  /* ✅ CONFIRMAR PEDIDO */
  const handleConfirmar = async () => {
    if (pedido.items.length === 0) return;
    if (!usuarioId) {
      alert("Error: Usuario no identificado");
      return;
    }

    // Verificar que la caja esté abierta
    try {
      const res = await fetch(`/api/caja/obtener-actual?usuario_id=${usuarioId}`);
      const data = await res.json();
      
      if (!data.caja || data.caja.estado !== "abierta") {
        alert("⚠️ La caja está cerrada. Debes abrir caja antes de crear un pedido");
        return;
      }
    } catch (error) {
      console.error("Error verificando caja:", error);
      alert("Error al verificar el estado de la caja");
      return;
    }

    /* 1️⃣ Crear pedido */
    const mesaNumero = pedido.mesa === "llevar" ? null : Number(pedido.mesa);
    
    // Validar mesa_numero
    if (pedido.mesa !== "llevar" && (!mesaNumero || mesaNumero < 1 || mesaNumero > 9)) {
      alert("Error: Número de mesa inválido. Debe ser entre 1 y 9");
      return;
    }

    console.log("Creando pedido con:", {
      usuario_id: usuarioId,
      tipo: pedido.mesa === "llevar" ? "llevar" : "mesa",
      mesa_numero: mesaNumero,
      estado: "en_curso",
      monto_total: total,
    });

    const { data: pedidoDB, error: pedidoError } =
      await supabase
        .from("pedidos")
        .insert({
          usuario_id: usuarioId,
          tipo: pedido.mesa === "llevar" ? "llevar" : "mesa",
          mesa_numero: mesaNumero,
          estado: "en_curso",
          monto_total: total,
          nota: pedido.nota || null,
        })
        .select()
        .single();

    if (pedidoError) {
      console.error("Error al crear pedido:", pedidoError.message || JSON.stringify(pedidoError));
      alert(`Error al crear el pedido: ${pedidoError.message || "Intenta de nuevo"}`);
      return;
    }

    const pedidoId = pedidoDB.id;
    const detalles = [];

    /* 2️⃣ Detalle pedido */
    for (const item of pedido.items) {
      /* 🔹 PRODUCTO NORMAL (no promo) */
      if (item.tipo !== "promo") {
        detalles.push({
          pedido_id: pedidoId,
          categoria: item.categoria,
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          subtotal: item.subtotal,
          nota: item.tipo === "s.eleccion" && item.sabores
            ? `Sabores: ${item.sabores.join(", ")}`
            : null,
          detalle: null,
        });
      }

      /* 🔹 PROMO (UNA SOLA ENTRADA con detalle JSON) */
      if (item.tipo === "promo") {
        detalles.push({
          pedido_id: pedidoId,
          categoria: "promos",
          producto_id: item.promo_id || item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          subtotal: item.subtotal,
          nota: null,
          detalle: JSON.stringify(
            item.detalle.map((prod) => ({
              nombre: prod.nombre,
              categoria: prod.categoria,
              producto_id: prod.producto_id,
              cantidad: prod.cantidad,
              tipo: prod.tipo,
              sabores:
                prod.tipo === "s.eleccion" &&
                prod.saboresPorUnidad &&
                prod.saboresPorUnidad.length > 0
                  ? prod.saboresPorUnidad
                  : null,
            }))
          ),
        });
      }
    }

    const { error: detalleError } = await supabase
      .from("detalle_pedido")
      .insert(detalles);

    if (detalleError) {
      console.error("Error al guardar detalle:", detalleError.message || JSON.stringify(detalleError));
      console.error("Detalles que se intentaron guardar:", detalles);
      alert(`Error al guardar el detalle del pedido: ${detalleError.message || "Intenta de nuevo"}`);
      return;
    }

    /* 3️⃣ Limpieza y redirect */
    sessionStorage.removeItem("pedidoActual");
    router.push("/atajo_S");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-orange-100">
      <Navbar perfilRoute="/PerfilSupervisor" />

      <main className="flex-1 p-4 sm:p-6">
        {/* 🧾 Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              🧾 Detalle del Pedido
            </h1>
            <p className="text-sm text-gray-600">
              {pedido.mesa === "llevar"
                ? "Pedido para llevar"
                : `Pedido para mesa ${pedido.mesa}`}
            </p>
          </div>

          <Button
            className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            onClick={() =>
              router.push(`/N_Pedido/menu?mesa=${pedido.mesa}`)
            }
          >
            <ArrowLeft size={16} />
            Volver al menú
          </Button>
        </div>

        {/* 📦 SIN ITEMS */}
        {pedido.items.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            💤 No hay productos en el pedido todavía.
          </div>
        )}

        {/* 📱 MOBILE */}
        <div className="space-y-4 sm:hidden">
          {pedido.items.map((item, index) => (
            <div
              key={`${item.tipo}-${index}`}
              className="bg-white rounded-2xl shadow p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">
                  {item.nombre}
                </h3>
                <button
                  onClick={() => handleEliminar(index)}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-500 capitalize">
                {item.tipo === "promo" ? "Promoción" : item.categoria}
              </p>

              {item.tipo === "promo" && (
                <div className="mt-2 text-sm text-gray-600">
                  {item.detalle.map((d, i) => (
                    <div key={i}>
                      <div>• {d.nombre} (Cantidad: {d.cantidad})</div>
                      {d.tipo === "s.eleccion" && d.saboresPorUnidad && d.saboresPorUnidad.length > 0 && (
                        <div className="ml-4 text-xs text-gray-500 mt-1">
                          {d.saboresPorUnidad.map((sabores, idx) => (
                            <div key={idx}>
                              {d.nombre} #{idx + 1}: {sabores.length > 0 ? sabores.join(", ") : "Sin sabores"}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {item.tipo !== "promo" && item.tipo === "s.eleccion" && item.sabores && item.sabores.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">Sabores:</span> {item.sabores.join(", ")}
                </div>
              )}

              <div className="flex justify-between text-sm mt-3">
                <span>Cantidad: {item.cantidad}</span>
                <span>Bs. {item.precio.toFixed(2)}</span>
              </div>

              <div className="text-right font-semibold text-orange-700 mt-2">
                Subtotal: Bs. {item.subtotal.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* �️ DESKTOP */}
        <div className="hidden sm:block">
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Producto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Detalles</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Cantidad</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Precio</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Subtotal</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedido.items.map((item, index) => (
                  <tr key={`${item.tipo}-${index}`} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {item.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.tipo === "promo" ? (
                        <div className="space-y-1">
                          {item.detalle.map((d, i) => (
                            <div key={i}>
                              <div>• {d.nombre} (x{d.cantidad})</div>
                              {d.tipo === "s.eleccion" && d.saboresPorUnidad && d.saboresPorUnidad.length > 0 && (
                                <div className="ml-4 text-xs text-gray-500 mt-1">
                                  {d.saboresPorUnidad.map((sabores, idx) => (
                                    <div key={idx}>
                                      {d.nombre} #{idx + 1}: <span className="font-medium">{sabores.length > 0 ? sabores.join(", ") : "Sin sabores"}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <div>{item.categoria}</div>
                          {item.tipo === "s.eleccion" && item.sabores && item.sabores.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Sabores:</span> {item.sabores.join(", ")}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{item.cantidad}</td>
                    <td className="px-4 py-3 text-right text-sm">Bs. {item.precio.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">
                      Bs. {item.subtotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEliminar(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {pedido.items.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow p-4">
            <label className="block text-sm font-medium mb-2">
              📝 Nota para cocina / pedido (opcional)
            </label>
            <textarea
              value={pedido.nota}
              onChange={handleNotaChange}
              className="w-full min-h-[80px] border rounded-lg p-3 text-sm"
            />
          </div>
        )}

        {/* 🧮 TOTAL */}
        {pedido.items.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow p-4">
            <div className="text-lg font-semibold mb-4">
              Total: Bs. {total.toFixed(2)}
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleVaciar}
                className="bg-gradient-to-r from-red-400 to-rose-400 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Vaciar pedido
              </Button>

              <Button
                onClick={handleConfirmar}
                className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Pedido listo ✅
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
