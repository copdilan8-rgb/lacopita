"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [rol, setRol] = useState(null);
  const [ci, setCi] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const rolGuardado = sessionStorage.getItem("rolSeleccionado");
    if (!rolGuardado) {
      router.push("/");
    } else {
      setRol(rolGuardado);
    }
  }, [router]);

  const showToast = useCallback((message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("ci", ci)
        .eq("pin", pin)
        .eq("rol", rol)
        .single();

      setLoading(false);

      if (error || !data) {
        showToast("CI o PIN incorrectos");
        return;
      }

      // Guardar datos de sesión
      sessionStorage.setItem("idUsuario", data.id);
      sessionStorage.setItem("nombreUsuario", data.nombre);
      sessionStorage.setItem("apellidoUsuario", data.apellido);
      sessionStorage.setItem("ciUsuario", data.ci);
      sessionStorage.setItem("telefonoUsuario", data.telefono);
      sessionStorage.setItem("pinUsuario", data.pin);
      sessionStorage.setItem("rolSeleccionado", data.rol);
      sessionStorage.setItem("avatarUsuario", data.avatar ?? "");

      localStorage.setItem("usuario", JSON.stringify(data));
      localStorage.setItem("usuario_id", data.id); // ✅ AGREGADO: ID del usuario para verificar caja
      router.push("/supervisor");
    },
    [ci, pin, rol, showToast, router]
  );

  if (!rol) {
    return <p className="text-center mt-20 text-gray-500">Redirigiendo...</p>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-red-100 px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-white font-semibold bg-red-500"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">
          Ingresando a {rol}
        </h1>

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="CI"
            value={ci}
            onChange={(e) => setCi(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            className="w-full py-3 text-lg font-medium bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Iniciando...
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}