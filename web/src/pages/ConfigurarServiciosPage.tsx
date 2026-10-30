import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Icon, Input, Loader, PageHeader, Stagger, TextArea } from "@/components/aire";
import { SelectSheet } from "@/components/SelectSheet";
import { Vacio } from "@/components/Vacio";
import { CATEGORIAS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { mostrarToast } from "@/lib/toast";
import { useAuth } from "@/lib/auth";
import { localeActual, tr } from "@/lib/i18n";

/** Réplica de ConfigurarServiciosPage.xaml: formulario "Nuevo servicio" + lista "Mis servicios". */
export function ConfigurarServiciosPage() {
  const navigate = useNavigate();
  const { usuario, refrescarUsuario } = useAuth();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ categoria: "", descripcion: "", precio: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!usuario) return <Loader label={tr("Cargando servicios...")} />;

  const limpiar = () => {
    setEditandoId(null);
    setForm({ categoria: "", descripcion: "", precio: "" });
    setError(null);
  };

  const guardar = async () => {
    if (!form.categoria) return setError(tr("Selecciona una categoría."));
    if (!form.descripcion.trim()) return setError(tr("Agrega una descripción del servicio."));
    setGuardando(true);
    setError(null);
    try {
      const datos = {
        categoria: form.categoria,
        descripcion: form.descripcion.trim(),
        precioAproximado: Number(form.precio) || undefined,
      };
      if (editandoId) await api.usuario.actualizarServicio(editandoId, datos);
      else await api.usuario.agregarServicio(datos);
      mostrarToast(editandoId ? tr("Servicio actualizado") : tr("Servicio agregado"));
      await refrescarUsuario();
      limpiar();
    } catch {
      setError(tr("No se pudo guardar el servicio."));
    } finally {
      setGuardando(false);
    }
  };

  const editar = (id: string) => {
    const s = usuario.servicios.find((x) => x.id === id);
    if (!s) return;
    setEditandoId(id);
    setForm({ categoria: s.categoria, descripcion: s.descripcion, precio: s.precioAproximado?.toString() ?? "" });
    setError(null);
  };

  const eliminar = async (id: string) => {
    await api.usuario.eliminarServicio(id);
    mostrarToast(tr("Servicio eliminado"), "info");
    if (editandoId === id) limpiar();
    await refrescarUsuario();
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Servicios")}
        subtitle={tr("Define qué ofreces y tu precio aproximado.")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-4 px-5 pt-2">
        <Card className="grid gap-3.5">
          <h2 className="aire-text-title-3 text-aire-ink">{editandoId ? tr("Editar servicio") : tr("Nuevo servicio")}</h2>

          <SelectSheet
            label={tr("Categoría")}
            placeholder={tr("Selecciona una categoría")}
            value={form.categoria}
            options={CATEGORIAS}
            onChange={(categoria) => setForm({ ...form, categoria })}
          />

          <TextArea
            label={tr("Descripción")}
            rows={4}
            maxLength={300}
            placeholder={tr("Ej: Instalación y reparación básica de tuberías")}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />

          <Input
            label={tr("Precio aproximado")}
            type="number"
            inputMode="numeric"
            min={1}
            prefix="₡"
            placeholder="20000"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />

          {error && <p className="aire-text-footnote font-semibold text-aire-danger-text">{error}</p>}

          <Button loading={guardando} onClick={guardar}>
            {editandoId ? tr("Guardar cambios") : tr("Agregar servicio")}
          </Button>
          {editandoId && (
            <Button variant="plain" onClick={limpiar}>
              {tr("Cancelar edición")}
            </Button>
          )}
        </Card>

        <h2 className="aire-text-title-3 text-aire-ink">{tr("Mis servicios")}</h2>

        {usuario.servicios.length === 0 ? (
          <Vacio title={tr("Sin servicios activos")} message={tr("Agrega el primer servicio para mostrarlo en tu perfil.")} />
        ) : (
          <Stagger className="grid gap-3">
            {usuario.servicios.map((s) => (
              <Card key={s.id} className="grid gap-2">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="aire-text-headline truncate text-aire-ink">{tr(s.categoria)}</p>
                    <p className="aire-text-subhead text-aire-accent-text">
                      {s.precioAproximado ? `₡${s.precioAproximado.toLocaleString(localeActual())}` : tr("Precio a convenir")}
                    </p>
                  </div>
                  <IconButton icon="edit" label={tr("Editar servicio")} onClick={() => editar(s.id)} />
                  <IconButton icon="delete" label={tr("Eliminar servicio")} onClick={() => eliminar(s.id)} />
                </div>
                <p className="aire-text-subhead text-aire-ink-2">{s.descripcion}</p>
              </Card>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}

function IconButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="ca-iconbtn">
      <Icon name={icon} size={22} />
    </button>
  );
}
