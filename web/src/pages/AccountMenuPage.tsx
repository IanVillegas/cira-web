import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, Loader, PageHeader, Sheet, Stagger, cx } from "@/components/aire";
import { useAuth } from "@/lib/auth";
import { cambiarIdioma, idioma, tr, type Idioma } from "@/lib/i18n";

const OPCIONES = [
  { icon: "edit", label: "Editar perfil", to: "/perfil/editar" },
  { icon: "credit_card", label: "Mi tarjeta", to: "/cuenta/tarjeta" },
  { icon: "receipt_long", label: "Mi actividad", to: "/cuenta/actividad" },
  { icon: "star", label: "Plan Plus", to: "/cuenta/plan" },
  { icon: "notifications", label: "Alertas", to: "/alertas" },
  { icon: "payments", label: "Ingresos de CIRA (demo)", to: "/cuenta/ingresos" },
];

const IDIOMAS: { value: Idioma; label: string }[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

/** Cuenta: datos de la persona y accesos a tarjeta, actividad, plan, idioma y cierre de sesión. */
export function AccountMenuPage() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [idiomaAbierto, setIdiomaAbierto] = useState(false);

  if (!usuario) return <Loader label={tr("Cargando cuenta...")} />;

  return (
    <div className="pb-6">
      <PageHeader title={tr("Cuenta")} onBack={() => navigate(-1)} backLabel={tr("Atrás")} large={false} />

      <div className="grid gap-5 px-5 pt-2">
        <div className="grid justify-items-center gap-1.5 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-aire-full bg-aire-accent-soft">
            <Icon name="account_circle" filled size={56} className="text-aire-accent-text" />
          </span>
          <p className="aire-text-title-1 text-aire-ink">{usuario.nombre}</p>
          <p className="aire-text-subhead text-aire-ink-2">{usuario.telefono}</p>
        </div>

        <Stagger className="grid overflow-hidden rounded-aire-lg bg-aire-surface">
          {OPCIONES.map((o) => (
            <Fila key={o.to} icon={o.icon} label={tr(o.label)} onClick={() => navigate(o.to)} />
          ))}
          <Fila icon="language" label={tr("Idioma")} detalle={idioma() === "es" ? "Español" : "English"} onClick={() => setIdiomaAbierto(true)} />
          <Fila icon="person_off" label={tr("Inhabilitar cuenta")} onClick={() => navigate("/cuenta/inhabilitar")} />
        </Stagger>

        <div className="overflow-hidden rounded-aire-lg bg-aire-surface">
          <Fila
            icon="logout"
            label={tr("Cerrar sesión")}
            peligro
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          />
        </div>
      </div>

      <Sheet open={idiomaAbierto} onClose={() => setIdiomaAbierto(false)} title={tr("Idioma")} subtitle={tr("Elige el idioma de la app")} contained>
        <div className="grid gap-1.5">
          {IDIOMAS.map((i) => (
            <button
              key={i.value}
              type="button"
              aria-pressed={idioma() === i.value}
              onClick={() => (i.value === idioma() ? setIdiomaAbierto(false) : cambiarIdioma(i.value))}
              className={cx(
                "aire-text-body flex min-h-12 items-center justify-between rounded-aire-md px-4 text-left transition-transform duration-[100ms] ease-aire-pop active:scale-[0.98]",
                idioma() === i.value ? "bg-aire-accent-soft font-semibold text-aire-accent-text" : "bg-aire-surface-2 text-aire-ink",
              )}
            >
              {i.label}
              {idioma() === i.value && <Icon name="check" size={22} />}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

function Fila({
  icon,
  label,
  detalle,
  peligro = false,
  onClick,
}: {
  icon: string;
  label: string;
  detalle?: string;
  peligro?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 border-b border-aire-hairline px-4 text-left transition-colors duration-[100ms] last:border-b-0 active:bg-aire-surface-2"
    >
      <Icon name={icon} size={24} className={peligro ? "text-aire-danger-text" : "text-aire-accent-text"} />
      <span className={cx("aire-text-body flex-1", peligro ? "text-aire-danger-text" : "text-aire-ink")}>{label}</span>
      {detalle && <span className="aire-text-subhead text-aire-ink-2">{detalle}</span>}
      {!peligro && <Icon name="chevron_right" size={22} className="text-aire-ink-3" />}
    </button>
  );
}
