import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook para manejar la autenticación del usuario
 * Recupera datos de sessionStorage y valida la sesión
 */
export function useAuth() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = sessionStorage.getItem("idUsuario");
    const nombre = sessionStorage.getItem("nombreUsuario");
    const apellido = sessionStorage.getItem("apellidoUsuario");
    const rol = sessionStorage.getItem("rolSeleccionado");
    const avatar = sessionStorage.getItem("avatarUsuario");

    if (!id || !rol) {
      router.push("/");
      setLoading(false);
      return;
    }

    setUsuario({ id, nombre, apellido, rol, avatar });
    setLoading(false);
  }, [router]);

  const logout = () => {
    sessionStorage.clear();
    router.push("/");
  };

  return { usuario, loading, logout };
}
