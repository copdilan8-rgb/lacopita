"use client";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Menu, Pencil, Trash2 } from "lucide-react";
import Navbar from "@/components/NavBar";
import ProductForm from "@/components/ProductosForm";
import { openSideMenu } from "@/components/SideMenu";
import BotonVolver from "@/components/BotonVolver";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { useProductos } from "@/hooks/useProductos";
import { NotificationContainer } from "@/components/NotificationContainer";

const TABLE_NAME = "sabores";

export default function SaboresPage() {
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50 to-red-100 relative">
      <Navbar perfilRoute="/PerfilSupervisor" />

      <NotificationContainer notificaciones={notificaciones} />

      <div className="flex justify-between items-center px-6 mt-2 gap-2">
        <Button
          onClick={() => openSideMenu()}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Menu className="w-4 h-4 mr-2" /> Menú
        </Button>

        <BotonVolver />

        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" /> Agregar
        </Button>
      </div>

      <main className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 p-3 md:p-6 max-w-2xl md:max-w-4xl mx-auto">
        {productos.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-lg p-4 md:p-5 flex flex-col items-center justify-center min-h-56 md:h-64 border-2 border-red-500 hover:shadow-xl hover:border-red-600 transition-all"
          >
            <div className="flex items-center justify-center mb-3 md:mb-4">
              {item.img ? (
                <img
                  src={item.img}
                  alt={item.nombre}
                  className="w-28 md:w-32 h-28 md:h-32 object-cover rounded-lg shadow-md border border-red-300"
                />
              ) : (
                <div className="w-28 md:w-32 h-28 md:h-32 bg-red-100 rounded-lg flex items-center justify-center text-red-400 text-sm font-semibold">
                  Sin imagen
                </div>
              )}
            </div>

            <h3 className="text-base md:text-lg font-bold text-red-600 text-center w-full px-2 mb-3 line-clamp-2">
              {item.nombre}
            </h3>

            <div className="flex justify-center gap-3 md:gap-4">
              <Button variant="outline" size="md" onClick={() => handleEdit(item)} className="h-9 w-9 md:h-10 md:w-10 p-0 border-red-500 hover:bg-red-50">
                <Pencil size={18} className="text-red-600" />
              </Button>
              <Button variant="outline" size="md" onClick={() => handleDelete(item.id)} className="h-9 w-9 md:h-10 md:w-10 p-0 border-red-500 hover:bg-red-50">
                <Trash2 size={18} className="text-red-600" />
              </Button>
            </div>
          </div>
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
