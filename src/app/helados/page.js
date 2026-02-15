"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Menu, Pencil, Trash2, Upload, X, XCircle, CheckCircle } from "lucide-react";
import Navbar from "@/components/NavBar";
import { openSideMenu } from "@/components/SideMenu";
import BotonVolver from "@/components/BotonVolver";
import { useAuth } from "@/hooks/useAuth";
import supabase from "@/utils/supabase/client";

const TABLE_NAME = "helados";

export default function HeladosPage() {
  const { usuario } = useAuth();
  const [helados, setHelados] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // 🔹 Cargar helados
  useEffect(() => {
    if (usuario) {
      fetchHelados();
    }
  }, [usuario]);

  const fetchHelados = async () => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("id", { ascending: false });

    if (!error) setHelados(data || []);
  };

  const showNotification = (mensaje, tipo = "success") => {
    const id = Date.now();
    setNotificaciones((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
    if (!error) {
      showNotification("Eliminado exitosamente ✅", "success");
      fetchHelados();
    } else {
      showNotification("Error al eliminar ❌", "error");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-cyan-100 relative">
      {/* 🔹 Navbar */}
      <Navbar perfilRoute="/PerfilSupervisor" />

      {/* 🔹 Notificaciones */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notificaciones.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md text-white transition-all duration-500 ${
              n.tipo === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {n.tipo === "error" ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{n.mensaje}</span>
          </div>
        ))}
      </div>

      {/* 🔹 Botones superiores */}
      <div className="flex justify-between items-center px-6 mt-3">
        <Button
          onClick={() => openSideMenu()}
          className="bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          <Menu className="w-4 h-4 mr-2" /> Menú
        </Button>

        {/* ✅ BOTÓN CONTEXTUAL (CENTRO) */}
        <BotonVolver />

        <Button
          onClick={handleAdd}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Agregar
        </Button>
      </div>

      {/* 🔹 Tarjetas */}
      <main className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {helados.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-64 border border-gray-200 hover:shadow-lg transition-all"
          >
            {/* Fila 1 */}
            <div className="flex flex-row flex-[0.5] gap-3 items-center border-b border-gray-200 pb-2">
              <div className="w-1/2 flex items-center justify-center">
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.nombre}
                    className="w-[50%] h-[50%] object-cover rounded-md shadow-sm"
                  />
                ) : (
                  <div className="w-[50%] h-[50%] bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="w-1/2 flex flex-col justify-between h-full py-1">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Nombre</h4>
                  <h3 className="text-sm font-semibold text-blue-700">
                    {item.nombre}
                  </h3>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Precio</h4>
                  <p className="text-blue-500 font-bold text-sm">
                    Bs. {item.precio}
                  </p>
                </div>
              </div>
            </div>

            {/* Fila 2 */}
            <div className="flex-[0.35] flex flex-col justify-start mt-2 border-b border-gray-200 pb-2 px-1">
              <h4 className="text-xs font-medium text-gray-500 mb-1">
                Descripción
              </h4>
              <p className="text-gray-700 text-sm text-left line-clamp-3">
                {item.descripcion}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Tipo:</strong> {item.tipo}
              </p>
            </div>

            {/* Fila 3 */}
            <div className="flex-[0.15] flex justify-center items-center gap-3 mt-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                <Pencil size={16} className="text-blue-600" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                <Trash2 size={16} className="text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </main>

      {/* 🔹 Modal (formulario adaptado) */}
      {modalOpen && (
        <HeladoForm
          editingData={editingItem}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            fetchHelados();
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------
   🔹 FORMULARIO ESPECÍFICO PARA HELADOS
------------------------------------------------------------ */
function HeladoForm({ editingData, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    tipo: "fijo",
    img: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingData) setForm(editingData);
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
    const compressed = await compressImage(file);
    const filePath = `helados/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("productos")
      .upload(filePath, compressed);

    if (error) return null;
    const { data } = supabase.storage.from("productos").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setUploading(true);
    let imageUrl = form.img;
    if (selectedFile) {
      const uploaded = await uploadImage(selectedFile);
      if (uploaded) imageUrl = uploaded;
    }

    const dataToSave = { ...form, img: imageUrl };

    if (editingData) {
      await supabase.from("helados").update(dataToSave).eq("id", editingData.id);
    } else {
      await supabase.from("helados").insert([dataToSave]);
    }

    setUploading(false);
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backdropFilter: "blur(6px)" }}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-semibold mb-4">
          {editingData ? "Editar Helado" : "Agregar Helado"}
        </h3>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
          />
          <input
            type="number"
            placeholder="Precio"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
          />
          <textarea
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
          />

          {/* Campo Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tipo de Helado
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
            >
              <option value="fijo">Fijo</option>
              <option value="s.eleccion">S. Elección</option>
            </select>
          </div>

          {/* Imagen */}
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

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={uploading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {uploading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
