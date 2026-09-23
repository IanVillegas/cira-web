import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PhoneFrame } from "@/layouts/PhoneFrame";

export function RecoverAccessPage() {
  const navigate = useNavigate();
  const [cedula, setCedula] = useState("");
  const [pin, setPin] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col overflow-y-auto bg-cira-base px-6 pt-10 pb-6">
        <button onClick={() => navigate(-1)} className="text-cira-header-text">
          <Icon name="arrow_back" size={26} />
        </button>

        <h1 className="mt-4 text-cira-title font-semibold text-cira-text-primary">
          Recuperar acceso
        </h1>
        <p className="mt-1 text-sm text-cira-text-secondary">
          Ingresá tu cédula y definí un nuevo PIN. Cerraremos todas tus sesiones activas por seguridad.
        </p>

        {enviado ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-cira-card bg-cira-surface-muted p-6 text-center">
            <Icon name="check_circle" size={40} className="text-emerald-600" filled />
            <p className="font-semibold text-cira-text-primary">Acceso recuperado</p>
            <p className="text-sm text-cira-text-secondary">
              Ya podés iniciar sesión con tu nuevo PIN.
            </p>
            <Button fullWidth onClick={() => navigate("/login")}>
              Ir a iniciar sesión
            </Button>
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Cédula"
              icon="badge"
              placeholder="1-2345-6789"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
            />
            <Input
              label="Nuevo PIN"
              icon="lock"
              type="password"
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
            <Button type="submit" fullWidth className="mt-2">
              Recuperar acceso
            </Button>
          </form>
        )}
      </div>
    </PhoneFrame>
  );
}
