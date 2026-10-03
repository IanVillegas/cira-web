import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PinInput } from "@/components/ui/PinInput";
import { FieldCaption } from "@/components/ui/FieldCaption";
import { useAuth } from "@/lib/auth";

const RESUMEN = [
  { icon: "logout", text: "Se cerrarán todas tus sesiones activas." },
  { icon: "visibility_off", text: "Tu perfil no aparecera en busquedas." },
  { icon: "history", text: "Tus trabajos se conservan." },
];

/** Réplica de InhabilitarCuentaPage.xaml: resumen + confirmación con PIN. */
export function InhabilitarCuentaPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [estado, setEstado] = useState<string | null>(null);

  const inhabilitar = () => {
    if (pin.length < 4) return setEstado("Ingresa tu PIN de 4 dígitos.");
    if (!confirmar) return setEstado("Confirma que deseas inhabilitar tu cuenta.");
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <PageHeader
        title="Inhabilitar cuenta"
        subtitle="La cuenta quedará inactiva hasta que solicites recuperarla."
        icon="person_off"
        showBack
      />

      <div className="flex flex-col gap-[18px] px-5 pt-2 pb-7">
        <div className="flex flex-col gap-3 rounded-[14px] bg-cira-card p-4">
          <h2 className="text-base font-semibold text-cira-text-primary">Resumen</h2>
          <div className="flex flex-col gap-2.5">
            {RESUMEN.map((r) => (
              <div key={r.icon} className="flex items-center gap-2.5">
                <Icon name={r.icon} size={22} className="shrink-0 text-cira-accent" />
                <span className="text-[13px] text-cira-text-secondary">{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3.5 rounded-[14px] bg-cira-card p-4">
          <h2 className="text-base font-semibold text-cira-text-primary">Confirmacion</h2>

          <div className="flex flex-col items-center gap-2.5">
            <FieldCaption>PIN</FieldCaption>
            <PinInput value={pin} onChange={setPin} />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={confirmar}
              onChange={(e) => setConfirmar(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-cira-accent"
            />
            <span className="text-[13px] text-cira-text-secondary">
              Confirmo que deseo inhabilitar temporalmente mi cuenta.
            </span>
          </label>

          {estado && <p className="text-[13px] text-cira-accent">{estado}</p>}

          <Button onClick={inhabilitar}>INHABILITAR CUENTA</Button>
        </div>
      </div>
    </div>
  );
}
