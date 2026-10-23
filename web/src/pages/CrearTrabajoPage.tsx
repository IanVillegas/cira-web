import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Switch } from "@/components/ui/Switch";
import { Loader } from "@/components/ui/Loader";
import { PagoResumen } from "@/components/PagoResumen";
import { LocationPicker } from "@/components/LocationPicker";
import { CATEGORIAS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { calcularResumen, useConfig } from "@/lib/useConfig";
import type { MetodoPago } from "@/lib/types";

const METODOS: { value: MetodoPago; icon: string; label: string }[] = [
  { value: "Efectivo", icon: "payments", label: "EFECTIVO" },
  { value: "Pago en la app", icon: "credit_card", label: "PAGO EN LA APP" },
];

function formatearFecha(fecha: string, hora: string) {
  const d = new Date(`${fecha}T${hora || "00:00"}`);
  if (Number.isNaN(d.getTime())) return `${fecha} ${hora}`.trim();
  return d.toLocaleString("es-CR", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/**
 * Réplica de CrearTrabajoPage.xaml: tres tarjetas (datos, ubicación y fecha, presupuesto y pago).
 * Con `:id` en la ruta funciona como "Editar publicación" (solo mientras esté pendiente).
 */
export function CrearTrabajoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = id !== undefined;
  const config = useConfig();
  const [cargando, setCargando] = useState(editando);
  const [urgente, setUrgente] = useState(false);
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
    metodoPago: "Pago en la app" as MetodoPago,
  });

  useEffect(() => {
    if (!id) return;
    api.trabajos
      .obtener(id)
      .then((t) => {
        if (!t.esMio || t.estado !== "Pendiente") {
          setError("Solo puedes editar tus publicaciones pendientes.");
          return;
        }
        setUrgente(t.urgente);
        setForm({
          titulo: t.titulo,
          descripcion: t.descripcion,
          categoria: t.categoria,
          ubicacion: t.ubicacion,
          coords: t.lat != null && t.lng != null ? { lat: t.lat, lng: t.lng } : null,
          fecha: t.fecha, // al editar la fecha se maneja como texto libre
          hora: "",
          pago: String(t.pago),
          metodoPago: t.metodoPago,
        });
      })
      .catch(() => setError("No se pudo cargar la publicación."))
      .finally(() => setCargando(false));
  }, [id]);

  const puedeUrgencia = !editando && config.categoriasUrgentes.includes(form.categoria);
  const esUrgente = urgente && (editando || puedeUrgencia);
  const metodoEfectivo: MetodoPago = esUrgente ? "Pago en la app" : form.metodoPago;

  const valido =
    form.titulo.trim() && form.categoria && form.ubicacion && (esUrgente || form.fecha) && Number(form.pago) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    setEnviando(true);
    setError(null);
    try {
      const datos = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion,
        categoria: form.categoria,
        ubicacion: form.ubicacion,
        lat: form.coords?.lat,
        lng: form.coords?.lng,
        fecha: editando ? form.fecha : esUrgente ? "Lo antes posible" : formatearFecha(form.fecha, form.hora),
        pago: Number(form.pago),
        metodoPago: metodoEfectivo,
      };
      if (id) await api.trabajos.editar(id, datos);
      else await api.trabajos.crear({ ...datos, urgente: esUrgente });
      setPublicado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo publicar el trabajo.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <Loader label="Cargando publicación..." />;

  if (publicado) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Icon name="check_circle" filled size={36} className="text-emerald-600" />
        </div>
        <h1 className="text-cira-title font-semibold text-cira-text-primary">
          {editando ? "Cambios guardados" : esUrgente ? "Urgencia publicada" : "Trabajo publicado"}
        </h1>
        <p className="text-sm text-cira-text-secondary">
          {esUrgente
            ? "Avisamos a los trabajadores disponibles de esa categoría. El primero que acepte se queda con el trabajo."
            : editando
              ? "Los trabajadores verán la información actualizada."
              : "Ya es visible en la lista y el mapa para los trabajadores cercanos."}
        </p>
        <Button onClick={() => navigate("/publicaciones")}>Ver mis publicaciones</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={editando ? "Editar Publicación" : "Crear Publicación"} icon="work" showBack />

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

        {(puedeUrgencia || (editando && urgente)) && (
          <Card className="flex items-start gap-3 border border-cira-btn-destructive-text/30">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cira-btn-destructive-bg">
              <Icon name="bolt" filled size={22} className="text-cira-btn-destructive-text" />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-cira-text-primary">Es urgente</p>
              <p className="text-xs text-cira-text-secondary">
                Alertamos primero a los trabajadores más cercanos y disponibles. Tiene una tarifa de urgencia del{" "}
                {config.urgenciaPct}% y se paga en la app.
              </p>
            </div>
            {!editando && <Switch checked={urgente} onChange={setUrgente} label="Es urgente" />}
          </Card>
        )}

        <Card className="flex flex-col gap-3.5">
          <LocationPicker
            value={form.coords}
            address={form.ubicacion}
            onChange={(coords, direccion) => setForm({ ...form, coords, ubicacion: direccion })}
          />

          {esUrgente ? (
            <p className="flex items-center gap-2 rounded-2xl bg-cira-btn-destructive-bg p-3 text-[13px] font-semibold text-cira-btn-destructive-text">
              <Icon name="schedule" size={18} />
              Se atiende lo antes posible
            </p>
          ) : editando ? (
            <Field label="Fecha y hora">
              <Input value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </Field>
          ) : (
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
          )}
        </Card>

        <Card className="flex flex-col gap-3.5">
          <Field label="Presupuesto ofrecido">
            <BudgetField value={form.pago} onChange={(pago) => setForm({ ...form, pago })} />
          </Field>

          <div className="flex flex-col gap-2">
            <FieldCaption>Método de pago</FieldCaption>
            <div className="grid grid-cols-2 gap-2.5">
              {METODOS.map((m) => (
                <SelectableCard
                  key={m.value}
                  icon={m.icon}
                  text={m.label}
                  selected={metodoEfectivo === m.value}
                  onClick={() => !esUrgente && setForm({ ...form, metodoPago: m.value })}
                />
              ))}
            </div>
          </div>

          {Number(form.pago) > 0 && (
            <PagoResumen resumen={calcularResumen(Number(form.pago), esUrgente, metodoEfectivo, config)} />
          )}
        </Card>

        {error && <p className="text-center text-[13px] text-cira-accent">{error}</p>}

        <Button type="submit" disabled={!valido || enviando} className="my-2">
          {enviando ? "GUARDANDO..." : editando ? "GUARDAR CAMBIOS" : esUrgente ? "PUBLICAR URGENCIA" : "PUBLICAR AHORA"}
        </Button>
      </form>
    </div>
  );
}
