import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Calendar, Card, FilterChip, Icon, SegmentedControl, Spinner, Stagger, type CalendarMark } from "@/components/aire";
import { CategoriaThumb } from "@/components/CategoriaThumb";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { aDate, diaLargo, fechaTrabajo, frecuenciaTexto, hoyDia, horaDe } from "@/lib/fechas";
import { localeActual, tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import type { Agenda, ItemAgenda, Propiedad } from "@/lib/types";

type Filtro = "todo" | "trabajador" | "cliente";

const dos = (n: number) => String(n).padStart(2, "0");

/** Tono del punto en el calendario: trabajo propio, servicio contratado, reemplazo pendiente o ya hecho. */
function tonoDe(item: ItemAgenda): CalendarMark {
  const t = item.trabajo;
  if (t.estado === "Finalizado") return "neutral";
  if (item.rol === "cliente" && t.reemplazo === "pendiente") return "warning";
  return item.rol === "trabajador" ? "accent" : "success";
}

/**
 * CIRA Agenda: calendario con lo que haré como trabajador y lo que contraté como cliente
 * (servicios recurrentes incluidos), días bloqueados y filtro por propiedad.
 */
export function AgendaPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const hoy = hoyDia();
  const [mes, setMes] = useState(() => {
    const d = aDate(hoy);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [dia, setDia] = useState(hoy);
  const [filtro, setFiltro] = useState<Filtro>("todo");
  const [propiedadId, setPropiedadId] = useState<string | null>(null);
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [bloqueando, setBloqueando] = useState(false);

  const desde = `${mes.year}-${dos(mes.month + 1)}-01`;
  const hasta = `${mes.year}-${dos(mes.month + 1)}-${dos(new Date(mes.year, mes.month + 1, 0).getDate())}`;

  const cargar = useCallback(
    () =>
      api.agenda
        .obtener(desde, hasta)
        .then(setAgenda)
        .catch(() => setAgenda({ items: [], bloqueos: [] })),
    [desde, hasta],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    api.propiedades
      .listar()
      .then(setPropiedades)
      .catch(() => setPropiedades([]));
  }, []);

  const items = useMemo(
    () =>
      (agenda?.items ?? []).filter(
        (i) => (filtro === "todo" || i.rol === filtro) && (!propiedadId || i.trabajo.propiedad?.id === propiedadId),
      ),
    [agenda, filtro, propiedadId],
  );

  const marcas = useMemo(() => {
    const m: Record<string, CalendarMark[]> = {};
    for (const i of items) {
      const d = i.trabajo.fecha!.slice(0, 10);
      const tono = tonoDe(i);
      m[d] = [...(m[d] ?? []), tono].filter((t, k, arr) => arr.indexOf(t) === k);
    }
    return m;
  }, [items]);

  const delDia = items.filter((i) => i.trabajo.fecha!.slice(0, 10) === dia);
  const bloqueado = agenda?.bloqueos.includes(dia) ?? false;
  const ofreceServicios = (usuario?.servicios.length ?? 0) > 0;

  const alternarBloqueo = async () => {
    setBloqueando(true);
    try {
      if (bloqueado) {
        await api.agenda.desbloquear(dia);
        mostrarToast(tr("Vuelves a estar disponible ese día"), "info");
      } else {
        await api.agenda.bloquear(dia);
        mostrarToast(tr("Marcaste el día como no disponible"), "info");
      }
      await cargar();
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : tr("No se pudo completar la acción."), "error");
    } finally {
      setBloqueando(false);
    }
  };

  return (
    <div>

      <div className="grid gap-3 px-5 pt-2">
        <SegmentedControl
          fullWidth
          label={tr("Ver")}
          value={filtro}
          onChange={(v) => setFiltro(v as Filtro)}
          items={[
            { value: "todo", label: tr("Todo") },
            { value: "trabajador", label: tr("Como trabajador") },
            { value: "cliente", label: tr("Como cliente") },
          ]}
        />

        {filtro !== "trabajador" && (
          <div className="-mr-5 flex items-center gap-2">
            {/* "+" siempre a la vista (fuera del scroll de los filtros): crea una propiedad nueva. */}
            <button
              type="button"
              className="ca-iconbtn shrink-0"
              aria-label={tr("Agregar propiedad")}
              onClick={() => navigate("/cuenta/propiedades?nueva=1")}
            >
              <Icon name="add" size={22} />
            </button>
            {propiedades.length > 0 ? (
              <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto pr-5 pb-1">
                <FilterChip label={tr("Todas las direcciones")} active={!propiedadId} onClick={() => setPropiedadId(null)} />
                {propiedades.map((p) => (
                  <FilterChip key={p.id} label={p.nombre} active={propiedadId === p.id} onClick={() => setPropiedadId(propiedadId === p.id ? null : p.id)} />
                ))}
              </div>
            ) : (
              <button
                type="button"
                className="aire-text-subhead min-h-11 pr-5 text-left font-semibold text-aire-accent-text"
                onClick={() => navigate("/cuenta/propiedades?nueva=1")}
              >
                {tr("Agrega una propiedad para filtrar por dirección")}
              </button>
            )}
          </div>
        )}

        <Card>
          <Calendar
            year={mes.year}
            month={mes.month}
            value={dia}
            onChange={setDia}
            onMonthChange={(year, month) => {
              setMes({ year, month });
              setDia(`${year}-${dos(month + 1)}-01`);
            }}
            marks={marcas}
            blocked={agenda?.bloqueos}
            today={hoy}
            locale={localeActual()}
            labels={{ previous: tr("Mes anterior"), next: tr("Mes siguiente") }}
          />
          <div className="aire-text-caption mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-aire-hairline pt-3 text-aire-ink-2">
            <Leyenda tono="accent" texto={tr("Como trabajador")} />
            <Leyenda tono="success" texto={tr("Como cliente")} />
            <Leyenda tono="warning" texto={tr("Falta reemplazo")} />
            <Leyenda tono="neutral" texto={tr("Hecho")} />
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-aire-xs bg-aire-surface-3" aria-hidden="true" />
              {tr("No disponible")}
            </span>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-3 pt-2">
          <h2 className="aire-text-title-3 text-aire-ink first-letter:uppercase">{diaLargo(dia)}</h2>
          {agenda === null && <Spinner size={18} />}
        </div>

        {bloqueado && (
          <p className="aire-text-subhead flex items-center gap-2 rounded-aire-md bg-aire-surface-3 p-3 text-aire-ink">
            <Icon name="event_busy" size={20} className="shrink-0" />
            {tr("Marcaste este día como no disponible: nadie puede ofrecerte trabajo directo.")}
          </p>
        )}

        {agenda !== null && delDia.length === 0 && !bloqueado && (
          <p className="aire-text-subhead text-aire-ink-2">{tr("Nada agendado este día.")}</p>
        )}

        <Stagger key={`${dia}-${filtro}-${propiedadId}`} className="grid gap-2.5">
          {delDia.map((i) => (
            <ItemDia key={i.trabajo.id} item={i} onOpen={() => navigate(i.rol === "trabajador" ? "/mis-trabajos" : "/publicaciones")} />
          ))}
        </Stagger>

        {ofreceServicios && dia >= hoy && (
          <Button variant="secondary" icon={bloqueado ? "event_available" : "event_busy"} loading={bloqueando} onClick={alternarBloqueo}>
            {bloqueado ? tr("Volver a estar disponible") : tr("Marcar como no disponible")}
          </Button>
        )}
      </div>
    </div>
  );
}

