"use client";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

export default function BotonVolver() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/supervisor")}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
    >
      <Home size={18} />
      Inicio
    </button>
  );
}
