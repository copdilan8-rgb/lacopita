import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

/**
 * Componente reutilizable para mostrar tarjetas de productos
 * Reduce duplicación en todas las páginas de catálogo
 */
export function ProductCard({ producto, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-60 border border-gray-200 hover:shadow-lg transition-all">
      <div className="flex gap-3 items-center border-b pb-2">
        <div className="w-1/2 flex justify-center">
          {producto.img ? (
            <img
              src={producto.img}
              alt={producto.nombre}
              className="w-20 h-20 object-cover rounded-md"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded-md">
              Sin imagen
            </div>
          )}
        </div>

        <div className="w-1/2">
          <h3 className="text-sm font-semibold text-indigo-600">
            {producto.nombre}
          </h3>
          <p className="text-blue-500 font-bold text-sm">
            Bs. {producto.precio}
          </p>
        </div>
      </div>

      <p className="text-gray-700 text-sm mt-2 line-clamp-3">
        {producto.descripcion}
      </p>

      <div className="flex justify-center gap-3 mt-2">
        <Button 
          size="sm" 
          onClick={() => onEdit(producto)}
          className="bg-gradient-to-r from-purple-300 to-pink-300 hover:from-purple-400 hover:to-pink-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Pencil size={16} />
        </Button>
        <Button
          size="sm"
          onClick={() => onDelete(producto.id)}
          className="bg-gradient-to-r from-red-300 to-rose-300 hover:from-red-400 hover:to-rose-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}
