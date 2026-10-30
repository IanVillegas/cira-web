import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Icon, Input, PinInput } from "@/components/aire";
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
      {step === "phone" && (
        <>
          <AuthHeading title={tr("Crea tu cuenta")} subtitle={tr("Primero ingresa tu número de teléfono.")} />
          <Input
            type="tel"
            inputMode="numeric"
            icon="call"
            maxLength={8}
            placeholder={tr("Número de teléfono")}
            value={telefono}
            error={error ?? undefined}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
          />
          <Button onClick={validarTelefono}>{tr("Continuar")}</Button>
        </>
      )}

      {step === "details" && (
        <>
          <AuthHeading title={tr("Tus nombres")} subtitle={tr("Agrega tus nombres y apellidos.")} />
          <div className="grid gap-3">
            <Input placeholder={tr("Primer nombre")} value={nombres.nombre} onChange={(e) => setNombres({ ...nombres, nombre: e.target.value })} />
            <Input placeholder={tr("Segundo nombre (opcional)")} value={nombres.nombre2} onChange={(e) => setNombres({ ...nombres, nombre2: e.target.value })} />
            <Input placeholder={tr("Primer apellido")} value={nombres.apellido} onChange={(e) => setNombres({ ...nombres, apellido: e.target.value })} />
            <Input placeholder={tr("Segundo apellido (opcional)")} value={nombres.apellido2} onChange={(e) => setNombres({ ...nombres, apellido2: e.target.value })} />
          </div>
          <AuthError message={error} />
          <Button onClick={validarNombres}>{tr("Continuar")}</Button>
          <Button variant="plain" onClick={() => ir("phone")}>
            {tr("Cambiar teléfono")}
          </Button>
        </>
      )}

      {step === "district" && (
        <>
          <AuthHeading title={tr("Tu ubicación")} subtitle={tr("Elige tu distrito y ajusta tu ubicación dentro de esa zona.")} />
          <Input
            readOnly
            icon="location_on"
            placeholder={tr("Selecciona un distrito")}
            value={distrito ? `${distrito.nombre}, ${distrito.canton}` : ""}
            onClick={() => setPickerOpen(true)}
            trailing={<Icon name="expand_more" size={22} />}
            style={{ cursor: "pointer" }}
          />
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
          <Button variant="plain" onClick={() => ir("details")}>
            {tr("Editar nombres")}
          </Button>
        </>
      )}

      {step === "token" && (
        <>
          <div className="grid gap-3">
            <AuthHeading title={tr("Verifica tu teléfono")} />
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
          <AuthHeading title={tr("Crea tu PIN")} subtitle={tr("Usarás estos 4 dígitos para iniciar sesión.")} />
          <PinInput label={tr("PIN")} value={pin} onChange={setPin} />
          <PinInput label={tr("Confirmar PIN")} value={confirmPin} onChange={setConfirmPin} error={!!error} />
          <AuthError message={error} />
          <Button disabled={pin.length < 4 || confirmPin.length < 4} onClick={crearCuenta}>
            {tr("Crear cuenta")}
          </Button>
        </>
      )}

      <p className="aire-text-subhead flex items-center justify-center gap-1">
        <span className="text-aire-ink-2">{tr("¿Ya tienes cuenta?")}</span>
        <Link to="/login" className="font-semibold text-aire-accent-text">
          {tr("Inicia sesión")}
        </Link>
      </p>

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
