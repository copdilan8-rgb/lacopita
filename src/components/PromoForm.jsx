"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2 } from "lucide-react";

export default function PromoForm({ editingData, onClose, onSaved }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [img, setImg] = useState("");

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [categorias] = useState([
    "batidos",
    "cafeteria",
    "comidas",
    "sandwichs",
    "reposteria",
    "refrescos",
    "helados",
  ]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  /* ✏ Cargar datos si es edición */
  useEffect(() => {
    if (editingData) {
      setNombre(editingData.nombre);
      setDescripcion(editingData.descripcion || "");
      setPrecio(editingData.precio);
      setImg(editingData.img || "");
      fetchProductosPromo(editingData.id);
    }
  }, [editingData]);

  /* 📦 Traer productos de la categoría */
  const fetchProductos = async (tabla) => {
    if (!tabla || tabla.trim() === "") {
      setProductos([]);
      return;
    }
    const { data } = await supabase.from(tabla).select("id, nombre");
    setProductos(data && Array.isArray(data) ? data : []);
  };

  /* 📦 Productos asociados a la promo */
  const fetchProductosPromo = async (promoId) => {
    const { data } = await supabase
      .from("promo_productos")
      .select("*")
      .eq("promo_id", promoId);

    if (data) setProductosSeleccionados(data);
  };

  /* ➕ Agregar producto */
  const agregarProducto = (producto) => {
    const existe = productosSeleccionados.find(
      (p) =>
        p.producto_id === producto.id && p.categoria === categoriaSeleccionada
    );

    if (existe) return;

    setProductosSeleccionados((prev) => [
      ...prev,
      {
        categoria: categoriaSeleccionada,
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
      },
    ]);
  };

  /* ➖ Quitar producto */
  const quitarProducto = (index) => {
    setProductosSeleccionados((prev) => prev.filter((_, i) => i !== index));
  };

  /* 🔢 Cambiar cantidad */
  const cambiarCantidad = (index, valor) => {
    setProductosSeleccionados((prev) =>
      prev.map((p, i) => (i === index ? { ...p, cantidad: valor } : p))
    );
  };

  /* 🖼️ Compresión de imagen (reduce MB sin perder calidad visual) */
  const compressImage = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => (img.src = e.target.result);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.75);
      };

      reader.readAsDataURL(file);
    });

  /* 💾 Guardar Promo */
  const handleSave = async () => {
    if (!nombre || !precio || productosSeleccionados.length === 0) return;

    let promoId = editingData?.id;
    let imageUrl = img;

    /* 📤 Subir imagen si existe */
    if (file) {
      setUploading(true);

      const compressed = await compressImage(file);
      const filePath = `promos/promo-${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("productos")
        .upload(filePath, compressed, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!error) {
        const { data } = supabase.storage
          .from("productos")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      setUploading(false);
    }

    /* ✏ Editar */
    if (editingData) {
      await supabase
        .from("promos")
        .update({ nombre, descripcion, precio, img: imageUrl })
        .eq("id", promoId);

      await supabase.from("promo_productos").delete().eq("promo_id", promoId);
    } else {
    /* ➕ Crear */
      const { data } = await supabase
        .from("promos")
        .insert([{ nombre, descripcion, precio, img: imageUrl }])
        .select();

      promoId = data[0].id;
    }

    const inserts = productosSeleccionados.map((p) => ({
      promo_id: promoId,
      categoria: p.categoria,
      producto_id: p.producto_id,
      cantidad: p.cantidad,
    }));

    await supabase.from("promo_productos").insert(inserts);

    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[480px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {editingData ? "Editar Promo" : "Nueva Promo"}
          </h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        <input
          className="w-full border rounded-lg p-2 mb-2"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg p-2 mb-2"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <input
          type="number"
          className="w-full border rounded-lg p-2 mb-2"
          placeholder="Precio total"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="w-full border rounded-lg p-2 mb-4"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <select
          className="w-full border rounded-lg p-2 mb-2"
          value={categoriaSeleccionada}
          onChange={(e) => {
            setCategoriaSeleccionada(e.target.value);
            fetchProductos(e.target.value);
          }}
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {productos.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center border-b py-1"
          >
            <span>{p.nombre}</span>
            <Button size="sm" onClick={() => agregarProducto(p)}>
              <Plus size={14} />
            </Button>
          </div>
        ))}

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Productos en la promo</h4>
          {productosSeleccionados.map((p, i) => (
            <div
              key={`${p.categoria}-${p.producto_id}`}
              className="flex items-center justify-between mb-2"
            >
              <span className="text-sm">
                {p.nombre} ({p.categoria})
              </span>

              <input
                type="number"
                min="1"
                className="w-16 border rounded p-1"
                value={p.cantidad}
                onChange={(e) => cambiarCantidad(i, parseInt(e.target.value))}
              />

              <Trash2
                className="cursor-pointer text-red-500"
                size={16}
                onClick={() => quitarProducto(i)}
              />
            </div>
          ))}
        </div>

        <Button
          disabled={uploading}
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {uploading ? "Subiendo imagen..." : "Guardar Promo"}
        </Button>
      </div>
    </div>
  );
}
