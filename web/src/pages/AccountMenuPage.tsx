import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, Loader, PageHeader, Sheet, Stagger, cx } from "@/components/aire";
import { useAuth } from "@/lib/auth";
import { cambiarIdioma, idioma, tr, type Idioma } from "@/lib/i18n";
import { formatearTelefono } from "@/lib/format";
import { cambiarTema, useTema, type Tema } from "@/lib/tema";

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

const TEMAS: { value: Tema; label: string; icon: string; detalle?: string }[] = [
  { value: "sistema", label: "Automático", icon: "brightness_auto", detalle: "Igual que tu teléfono" },
  { value: "claro", label: "Claro", icon: "light_mode" },
  { value: "oscuro", label: "Oscuro", icon: "dark_mode" },
];

/** Cuenta: datos de la persona y accesos a tarjeta, actividad, plan, apariencia, idioma y cierre de sesión. */
export function AccountMenuPage() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [idiomaAbierto, setIdiomaAbierto] = useState(false);
  const [temaAbierto, setTemaAbierto] = useState(false);
  const { tema, oscuro } = useTema();

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
          <p className="aire-text-subhead text-aire-ink-2">{formatearTelefono(usuario.telefono)}</p>
        </div>

        <Stagger className="grid overflow-hidden rounded-aire-lg bg-aire-surface">
          {OPCIONES.map((o) => (
            <Fila key={o.to} icon={o.icon} label={tr(o.label)} onClick={() => navigate(o.to)} />
          ))}
          <Fila
            icon={oscuro ? "dark_mode" : "light_mode"}
            label={tr("Apariencia")}
            detalle={tr(TEMAS.find((t) => t.value === tema)?.label ?? "Automático")}
            onClick={() => setTemaAbierto(true)}
          />
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

      <Sheet open={temaAbierto} onClose={() => setTemaAbierto(false)} title={tr("Apariencia")} subtitle={tr("Elige cómo se ve CIRA")} contained>
        <div className="grid gap-1.5">
          {TEMAS.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={tema === t.value}
              onClick={() => cambiarTema(t.value)}
              className={cx(
                "flex min-h-12 items-center gap-3 rounded-aire-md px-4 py-2 text-left transition-transform duration-[100ms] ease-aire-pop active:scale-[0.98]",
                tema === t.value ? "bg-aire-accent-soft text-aire-accent-text" : "bg-aire-surface-2 text-aire-ink",
              )}
            >
              <Icon name={t.icon} filled={tema === t.value} size={22} />
              <span className="flex-1">
                <span className={cx("aire-text-body block", tema === t.value && "font-semibold")}>{tr(t.label)}</span>
                {t.detalle && <span className="aire-text-footnote block text-aire-ink-2">{tr(t.detalle)}</span>}
              </span>
              {tema === t.value && <Icon name="check" size={22} />}
            </button>
          ))}
        </div>
      </Sheet>

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
