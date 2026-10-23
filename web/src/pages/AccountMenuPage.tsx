import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { cambiarIdioma, idioma, tr, type Idioma } from "@/lib/i18n";

const OPTIONS = [
  { icon: "edit", label: tr("Editar perfil"), to: "/perfil/editar" },
  { icon: "credit_card", label: tr("Mi tarjeta"), to: "/cuenta/tarjeta" },
  { icon: "receipt_long", label: tr("Mi actividad"), to: "/cuenta/actividad" },
  { icon: "star", label: tr("Plan Plus"), to: "/cuenta/plan" },
  { icon: "notifications", label: tr("Alertas"), to: "/alertas" },
  { icon: "payments", label: tr("Ingresos de CIRA (demo)"), to: "/cuenta/ingresos" },
  { icon: "person_off", label: tr("Inhabilitar cuenta"), to: "/cuenta/inhabilitar" },
];

/** Réplica de AccountMenuPage.xaml: avatar, nombre, teléfono y tres opciones. */
export function AccountMenuPage() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [idiomaAbierto, setIdiomaAbierto] = useState(false);

  if (!usuario) return <Loader label={tr("Cargando cuenta...")} />;

  return (
    <div className="flex h-full min-h-[560px] flex-col px-6 py-7">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <button
          onClick={() => navigate(-1)}
          aria-label={tr("Volver")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cira-header-icon-bg text-cira-accent"
        >
          <Icon name="chevron_backward" size={24} />
        </button>
        <h1 className="text-center text-cira-title font-semibold text-cira-text-primary">{tr("Cuenta")}</h1>
      </div>

      <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center gap-6">
        <div className="mx-auto flex h-[108px] w-[108px] items-center justify-center rounded-full bg-cira-header-icon-bg">
          <Icon name="account_circle" size={56} className="text-cira-accent" />
        </div>

        <div className="flex flex-col gap-1.5 text-center">
          <p className="text-[26px] font-semibold text-cira-text-primary">{usuario.nombre}</p>
          <p className="text-[15px] text-cira-text-secondary">{usuario.telefono}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {OPTIONS.map((o) => (
            <MenuOption key={o.to} icon={o.icon} label={o.label} onClick={() => navigate(o.to)} />
          ))}
          <MenuOption icon="language" label={tr("Idioma")} onClick={() => setIdiomaAbierto(true)} />
          <MenuOption
            icon="logout"
            label={tr("Cerrar sesion")}
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          />
        </div>
      </div>

      <BottomSheet open={idiomaAbierto} onClose={() => setIdiomaAbierto(false)} title={tr("Idioma")} subtitle={tr("Elige el idioma de la app")}>
        <div className="flex flex-col gap-2">
          {IDIOMAS.map((i) => (
            <button
              key={i.value}
              type="button"
              aria-pressed={idioma() === i.value}
              onClick={() => (i.value === idioma() ? setIdiomaAbierto(false) : cambiarIdioma(i.value))}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-[15px] ${
                idioma() === i.value
                  ? "border-cira-accent bg-cira-nav-selected-bg font-semibold text-cira-accent"
                  : "border-cira-border text-cira-text-primary"
              }`}
            >
              {i.label}
              {idioma() === i.value && <Icon name="check" size={22} />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

const IDIOMAS: { value: Idioma; label: string }[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

function MenuOption({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-cira-border bg-cira-card px-4 py-3.5 text-left"
    >
      <Icon name={icon} size={24} className="text-cira-accent" />
      <span className="flex-1 text-[15px] font-semibold text-cira-text-primary">{label}</span>
      <Icon name="chevron_right" size={22} className="text-cira-text-secondary" />
    </button>
  );
}
