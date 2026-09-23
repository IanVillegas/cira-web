import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { usuarioActual } from "@/lib/mockData";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function ConfigurarDisponibilidadPage() {
  const [disponible, setDisponible] = useState(usuarioActual.disponible);
  const [dias, setDias] = useState<string[]>(["Lun", "Mar", "Mié", "Jue", "Vie"]);

  const toggleDia = (d: string) =>
    setDias((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  return (
    <div className="pb-8">
      <PageHeader title="Disponibilidad" subtitle="Indicá cuándo podés recibir solicitudes." showBack />

      <div className="px-5">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon
              name={disponible ? "toggle_on" : "toggle_off"}
              size={32}
              className={disponible ? "text-cira-accent" : "text-cira-text-helper"}
            />
            <div>
              <p className="font-semibold text-cira-text-primary">
                {disponible ? "Disponible" : "No disponible"}
              </p>
              <p className="text-sm text-cira-text-secondary">
                {disponible
                  ? "Aparecés en las búsquedas de empleadores."
                  : "No aparecés en resultados de búsqueda."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDisponible((v) => !v)}
            className={`h-7 w-12 shrink-0 rounded-full transition-colors ${
              disponible ? "bg-cira-accent" : "bg-cira-surface-disabled"
            }`}
          >
            <span
              className={`block h-5 w-5 translate-y-1 rounded-full bg-white shadow transition-transform ${
                disponible ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </Card>

        <Card className="mt-4">
          <p className="mb-3 font-semibold text-cira-text-primary">Días disponibles</p>
          <div className="flex flex-wrap gap-2">
            {DIAS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDia(d)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  dias.includes(d)
                    ? "border-cira-accent bg-cira-secondary text-cira-accent"
                    : "border-cira-input-border text-cira-text-secondary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
