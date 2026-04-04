'use client';

export default function Loading({ message = "Procesando pedido..." }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 min-w-[260px]">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Espere un momento
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}