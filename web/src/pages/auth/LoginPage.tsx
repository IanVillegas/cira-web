import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PinInput } from "@/components/ui/PinInput";
import { AuthError, AuthHeading, AuthLayout, IdentifierChip } from "@/layouts/AuthLayout";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [step, setStep] = useState<"identifier" | "pin">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/explorar" replace />;

  const continuar = () => {
    if (!identifier.trim()) {
      setError("Ingresa tu teléfono o correo.");
      return;
    }
    setError(null);
    setStep("pin");
  };

  const ingresar = () => {
    // Mockup: cualquier PIN de 4 dígitos se acepta (sin validación real).
    login(identifier.trim());
    navigate("/explorar", { replace: true });
  };

  return (
    <AuthLayout>
      {step === "identifier" ? (
        <div className="flex flex-col gap-[18px]">
          <AuthHeading title="Inicia sesión" subtitle="Ingresa tu teléfono o correo para continuar." />

          <Input
            type="text"
            inputMode="email"
            placeholder="Teléfono o correo"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && continuar()}
          />

          <AuthError message={error} />

          <Button onClick={continuar}>Continuar</Button>

          <p className="flex items-center justify-center gap-1 text-[13px]">
            <span className="text-cira-text-secondary">¿No tienes una cuenta?</span>
            <Link to="/registro" className="font-bold text-cira-accent underline">
              Regístrate.
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <AuthHeading title="Ingresa tu PIN" />
            <IdentifierChip>{identifier}</IdentifierChip>
          </div>

          <PinInput value={pin} onChange={setPin} autoFocus />

          <AuthError message={error} />

          <Link to="/recuperar" className="text-center text-[13px] font-bold text-cira-accent underline">
            ¿Olvidaste tu PIN?
          </Link>

          <Button disabled={pin.length < 4} onClick={ingresar}>
            Ingresar
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setPin("");
              setStep("identifier");
            }}
          >
            Cambiar teléfono o correo
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
