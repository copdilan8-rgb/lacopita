import { CheckCircle, XCircle } from "lucide-react";

/**
 * Componente centralizado para mostrar notificaciones
 * Reduce duplicación en todas las páginas de listados
 */
export function NotificationContainer({ notificaciones }) {
  return (
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
  );
}
