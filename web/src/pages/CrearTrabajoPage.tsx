import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, Field, FilterChip, Icon, Input, Loader, PageHeader, SelectableCard, Switch, TextArea } from "@/components/aire";
import { SelectSheet } from "@/components/SelectSheet";
import { PagoResumen } from "@/components/PagoResumen";
import { LocationPicker } from "@/components/LocationPicker";
import { DisponibilidadStrip } from "@/components/DisponibilidadStrip";
import { CATEGORIAS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { mostrarToast } from "@/lib/toast";
import { calcularResumen, useConfig } from "@/lib/useConfig";
import { diaLargo, frecuenciaTexto, hoyDia, sumarDias } from "@/lib/fechas";
import type { Frecuencia, MetodoPago, PerfilPublico, Propiedad } from "@/lib/types";
import { tr } from "@/lib/i18n";

const METODOS: { value: MetodoPago; icon: string; label: string }[] = [
  { value: "Efectivo", icon: "payments", label: tr("Efectivo") },
  { value: "Tarjeta", icon: "credit_card", label: tr("Tarjeta") },
];

const FRECUENCIAS: { value: Frecuencia; icon: string; label: string }[] = [
  { value: "una_vez", icon: "event", label: tr("Una vez") },
  { value: "semanal", icon: "event_repeat", label: tr("Semanal") },
  { value: "quincenal", icon: "date_range", label: tr("Quincenal") },
  { value: "mensual", icon: "calendar_month", label: tr("Mensual") },
];

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
  // Trueque: se paga con un servicio (`ofrece`) y, opcionalmente, un diferencial en dinero (`pago`).
  const [trueque, setTrueque] = useState(false);
  const [ofrece, setOfrece] = useState("");
  // CIRA Agenda: frecuencia (solo al recontratar), propiedad elegida y días ocupados del invitado.
  const [frecuencia, setFrecuencia] = useState<Frecuencia>("una_vez");
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [propiedadId, setPropiedadId] = useState<string | null>(null);
  const [ocupadosInvitado, setOcupadosInvitado] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    ubicacion: "",
    coords: null as { lat: number; lng: number } | null,
    fecha: "",
    hora: "09:00",
    /** "Listo antes de" (HH:MM, opcional). */
    limiteHora: "",
    pago: "",
    metodoPago: "Tarjeta" as MetodoPago,
  });

  useEffect(() => {
    if (editando) return;
    api.propiedades
      .listar()
      .then(setPropiedades)
      .catch(() => setPropiedades([]));
  }, [editando]);

  const propiedad = propiedades.find((p) => p.id === propiedadId) ?? null;
  const elegirPropiedad = (p: Propiedad | null) => {
    setPropiedadId(p?.id ?? null);
    if (p) setForm((f) => ({ ...f, ubicacion: p.ubicacion, coords: p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null }));
  };

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
        setTrueque(!!t.trueque);
        setOfrece(t.trueque?.ofrece ?? "");
        setForm({
          titulo: t.titulo,
          descripcion: t.descripcion,
          categoria: t.categoria,
          ubicacion: t.ubicacion,
          coords: t.lat != null && t.lng != null ? { lat: t.lat, lng: t.lng } : null,
          fecha: t.fecha ? t.fecha.slice(0, 10) : "",
          hora: t.fecha ? t.fecha.slice(11, 16) : "09:00",
          limiteHora: t.limite ? t.limite.slice(11, 16) : "",
          pago: t.trueque && t.pago === 0 ? "" : String(t.pago),
          metodoPago: t.metodoPago,
        });
      })
      .catch(() => setError(tr("No se pudo cargar la publicación.")))
      .finally(() => setCargando(false));
  }, [id]);

  const esUrgente = urgente && !paraId && !trueque;
  const recurrente = !!paraId && frecuencia !== "una_vez" && !trueque;
  const fechaHora = form.fecha && form.hora ? `${form.fecha}T${form.hora}` : "";
  // Hora límite: el mismo día del inicio (o de hoy en una urgencia); si es más temprano que el inicio, al día siguiente.
  const limite = (() => {
    if (!form.limiteHora) return null;
    const base = esUrgente ? hoyDia() : form.fecha;
    const desde = esUrgente ? new Date().toTimeString().slice(0, 5) : form.hora;
    if (!base) return null;
    return `${form.limiteHora <= desde ? sumarDias(base, 1) : base}T${form.limiteHora}`;
  })();
  const diaOcupado = !!paraId && !!form.fecha && ocupadosInvitado.includes(form.fecha);
  const metodoEfectivo: MetodoPago = form.metodoPago;
  const monto = Number(form.pago) || 0;
  // Con tarjeta, o en una urgencia (la tarifa se cobra con tarjeta), hace falta una tarjeta registrada.
  // En un trueque solo si hay un diferencial que se paga con tarjeta.
  const faltaTarjeta = (trueque ? monto > 0 && metodoEfectivo === "Tarjeta" : metodoEfectivo === "Tarjeta" || esUrgente) && !usuario?.tarjeta;
  // Plan gratis: trueques limitados por mes (al editar no cuenta).
  const truequesRestantes = usuario?.plan === "plus" ? Infinity : Math.max(0, config.truequesGratisMes - (usuario?.truequesMes ?? 0));
  const sinCupoTrueque = trueque && !editando && truequesRestantes === 0;

  const pagoValido = trueque ? monto >= 0 && ofrece.trim().length > 0 && !sinCupoTrueque : monto > 0;
  const valido =
    form.titulo.trim() && form.categoria && form.ubicacion && (esUrgente || fechaHora) && pagoValido && !faltaTarjeta && !diaOcupado && (!paraId || invitado);

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
        fecha: esUrgente ? undefined : fechaHora,
        limite: editando ? limite : (limite ?? undefined),
        pago: monto,
        metodoPago: metodoEfectivo,
      };
      if (id) await api.trabajos.editar(id, trueque ? { ...datos, ofrece: ofrece.trim() } : datos);
      else
        await api.trabajos.crear({
          ...datos,
          urgente: esUrgente,
          invitadoId: invitado?.id,
          propiedadId: propiedad?.id,
          ...(recurrente ? { frecuencia } : {}),
          ...(trueque ? { trueque: true, ofrece: ofrece.trim() } : {}),
        });
      mostrarToast(
        editando
          ? tr("Cambios guardados")
          : recurrente && invitado
            ? tr("Oferta enviada a {nombre}: {cada}", { nombre: invitado.nombre, cada: frecuenciaTexto(frecuencia, fechaHora).toLowerCase() })
            : trueque ? tr("Trueque publicado") : invitado ? tr("Oferta enviada a {nombre}", { nombre: invitado.nombre }) : esUrgente ? tr("Urgencia publicada: avisamos a los trabajadores cercanos") : tr("Trabajo publicado"),
      );
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
                {recurrente
                  ? tr("Lo acepta una sola vez y CIRA agenda las siguientes visitas. Si un día no puede, te proponemos un reemplazo.")
                  : tr("Solo esa persona verá este trabajo. Si no puede tomarlo, se publica para todos.")}
              </p>
            </div>
          </Card>
        )}

        {invitado && !trueque && (
          <Card className="grid gap-3">
            <Field label={tr("¿Cada cuánto?")}>
              <div className="grid grid-cols-2 gap-2.5">
                {FRECUENCIAS.map((f) => (
                  <SelectableCard key={f.value} icon={f.icon} text={f.label} selected={frecuencia === f.value} onClick={() => setFrecuencia(f.value)} />
                ))}
              </div>
            </Field>
            {recurrente && fechaHora && (
              <p className="aire-text-footnote flex items-center gap-2 text-aire-ink-2">
                <Icon name="event_repeat" size={18} className="shrink-0 text-aire-accent-text" />
                {tr("{cada}, desde el {dia}.", { cada: frecuenciaTexto(frecuencia, fechaHora), dia: diaLargo(form.fecha) })}
              </p>
            )}
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

        {!paraId && !trueque && (!editando || urgente) && (
          <Card className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-aire-md bg-aire-danger-soft">
              <Icon name="bolt" filled size={22} className="text-aire-danger-text" />
            </span>
            <div className="flex-1">
              <p className="aire-text-headline text-aire-ink">{tr("Es urgente")}</p>
              <p className="aire-text-footnote text-aire-ink-2">
                {tr("Alertamos primero a los trabajadores más cercanos y disponibles. Tiene una tarifa de urgencia del {pct}%, que se cobra con tu tarjeta registrada: {trab}% es para quien atiende la urgencia y {cira}% para CIRA.", { pct: config.urgenciaPct, trab: config.urgenciaTrabajadorPct, cira: config.urgenciaPct - config.urgenciaTrabajadorPct })}
              </p>
            </div>
            {!editando && <Switch checked={esUrgente} onChange={setUrgente} label={tr("Es urgente")} />}
          </Card>
        )}

        <Card className="grid gap-3.5">
          {!editando && propiedades.length > 0 && (
            <Field label={tr("¿Dónde?")}>
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {propiedades.map((p) => (
                  <FilterChip key={p.id} label={p.nombre} active={propiedadId === p.id} onClick={() => elegirPropiedad(propiedadId === p.id ? null : p)} />
                ))}
                <FilterChip label={tr("Otra dirección")} active={!propiedadId} onClick={() => elegirPropiedad(null)} />
              </div>
            </Field>
          )}

          {propiedad ? (
            <div className="grid gap-2 rounded-aire-md bg-aire-surface-2 p-3.5">
              <p className="aire-text-headline flex items-center gap-2 text-aire-ink">
                <Icon name="home_work" size={20} className="text-aire-accent-text" />
                {propiedad.nombre}
              </p>
              <p className="aire-text-subhead text-aire-ink-2">{propiedad.ubicacion}</p>
              {propiedad.instrucciones && (
                <p className="aire-text-footnote text-aire-ink-2">
                  <span className="font-semibold text-aire-ink">{tr("Instrucciones para el trabajador:")}</span> {propiedad.instrucciones}
                </p>
              )}
            </div>
          ) : (
            <LocationPicker
              value={form.coords}
              address={form.ubicacion}
              onChange={(coords, direccion) => setForm({ ...form, coords, ubicacion: direccion })}
            />
          )}

          {!editando && (
            <button
              type="button"
              onClick={() => navigate("/cuenta/propiedades")}
              className="aire-text-footnote min-h-11 justify-self-start font-semibold text-aire-accent-text"
            >
              {propiedades.length > 0 ? tr("Administrar mis propiedades") : tr("Guarda tus propiedades para no escribir la dirección cada vez")}
            </button>
          )}

          {esUrgente ? (
            <>
              <p className="aire-text-subhead flex items-center gap-2 rounded-aire-md bg-aire-danger-soft p-3 font-semibold text-aire-danger-text">
                <Icon name="schedule" size={20} />
                {tr("Se atiende lo antes posible")}
              </p>
              <Input
                label={tr("Listo antes de (opcional)")}
                type="time"
                hint={tr("Por ejemplo, la hora en que entra el próximo huésped.")}
                value={form.limiteHora}
                onChange={(e) => setForm({ ...form, limiteHora: e.target.value })}
              />
            </>
          ) : (
            <>
              {invitado && (
                <DisponibilidadStrip
                  usuarioId={invitado.id}
                  nombre={invitado.nombre}
                  value={form.fecha}
                  onChange={(fecha) => setForm({ ...form, fecha })}
                  onOcupados={setOcupadosInvitado}
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={recurrente ? tr("Primera visita") : tr("Fecha")}
                  type="date"
                  min={editando ? undefined : hoyDia()}
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                />
                <Input label={tr("Hora")} type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
              </div>
              <Input
                label={tr("Listo antes de (opcional)")}
                type="time"
                hint={
                  limite && fechaHora && limite.slice(0, 10) !== fechaHora.slice(0, 10)
                    ? tr("Al día siguiente del inicio.")
                    : tr("Si el trabajo tiene que estar terminado a una hora.")
                }
                value={form.limiteHora}
                onChange={(e) => setForm({ ...form, limiteHora: e.target.value })}
              />
              {diaOcupado && invitado && (
                <p className="aire-text-footnote flex items-start gap-2 rounded-aire-md bg-aire-warning-soft p-3 text-aire-warning-text">
                  <Icon name="event_busy" size={18} className="mt-px shrink-0" />
                  {tr("{nombre} no está disponible ese día. Elige un día libre.", { nombre: invitado.nombre })}
                </p>
              )}
            </>
          )}
        </Card>

        <Card className="grid gap-3.5">
          {/* Al editar no se cambia entre dinero y trueque. */}
          {!editando && (
            <Field label={tr("¿Cómo vas a pagar?")}>
              <div className="grid grid-cols-3 gap-2">
                {METODOS.map((m) => (
                  <SelectableCard
                    key={m.value}
                    icon={m.icon}
                    text={m.label}
                    selected={!trueque && metodoEfectivo === m.value}
                    onClick={() => {
                      setTrueque(false);
                      setForm({ ...form, metodoPago: m.value });
                    }}
                  />
                ))}
                <SelectableCard
                  icon="handshake"
                  text={tr("Trueque")}
                  selected={trueque}
                  onClick={() => {
                    setTrueque(true);
                    setFrecuencia("una_vez");
                  }}
                />
              </div>
            </Field>
          )}

          {trueque ? (
            <>
              <TextArea
                label={tr("¿Qué ofreces a cambio?")}
                rows={2}
                maxLength={300}
                placeholder={tr("Ej: Reviso la instalación eléctrica de tu casa (2 horas)")}
                value={ofrece}
                onChange={(e) => setOfrece(e.target.value)}
              />
              <Input
                label={tr("Diferencial en dinero (opcional)")}
                type="number"
                inputMode="numeric"
                min={0}
                prefix="₡"
                placeholder="0"
                hint={tr("Si los trabajos no valen lo mismo o hay gastos, como combustible.")}
                value={form.pago}
                onChange={(e) => setForm({ ...form, pago: e.target.value })}
              />
              {monto > 0 && (
                <Field label={tr("¿Cómo pagas el diferencial?")}>
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
              )}
              {!editando && usuario?.plan !== "plus" && (
                <div
                  className={`aire-text-footnote grid gap-2 rounded-aire-md p-3 ${
                    sinCupoTrueque ? "bg-aire-warning-soft text-aire-warning-text" : "bg-aire-surface-2 text-aire-ink-2"
                  }`}
                >
                  <p className="flex items-start gap-2">
                    <Icon name={sinCupoTrueque ? "block" : "info"} size={18} className="mt-px shrink-0" />
                    {sinCupoTrueque
                      ? tr("Ya usaste tu trueque de este mes. Con el Plan Plus son ilimitados.")
                      : tr("Plan gratis: {n} trueque al mes. Con el Plan Plus son ilimitados.", { n: config.truequesGratisMes })}
                  </p>
                  {sinCupoTrueque && (
                    <Button variant="secondary" size="sm" type="button" icon="star" onClick={() => navigate("/cuenta/plan")}>
                      {tr("Conoce el Plan Plus")}
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
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
              {editando && (
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
              )}
            </>
          )}

          {monto > 0 && <PagoResumen resumen={calcularResumen(monto, esUrgente, metodoEfectivo, config)} trueque={trueque} />}
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

        <Button type="submit" size="lg" icon={esUrgente ? "bolt" : trueque ? "handshake" : undefined} disabled={!valido} loading={enviando} className="mt-1">
          {editando
            ? tr("Guardar cambios")
            : invitado
              ? tr("Enviar oferta a {nombre}", { nombre: invitado.nombre })
              : esUrgente
                ? tr("Publicar urgencia")
                : trueque
                  ? tr("Publicar trueque")
                  : tr("Publicar ahora")}
        </Button>
      </form>
    </div>
  );
}
