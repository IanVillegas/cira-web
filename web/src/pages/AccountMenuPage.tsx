import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/auth";

const OPTIONS = [
  { icon: "edit", label: "Editar perfil", to: "/perfil/editar" },
  { icon: "person_off", label: "Inhabilitar cuenta", to: "/cuenta/inhabilitar" },
];

/** Réplica de AccountMenuPage.xaml: avatar, nombre, teléfono y tres opciones. */
export function AccountMenuPage() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  if (!usuario) return <Loader label="Cargando cuenta..." />;

  return (
    <div className="flex h-full min-h-[560px] flex-col px-6 py-7">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cira-header-icon-bg text-cira-accent"
        >
          <Icon name="chevron_backward" size={24} />
        </button>
        <h1 className="text-center text-cira-title font-semibold text-cira-text-primary">Cuenta</h1>
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
          <MenuOption
            icon="logout"
            label="Cerrar sesion"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          />
        </div>
      </div>
    </div>
  );
}

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
