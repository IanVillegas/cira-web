import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PhoneFrame } from "@/layouts/PhoneFrame";

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", telefono: "", cedula: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/pin", { state: { telefono: form.telefono } });
  };

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col overflow-y-auto bg-cira-base px-6 pt-10 pb-6">
        <button onClick={() => navigate(-1)} className="text-cira-header-text">
          <Icon name="arrow_back" size={26} />
        </button>

        <h1 className="mt-4 text-cira-title font-semibold text-cira-text-primary">
          Crear cuenta
        </h1>
        <p className="mt-1 text-sm text-cira-text-secondary">
          Con una sola cuenta podrás ofrecer y contratar servicios.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Nombre completo"
            icon="person"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <Input
            label="Cédula"
            icon="badge"
            placeholder="1-2345-6789"
            value={form.cedula}
            onChange={(e) => setForm({ ...form, cedula: e.target.value })}
            required
          />
          <Input
            label="Número de teléfono"
            icon="call"
            type="tel"
            placeholder="8888-1234"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            required
          />

          <Button type="submit" fullWidth className="mt-2">
            Continuar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-cira-text-secondary">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-semibold text-cira-accent">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
}
