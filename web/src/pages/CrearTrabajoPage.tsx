import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Field, FieldCaption } from "@/components/ui/FieldCaption";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { SelectField } from "@/components/ui/SelectField";
import { BudgetField } from "@/components/ui/BudgetField";
import { DateTimeField } from "@/components/ui/DateTimeField";
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
            <SelectField
              value={form.categoria}
              onChange={(categoria) => setForm({ ...form, categoria })}
              placeholder="Selecciona una categoría"
              options={CATEGORIAS}
            />
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
            <BudgetField value={form.pago} onChange={(pago) => setForm({ ...form, pago })} />
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
