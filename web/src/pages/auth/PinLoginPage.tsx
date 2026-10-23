import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, PinInput } from "@/components/aire";
import { AuthError, AuthHeading, AuthLayout, IdentifierChip } from "@/layouts/AuthLayout";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";

/** "Sesión expirada": la sesión se perdió pero la cuenta sigue recordada, solo pide el PIN. */
export function PinLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, lastIdentifier, login, forgetIdentifier } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  if (isAuthenticated) return <Navigate to="/explorar" replace />;
  if (!lastIdentifier) return <Navigate to="/login" replace />;

  const ingresar = async () => {
    setCargando(true);
    try {
      await login(lastIdentifier, pin);
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
      <div className="grid gap-3">
        <AuthHeading title={tr("Sesión expirada")} subtitle={tr("Confirma tu PIN para volver a entrar.")} />
        <IdentifierChip>{lastIdentifier}</IdentifierChip>
      </div>

      <PinInput value={pin} onChange={setPin} autoFocus error={!!error} />

      <AuthError message={error} />

      <Button disabled={pin.length < 4} loading={cargando} onClick={ingresar}>
        {tr("Ingresar")}
      </Button>

      <Button
        variant="plain"
        onClick={() => {
          forgetIdentifier();
          navigate("/login", { replace: true });
        }}
      >
        {tr("Cambiar de cuenta")}
      </Button>
    </AuthLayout>
  );
}
