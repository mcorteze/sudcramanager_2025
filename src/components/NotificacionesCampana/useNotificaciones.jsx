import { useEffect, useState } from 'react';

export default function useNotificaciones(sources) {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    let isMounted = true; // Evita actualizar el estado si el componente ya se desmontó

    const fetchAll = async () => {
      const results = await Promise.all(
        sources.map(async ({ id, label, apiUrl, redirectUrl }) => {
          try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error('Error en fetch');
            const data = await res.json();
            const count = Array.isArray(data) ? data.length : data.count || 0;

            return { id, label, count, redirectUrl };
          } catch {
            return { id, label, count: 0, redirectUrl };
          }
        })
      );

      if (isMounted) {
        setNotificaciones(results);
      }
    };

    fetchAll(); // Primera carga inmediata

    const intervalId = setInterval(fetchAll, 10000); // Repetir cada 10 segundos

    return () => {
      isMounted = false;
      clearInterval(intervalId); // Limpia el intervalo al desmontar
    };
  }, [sources]);

  return notificaciones;
}
