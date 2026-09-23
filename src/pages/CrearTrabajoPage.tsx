import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIAS } from "@/lib/mockData";
import type { MetodoPago } from "@/lib/types";

const METODOS: MetodoPago[] = ["Efectivo", "SINPE", "Transferencia"];

export function CrearTrabajoPage() {
  const navigate = useNavigate();
  const [publicado, setPublicado] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: CATEGORIAS[0],
    ubicacion: "",
    fecha: "",
    pago: "",
    metodoPago: METODOS[0] as MetodoPago,
  });

  const valido = form.titulo && form.categoria && form.ubicacion && form.fecha && Number(form.pago) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    setPublicado(true);
  };

  if (publicado) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Icon name="check_circle" filled size={36} className="text-emerald-600" />
        </div>
        <h1 className="text-cira-title font-semibold text-cira-text-primary">
          Trabajo publicado
        </h1>
        <p className="text-sm text-cira-text-secondary">
          Ya es visible en la lista y el mapa para los trabajadores cercanos.
        </p>
        <Button fullWidth onClick={() => navigate("/publicaciones")}>
          Ver mis publicaciones
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader title="Publicar trabajo" subtitle="Contá qué necesitás resolver." showBack />

      <form className="flex flex-col gap-4 px-5" onSubmit={handleSubmit}>
        <Input
          label="Título"
          placeholder="Ej. Reparar fuga de agua"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          required
        />

        <TextArea
          label="Descripción"
          placeholder="Detalles del trabajo, materiales, herramientas necesarias..."
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-cira-body font-semibold text-cira-text-primary">Categoría</span>
          <select
            className="rounded-cira-input border border-cira-input-border bg-cira-input-bg px-4 py-3 text-cira-control text-cira-text-primary focus:border-cira-accent focus:outline-none"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Ubicación"
          icon="location_on"
          placeholder="Ej. Alajuela, Río Segundo"
          value={form.ubicacion}
          onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
          required
        />

        <Input
          label="Fecha y hora"
          icon="calendar_month"
          type="datetime-local"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          required
        />

        <Input
          label="Pago ofrecido (₡)"
          icon="payments"
          type="number"
          min={1}
          placeholder="15000"
          value={form.pago}
          onChange={(e) => setForm({ ...form, pago: e.target.value })}
          required
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-cira-body font-semibold text-cira-text-primary">Método de pago</span>
          <div className="flex gap-2">
            {METODOS.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setForm({ ...form, metodoPago: m })}
                className={`flex-1 rounded-cira-input border px-3 py-2 text-sm font-semibold transition-colors ${
                  form.metodoPago === m
                    ? "border-cira-accent bg-cira-secondary text-cira-accent"
                    : "border-cira-input-border text-cira-text-secondary"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </label>

        <Button type="submit" fullWidth disabled={!valido} className="mt-2">
          Publicar trabajo
        </Button>
      </form>
    </div>
  );
}
