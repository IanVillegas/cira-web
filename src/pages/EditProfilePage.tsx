import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { MetodoPago } from "@/lib/types";

const METODOS: MetodoPago[] = ["Efectivo", "SINPE", "Transferencia"];

export function EditProfilePage() {
  const { usuario, refrescarUsuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", zona: "", descripcion: "", metodosPago: [] as MetodoPago[] });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre,
        zona: usuario.zona,
        descripcion: usuario.descripcion,
        metodosPago: usuario.metodosPago,
      });
    }
  }, [usuario]);

  if (!usuario) return <Loader label="Cargando perfil..." />;

  const toggleMetodo = (m: MetodoPago) => {
    setForm((prev) => ({
      ...prev,
      metodosPago: prev.metodosPago.includes(m)
        ? prev.metodosPago.filter((x) => x !== m)
        : [...prev.metodosPago, m],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.usuario.actualizar(form);
      await refrescarUsuario();
      navigate("/perfil");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pb-8">
      <PageHeader title="Editar perfil" showBack />

      <form className="flex flex-col gap-4 px-5" onSubmit={handleSubmit}>
        <Input
          label="Nombre completo"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <Input
          label="Zona o ubicación"
          icon="location_on"
          value={form.zona}
          onChange={(e) => setForm({ ...form, zona: e.target.value })}
          required
        />
        <TextArea
          label="Descripción personal"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-cira-body font-semibold text-cira-text-primary">Métodos de pago</span>
          <div className="flex flex-wrap gap-2">
            {METODOS.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => toggleMetodo(m)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  form.metodosPago.includes(m)
                    ? "border-cira-accent bg-cira-secondary text-cira-accent"
                    : "border-cira-input-border text-cira-text-secondary"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </label>

        <Button type="submit" fullWidth disabled={form.metodosPago.length === 0 || guardando} className="mt-2">
          {guardando ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
