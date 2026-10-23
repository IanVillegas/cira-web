import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button, Input, PinInput } from "@/components/aire";
import { AuthError, AuthHeading, AuthLayout, IdentifierChip } from "@/layouts/AuthLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [step, setStep] = useState<"identifier" | "pin">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  if (isAuthenticated) return <Navigate to="/explorar" replace />;

  const continuar = async () => {
    if (!identifier.trim()) {
      setError(tr("Ingresa tu teléfono o correo."));
      return;
    }
    setError(null);
    setCargando(true);
    try {
      await api.auth.existe(identifier.trim());
      setStep("pin");
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo iniciar sesión."));
    } finally {
      setCargando(false);
    }
  };

  const ingresar = async () => {
    setError(null);
    setCargando(true);
    try {
      await login(identifier.trim(), pin);
      navigate("/explorar", { replace: true });
    } catch (e) {
      setPin("");
      setError(e instanceof Error ? e.message : tr("No se pudo iniciar sesión."));
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthLayout>
      {step === "identifier" ? (
        <>
          <AuthHeading title={tr("Inicia sesión")} subtitle={tr("Ingresa tu teléfono o correo para continuar.")} />

          <Input
            type="text"
            inputMode="email"
            icon="person"
            placeholder={tr("Teléfono o correo")}
            value={identifier}
            error={error ?? undefined}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && continuar()}
          />

          <Button loading={cargando} onClick={continuar}>
            {tr("Continuar")}
          </Button>

          <p className="aire-text-subhead flex items-center justify-center gap-1">
            <span className="text-aire-ink-2">{tr("¿No tienes una cuenta?")}</span>
            <Link to="/registro" className="font-semibold text-aire-accent-text">
              {tr("Regístrate.")}
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="grid gap-3">
            <AuthHeading title={tr("Ingresa tu PIN")} />
            <IdentifierChip>{identifier}</IdentifierChip>
          </div>

          <PinInput value={pin} onChange={setPin} autoFocus error={!!error} />

          <AuthError message={error} />

          <Link to="/recuperar" className="aire-text-subhead text-center font-semibold text-aire-accent-text">
            {tr("¿Olvidaste tu PIN?")}
          </Link>

          <Button disabled={pin.length < 4} loading={cargando} onClick={ingresar}>
            {tr("Ingresar")}
          </Button>

          <Button
            variant="plain"
            onClick={() => {
              setPin("");
              setError(null);
              setStep("identifier");
            }}
          >
            {tr("Cambiar teléfono o correo")}
          </Button>
        </>
      )}
    </AuthLayout>
  );
}
