import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, PinInput } from "@/components/aire";
import { AuthError, AuthHeading, AuthLayout, IdentifierChip } from "@/layouts/AuthLayout";
import { tr } from "@/lib/i18n";

type Step = "identifier" | "token" | "pin";

export function RecoverAccessPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("identifier");
  const [error, setError] = useState<string | null>(null);
  const [telefono, setTelefono] = useState("");
  const [token, setToken] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const ir = (next: Step) => {
    setError(null);
    setStep(next);
  };

  return (
    <AuthLayout>
      {step === "identifier" && (
        <>
          <AuthHeading title={tr("Recupera tu acceso")} subtitle={tr("Ingresa tu teléfono para enviarte un código.")} />
          <Input
            type="tel"
            inputMode="numeric"
            icon="call"
            placeholder={tr("Teléfono")}
            value={telefono}
            error={error ?? undefined}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
          />
          <Button onClick={() => (/^\d{8}$/.test(telefono) ? ir("token") : setError(tr("Ingresa un número de 8 dígitos.")))}>
            {tr("Continuar")}
          </Button>
          <Button variant="plain" onClick={() => navigate("/login")}>
            {tr("Volver al inicio de sesión")}
          </Button>
        </>
      )}

      {step === "token" && (
        <>
          <div className="grid gap-3">
            <AuthHeading title={tr("Verifica el código")} />
            <IdentifierChip>{telefono}</IdentifierChip>
          </div>
          <PinInput value={token} onChange={setToken} length={6} isPassword={false} allowLetters autoUppercase autoFocus />
          <AuthError message={error} />
          <Button disabled={token.length < 6} onClick={() => ir("pin")}>
            {tr("Verificar")}
          </Button>
          <Button variant="plain" onClick={() => setToken("")}>
            {tr("Reenviar SMS")}
          </Button>
        </>
      )}

      {step === "pin" && (
        <>
          <AuthHeading title={tr("Crea tu nuevo PIN")} subtitle={tr("Úsalo para entrar de nuevo a CIRA.")} />
          <PinInput label={tr("PIN nuevo")} value={pin} onChange={setPin} />
          <PinInput label={tr("Confirmar PIN")} value={confirmPin} onChange={setConfirmPin} error={!!error} />
          <AuthError message={error} />
          <Button
            disabled={pin.length < 4 || confirmPin.length < 4}
            onClick={() => (pin === confirmPin ? navigate("/login", { replace: true }) : setError(tr("Los PIN no coinciden.")))}
          >
            {tr("Guardar PIN")}
          </Button>
        </>
      )}
    </AuthLayout>
  );
}
