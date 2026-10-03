import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Field, FieldCaption } from "@/components/ui/FieldCaption";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { Card } from "@/components/ui/Card";
import { LocationPicker } from "@/components/LocationPicker";
import { CATEGORIAS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { MetodoPago } from "@/lib/types";

const METODOS: { value: MetodoPago; icon: string; label: string }[] = [
  { value: "SINPE", icon: "smartphone", label: "SINPE" },
  { value: "Efectivo", icon: "payments", label: "EFECTIVO" },
  { value: "Transferencia", icon: "account_balance", label: "TRANSFER." },
];

function formatearFecha(fecha: string, hora: string) {
  const d = new Date(`${fecha}T${hora || "00:00"}`);
  if (Number.isNaN(d.getTime())) return `${fecha} ${hora}`.trim();
  return d.toLocaleString("es-CR", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** Réplica de CrearTrabajoPage.xaml: tres tarjetas (datos, ubicación y fecha, presupuesto y pago). */
export function CrearTrabajoPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [publicado, setPublicado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    ubicacion: "",
    coords: null as { lat: number; lng: number } | null,
    fecha: "",
    hora: "",
    pago: "",
    metodoPago: "SINPE" as MetodoPago,
  });

  const valido =
    form.titulo.trim() && form.categoria && form.ubicacion && form.fecha && Number(form.pago) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    setEnviando(true);
    setError(null);
    try {
      await api.trabajos.crear({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion,
        categoria: form.categoria,
        ubicacion: form.ubicacion,
        lat: form.coords?.lat,
        lng: form.coords?.lng,
        fecha: formatearFecha(form.fecha, form.hora),
        pago: Number(form.pago),
        metodoPago: form.metodoPago,
        publicador: usuario?.nombre,
      });
      setPublicado(true);
    } catch {
      setError("No se pudo publicar el trabajo. Verifica que el servidor esté corriendo.");
    } finally {
      setEnviando(false);
    }
  };

  if (publicado) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Icon name="check_circle" filled size={36} className="text-emerald-600" />
        </div>
        <h1 className="text-cira-title font-semibold text-cira-text-primary">Trabajo publicado</h1>
        <p className="text-sm text-cira-text-secondary">
          Ya es visible en la lista y el mapa para los trabajadores cercanos.
        </p>
        <Button onClick={() => navigate("/publicaciones")}>Ver mis publicaciones</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Crear Publicación" icon="work" showBack />

      <form className="flex flex-col gap-3.5 px-5 pt-2 pb-9" onSubmit={handleSubmit}>
        <Card className="flex flex-col gap-3.5">
          <Field label="Título del trabajo">
            <Input
              placeholder="Ej: Reparación de fuga"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </Field>

          <Field label="Categoría">
            <div className="relative">
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className={`min-h-14 w-full appearance-none rounded-cira-input bg-cira-input-bg px-3.5 pr-11 text-cira-control focus:outline-none ${
                  form.categoria ? "text-cira-text-primary" : "text-cira-text-helper"
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Icon
                name="keyboard_arrow_down"
                size={24}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-cira-text-secondary"
              />
            </div>
          </Field>

          <Field label="Descripción detallada">
            <textarea
              rows={4}
              placeholder="Describe el problema o necesidad con detalle..."
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="min-h-[104px] w-full resize-y rounded-cira-input bg-cira-input-bg px-3.5 py-2.5 text-cira-body text-cira-text-primary placeholder:text-cira-text-helper focus:outline-none"
            />
          </Field>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <LocationPicker
            value={form.coords}
            address={form.ubicacion}
            onChange={(coords, direccion) => setForm({ ...form, coords, ubicacion: direccion })}
          />

          <div className="grid grid-cols-2 gap-3">
            <DateTimeField
              label="Fecha"
              icon="calendar_month"
              type="date"
              value={form.fecha}
              onChange={(fecha) => setForm({ ...form, fecha })}
            />
            <DateTimeField
              label="Hora"
              icon="schedule"
              type="time"
              value={form.hora}
              onChange={(hora) => setForm({ ...form, hora })}
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <Field label="Presupuesto ofrecido">
            <div className="flex h-[86px] items-center gap-2.5 rounded-[14px] border border-cira-border bg-cira-input-bg p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-cira-nav-selected-bg">
                <Icon name="payments" size={24} className="text-cira-accent" />
              </span>
              <span className="text-2xl font-semibold text-cira-text-primary">₡</span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="20000"
                  value={form.pago}
                  onChange={(e) => setForm({ ...form, pago: e.target.value })}
                  className="w-full bg-transparent text-2xl font-semibold text-cira-text-primary placeholder:text-cira-text-helper focus:outline-none"
                />
                <span className="text-[9px] tracking-[0.12em] text-cira-text-helper">MONTO EN COLONES</span>
              </div>
            </div>
          </Field>

          <div className="flex flex-col gap-2">
            <FieldCaption>Método de pago</FieldCaption>
            <div className="grid grid-cols-3 gap-2.5">
              {METODOS.map((m) => (
                <SelectableCard
                  key={m.value}
                  icon={m.icon}
                  text={m.label}
                  selected={form.metodoPago === m.value}
                  onClick={() => setForm({ ...form, metodoPago: m.value })}
                />
              ))}
            </div>
          </div>
        </Card>

        {error && <p className="text-center text-[13px] text-cira-accent">{error}</p>}

        <Button type="submit" disabled={!valido || enviando} className="my-2">
          {enviando ? "PUBLICANDO..." : "PUBLICAR AHORA"}
        </Button>
      </form>
    </div>
  );
}

/** Réplica de CiraDateTimeField: etiqueta + contenedor con ícono acento y selector nativo. */
function DateTimeField({
  label,
  icon,
  type,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  type: "date" | "time";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex min-h-12 items-center gap-2 rounded-cira-input bg-cira-input-bg px-2.5">
        <Icon name={icon} size={18} className="shrink-0 text-cira-accent" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-xs text-cira-text-primary focus:outline-none"
        />
      </div>
    </Field>
  );
}
