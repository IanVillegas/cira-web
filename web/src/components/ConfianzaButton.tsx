import { useState } from "react";
import { Icon } from "@/components/aire";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import type { Trabajador } from "@/lib/types";

interface ConfianzaButtonProps {
  trabajador: Pick<Trabajador, "id" | "nombre" | "deConfianza">;
  /** Recibe al trabajador actualizado (deConfianza y guardadoPor nuevos). */
  onChange?: (trabajador: Trabajador) => void;
}

/** Corazón para agregar o quitar a alguien de "De confianza". */
export function ConfianzaButton({ trabajador, onChange }: ConfianzaButtonProps) {
  const [guardado, setGuardado] = useState(trabajador.deConfianza);
  const [ocupado, setOcupado] = useState(false);

  const alternar = async () => {
    const nuevo = !guardado;
    setGuardado(nuevo); // respuesta inmediata; se revierte si falla
    setOcupado(true);
    try {
      const actualizado = nuevo ? await api.favoritos.agregar(trabajador.id) : await api.favoritos.quitar(trabajador.id);
      onChange?.(actualizado);
      mostrarToast(
        nuevo
          ? tr("{nombre} está en tus trabajadores de confianza", { nombre: trabajador.nombre })
          : tr("Quitaste a {nombre} de De confianza", { nombre: trabajador.nombre }),
        nuevo ? "exito" : "info",
      );
    } catch (e) {
      setGuardado(!nuevo);
      mostrarToast(e instanceof Error ? e.message : tr("No se pudo completar la acción."), "error");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <button
      type="button"
      className="ca-iconbtn shrink-0"
      aria-pressed={guardado}
      aria-label={guardado ? tr("Quitar de De confianza") : tr("Agregar a De confianza")}
      disabled={ocupado}
      onClick={alternar}
      style={{
        color: guardado ? "var(--aire-accent-text)" : "var(--aire-ink-2)",
        background: guardado ? "var(--aire-accent-soft)" : "var(--aire-surface-3)",
      }}
    >
      <Icon name="favorite" filled={guardado} size={24} />
    </button>
  );
}
