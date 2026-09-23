import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { CATEGORIAS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function ConfigurarServiciosPage() {
  const { usuario, refrescarUsuario } = useAuth();
  const [nuevo, setNuevo] = useState({ categoria: CATEGORIAS[0], descripcion: "", precio: "" });
  const [guardando, setGuardando] = useState(false);

  if (!usuario) return <Loader label="Cargando servicios..." />;

  const agregar = async () => {
    if (!nuevo.descripcion.trim()) return;
    setGuardando(true);
    try {
      await api.usuario.agregarServicio({
        categoria: nuevo.categoria,
        descripcion: nuevo.descripcion,
        precioAproximado: Number(nuevo.precio) || undefined,
      });
      await refrescarUsuario();
      setNuevo({ categoria: CATEGORIAS[0], descripcion: "", precio: "" });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: string) => {
    await api.usuario.eliminarServicio(id);
    await refrescarUsuario();
  };

  return (
    <div className="pb-8">
      <PageHeader title="Configurar servicios" subtitle="Definí qué ofrecés y a qué precio." showBack />

      <div className="px-5">
        <div className="space-y-3">
          {usuario.servicios.map((s) => (
            <Card key={s.id} className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-cira-accent uppercase">
                  {s.categoria}
                </p>
                <p className="text-sm text-cira-text-primary">{s.descripcion}</p>
                {s.precioAproximado && (
                  <p className="mt-1 text-sm font-semibold text-cira-accent">
                    ₡{s.precioAproximado.toLocaleString("es-CR")}
                  </p>
                )}
              </div>
              <button onClick={() => eliminar(s.id)} className="text-cira-text-helper">
                <Icon name="close" size={20} />
              </button>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <p className="mb-3 font-semibold text-cira-text-primary">Agregar servicio</p>
          <div className="flex flex-col gap-3">
            <select
              className="rounded-cira-input border border-cira-input-border bg-cira-input-bg px-4 py-3 text-cira-control text-cira-text-primary focus:border-cira-accent focus:outline-none"
              value={nuevo.categoria}
              onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Input
              placeholder="Descripción del servicio"
              value={nuevo.descripcion}
              onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
            />
            <Input
              placeholder="Precio aproximado (opcional)"
              type="number"
              value={nuevo.precio}
              onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
            />
            <Button variant="secondary" onClick={agregar} disabled={guardando}>
              {guardando ? "Agregando..." : "Agregar"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
