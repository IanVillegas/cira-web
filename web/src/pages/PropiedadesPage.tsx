import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Dialog, Field, FilterChip, Icon, Input, Loader, PageHeader, Reveal, Stagger, TextArea } from "@/components/aire";
import { LocationPicker } from "@/components/LocationPicker";
import { SalidaHuespedSheet } from "@/components/SalidaHuespedSheet";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import { useConfig } from "@/lib/useConfig";
import type { Propiedad, Trabajador } from "@/lib/types";

const VACIA = {
  nombre: "",
  ubicacion: "",
  coords: null as { lat: number; lng: number } | null,
  instrucciones: "",
  limpiadorId: null as string | null,
};

/**
 * Mis propiedades: direcciones con nombre e instrucciones fijas (dónde está la llave, qué revisar).
 * Al publicar o recontratar se eligen en un toque; las instrucciones solo las ve quien hace el trabajo.
 */
export function PropiedadesPage() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Propiedad[] | null>(null);
  // /cuenta/propiedades?nueva=1 (botón "+" de la Agenda) abre directo el formulario de una propiedad nueva.
  const [searchParams] = useSearchParams();
  const [editando, setEditando] = useState<Propiedad | "nueva" | null>(() => (searchParams.get("nueva") ? "nueva" : null));
  const [form, setForm] = useState(VACIA);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Propiedad | null>(null);
  const [salidaDe, setSalidaDe] = useState<Propiedad | null>(null);
  // Posibles limpiadores habituales: tus trabajadores "De confianza" que ofrecen Limpieza.
  const [limpiadores, setLimpiadores] = useState<Trabajador[]>([]);
  const config = useConfig();

  useEffect(() => {
    api.propiedades
      .listar()
      .then(setLista)
      .catch(() => setLista([]));
    api.favoritos
      .listar()
      .then((f) => setLimpiadores(f.filter((t) => t.servicios.includes("Limpieza"))))
      .catch(() => setLimpiadores([]));
  }, []);

  const abrir = (p: Propiedad | "nueva") => {
    setError(null);
    setEditando(p);
    setForm(
      p === "nueva"
        ? VACIA
        : {
            nombre: p.nombre,
            ubicacion: p.ubicacion,
            coords: p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null,
            instrucciones: p.instrucciones,
            limpiadorId: p.limpiadorId ?? null,
          },
    );
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    const datos = {
      nombre: form.nombre.trim(),
      ubicacion: form.ubicacion,
      lat: form.coords?.lat,
      lng: form.coords?.lng,
      instrucciones: form.instrucciones.trim(),
      limpiadorId: form.limpiadorId ?? undefined,
    };
    try {
      if (editando === "nueva") {
        const nueva = await api.propiedades.crear(datos);
        setLista((l) => [...(l ?? []), nueva]);
      } else if (editando) {
        const editada = await api.propiedades.editar(editando.id, datos);
        setLista((l) => l?.map((p) => (p.id === editada.id ? editada : p)) ?? l);
      }
      mostrarToast(tr("Propiedad guardada"));
      setEditando(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo completar la acción."));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!aEliminar) return;
    try {
      await api.propiedades.eliminar(aEliminar.id);
      setLista((l) => l?.filter((p) => p.id !== aEliminar.id) ?? l);
      mostrarToast(tr("Propiedad eliminada"), "info");
    } finally {
      setAEliminar(null);
    }
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Mis propiedades")}
        subtitle={tr("Casas, apartamentos o locales que atiendes seguido.")}
        onBack={() => (editando ? setEditando(null) : navigate(-1))}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-3 px-5 pt-2">
        {editando ? (
          <Reveal effect="up">
            <Card className="grid gap-3.5">
              <p className="aire-text-title-3 text-aire-ink">{editando === "nueva" ? tr("Nueva propiedad") : tr("Editar propiedad")}</p>
              <Input
                label={tr("Nombre")}
                placeholder={tr("Ej: Apartamento Escazú")}
                maxLength={60}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
              <LocationPicker value={form.coords} address={form.ubicacion} onChange={(coords, ubicacion) => setForm({ ...form, coords, ubicacion })} />
              <TextArea
                label={tr("Instrucciones para el trabajador")}
                rows={3}
                maxLength={500}
                placeholder={tr("Ej: La llave está con el guarda. Cambiar sábanas y dejar toallas limpias.")}
                hint={tr("Solo las ve la persona que hace el trabajo.")}
                value={form.instrucciones}
                onChange={(e) => setForm({ ...form, instrucciones: e.target.value })}
              />
              <Field label={tr("Limpiador habitual")}>
                {limpiadores.length === 0 ? (
                  <p className="aire-text-footnote text-aire-ink-2">
                    {tr("Guarda en \"De confianza\" a alguien que ofrezca Limpieza para elegirlo aquí.")}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <FilterChip label={tr("Nadie")} active={!form.limpiadorId} onClick={() => setForm({ ...form, limpiadorId: null })} />
                    {limpiadores.map((l) => (
                      <FilterChip key={l.id} label={l.nombre} active={form.limpiadorId === l.id} onClick={() => setForm({ ...form, limpiadorId: l.id })} />
                    ))}
                  </div>
                )}
                <p className="aire-text-caption mt-1.5 text-aire-ink-2">
                  {tr("Recibe primero las limpiezas entre huéspedes. Si no responde en {min} min, pasan a urgencia.", { min: config.escalarTurnoMin })}
                </p>
              </Field>
              {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}
              <Button icon="check" loading={guardando} disabled={!form.nombre.trim() || !form.ubicacion} onClick={guardar}>
                {tr("Guardar propiedad")}
              </Button>
              <Button variant="plain" onClick={() => setEditando(null)}>
                {tr("Cancelar")}
              </Button>
            </Card>
          </Reveal>
        ) : lista === null ? (
          <Loader label={tr("Cargando...")} />
        ) : (
          <>
            {lista.length === 0 ? (
              <Vacio
                title={tr("Todavía no tienes propiedades")}
                message={tr("Guárdalas para agendar limpiezas y mantenimientos sin escribir la dirección cada vez.")}
              />
            ) : (
              <Stagger className="grid gap-3">
                {lista.map((p) => (
                  <Card key={p.id} className="grid gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft text-aire-accent-text">
                        <Icon name="home_work" size={26} />
                      </span>
                      <div className="grid min-w-0 flex-1 gap-0.5">
                        <p className="aire-text-headline text-aire-ink">{p.nombre}</p>
                        <p className="aire-text-subhead text-aire-ink-2">{p.ubicacion}</p>
                      </div>
                    </div>
                    {p.instrucciones && (
                      <p className="aire-text-footnote rounded-aire-md bg-aire-surface-2 p-3 text-aire-ink-2">{p.instrucciones}</p>
                    )}
                    <p className="aire-text-footnote flex items-center gap-1.5 text-aire-ink-2">
                      <Icon name="cleaning_services" size={16} className="text-aire-accent-text" />
                      {p.limpiadorNombre ? tr("Limpia: {nombre}", { nombre: p.limpiadorNombre }) : tr("Sin limpiador habitual")}
                    </p>
                    <Button icon="luggage" onClick={() => setSalidaDe(p)}>
                      {tr("Registrar salida de huésped")}
                    </Button>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="secondary" size="sm" onClick={() => navigate("/agenda")}>
                        {tr("Agenda")}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => abrir(p)}>
                        {tr("Editar")}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setAEliminar(p)}>
                        {tr("Eliminar")}
                      </Button>
                    </div>
                  </Card>
                ))}
              </Stagger>
            )}
            <Button icon="add_home" onClick={() => abrir("nueva")}>
              {tr("Agregar propiedad")}
            </Button>
          </>
        )}
      </div>

      <SalidaHuespedSheet
        propiedad={salidaDe}
        onClose={() => setSalidaDe(null)}
        onCreada={(t) => {
          setSalidaDe(null);
          mostrarToast(
            t.urgente
              ? tr("Limpieza publicada como urgencia: avisamos a los trabajadores cercanos")
              : tr("Le avisamos a {nombre}; si no responde, pasa a urgencia", { nombre: t.invitadoNombre ?? "" }),
          );
          navigate("/publicaciones");
        }}
      />

      <Dialog
        open={aEliminar !== null}
        onClose={() => setAEliminar(null)}
        title={tr("¿Eliminar {nombre}?", { nombre: aEliminar?.nombre ?? "" })}
        message={tr("Los trabajos que ya agendaste ahí conservan su dirección.")}
        icon="delete"
        tone="danger"
        contained
        actions={
          <div className="grid gap-2">
            <Button variant="destructive" onClick={eliminar}>
              {tr("Eliminar")}
            </Button>
            <Button variant="plain" onClick={() => setAEliminar(null)}>
              {tr("Cancelar")}
            </Button>
          </div>
        }
      />
    </div>
  );
}
