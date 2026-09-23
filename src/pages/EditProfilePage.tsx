import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import type { MetodoPago } from "@/lib/types";

const METODOS: MetodoPago[] = ["Efectivo", "SINPE", "Transferencia"];

export function EditProfilePage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: usuario.nombre,
    zona: usuario.zona,
    descripcion: usuario.descripcion,
    metodosPago: usuario.metodosPago,
  });

  const toggleMetodo = (m: MetodoPago) => {
    setForm((prev) => ({
      ...prev,
      metodosPago: prev.metodosPago.includes(m)
        ? prev.metodosPago.filter((x) => x !== m)
        : [...prev.metodosPago, m],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/perfil");
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

        <Button type="submit" fullWidth disabled={form.metodosPago.length === 0} className="mt-2">
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}
