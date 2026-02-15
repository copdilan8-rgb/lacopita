import { useCallback, useEffect, useState } from "react";
import supabase from "@/utils/supabase/client";

/**
 * Hook genérico para manejar CRUD de productos
 * Elimina duplicación en todas las páginas de productos
 */
export function useProductos(tableName) {
  const [productos, setProductos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchProductos = useCallback(async () => {
    const { data } = await supabase
      .from(tableName)
      .select("*")
      .order("id", { ascending: true });
    setProductos(data || []);
  }, [tableName]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleDelete = useCallback(
    async (id) => {
      return await supabase.from(tableName).delete().eq("id", id);
    },
    [tableName]
  );

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return {
    productos,
    modalOpen,
    editingItem,
    setModalOpen,
    setEditingItem,
    fetchProductos,
    handleDelete,
    handleEdit,
    handleAdd,
    handleCloseModal,
  };
}
