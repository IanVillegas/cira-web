import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { usePolling } from "./usePolling";
import type { Alerta } from "./types";

/** Alertas de trabajos de mi oficio y mi zona (se consultan cada pocos segundos, sin push real). */
export function useAlertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargado, setCargado] = useState(false);

  const cargar = useCallback(
    () =>
      api.alertas
        .listar()
        .then(setAlertas)
        .catch(() => {})
        .finally(() => setCargado(true)),
    [],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);
  usePolling(cargar, 5000);

  const descartar = async (trabajoId: string) => {
    setAlertas((prev) => prev.filter((a) => a.trabajo.id !== trabajoId));
    await api.alertas.descartar(trabajoId).catch(() => {});
  };

  return { alertas, cargado, recargar: cargar, descartar };
}
