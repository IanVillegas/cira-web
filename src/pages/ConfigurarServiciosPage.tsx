import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CATEGORIAS, usuarioActual } from "@/lib/mockData";
import type { ServicioUsuario } from "@/lib/types";

export function ConfigurarServiciosPage() {
  const [servicios, setServicios] = useState<ServicioUsuario[]>(usuarioActual.servicios);
  const [nuevo, setNuevo] = useState({ categoria: CATEGORIAS[0], descripcion: "", precio: "" });

  const agregar = () => {
    if (!nuevo.descripcion.trim()) return;
    setServicios((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        categoria: nuevo.categoria,
        descripcion: nuevo.descripcion,
        precioAproximado: Number(nuevo.precio) || undefined,
      },
    ]);
    setNuevo({ categoria: CATEGORIAS[0], descripcion: "", precio: "" });
  };

  const eliminar = (id: string) => setServicios((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="pb-8">
      <PageHeader title="Configurar servicios" subtitle="Definí qué ofrecés y a qué precio." showBack />

      <div className="px-5">
        <div className="space-y-3">
          {servicios.map((s) => (
            <Card key={s.id} className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-cira-accent uppercase">
                  {s.categoria}
                </p>
                <p className="text-sm text-cira-text-primary">{s.descripcion}</p>
                {s.precioAproximado && (
                  <p className="mt-1 text-sm font-semibold text-cira-accent">
                    ₡{s.precioAproximado.toLocaleString("es-CR")}
                  </p>
                )}
              </div>
              <button onClick={() => eliminar(s.id)} className="text-cira-text-helper">
                <Icon name="close" size={20} />
              </button>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <p className="mb-3 font-semibold text-cira-text-primary">Agregar servicio</p>
          <div className="flex flex-col gap-3">
            <select
              className="rounded-cira-input border border-cira-input-border bg-cira-input-bg px-4 py-3 text-cira-control text-cira-text-primary focus:border-cira-accent focus:outline-none"
              value={nuevo.categoria}
              onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Input
              placeholder="Descripción del servicio"
              value={nuevo.descripcion}
              onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
            />
            <Input
              placeholder="Precio aproximado (opcional)"
              type="number"
              value={nuevo.precio}
              onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
            />
            <Button variant="secondary" onClick={agregar}>
              Agregar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
