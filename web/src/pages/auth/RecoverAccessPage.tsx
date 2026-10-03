import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PinInput } from "@/components/ui/PinInput";
import { AuthError, AuthHeading, AuthLayout, IdentifierChip } from "@/layouts/AuthLayout";

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
        <div className="flex flex-col gap-[18px]">
          <AuthHeading title="Recupera tu acceso" subtitle="Ingresa tu teléfono para enviarte un código." />
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="Telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
          />
          <AuthError message={error} />
          <Button
            onClick={() =>
              /^\d{8}$/.test(telefono) ? ir("token") : setError("Ingresa un número de 8 dígitos.")
            }
          >
            Continuar
          </Button>
          <Button variant="outlined" onClick={() => navigate("/login")}>
            Volver al inicio de sesión
          </Button>
        </div>
      )}

      {step === "token" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <AuthHeading title="Verifica el codigo" />
            <IdentifierChip>{telefono}</IdentifierChip>
          </div>
          <PinInput value={token} onChange={setToken} length={6} isPassword={false} allowLetters autoUppercase autoFocus />
          <AuthError message={error} />
          <Button disabled={token.length < 6} onClick={() => ir("pin")}>
            Verificar
          </Button>
          <Button variant="outlined" onClick={() => setToken("")}>
            Reenviar SMS
          </Button>
        </div>
      )}

      {step === "pin" && (
        <div className="flex flex-col gap-5">
          <AuthHeading title="Crea tu nuevo PIN" subtitle="Usalo para entrar de nuevo a CIRA." />
          <PinInput label="PIN nuevo" value={pin} onChange={setPin} />
          <PinInput label="Confirmar PIN" value={confirmPin} onChange={setConfirmPin} />
          <AuthError message={error} />
          <Button
            disabled={pin.length < 4 || confirmPin.length < 4}
            onClick={() =>
              pin === confirmPin ? navigate("/login", { replace: true }) : setError("Los PIN no coinciden.")
            }
          >
            Guardar PIN
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
