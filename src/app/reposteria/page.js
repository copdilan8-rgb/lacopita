"use client";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Menu } from "lucide-react";
import Navbar from "@/components/NavBar";
import ProductForm from "@/components/ProductosForm";
import { openSideMenu } from "@/components/SideMenu";
import BotonVolver from "@/components/BotonVolver";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { useProductos } from "@/hooks/useProductos";
import { NotificationContainer } from "@/components/NotificationContainer";
import { ProductCard } from "@/components/ProductCard";

const TABLE_NAME = "reposteria";

export default function ReposteriaPage() {
  const { usuario } = useAuth();
  const { notificaciones, showNotification } = useNotification();
  const {
    productos,
    modalOpen,
    editingItem,
    setModalOpen,
    fetchProductos,
    handleDelete: deleteProducto,
    handleEdit,
    handleAdd,
  } = useProductos(TABLE_NAME);

  const handleDelete = useCallback(
    async (id) => {
      const { error } = await deleteProducto(id);
      if (!error) {
        showNotification("Eliminado exitosamente ✅", "success");
        fetchProductos();
      } else {
        showNotification("Error al eliminar ❌", "error");
      }
    },
    [deleteProducto, fetchProductos, showNotification]
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-rose-100 relative">
      <Navbar perfilRoute="/PerfilSupervisor" />

      <NotificationContainer notificaciones={notificaciones} />

      <div className="flex justify-between items-center px-6 mt-2 gap-2">
        <Button
          onClick={() => openSideMenu()}
          className="bg-gradient-to-r from-pink-300 to-rose-300 hover:from-pink-400 hover:to-rose-400 text-gray-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Menu className="w-4 h-4 mr-2" /> Menú
        </Button>

        <BotonVolver />

        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" /> Agregar
        </Button>
      </div>

      <main className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {productos.map((item) => (
          <ProductCard
            key={item.id}
            producto={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </main>

      {modalOpen && (
        <ProductForm
          editingData={editingItem}
          tableName={TABLE_NAME}
          onClose={handleCloseModal}
          onSaved={() => {
            fetchProductos();
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

