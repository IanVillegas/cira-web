import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { PinInput } from "@/components/ui/PinInput";
import { DistrictPickerSheet } from "@/components/DistrictPickerSheet";
import { LocationPreview } from "@/components/LocationPreview";
import { AuthError, AuthHeading, AuthLayout, IdentifierChip } from "@/layouts/AuthLayout";
import { useAuth } from "@/lib/auth";
import type { Distrito } from "@/lib/districts";

type Step = "phone" | "details" | "district" | "token" | "pin";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [telefono, setTelefono] = useState("");
  const [nombres, setNombres] = useState({ nombre: "", nombre2: "", apellido: "", apellido2: "" });
  const [distrito, setDistrito] = useState<Distrito | null>(null);
  const [token, setToken] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const ir = (next: Step) => {
    setError(null);
    setStep(next);
  };

  const validarTelefono = () => {
    if (!/^\d{8}$/.test(telefono)) return setError("Ingresa un número de 8 dígitos.");
    ir("details");
  };

  const validarNombres = () => {
    if (!nombres.nombre.trim() || !nombres.apellido.trim())
      return setError("El primer nombre y el primer apellido son obligatorios.");
    if (!/^[\p{L}\s]+$/u.test(`${nombres.nombre}${nombres.nombre2}${nombres.apellido}${nombres.apellido2}`.replace(/\s/g, "")))
      return setError("Los nombres solo pueden tener letras.");
    ir("district");
  };

  const enviarSms = () => {
    if (!distrito) return setError("Selecciona un distrito.");
    ir("token");
  };

  const crearCuenta = () => {
    if (pin !== confirmPin) return setError("Los PIN no coinciden.");
    login(telefono);
    navigate("/explorar", { replace: true });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-5">
        {step === "phone" && (
          <div className="flex flex-col gap-[18px]">
            <AuthHeading title="Crea tu cuenta" subtitle="Primero ingresa tu número de teléfono." />
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={8}
              placeholder="Número de teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
            />
            <AuthError message={error} />
            <Button onClick={validarTelefono}>Continuar</Button>
          </div>
        )}

        {step === "details" && (
          <div className="flex flex-col gap-4">
            <AuthHeading title="Tus nombres" subtitle="Agrega tus nombres y apellidos." />
            <Input placeholder="Primer nombre" value={nombres.nombre} onChange={(e) => setNombres({ ...nombres, nombre: e.target.value })} />
            <Input placeholder="Segundo nombre (opcional)" value={nombres.nombre2} onChange={(e) => setNombres({ ...nombres, nombre2: e.target.value })} />
            <Input placeholder="Primer apellido" value={nombres.apellido} onChange={(e) => setNombres({ ...nombres, apellido: e.target.value })} />
            <Input placeholder="Segundo apellido (opcional)" value={nombres.apellido2} onChange={(e) => setNombres({ ...nombres, apellido2: e.target.value })} />
            <AuthError message={error} />
            <Button onClick={validarNombres}>Continuar</Button>
            <Button variant="outlined" onClick={() => ir("phone")}>
              Cambiar teléfono
            </Button>
          </div>
        )}

        {step === "district" && (
          <div className="flex flex-col gap-4">
            <AuthHeading
              title="Tu ubicación"
              subtitle="Elige tu distrito y ajusta tu ubicación dentro de esa zona."
            />
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex min-h-14 items-center justify-between rounded-cira-input bg-cira-input-bg px-3.5 text-left text-cira-control"
            >
              <span className={distrito ? "text-cira-text-primary" : "text-cira-text-helper"}>
                {distrito ? `${distrito.nombre}, ${distrito.canton}` : "Selecciona un distrito"}
              </span>
              <Icon name="keyboard_arrow_down" size={24} className="text-cira-text-secondary" />
            </button>
            <LocationPreview
              center={distrito ? [distrito.lat, distrito.lng] : null}
              text={
                distrito
                  ? `${distrito.nombre}, ${distrito.canton}, ${distrito.provincia}`
                  : "Selecciona un distrito para centrar el mapa"
              }
            />
            <AuthError message={error} />
            <Button onClick={enviarSms}>Enviar SMS</Button>
            <Button variant="outlined" onClick={() => ir("details")}>
              Editar nombres
            </Button>
          </div>
        )}

        {step === "token" && (
          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-2">
              <AuthHeading title="Verifica tu teléfono" />
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
            <AuthHeading title="Crea tu PIN" subtitle="Usarás estos 4 dígitos para iniciar sesión." />
            <div className="flex flex-col gap-2">
              <p className="text-center text-cira-body font-bold text-cira-text-primary">PIN</p>
              <PinInput value={pin} onChange={setPin} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-center text-cira-body font-bold text-cira-text-primary">Confirmar PIN</p>
              <PinInput value={confirmPin} onChange={setConfirmPin} />
            </div>
            <AuthError message={error} />
            <Button disabled={pin.length < 4 || confirmPin.length < 4} onClick={crearCuenta}>
              Crear cuenta
            </Button>
          </div>
        )}

        <p className="flex items-center justify-center gap-1 text-[13px]">
          <span className="text-cira-text-secondary">Ya tienes cuenta?</span>
          <Link to="/login" className="font-bold text-cira-accent underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>

      <DistrictPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(d) => {
          setDistrito(d);
          setPickerOpen(false);
          setError(null);
        }}
      />
    </AuthLayout>
  );
}
