import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PinInput } from "@/components/ui/PinInput";
import { AuthHeading, AuthLayout, IdentifierChip } from "@/layouts/AuthLayout";
import { useAuth } from "@/lib/auth";

/** "Sesión expirada": la sesión se perdió pero la cuenta sigue recordada, solo pide el PIN. */
export function PinLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, lastIdentifier, login, forgetIdentifier } = useAuth();
  const [pin, setPin] = useState("");

  if (isAuthenticated) return <Navigate to="/explorar" replace />;
  if (!lastIdentifier) return <Navigate to="/login" replace />;

  return (
    <AuthLayout>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <AuthHeading title="Sesión expirada" subtitle="Confirma tu PIN para volver a entrar." />
          <IdentifierChip>{lastIdentifier}</IdentifierChip>
        </div>

        <PinInput value={pin} onChange={setPin} autoFocus />

        <Button
          disabled={pin.length < 4}
          onClick={() => {
            login(lastIdentifier);
            navigate("/explorar", { replace: true });
          }}
        >
          Ingresar
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            forgetIdentifier();
            navigate("/login", { replace: true });
          }}
        >
          Cambiar de cuenta
        </Button>
      </div>
    </AuthLayout>
  );
}
