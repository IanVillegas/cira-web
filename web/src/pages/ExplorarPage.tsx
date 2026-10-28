import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Fab, Loader, PageHeader, Reveal } from "@/components/aire";
import { AccesosExplorar } from "@/components/AccesosExplorar";
import { Carrusel } from "@/components/Carrusel";
import { TrabajadorSheet, TrabajoSheet } from "@/components/DetalleSheets";
import { TrabajadorMini, TrabajoMini } from "@/components/TarjetasCompactas";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import type { Trabajador, Trabajo } from "@/lib/types";

/** Cuántas tarjetas se muestran en cada fila antes de "Ver todos". */
const POR_FILA = 5;

/**
 * Inicio de Explorar: accesos rápidos y tres filas que se deslizan a lo ancho
 * (Urgentes, Trabajos y Trabajadores), cada una con "Ver todos". Tocar una
 * tarjeta abre una hoja con la información completa y sus acciones.
 */
export function ExplorarPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  // Link compartido por WhatsApp, alertas o el mapa (/explorar?trabajo=ID): abre ese trabajo.
  const [searchParams, setSearchParams] = useSearchParams();
  const trabajoDelLink = searchParams.get("trabajo");

  const [trabajos, setTrabajos] = useState<Trabajo[] | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[] | null>(null);
  const [error, setError] = useState(false);
  const [trabajoAbierto, setTrabajoAbierto] = useState<string | null>(trabajoDelLink);
  const [trabajadorAbierto, setTrabajadorAbierto] = useState<string | null>(null);

  const cargarTrabajos = () =>
    api.trabajos
      .listar()
      .then(setTrabajos)
      .catch(() => setError(true));

  useEffect(() => {
    cargarTrabajos();
    api.trabajadores
      .listar()
      .then(setTrabajadores)
      .catch(() => setError(true));
  }, []);

  // Si llega otro link estando ya en la pantalla (por ejemplo, desde un aviso), se abre ese.
  const [linkPrevio, setLinkPrevio] = useState(trabajoDelLink);
  if (trabajoDelLink !== linkPrevio) {
    setLinkPrevio(trabajoDelLink);
    if (trabajoDelLink) setTrabajoAbierto(trabajoDelLink);
  }

  const urgentes = useMemo(
    () => (trabajos ?? []).filter((t) => t.urgente).sort((a, b) => a.distanciaKm - b.distanciaKm),
    [trabajos],
  );
  const normales = useMemo(
    () => (trabajos ?? []).filter((t) => !t.urgente).sort((a, b) => a.distanciaKm - b.distanciaKm),
    [trabajos],
  );
  // Primero los disponibles; entre ellos, los mejor calificados.
  const otrosTrabajadores = useMemo(
    () =>
      (trabajadores ?? [])
        .filter((w) => w.id !== usuario?.id)
        .sort((a, b) => Number(b.disponible) - Number(a.disponible) || (b.calificacion ?? 0) - (a.calificacion ?? 0)),
    [trabajadores, usuario?.id],
  );

  const trabajoSel = trabajos?.find((t) => t.id === trabajoAbierto) ?? null;
  const trabajadorSel = trabajadores?.find((w) => w.id === trabajadorAbierto) ?? null;

  const cerrarTrabajo = () => {
    setTrabajoAbierto(null);
    if (trabajoDelLink) setSearchParams({}, { replace: true });
  };

  const cargando = trabajos === null || trabajadores === null;

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Explorar")}
        subtitle={tr("Encuentra tu próximo servicio hoy.")}
        action={{ icon: "notifications", label: tr("Alertas"), onClick: () => navigate("/alertas") }}
      />
      <AccesosExplorar />

      {error ? (
        <div className="px-5 pt-6">
          <Vacio image="empty_no_signal" title={tr("Sin conexión")} message={tr("No se pudo conectar con el servidor local (CIRA-Server).")} />
        </div>
      ) : cargando ? (
        <div className="pt-8">
          <Loader label={tr("Cargando...")} />
        </div>
      ) : (
        <div className="grid gap-6 pt-6">
          {urgentes.length > 0 && (
            <Reveal>
              <Carrusel
                titulo={tr("Urgentes")}
                subtitulo={tr("Se lo queda quien acepte primero")}
                onVerTodos={urgentes.length > POR_FILA ? () => navigate("/explorar/trabajos") : undefined}
                total={urgentes.length}
              >
                {urgentes.slice(0, POR_FILA).map((t) => (
                  <TrabajoMini key={t.id} trabajo={t} onOpen={() => setTrabajoAbierto(t.id)} />
                ))}
              </Carrusel>
            </Reveal>
          )}

          <Reveal delay={60}>
            <Carrusel
              titulo={tr("Trabajos")}
              subtitulo={tr("Los más cercanos a ti")}
              onVerTodos={() => navigate("/explorar/trabajos")}
              total={trabajos.length}
            >
              {normales.length === 0 ? (
                <p className="ca-carrusel__vacio aire-text-subhead">{tr("Cuando existan publicaciones activas aparecerán aquí.")}</p>
              ) : (
                normales.slice(0, POR_FILA).map((t) => <TrabajoMini key={t.id} trabajo={t} onOpen={() => setTrabajoAbierto(t.id)} />)
              )}
            </Carrusel>
          </Reveal>

          <Reveal delay={120}>
            <Carrusel
              titulo={tr("Trabajadores")}
              subtitulo={tr("Disponibles primero")}
              onVerTodos={() => navigate("/trabajadores")}
              total={otrosTrabajadores.length}
            >
              {otrosTrabajadores.length === 0 ? (
                <p className="ca-carrusel__vacio aire-text-subhead">{tr("Cuando existan trabajadores disponibles aparecerán aquí.")}</p>
              ) : (
                otrosTrabajadores
                  .slice(0, POR_FILA)
                  .map((w) => <TrabajadorMini key={w.id} trabajador={w} onOpen={() => setTrabajadorAbierto(w.id)} />)
              )}
            </Carrusel>
          </Reveal>
        </div>
      )}

      {/* El área con scroll ya reserva el alto de la barra: el botón solo se separa 12px de ella. */}
      <div className="pointer-events-none sticky bottom-3 mt-4 flex justify-end px-5">
        <span className="pointer-events-auto">
          <Fab icon="add" label={tr("Crear publicación")} onClick={() => navigate("/crear-trabajo")} />
        </span>
      </div>

      <TrabajoSheet
        trabajo={trabajoSel}
        onClose={cerrarTrabajo}
        onCambio={(t) => setTrabajos((prev) => prev?.map((x) => (x.id === t.id ? t : x)) ?? prev)}
        onRecargar={cargarTrabajos}
      />
      <TrabajadorSheet
        trabajador={trabajadorSel}
        onClose={() => setTrabajadorAbierto(null)}
        onCambio={(w) => setTrabajadores((prev) => prev?.map((x) => (x.id === w.id ? w : x)) ?? prev)}
      />
    </div>
  );
}
