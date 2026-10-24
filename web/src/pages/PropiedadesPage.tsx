import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Dialog, Icon, Input, Loader, PageHeader, Reveal, Stagger, TextArea } from "@/components/aire";
import { LocationPicker } from "@/components/LocationPicker";
import { Vacio } from "@/components/Vacio";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import type { Propiedad } from "@/lib/types";

const VACIA = { nombre: "", ubicacion: "", coords: null as { lat: number; lng: number } | null, instrucciones: "" };

/**
 * Mis propiedades: direcciones con nombre e instrucciones fijas (dónde está la llave, qué revisar).
 * Al publicar o recontratar se eligen en un toque; las instrucciones solo las ve quien hace el trabajo.
 */
export function PropiedadesPage() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Propiedad[] | null>(null);
  const [editando, setEditando] = useState<Propiedad | "nueva" | null>(null);
  const [form, setForm] = useState(VACIA);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Propiedad | null>(null);

  useEffect(() => {
    api.propiedades
      .listar()
      .then(setLista)
      .catch(() => setLista([]));
  }, []);

  const abrir = (p: Propiedad | "nueva") => {
    setError(null);
    setEditando(p);
    setForm(
      p === "nueva"
        ? VACIA
        : { nombre: p.nombre, ubicacion: p.ubicacion, coords: p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null, instrucciones: p.instrucciones },
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
