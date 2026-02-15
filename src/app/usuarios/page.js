"use client";
import { useEffect, useState, useCallback } from "react";
import supabase from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Menu } from "lucide-react";
import Navbar from "@/components/NavBar";
import { openSideMenu } from "@/components/SideMenu";
import BotonVolver from "@/components/BotonVolver";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { NotificationContainer } from "@/components/NotificationContainer";

export default function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();
  const { notificaciones, showNotification } = useNotification();
  const [usuarios, setUsuarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setUsuarios(data);
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleDelete = useCallback(
    async (id) => {
      const { error } = await supabase.from("usuarios").delete().eq("id", id);
      if (!error) {
        showNotification("Usuario eliminado exitosamente ✅", "success");
        fetchUsuarios();
      } else {
        showNotification("Error al eliminar ❌", "error");
      }
    },
    [fetchUsuarios, showNotification]
  );

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  if (!usuarioActual) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-indigo-50 relative">
      <Navbar perfilRoute="/PerfilSupervisor" />

      <NotificationContainer notificaciones={notificaciones} />

      <div className="flex justify-between items-center px-6 mt-3 gap-2">
        <Button
          onClick={() => openSideMenu()}
          className="bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-400 hover:to-orange-400 text-gray-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Menu className="w-4 h-4 mr-2" /> Menú
        </Button>

        <BotonVolver />

        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" /> Agregar
        </Button>
      </div>

      <main className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios
          .filter((item) => String(item.id) !== String(usuarioActual?.id))
          .map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow p-4 border border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="mb-2 border-b pb-2">
                <h4 className="text-xs font-medium text-gray-500">Nombre</h4>
                <p className="text-lg font-semibold text-indigo-600">
                  {item.nombre} {item.apellido}
                </p>
                <h4 className="text-xs font-medium text-gray-500 mt-1">Rol</h4>
                <p className="text-sm font-semibold text-blue-600">{item.rol}</p>
              </div>

              <div className="mb-2 border-b pb-2">
                <h4 className="text-xs font-medium text-gray-500">CI</h4>
                <p className="text-sm text-gray-700">{item.ci}</p>
                <h4 className="text-xs font-medium text-gray-500 mt-1">
                  Teléfono
                </h4>
                <p className="text-sm text-gray-700">{item.telefono || "—"}</p>
              </div>

              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-500">PIN</h4>
                <p className="text-sm text-gray-700">••••••</p>
              </div>

              <div className="flex justify-center gap-3 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  <Pencil size={16} className="text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} className="text-red-600" />
                </Button>
              </div>
            </div>
          ))}
      </main>

      {modalOpen && (
        <UsuarioForm
          editingData={editingItem}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            fetchUsuarios();
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function UsuarioForm({ editingData, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    nombre: editingData?.nombre || "",
    apellido: editingData?.apellido || "",
    ci: editingData?.ci || "",
    telefono: editingData?.telefono || "",
    pin: editingData?.pin || "",
    rol: editingData?.rol || "Supervisor",
  });

  const handleChange = useCallback(
    (e) =>
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { error } = editingData
        ? await supabase
            .from("usuarios")
            .update(formData)
            .eq("id", editingData.id)
        : await supabase.from("usuarios").insert([formData]);
      if (!error) onSaved();
    },
    [formData, editingData, onSaved]
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          {editingData ? "Editar Usuario" : "Agregar Usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            required
            className="border rounded-lg px-3 py-2 focus:outline-indigo-500"
          />
          <input
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Apellido"
            required
            className="border rounded-lg px-3 py-2 focus:outline-indigo-500"
          />
          <input
            name="ci"
            value={formData.ci}
            onChange={handleChange}
            placeholder="CI"
            required
            className="border rounded-lg px-3 py-2 focus:outline-indigo-500"
          />
          <input
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            className="border rounded-lg px-3 py-2 focus:outline-indigo-500"
          />
          <input
            name="pin"
            value={formData.pin}
            onChange={handleChange}
            placeholder="PIN"
            required
            type="password"
            className="border rounded-lg px-3 py-2 focus:outline-indigo-500"
          />
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 focus:outline-indigo-500"
          >
            <option value="Supervisor">Supervisor</option>
          </select>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
