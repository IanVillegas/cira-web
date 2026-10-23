import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PinInput } from "@/components/ui/PinInput";
import { AuthError, AuthHeading, AuthLayout, IdentifierChip } from "@/layouts/AuthLayout";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";

/** "Sesión expirada": la sesión se perdió pero la cuenta sigue recordada, solo pide el PIN. */
export function PinLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, lastIdentifier, login, forgetIdentifier } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/explorar" replace />;
  if (!lastIdentifier) return <Navigate to="/login" replace />;

  return (
    <AuthLayout>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <AuthHeading title={tr("Sesión expirada")} subtitle={tr("Confirma tu PIN para volver a entrar.")} />
          <IdentifierChip>{lastIdentifier}</IdentifierChip>
        </div>

        <PinInput value={pin} onChange={setPin} autoFocus />

        <AuthError message={error} />

        <Button
          disabled={pin.length < 4}
          onClick={async () => {
            try {
              await login(lastIdentifier, pin);
              navigate("/explorar", { replace: true });
            } catch (e) {
              setPin("");
              setError(e instanceof Error ? e.message : tr("No se pudo iniciar sesión."));
            }
          }}
        >
          {tr("Ingresar")}
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            forgetIdentifier();
            navigate("/login", { replace: true });
          }}
        >
          {tr("Cambiar de cuenta")}
        </Button>
      </div>
    </AuthLayout>
  );
}
