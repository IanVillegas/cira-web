import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/FieldCaption";
import { SelectField } from "@/components/ui/SelectField";
import { BudgetField } from "@/components/ui/BudgetField";
import { CATEGORIAS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/** Réplica de ConfigurarServiciosPage.xaml: formulario "Nuevo servicio" + lista "Mis servicios". */
export function ConfigurarServiciosPage() {
  const { usuario, refrescarUsuario } = useAuth();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ categoria: "", descripcion: "", precio: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!usuario) return <Loader label="Cargando servicios..." />;

  const limpiar = () => {
    setEditandoId(null);
    setForm({ categoria: "", descripcion: "", precio: "" });
    setError(null);
  };

  const guardar = async () => {
    if (!form.categoria) return setError("Selecciona una categoría.");
    if (!form.descripcion.trim()) return setError("Agrega una descripción del servicio.");
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
      await refrescarUsuario();
      limpiar();
    } catch {
      setError("No se pudo guardar el servicio.");
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
    if (editandoId === id) limpiar();
    await refrescarUsuario();
  };

  return (
    <div>
      <PageHeader
        title="Servicios"
        subtitle="Define qué ofreces y tu precio aproximado."
        icon="design_services"
        showBack
      />

      <div className="flex flex-col gap-[18px] px-5 pt-2 pb-7">
        <div className="flex flex-col gap-3.5 rounded-[14px] bg-cira-card p-4">
          <h2 className="text-base font-semibold text-cira-text-primary">
            {editandoId ? "Editar servicio" : "Nuevo servicio"}
          </h2>

          <Field label="Categoría">
            <SelectField
              value={form.categoria}
              onChange={(categoria) => setForm({ ...form, categoria })}
              placeholder="Selecciona una categoría"
              options={CATEGORIAS}
            />
          </Field>

          <Field label="Descripción">
            <textarea
              rows={4}
              maxLength={300}
              placeholder="Ej: Instalación y reparación básica de tuberías"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="min-h-[104px] w-full resize-y rounded-cira-input bg-cira-input-bg px-3.5 py-2.5 text-cira-body text-cira-text-primary ring-1 ring-cira-border placeholder:text-cira-text-helper focus:outline-none focus:ring-cira-accent"
            />
          </Field>

          <Field label="Precio aproximado">
            <BudgetField
              bordered={false}
              value={form.precio}
              onChange={(precio) => setForm({ ...form, precio })}
            />
          </Field>

          {error && <p className="text-[13px] text-cira-accent">{error}</p>}

          <Button onClick={guardar} disabled={guardando}>
            {editandoId ? "GUARDAR CAMBIOS" : "AGREGAR SERVICIO"}
          </Button>
          {editandoId && (
            <Button variant="secondary" onClick={limpiar}>
              CANCELAR EDICIÓN
            </Button>
          )}
        </div>

        <h2 className="text-lg font-semibold text-cira-text-primary">Mis servicios</h2>

        {usuario.servicios.length === 0 ? (
          <EmptyState
            title="Sin servicios activos"
            message="Agrega el primer servicio para mostrarlo en tu perfil."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {usuario.servicios.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 rounded-[14px] bg-cira-card p-4">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-cira-text-primary">{s.categoria}</p>
                    <p className="text-[13px] text-cira-accent">
                      {s.precioAproximado ? `₡${s.precioAproximado.toLocaleString("es-CR")}` : "Precio a convenir"}
                    </p>
                  </div>
                  <IconButton icon="edit" label="Editar servicio" onClick={() => editar(s.id)} />
                  <IconButton icon="delete" label="Eliminar servicio" onClick={() => eliminar(s.id)} />
                </div>
                <p className="text-[13px] text-cira-text-secondary">{s.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IconButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-cira-nav-selected-bg text-cira-accent"
    >
      <Icon name={icon} size={22} />
    </button>
  );
}
