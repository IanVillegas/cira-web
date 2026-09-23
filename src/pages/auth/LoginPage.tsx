import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PhoneFrame } from "@/layouts/PhoneFrame";

export function LoginPage() {
  const navigate = useNavigate();
  const [telefono, setTelefono] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/pin", { state: { telefono } });
  };

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col overflow-y-auto bg-gradient-to-b from-cira-accent to-cira-primary-dark px-6 pt-14 pb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Icon name="handshake" size={30} />
          </div>
          <div>
            <p className="text-2xl font-semibold">CIRA</p>
            <p className="text-sm text-white/80">Trabajos cerca de ti</p>
          </div>
        </div>

        <div className="mt-10 flex-1 rounded-[28px] bg-cira-base p-6 text-cira-text-primary">
          <h1 className="text-cira-title font-semibold text-cira-text-primary">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-cira-text-secondary">
            Ingresá con tu número de teléfono. Te enviaremos un código de verificación.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Número de teléfono"
              icon="call"
              type="tel"
              inputMode="numeric"
              placeholder="8888-1234"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
            <Button type="submit" fullWidth>
              Enviar código
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm">
            <Link to="/registro" className="font-semibold text-cira-accent">
              Crear una cuenta nueva
            </Link>
            <Link to="/recuperar" className="text-cira-text-helper">
              ¿Olvidaste el acceso a tu cuenta?
            </Link>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
