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
import { tr } from "@/lib/i18n";

type Step = "phone" | "details" | "district" | "token" | "pin";

export function RegisterPage() {
  const navigate = useNavigate();
  const { registrar } = useAuth();
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
    if (!/^\d{8}$/.test(telefono)) return setError(tr("Ingresa un número de 8 dígitos."));
    ir("details");
  };

  const validarNombres = () => {
    if (!nombres.nombre.trim() || !nombres.apellido.trim())
      return setError(tr("El primer nombre y el primer apellido son obligatorios."));
    if (!/^[\p{L}\s]+$/u.test(`${nombres.nombre}${nombres.nombre2}${nombres.apellido}${nombres.apellido2}`.replace(/\s/g, "")))
      return setError(tr("Los nombres solo pueden tener letras."));
    ir("district");
  };

  const enviarSms = () => {
    if (!distrito) return setError(tr("Selecciona un distrito."));
    ir("token");
  };

  const crearCuenta = async () => {
    if (pin !== confirmPin) return setError(tr("Los PIN no coinciden."));
    const nombre = [nombres.nombre, nombres.nombre2, nombres.apellido, nombres.apellido2]
      .map((n) => n.trim())
      .filter(Boolean)
      .join(" ");
    setError(null);
    try {
      await registrar({
        telefono,
        nombre,
        zona: distrito ? `${distrito.nombre}, ${distrito.canton}` : "",
        lat: distrito?.lat,
        lng: distrito?.lng,
        pin,
      });
      navigate("/explorar", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo crear la cuenta."));
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-5">
        {step === "phone" && (
          <div className="flex flex-col gap-[18px]">
            <AuthHeading title={tr("Crea tu cuenta")} subtitle={tr("Primero ingresa tu número de teléfono.")} />
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={8}
              placeholder={tr("Número de teléfono")}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
            />
            <AuthError message={error} />
            <Button onClick={validarTelefono}>{tr("Continuar")}</Button>
          </div>
        )}

        {step === "details" && (
          <div className="flex flex-col gap-4">
            <AuthHeading title={tr("Tus nombres")} subtitle={tr("Agrega tus nombres y apellidos.")} />
            <Input placeholder={tr("Primer nombre")} value={nombres.nombre} onChange={(e) => setNombres({ ...nombres, nombre: e.target.value })} />
            <Input placeholder={tr("Segundo nombre (opcional)")} value={nombres.nombre2} onChange={(e) => setNombres({ ...nombres, nombre2: e.target.value })} />
            <Input placeholder={tr("Primer apellido")} value={nombres.apellido} onChange={(e) => setNombres({ ...nombres, apellido: e.target.value })} />
            <Input placeholder={tr("Segundo apellido (opcional)")} value={nombres.apellido2} onChange={(e) => setNombres({ ...nombres, apellido2: e.target.value })} />
            <AuthError message={error} />
            <Button onClick={validarNombres}>{tr("Continuar")}</Button>
            <Button variant="outlined" onClick={() => ir("phone")}>
              {tr("Cambiar teléfono")}
            </Button>
          </div>
        )}

        {step === "district" && (
          <div className="flex flex-col gap-4">
            <AuthHeading
              title={tr("Tu ubicación")}
              subtitle={tr("Elige tu distrito y ajusta tu ubicación dentro de esa zona.")}
            />
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex min-h-14 items-center justify-between rounded-cira-input bg-cira-input-bg px-3.5 text-left text-cira-control"
            >
              <span className={distrito ? "text-cira-text-primary" : "text-cira-text-helper"}>
                {distrito ? `${distrito.nombre}, ${distrito.canton}` : tr("Selecciona un distrito")}
              </span>
              <Icon name="keyboard_arrow_down" size={24} className="text-cira-text-secondary" />
            </button>
            <LocationPreview
              center={distrito ? [distrito.lat, distrito.lng] : null}
              text={
                distrito
                  ? `${distrito.nombre}, ${distrito.canton}, ${distrito.provincia}`
                  : tr("Selecciona un distrito para centrar el mapa")
              }
            />
            <AuthError message={error} />
            <Button onClick={enviarSms}>{tr("Enviar SMS")}</Button>
            <Button variant="outlined" onClick={() => ir("details")}>
              {tr("Editar nombres")}
            </Button>
          </div>
        )}

        {step === "token" && (
          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-2">
              <AuthHeading title={tr("Verifica tu teléfono")} />
              <IdentifierChip>{telefono}</IdentifierChip>
            </div>
            <PinInput value={token} onChange={setToken} length={6} isPassword={false} allowLetters autoUppercase autoFocus />
            <AuthError message={error} />
            <Button disabled={token.length < 6} onClick={() => ir("pin")}>
              {tr("Verificar")}
            </Button>
            <Button variant="outlined" onClick={() => setToken("")}>
              {tr("Reenviar SMS")}
            </Button>
          </div>
        )}

        {step === "pin" && (
          <div className="flex flex-col gap-5">
            <AuthHeading title={tr("Crea tu PIN")} subtitle={tr("Usarás estos 4 dígitos para iniciar sesión.")} />
            <div className="flex flex-col gap-2">
              <p className="text-center text-cira-body font-bold text-cira-text-primary">{tr("PIN")}</p>
              <PinInput value={pin} onChange={setPin} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-center text-cira-body font-bold text-cira-text-primary">{tr("Confirmar PIN")}</p>
              <PinInput value={confirmPin} onChange={setConfirmPin} />
            </div>
            <AuthError message={error} />
            <Button disabled={pin.length < 4 || confirmPin.length < 4} onClick={crearCuenta}>
              {tr("Crear cuenta")}
            </Button>
          </div>
        )}

        <p className="flex items-center justify-center gap-1 text-[13px]">
          <span className="text-cira-text-secondary">{tr("Ya tienes cuenta?")}</span>
          <Link to="/login" className="font-bold text-cira-accent underline">
            {tr("Iniciar Sesión")}
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
