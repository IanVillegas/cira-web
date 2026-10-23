import { useEffect, useState } from "react";
import { api } from "./api";
import type { ConfigNegocio, MetodoPago, ResumenPago } from "./types";

// Valores por defecto mientras responde el servidor (coinciden con server/src/config.js).
const POR_DEFECTO: ConfigNegocio = {
  comisionPct: 10,
  urgenciaPct: 15,
  plusPrecio: 2500,
  retrasoGratisSeg: 120,
  categoriasUrgentes: ["Plomería", "Electricidad", "Cerrajería"],
};

let cache: ConfigNegocio | null = null;

/** Parámetros del modelo de negocio (comisión, tarifa de urgencia, precio del Plan Plus). */
export function useConfig(): ConfigNegocio {
  const [config, setConfig] = useState<ConfigNegocio>(cache ?? POR_DEFECTO);
  useEffect(() => {
    if (cache) return;
    api
      .config()
      .then((c) => {
        cache = c;
        setConfig(c);
      })
      .catch(() => {});
  }, []);
  return config;
}

/** Mismo cálculo que el servidor, para mostrar el resumen antes de publicar. */
export function calcularResumen(
  monto: number,
  urgente: boolean,
  metodo: MetodoPago,
  config: ConfigNegocio,
  propina = 0,
): ResumenPago {
  const comision = metodo === "Tarjeta" ? Math.round((monto * config.comisionPct) / 100) : 0;
  const tarifaUrgencia = urgente ? Math.round((monto * config.urgenciaPct) / 100) : 0;
  const total = monto + comision + tarifaUrgencia + propina;
  const enEfectivo = metodo === "Efectivo" ? monto + propina : 0;
  return { monto, comision, tarifaUrgencia, propina, total, enEfectivo, enTarjeta: total - enEfectivo };
}
