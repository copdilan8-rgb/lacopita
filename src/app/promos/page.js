"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Plus,
  Menu,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/NavBar";
import { openSideMenu } from "@/components/SideMenu";
import BotonVolver from "@/components/BotonVolver";
import PromoForm from "@/components/PromoForm"; // 🆕 NUEVO FORMULARIO

export default function PromosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [promos, setPromos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);

  /* 🔐 Sesión */
  useEffect(() => {
    const id = sessionStorage.getItem("idUsuario");
    const rol = sessionStorage.getItem("rolSeleccionado");
    if (!id || !rol) {
      router.push("/");
      return;
    }
    setUsuario({ id });
  }, [router]);

  /* 📥 Obtener promos */
  const fetchPromos = async () => {
    const { data, error } = await supabase
      .from("promos")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setPromos(data);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  /* 🔔 Notificaciones */
  const showNotification = (mensaje, tipo = "success") => {
    const id = Date.now();
    setNotificaciones((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  /* 🗑 Eliminar promo + productos */
  const handleDelete = async (id) => {
    const { error } = await supabase.from("promos").delete().eq("id", id);
    if (!error) {
      showNotification("Promoción eliminada ✅");
      fetchPromos();
    } else {
      showNotification("Error al eliminar ❌", "error");
    }
  };

  /* ✏ Editar */
  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  /* ➕ Nueva */
  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-amber-100">
      <Navbar perfilRoute="/PerfilSupervisor" />

      {/* 🔔 Notificaciones */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notificaciones.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-2 rounded-lg shadow text-white ${
              n.tipo === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {n.mensaje}
          </div>
        ))}
      </div>

      {/* 🔘 Botones */}
      <div className="flex justify-between items-center px-6 mt-3">
        <Button
          onClick={() => openSideMenu()}
          className="bg-gray-200 text-gray-800"
        >
          <Menu className="w-4 h-4 mr-2" /> Menú
        </Button>

        <BotonVolver />

        <Button
          onClick={handleAdd}
          className="bg-orange-600 text-white hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Nueva Promo
        </Button>
      </div>

      {/* 🧾 Cards */}
      <main className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {promos.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-64"
          >
            <div className="flex gap-3 border-b pb-2">
              <div className="w-1/2 flex justify-center">
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.nombre}
                    className="w-[70%] h-[70%] object-cover rounded-md"
                  />
                ) : (
                  <div className="w-[70%] h-[70%] bg-gray-100 flex items-center justify-center text-xs">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="w-1/2">
                <h3 className="text-sm font-semibold text-orange-600">
                  {item.nombre}
                </h3>
                <p className="text-blue-500 font-bold">
                  Bs. {parseFloat(item.precio).toFixed(2)}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 line-clamp-3 mt-2">
              {item.descripcion || "Sin descripción"}
            </p>

            <div className="flex justify-center gap-3 mt-3">
              <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                <Pencil size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </main>

      {/* 🧩 MODAL PROMO */}
      {modalOpen && (
        <PromoForm
          editingData={editingItem}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            fetchPromos();
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
