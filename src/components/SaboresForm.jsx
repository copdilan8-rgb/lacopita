"use client";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase/client";

export default function SaboresForm({
  editingData,
  onClose,
  onSaved,
  tableName = "sabores",
}) {
  const [form, setForm] = useState({
    nombre: "",
    img: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingData) {
      setForm({
        nombre: editingData.nombre || "",
        img: editingData.img || "",
      });
      setSelectedFile(null);
    } else {
      setForm({
        nombre: "",
        img: "",
      });
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

          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            const scaleSize = MAX_WIDTH / width;
            width = MAX_WIDTH;
            height = height * scaleSize;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

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
    const nombreLimpio = form.nombre.trim();

    if (!nombreLimpio) {
      alert("El nombre del sabor es obligatorio");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = form.img;

      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          alert("No se pudo subir la imagen");
          setUploading(false);
          return;
        }
      }

      const dataToSave = {
        nombre: nombreLimpio,
        img: imageUrl || null,
      };

      let response;

      if (editingData) {
        response = await supabase
          .from(tableName)
          .update(dataToSave)
          .eq("id", editingData.id);
      } else {
        response = await supabase
          .from(tableName)
          .insert([dataToSave]);
      }

      if (response.error) {
        console.error("Error guardando sabor:", response.error);
        alert(`Error al guardar: ${response.error.message}`);
        setUploading(false);
        return;
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Error inesperado:", error);
      alert("Ocurrió un error inesperado al guardar el sabor");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.25)" }}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative border border-gray-200">
        <button
          onClick={onClose}
          disabled={uploading}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-semibold mb-4 text-red-600 text-center">
          {editingData ? "Editar Sabor" : "Agregar Sabor"}
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre del sabor"
            value={form.nombre}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, nombre: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-red-200 outline-none"
            disabled={uploading}
          />

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="uploadSaborImg"
              disabled={uploading}
            />
            <label
              htmlFor="uploadSaborImg"
              className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              <Upload size={18} />
              {selectedFile ? selectedFile.name : "Subir imagen"}
            </label>

            {form.img && !selectedFile && (
              <span className="text-xs text-gray-500">
                Imagen actual cargada
              </span>
            )}
          </div>

          {(selectedFile || form.img) && (
            <div className="flex justify-center">
              <img
                src={selectedFile ? URL.createObjectURL(selectedFile) : form.img}
                alt="Vista previa"
                className="w-28 h-28 object-cover rounded-lg border border-red-200 shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button
            onClick={onClose}
            disabled={uploading}
            className="bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-slate-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSave}
            disabled={uploading}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}