function Leyenda({ tono, texto }: { tono: CalendarMark; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <i className={`ca-cal__dot ca-cal__dot--${tono}`} aria-hidden="true" />
      {texto}
    </span>
  );
}

function ItemDia({ item, onOpen }: { item: ItemAgenda; onOpen: () => void }) {
  const t = item.trabajo;
  const conQuien =
    item.rol === "trabajador"
      ? tr("Para {nombre}", { nombre: t.publicador })
      : t.reemplazo === "pendiente"
        ? tr("{nombre} no puede: falta reemplazo", { nombre: t.serie?.trabajadorNombre ?? "" })
        : t.reemplazo === "invitado"
          ? tr("Esperando a {nombre}", { nombre: t.invitadoNombre ?? "" })
          : t.trabajadorNombre
            ? tr("Con {nombre}", { nombre: t.trabajadorNombre })
            : t.invitadoNombre
              ? tr("Esperando a {nombre}", { nombre: t.invitadoNombre })
              : tr("Buscando trabajador");
  return (
    <Card interactive onClick={onOpen} className="flex items-start gap-3" padding="sm">
      <CategoriaThumb categoria={t.categoria} apagado={t.estado === "Finalizado"} />
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="aire-text-footnote font-semibold text-aire-ink-2">
          {horaDe(t.fecha!)}
          {t.limite && ` – ${t.limite.slice(0, 10) === t.fecha!.slice(0, 10) ? horaDe(t.limite) : fechaTrabajo(t.limite)}`} ·{" "}
          {item.rol === "trabajador" ? tr("Trabajas") : tr("Contrataste")}
        </p>
        <p className="aire-text-headline truncate text-aire-ink">{t.titulo}</p>
        <p className={`aire-text-footnote ${t.reemplazo === "pendiente" ? "font-semibold text-aire-warning-text" : "text-aire-ink-2"}`}>{conQuien}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {t.serie && (
            <Badge tone="accent">
              <Icon name="event_repeat" size={14} />
              {frecuenciaTexto(t.serie.frecuencia, t.fecha)}
            </Badge>
          )}
          {t.turno && (
            <Badge tone="accent">
              <Icon name="luggage" size={14} />
              {tr("Entre huéspedes")}
            </Badge>
          )}
          {t.propiedad && (
            <Badge tone="neutral">
              <Icon name="home_work" size={14} />
              {t.propiedad.nombre}
            </Badge>
          )}
          {t.estado === "Finalizado" && <Badge tone="success">{tr("Hecho")}</Badge>}
          {t.invitacionParaMi && <Badge tone="warning">{tr("Por responder")}</Badge>}
        </div>
      </div>
      <Icon name="chevron_forward" size={20} className="mt-1 shrink-0 text-aire-ink-2" />
    </Card>
  );
}
