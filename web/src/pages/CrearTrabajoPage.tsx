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
import { useAuth } from "@/lib/auth";
import { mostrarToast } from "@/lib/toast";
import { calcularResumen, useConfig } from "@/lib/useConfig";
import type { MetodoPago } from "@/lib/types";
import { localeActual, tr } from "@/lib/i18n";

const METODOS: { value: MetodoPago; icon: string; label: string }[] = [
  { value: "Efectivo", icon: "payments", label: tr("EFECTIVO") },
  { value: "Tarjeta", icon: "credit_card", label: tr("TARJETA") },
];

function formatearFecha(fecha: string, hora: string) {
  const d = new Date(`${fecha}T${hora || "00:00"}`);
  if (Number.isNaN(d.getTime())) return `${fecha} ${hora}`.trim();
  return d.toLocaleString(localeActual(), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
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
  const { usuario } = useAuth();
  const [cargando, setCargando] = useState(editando);
  const [urgente, setUrgente] = useState(false);
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
    metodoPago: "Tarjeta" as MetodoPago,
  });

  useEffect(() => {
    if (!id) return;
    api.trabajos
      .obtener(id)
      .then((t) => {
        if (!t.esMio || t.estado !== "Pendiente") {
          setError(tr("Solo puedes editar tus publicaciones pendientes."));
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
      .catch(() => setError(tr("No se pudo cargar la publicación.")))
      .finally(() => setCargando(false));
  }, [id]);

  const puedeUrgencia = !editando && config.categoriasUrgentes.includes(form.categoria);
  const esUrgente = urgente && (editando || puedeUrgencia);
  const metodoEfectivo: MetodoPago = form.metodoPago;
  // Con tarjeta, o en una urgencia (la tarifa se cobra con tarjeta), hace falta una tarjeta registrada.
  const faltaTarjeta = (metodoEfectivo === "Tarjeta" || esUrgente) && !usuario?.tarjeta;

  const valido =
    form.titulo.trim() && form.categoria && form.ubicacion && (esUrgente || form.fecha) && Number(form.pago) > 0 && !faltaTarjeta;

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
      mostrarToast(editando ? tr("Cambios guardados") : esUrgente ? tr("Urgencia publicada: avisamos a los trabajadores cercanos") : tr("Trabajo publicado"));
      navigate("/publicaciones");
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo publicar el trabajo."));
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <Loader label={tr("Cargando publicación...")} />;

  return (
    <div>
      <PageHeader title={editando ? tr("Editar Publicación") : tr("Crear Publicación")} icon="work" showBack />

      <form className="flex flex-col gap-3.5 px-5 pt-2 pb-9" onSubmit={handleSubmit}>
        <Card className="flex flex-col gap-3.5">
          <Field label={tr("Título del trabajo")}>
            <Input
              placeholder={tr("Ej: Reparación de fuga")}
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </Field>

          <Field label={tr("Categoría")}>
            <SelectField
              value={form.categoria}
              onChange={(categoria) => setForm({ ...form, categoria })}
              placeholder={tr("Selecciona una categoría")}
              options={CATEGORIAS}
            />
          </Field>

          <Field label={tr("Descripción detallada")}>
            <textarea
              rows={4}
              placeholder={tr("Describe el problema o necesidad con detalle...")}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="min-h-[104px] w-full resize-y rounded-cira-input bg-cira-input-bg px-3.5 py-2.5 text-cira-body text-cira-text-primary placeholder:text-cira-text-helper focus:outline-none"
            />
          </Field>
        </Card>

        {(!editando || urgente) && (
          <Card
            className={`flex items-start gap-3 border ${
              esUrgente ? "border-cira-btn-destructive-text" : "border-cira-border"
            } ${puedeUrgencia || editando ? "" : "opacity-80"}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cira-btn-destructive-bg">
              <Icon name="bolt" filled size={22} className="text-cira-btn-destructive-text" />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-cira-text-primary">{tr("Es urgente")}</p>
              <p className="text-xs text-cira-text-secondary">
                {puedeUrgencia || editando
                  ? tr("Alertamos primero a los trabajadores más cercanos y disponibles. Tiene una tarifa de urgencia del {pct}%, que se cobra con tu tarjeta registrada.", { pct: config.urgenciaPct })
                  : tr("Disponible solo para Plomería, Electricidad y Cerrajería. Elige una de esas categorías para activarla.")}
              </p>
            </div>
            {!editando && <Switch checked={esUrgente} onChange={setUrgente} disabled={!puedeUrgencia} label={tr("Es urgente")} />}
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
              {tr("Se atiende lo antes posible")}
            </p>
          ) : editando ? (
            <Field label={tr("Fecha y hora")}>
              <Input value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <DateTimeField
                label={tr("Fecha")}
                icon="calendar_month"
                type="date"
                value={form.fecha}
                onChange={(fecha) => setForm({ ...form, fecha })}
              />
              <DateTimeField
                label={tr("Hora")}
                icon="schedule"
                type="time"
                value={form.hora}
                onChange={(hora) => setForm({ ...form, hora })}
              />
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-3.5">
          <Field label={tr("Presupuesto ofrecido")}>
            <BudgetField value={form.pago} onChange={(pago) => setForm({ ...form, pago })} />
          </Field>

          <div className="flex flex-col gap-2">
            <FieldCaption>{tr("Método de pago")}</FieldCaption>
            <div className="grid grid-cols-2 gap-2.5">
              {METODOS.map((m) => (
                <SelectableCard
                  key={m.value}
                  icon={m.icon}
                  text={m.label}
                  selected={metodoEfectivo === m.value}
                  onClick={() => setForm({ ...form, metodoPago: m.value })}
                />
              ))}
            </div>
          </div>

          {Number(form.pago) > 0 && (
            <PagoResumen resumen={calcularResumen(Number(form.pago), esUrgente, metodoEfectivo, config)} />
          )}
        </Card>

        {faltaTarjeta && (
          <Card className="flex flex-col gap-2.5 border border-cira-btn-destructive-text/40">
            <p className="flex items-start gap-2 text-[13px] text-cira-text-primary">
              <Icon name="credit_card_off" size={20} className="shrink-0 text-cira-btn-destructive-text" />
              {tr("Para pagar con tarjeta o publicar una urgencia primero debes registrar una tarjeta.")}
            </p>
            <Button variant="outlined" type="button" onClick={() => navigate("/cuenta/tarjeta")}>
              {tr("REGISTRAR TARJETA")}
            </Button>
          </Card>
        )}

        {error && <p className="text-center text-[13px] text-cira-btn-destructive-text">{error}</p>}

        <Button type="submit" disabled={!valido || enviando} className="my-2">
          {enviando ? tr("GUARDANDO...") : editando ? tr("GUARDAR CAMBIOS") : esUrgente ? tr("PUBLICAR URGENCIA") : tr("PUBLICAR AHORA")}
        </Button>
      </form>
    </div>
  );
}
