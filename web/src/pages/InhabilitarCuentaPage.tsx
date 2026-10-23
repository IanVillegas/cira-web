import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, FieldCaption, Icon, PageHeader, PinInput, Switch } from "@/components/aire";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";

const RESUMEN = [
  { icon: "logout", text: tr("Se cerrarán todas tus sesiones activas.") },
  { icon: "visibility_off", text: tr("Tu perfil no aparecera en busquedas.") },
  { icon: "history", text: tr("Tus trabajos se conservan.") },
];

/** Réplica de InhabilitarCuentaPage.xaml: resumen + confirmación con PIN. */
export function InhabilitarCuentaPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [estado, setEstado] = useState<string | null>(null);

  const inhabilitar = () => {
    if (pin.length < 4) return setEstado(tr("Ingresa tu PIN de 4 dígitos."));
    if (!confirmar) return setEstado(tr("Confirma que deseas inhabilitar tu cuenta."));
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Inhabilitar cuenta")}
        subtitle={tr("La cuenta quedará inactiva hasta que solicites recuperarla.")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-4 px-5 pt-2">
        <Card className="grid gap-3">
          <h2 className="aire-text-title-3 text-aire-ink">{tr("Resumen")}</h2>
          <div className="grid gap-3">
            {RESUMEN.map((r) => (
              <div key={r.icon} className="flex items-center gap-3">
                <Icon name={r.icon} size={22} className="shrink-0 text-aire-accent-text" />
                <span className="aire-text-subhead text-aire-ink-2">{r.text}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="grid gap-4">
          <h2 className="aire-text-title-3 text-aire-ink">{tr("Confirmación")}</h2>

          <div className="grid justify-items-center gap-2.5">
            <FieldCaption>{tr("PIN")}</FieldCaption>
            <PinInput value={pin} onChange={setPin} error={!!estado && pin.length < 4} />
          </div>

          <div className="flex items-center gap-3">
            <span className="aire-text-subhead flex-1 text-aire-ink-2">{tr("Confirmo que deseo inhabilitar temporalmente mi cuenta.")}</span>
            <Switch checked={confirmar} onChange={setConfirmar} label={tr("Confirmo que deseo inhabilitar temporalmente mi cuenta.")} />
          </div>

          {estado && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{estado}</p>}

          <Button variant="destructive" onClick={inhabilitar}>
            {tr("Inhabilitar cuenta")}
          </Button>
        </Card>
      </div>
    </div>
  );
}
