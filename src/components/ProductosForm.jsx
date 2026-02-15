"use client";
import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase/client";
import { usePathname } from "next/navigation";

export default function ProductForm({
  editingData,
  onClose,
  onSaved,
  tableName = "batidos",
}) {
  const pathname = usePathname(); // ✅ Detecta la ruta actual
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    img: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Determinar título dinámico según la ruta
  const getTitulo = () => {
    if (pathname.includes("/cafeteria")) return "Cafes";
    if (pathname.includes("/batidos")) return "Batidos";
    if (pathname.includes("/sandwichs")) return "Sándwichs";
    if (pathname.includes("/comidas")) return "Platillo";
    if (pathname.includes("/paninis")) return "Paninis";
    if (pathname.includes("/reposteria")) return "Postres";
    if (pathname.includes("/refrescos")) return "Refresco";
    if (pathname.includes("/promos")) return "Promociones";
    if (pathname.includes("/usuarios")) return "Usuario";
    return "Producto";
  };

  useEffect(() => {
    if (editingData) {
      setForm({
        nombre: editingData.nombre || "",
        precio: editingData.precio || "",
        descripcion: editingData.descripcion || "",
        img: editingData.img || "",
      });
    } else {
      setForm({ nombre: "", precio: "", descripcion: "", img: "" });
      setSelectedFile(null);
    }
  }, [editingData]);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.7
          );
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (file) => {
    const compressedFile = await compressImage(file);
    const filePath = `${tableName}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("productos")
      .upload(filePath, compressedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error subiendo imagen:", error);
      return null;
    }

    const { data } = supabase.storage.from("productos").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setUploading(true);
    let imageUrl = form.img;

    if (selectedFile) {
      const uploadedUrl = await uploadImage(selectedFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const dataToSave = { ...form, img: imageUrl };

    if (editingData) {
      await supabase.from(tableName).update(dataToSave).eq("id", editingData.id);
    } else {
      await supabase.from(tableName).insert([dataToSave]);
    }

    setUploading(false);
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backdropFilter: "blur(6px)" }}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative border border-gray-200">
        {/* ❌ Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        {/* 🏷️ Título dinámico */}
        <h3 className="text-xl font-semibold mb-4 text-indigo-600 text-center">
          {editingData
            ? `Editar ${getTitulo()}`
            : `Agregar ${getTitulo()}`}
        </h3>

        {/* 🧾 Formulario */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
          />
          <input
            type="number"
            placeholder="Precio"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
          />
          <textarea
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-indigo-200"
          />

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="hidden"
              id="uploadImg"
            />
            <label
              htmlFor="uploadImg"
              className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              <Upload size={18} />
              {selectedFile ? selectedFile.name : "Subir imagen"}
            </label>
          </div>
        </div>

        {/* 🔘 Botones */}
        <div className="mt-5 flex justify-end gap-3">
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-slate-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={uploading}
            className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
