import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, Field, Icon, Input, Loader, PageHeader, SelectableCard, Switch, TextArea } from "@/components/aire";
import { SelectSheet } from "@/components/SelectSheet";
import { PagoResumen } from "@/components/PagoResumen";
import { LocationPicker } from "@/components/LocationPicker";
import { CATEGORIAS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { mostrarToast } from "@/lib/toast";
import { calcularResumen, useConfig } from "@/lib/useConfig";
import type { MetodoPago, PerfilPublico } from "@/lib/types";
import { localeActual, tr } from "@/lib/i18n";

const METODOS: { value: MetodoPago; icon: string; label: string }[] = [
  { value: "Efectivo", icon: "payments", label: tr("Efectivo") },
  { value: "Tarjeta", icon: "credit_card", label: tr("Tarjeta") },
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
  // "Recontratar": /crear-trabajo?para=<id> crea una oferta directa solo para esa persona.
  const [searchParams] = useSearchParams();
  const paraId = editando ? null : searchParams.get("para");
  const [invitado, setInvitado] = useState<PerfilPublico | null>(null);
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
    if (!paraId) return;
    api.usuarios
      .perfil(paraId)
      .then((p) => {
        setInvitado(p);
        // Si ofrece un solo oficio, la categoría ya queda elegida.
        if (p.servicios.length === 1) setForm((f) => ({ ...f, categoria: f.categoria || p.servicios[0] }));
      })
      .catch(() => setError(tr("No se encontró a la persona que quieres contratar.")));
  }, [paraId]);

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

  const esUrgente = urgente && !paraId;
  const metodoEfectivo: MetodoPago = form.metodoPago;
  // Con tarjeta, o en una urgencia (la tarifa se cobra con tarjeta), hace falta una tarjeta registrada.
  const faltaTarjeta = (metodoEfectivo === "Tarjeta" || esUrgente) && !usuario?.tarjeta;

  const valido =
    form.titulo.trim() && form.categoria && form.ubicacion && (esUrgente || form.fecha) && Number(form.pago) > 0 && !faltaTarjeta && (!paraId || invitado);

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
      else await api.trabajos.crear({ ...datos, urgente: esUrgente, invitadoId: invitado?.id });
      mostrarToast(editando ? tr("Cambios guardados") : invitado ? tr("Oferta enviada a {nombre}", { nombre: invitado.nombre }) : esUrgente ? tr("Urgencia publicada: avisamos a los trabajadores cercanos") : tr("Trabajo publicado"));
      navigate("/publicaciones");
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo publicar el trabajo."));
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <Loader label={tr("Cargando publicación...")} />;

  return (
    <div className="pb-8">
      <PageHeader
        title={editando ? tr("Editar publicación") : paraId ? tr("Recontratar") : tr("Crear publicación")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <form className="grid gap-3 px-5 pt-2" onSubmit={handleSubmit}>
        {invitado && (
          <Card className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft">
              <Icon name="favorite" filled size={22} className="text-aire-accent-text" />
            </span>
            <div className="flex-1">
              <p className="aire-text-headline text-aire-ink">{tr("Oferta directa para {nombre}", { nombre: invitado.nombre })}</p>
              <p className="aire-text-footnote text-aire-ink-2">
                {tr("Solo esa persona verá este trabajo. Si no puede tomarlo, se publica para todos.")}
              </p>
            </div>
          </Card>
        )}

        <Card className="grid gap-3.5">
          <Input
            label={tr("Título del trabajo")}
            placeholder={tr("Ej: Reparación de fuga")}
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />

          <SelectSheet
            label={tr("Categoría")}
            placeholder={tr("Selecciona una categoría")}
            value={form.categoria}
            options={invitado && invitado.servicios.length > 0 ? invitado.servicios : CATEGORIAS}
            onChange={(categoria) => setForm({ ...form, categoria })}
          />

          <TextArea
            label={tr("Descripción detallada")}
            rows={4}
            placeholder={tr("Describe el problema o necesidad con detalle...")}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </Card>

        {!paraId && (!editando || urgente) && (
          <Card className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-aire-md bg-aire-danger-soft">
              <Icon name="bolt" filled size={22} className="text-aire-danger-text" />
            </span>
            <div className="flex-1">
              <p className="aire-text-headline text-aire-ink">{tr("Es urgente")}</p>
              <p className="aire-text-footnote text-aire-ink-2">
                {tr("Alertamos primero a los trabajadores más cercanos y disponibles. Tiene una tarifa de urgencia del {pct}%, que se cobra con tu tarjeta registrada.", { pct: config.urgenciaPct })}
              </p>
            </div>
            {!editando && <Switch checked={esUrgente} onChange={setUrgente} label={tr("Es urgente")} />}
          </Card>
        )}

        <Card className="grid gap-3.5">
          <LocationPicker
            value={form.coords}
            address={form.ubicacion}
            onChange={(coords, direccion) => setForm({ ...form, coords, ubicacion: direccion })}
          />

          {esUrgente ? (
            <p className="aire-text-subhead flex items-center gap-2 rounded-aire-md bg-aire-danger-soft p-3 font-semibold text-aire-danger-text">
              <Icon name="schedule" size={20} />
              {tr("Se atiende lo antes posible")}
            </p>
          ) : editando ? (
            <Input label={tr("Fecha y hora")} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Input label={tr("Fecha")} type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
              <Input label={tr("Hora")} type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
            </div>
          )}
        </Card>

        <Card className="grid gap-3.5">
          <Input
            label={tr("Presupuesto ofrecido")}
            type="number"
            inputMode="numeric"
            min={1}
            prefix="₡"
            placeholder="20000"
            hint={tr("Monto en colones")}
            value={form.pago}
            onChange={(e) => setForm({ ...form, pago: e.target.value })}
          />

          <Field label={tr("Método de pago")}>
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
          </Field>

          {Number(form.pago) > 0 && <PagoResumen resumen={calcularResumen(Number(form.pago), esUrgente, metodoEfectivo, config)} />}
        </Card>

        {faltaTarjeta && (
          <Card className="grid gap-3">
            <p className="aire-text-subhead flex items-start gap-2 text-aire-ink">
              <Icon name="credit_card_off" size={20} className="mt-0.5 shrink-0 text-aire-danger-text" />
              {tr("Para pagar con tarjeta o publicar una urgencia primero debes registrar una tarjeta.")}
            </p>
            <Button variant="secondary" type="button" onClick={() => navigate("/cuenta/tarjeta")}>
              {tr("Registrar tarjeta")}
            </Button>
          </Card>
        )}

        {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}

        <Button type="submit" size="lg" icon={esUrgente ? "bolt" : undefined} disabled={!valido} loading={enviando} className="mt-1">
          {editando
            ? tr("Guardar cambios")
            : invitado
              ? tr("Enviar oferta a {nombre}", { nombre: invitado.nombre })
              : esUrgente
                ? tr("Publicar urgencia")
                : tr("Publicar ahora")}
        </Button>
      </form>
    </div>
  );
}
