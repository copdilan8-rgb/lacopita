"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase/client";
import imageCompression from "browser-image-compression";
import { Eye, EyeOff, Upload, Trash2, Edit3, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function PerfilSupervisorPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = {
      id: sessionStorage.getItem("idUsuario"),
      nombre: sessionStorage.getItem("nombreUsuario"),
      apellido: sessionStorage.getItem("apellidoUsuario"),
      telefono: sessionStorage.getItem("telefonoUsuario"),
      pin: sessionStorage.getItem("pinUsuario"),
      rol: sessionStorage.getItem("rolSeleccionado"),
      avatar: sessionStorage.getItem("avatarUsuario"),
    };

    if (!storedUser.id || storedUser.rol !== "Supervisor") {
      router.push("/");
    } else {
      setUsuario(storedUser);
    }
  }, [router]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // 📤 Subir o actualizar imagen (con compresión)
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !usuario) return;

    try {
      setLoading(true);

      // ⚙️ Opciones de compresión
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      // 🔽 Comprimir imagen
      const compressedFile = await imageCompression(file, options);

      const fileExt = compressedFile.name.split(".").pop();
      const fileName = `${usuario.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 🧠 Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 📝 Actualizar en DB
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ avatar: data.publicUrl })
        .eq("id", usuario.id);

      if (updateError) throw updateError;

      setUsuario({ ...usuario, avatar: data.publicUrl });
      sessionStorage.setItem("avatarUsuario", data.publicUrl);

      showToast("✅ Imagen actualizada con éxito");
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      console.error("Error al subir avatar:", error.message);
      showToast("❌ Error al subir imagen", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Eliminar avatar
  const handleDeleteAvatar = async () => {
    if (!usuario?.avatar) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("usuarios")
        .update({ avatar: null })
        .eq("id", usuario.id);

      if (error) throw error;

      setUsuario({ ...usuario, avatar: null });
      sessionStorage.removeItem("avatarUsuario");

      showToast("🗑️ Imagen eliminada correctamente");
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      console.error("Error al eliminar avatar:", error.message);
      showToast("❌ Error al eliminar imagen", "error");
    } finally {
      setLoading(false);
    }
  };

  // 💾 Guardar cambios
  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("usuarios")
        .update({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          telefono: usuario.telefono,
          pin: usuario.pin,
        })
        .eq("id", usuario.id);

      if (error) throw error;

      sessionStorage.setItem("nombreUsuario", usuario.nombre);
      sessionStorage.setItem("apellidoUsuario", usuario.apellido);
      sessionStorage.setItem("telefonoUsuario", usuario.telefono);
      sessionStorage.setItem("pinUsuario", usuario.pin);

      setEditMode(false);
      showToast("✅ Datos actualizados correctamente");
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      console.error("Error al actualizar:", error.message);
      showToast("❌ Error al guardar cambios", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col items-center py-10 relative">
      {/* 🔔 Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-md text-white font-medium z-50 ${
              toast.type === "error" ? "bg-red-500" : "bg-blue-600"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔙 Volver */}
      <div className="absolute left-6 top-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-gray-100 mt-10">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Perfil del Supervisor 🧾
        </h2>

        {/* 🧍 Avatar */}
        <div className="flex flex-col items-center mb-6">
          {usuario.avatar ? (
            <img
              src={usuario.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-blue-500 text-white text-3xl font-bold">
              {usuario.nombre?.charAt(0).toUpperCase()}
              {usuario.apellido?.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current.click()}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Subiendo...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1" />{" "}
                  {usuario.avatar ? "Actualizar" : "Subir"}
                </>
              )}
            </Button>
            {usuario.avatar && (
              <Button
                variant="destructive"
                onClick={handleDeleteAvatar}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
              </Button>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        {/* 📋 Info usuario */}
        <div className="space-y-4">
          {[{ label: "Nombre", key: "nombre" },
            { label: "Apellido", key: "apellido" },
            { label: "Teléfono", key: "telefono" }]
            .map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-600">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={usuario[field.key] || ""}
                  disabled={!editMode}
                  onChange={(e) =>
                    setUsuario({ ...usuario, [field.key]: e.target.value })
                  }
                  className={`w-full mt-1 border rounded-md p-2 text-gray-700 ${
                    editMode ? "bg-white border-gray-300" : "bg-gray-100"
                  }`}
                />
              </div>
            ))}

          {/* 🔑 PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              PIN
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showPin ? "text" : "password"}
                value={usuario.pin || ""}
                disabled={!editMode}
                onChange={(e) =>
                  setUsuario({ ...usuario, pin: e.target.value })
                }
                className={`w-full mt-1 border rounded-md p-2 text-gray-700 ${
                  editMode ? "bg-white border-gray-300" : "bg-gray-100"
                }`}
              />
              <Button
                variant="ghost"
                onClick={() => setShowPin(!showPin)}
                className="mt-1"
              >
                {showPin ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ⚙️ Botones */}
        <div className="flex justify-between mt-6">
          {editMode ? (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <span className="animate-pulse">Guardando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Guardar
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              disabled={loading}
            >
              <Edit3 className="w-4 h-4 mr-2" /> Editar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}