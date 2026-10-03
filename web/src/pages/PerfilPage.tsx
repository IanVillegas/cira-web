import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Switch } from "@/components/ui/Switch";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function serviceIcon(categoria: string) {
  const v = categoria.toLowerCase();
  if (v.includes("fontan") || v.includes("plomer")) return "plumbing";
  if (v.includes("limp")) return "cleaning_services";
  if (v.includes("electric")) return "electrical_services";
  return "design_services";
}

function paymentIcon(metodo: string) {
  const v = metodo.toLowerCase();
  if (v.includes("sinpe") || v.includes("movil") || v.includes("móvil")) return "smartphone";
  if (v.includes("transfer") || v.includes("banco")) return "account_balance";
  return "payments";
}

/** Réplica de PerfilPage.xaml: avatar, tarjeta de disponibilidad, servicios y métodos de pago. */
export function PerfilPage() {
  const { usuario, refrescarUsuario } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [usarRango, setUsarRango] = useState(false);
  const [guardando, setGuardando] = useState(false);

  if (!usuario) return <Loader label="Cargando perfil..." />;

  const guardarDisponibilidad = async (disponible: boolean) => {
    setGuardando(true);
    try {
      await api.usuario.setDisponibilidad(disponible);
      await refrescarUsuario();
    } finally {
      setGuardando(false);
    }
  };

  const onToggle = (value: boolean) => {
    if (value) setModalOpen(true);
    else guardarDisponibilidad(false);
  };

  const servicios = usuario.servicios.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 px-6 pb-7">
      <PageHeader
        title="Perfil"
        icon="settings"
        onIconClick={() => navigate("/cuenta")}
        className="px-0 pt-6 pb-3"
      />

      <div className="flex flex-col items-center gap-3">
        <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full border-[3px] border-cira-card bg-cira-header-icon-bg">
          <Icon name="account_circle" size={66} className="text-cira-accent" />
        </div>
        <p className="text-center text-[26px] font-semibold text-cira-text-primary">{usuario.nombre}</p>
        <p className="text-center text-cira-body text-cira-text-secondary">
          {usuario.zona || "Sin ubicación"}
        </p>
      </div>

      <div className="flex items-center gap-3.5 rounded-[18px] bg-cira-surface-muted p-4">
        <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl bg-cira-header-icon-bg">
          <Icon name="event_available" size={24} className="text-cira-accent" />
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-cira-text-primary">Disponibilidad</p>
          <p className="text-[10px] font-semibold tracking-[0.12em] text-cira-text-secondary">
            {usuario.disponible ? "ESTADO ACTUAL" : "NO DISPONIBLE"}
          </p>
        </div>
        <Switch
          checked={usuario.disponible}
          onChange={onToggle}
          disabled={guardando}
          label="Disponibilidad"
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cira-text-primary">Mis Servicios</h2>
          <button
            onClick={() => navigate("/cuenta/servicios")}
            className="text-[13px] font-semibold text-cira-accent"
          >
            Editar
          </button>
        </div>
        <div className="flex flex-wrap gap-x-2.5 gap-y-2.5">
          {servicios.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-1.5 rounded-[18px] bg-cira-card px-3.5 py-[9px] text-[13px] text-cira-text-primary"
            >
              <Icon name={serviceIcon(s.categoria)} size={16} className="text-cira-accent" />
              {s.categoria}
            </span>
          ))}
          <button
            onClick={() => navigate("/cuenta/servicios")}
            className="flex items-center gap-1.5 rounded-[18px] border border-cira-border bg-cira-card px-3.5 py-[9px] text-[13px] text-cira-text-primary"
          >
            <Icon name="add" size={16} className="text-cira-text-secondary" />
            {servicios.length === 0 ? "Añadir servicio" : "Añadir"}
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cira-text-primary">Métodos de Pago</h2>
          <button
            onClick={() => navigate("/perfil/editar")}
            className="text-[13px] font-semibold text-cira-accent"
          >
            Editar
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {usuario.metodosPago.length === 0 ? (
            <PaymentCard text="Añadir" icon="add" active={false} onClick={() => navigate("/perfil/editar")} />
          ) : (
            usuario.metodosPago.map((m) => (
              <PaymentCard
                key={m}
                text={m}
                icon={paymentIcon(m)}
                active
                onClick={() => navigate("/perfil/editar")}
              />
            ))
          )}
        </div>
      </section>

      {modalOpen && (
        <div
          className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/60 p-[18px]"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-[22px] bg-cira-card p-[22px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[21px] font-semibold text-cira-text-primary">Activar disponibilidad</h3>
            <p className="mt-1 text-[13px] text-cira-text-secondary">
              Puedes activarla ahora o definir un rango opcional.
            </p>

            <label className="mt-4 flex items-center gap-2.5 text-sm font-semibold text-cira-text-primary">
              <input
                type="checkbox"
                checked={usarRango}
                onChange={(e) => setUsarRango(e.target.checked)}
                className="h-5 w-5 accent-cira-accent"
              />
              Usar rango opcional
            </label>

            {usarRango && (
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <RangeField label="DESDE" type="date" />
                <RangeField label="HORA" type="time" />
                <RangeField label="HASTA" type="date" />
                <RangeField label="HORA" type="time" />
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  setModalOpen(false);
                  setUsarRango(false);
                  await guardarDisponibilidad(true);
                }}
              >
                Activar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentCard({
  text,
  icon,
  active,
  onClick,
}: {
  text: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-[92px] flex-col items-center gap-2 rounded-2xl bg-cira-card p-2.5 ${
        active ? "border-2 border-cira-accent" : "border-2 border-transparent"
      }`}
    >
      <span
        className={`flex h-[38px] w-[38px] items-center justify-center rounded-xl ${
          active ? "bg-cira-accent" : "bg-cira-surface-muted"
        }`}
      >
        <Icon name={icon} size={22} className={active ? "text-cira-card" : "text-cira-accent"} />
      </span>
      <span className="text-[9px] font-semibold text-cira-text-primary uppercase">{text}</span>
    </button>
  );
}

function RangeField({ label, type }: { label: string; type: "date" | "time" }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold tracking-[0.12em] text-cira-text-secondary">{label}</span>
      <input
        type={type}
        className="min-h-12 rounded-cira-input bg-cira-surface-muted px-2.5 text-sm text-cira-text-primary focus:outline-none"
      />
    </label>
  );
}
