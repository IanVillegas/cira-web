import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth";

const ITEMS = [
  { icon: "person", label: "Editar perfil", to: "/perfil/editar" },
  { icon: "design_services", label: "Configurar servicios", to: "/cuenta/servicios" },
  { icon: "event_available", label: "Configurar disponibilidad", to: "/cuenta/disponibilidad" },
  { icon: "history", label: "Historial de trabajos", to: "/historial" },
  { icon: "block", label: "Inhabilitar cuenta", to: "/cuenta/inhabilitar", destructive: true },
];

export function AccountMenuPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="pb-4">
      <PageHeader title="Cuenta" subtitle="Preferencias y configuración." showBack />

      <div className="mx-5 overflow-hidden rounded-cira-card bg-cira-card shadow-[0_8px_24px_-12px_rgba(25,28,30,0.18)]">
        {ITEMS.map((item) => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className="flex w-full items-center gap-3 border-b border-cira-border px-4 py-4 text-left last:border-none"
          >
            <Icon
              name={item.icon}
              size={22}
              className={item.destructive ? "text-cira-btn-destructive-text" : "text-cira-accent"}
            />
            <span
              className={`flex-1 text-sm font-medium ${
                item.destructive ? "text-cira-btn-destructive-text" : "text-cira-text-primary"
              }`}
            >
              {item.label}
            </span>
            <Icon name="chevron_right" size={20} className="text-cira-text-helper" />
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}
        className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] items-center justify-center gap-2 rounded-cira-input border border-cira-border py-3 text-sm font-semibold text-cira-text-secondary"
      >
        <Icon name="logout" size={20} />
        Cerrar sesión
      </button>
    </div>
  );
}
