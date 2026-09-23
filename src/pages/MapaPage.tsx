import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trabajosMock } from "@/lib/mockData";
import type { Trabajo } from "@/lib/types";

// Posiciones fijas (en % del contenedor) solo para representar pines en el mockup.
const POSICIONES = [
  { top: "28%", left: "32%" },
  { top: "48%", left: "62%" },
  { top: "64%", left: "24%" },
  { top: "36%", left: "72%" },
];

export function MapaPage() {
  const [seleccionado, setSeleccionado] = useState<Trabajo | null>(null);

  return (
    <div className="flex h-full flex-col pb-2">
      <PageHeader title="Mapa" subtitle="Trabajos y trabajadores cerca de ti." icon="my_location" />

      <div className="relative mx-5 flex-1 overflow-hidden rounded-cira-card bg-gradient-to-br from-cira-secondary via-cira-base to-cira-surface-muted">
        {/* Cuadrícula simulando calles, para dar la sensación de mapa sin depender de un proveedor real */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(#d9dde6 1px, transparent 1px), linear-gradient(90deg, #d9dde6 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {trabajosMock.map((trabajo, i) => (
          <button
            key={trabajo.id}
            style={POSICIONES[i % POSICIONES.length]}
            className="absolute -translate-x-1/2 -translate-y-full"
            onClick={() => setSeleccionado(trabajo)}
          >
            <Icon
              name="location_on"
              filled
              size={38}
              className={seleccionado?.id === trabajo.id ? "text-cira-tertiary" : "text-cira-accent"}
            />
          </button>
        ))}

        <div className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-cira-card shadow-lg">
          <Icon name="my_location" size={22} className="text-cira-accent" />
        </div>
      </div>

      {seleccionado && (
        <Card className="mx-5 mt-3">
          <p className="text-[11px] font-semibold tracking-wider text-cira-accent uppercase">
            {seleccionado.categoria}
          </p>
          <p className="font-semibold text-cira-text-primary">{seleccionado.titulo}</p>
          <p className="mt-1 text-sm text-cira-text-secondary">
            {seleccionado.ubicacion} · {seleccionado.distanciaKm} km
          </p>
          <Button variant="outlined" className="mt-3" fullWidth onClick={() => setSeleccionado(null)}>
            Cerrar
          </Button>
        </Card>
      )}
    </div>
  );
}
