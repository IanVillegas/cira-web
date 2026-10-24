import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Icon, Input, Loader, PageHeader, Reveal, Sheet, Switch } from "@/components/aire";
import { Calificacion } from "@/components/Estrellas";
import { GuardadoPor } from "@/components/GuardadoPor";
import { InsigniaChips } from "@/components/InsigniaChips";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";

function serviceIcon(categoria: string) {
  const v = categoria.toLowerCase();
  if (v.includes("fontan") || v.includes("plomer")) return "plumbing";
  if (v.includes("limp")) return "cleaning_services";
  if (v.includes("electric")) return "electrical_services";
  return "design_services";
}

function paymentIcon(metodo: string) {
  return metodo === "Tarjeta" ? "credit_card" : "payments";
}

/** Réplica de PerfilPage.xaml: avatar, tarjeta de disponibilidad, servicios y métodos de pago. */
export function PerfilPage() {
  const { usuario, refrescarUsuario } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [usarRango, setUsarRango] = useState(false);
  const [guardando, setGuardando] = useState(false);

  if (!usuario) return <Loader label={tr("Cargando perfil...")} />;

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
    <div className="pb-6">
      <PageHeader title={tr("Perfil")} action={{ icon: "settings", label: tr("Cuenta"), onClick: () => navigate("/cuenta") }} />

      <div className="grid gap-6 px-5">
        <Reveal effect="scale">
          <div className="grid justify-items-center gap-2 text-center">
            <span className="flex h-28 w-28 items-center justify-center rounded-aire-full bg-aire-accent-soft">
              <Icon name="account_circle" filled size={66} className="text-aire-accent-text" />
            </span>
            <p className="aire-text-title-1 text-aire-ink">{usuario.nombre}</p>
            <p className="aire-text-subhead text-aire-ink-2">{usuario.zona || tr("Sin ubicación")}</p>
            <Calificacion valor={usuario.calificacion} total={usuario.numCalificaciones} />
            <InsigniaChips insignias={usuario.insignias} />
            {usuario.guardadoPor > 0 && <GuardadoPor n={usuario.guardadoPor} />}
            {usuario.plan !== "plus" && (
              <button type="button" onClick={() => navigate("/cuenta/plan")} className="aire-text-subhead min-h-11 font-semibold text-aire-accent-text">
                {tr("Conoce el Plan Plus")}
              </button>
            )}
          </div>
        </Reveal>

        <Card className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft">
            <Icon name="event_available" size={24} className="text-aire-accent-text" />
          </span>
          <div className="flex-1">
            <p className="aire-text-headline text-aire-ink">{tr("Disponibilidad")}</p>
            <p className="aire-text-eyebrow text-aire-ink-2">{usuario.disponible ? tr("ESTADO ACTUAL") : tr("NO DISPONIBLE")}</p>
          </div>
          <Switch checked={usuario.disponible} onChange={onToggle} disabled={guardando} label={tr("Disponibilidad")} />
        </Card>

        <Card interactive onClick={() => navigate("/de-confianza")} className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft">
            <Icon name="favorite" filled size={24} className="text-aire-accent-text" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="aire-text-headline text-aire-ink">{tr("Mis trabajadores de confianza")}</p>
            <p className="aire-text-footnote text-aire-ink-2">{tr("Recontrata, chatea o recomienda a quienes ya conoces.")}</p>
          </div>
          <Icon name="chevron_forward" size={22} className="shrink-0 text-aire-ink-2" />
        </Card>

        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="aire-text-title-2 text-aire-ink">{tr("Mis servicios")}</h2>
            <button type="button" onClick={() => navigate("/cuenta/servicios")} className="aire-text-subhead min-h-11 font-semibold text-aire-accent-text">
              {tr("Editar")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {servicios.map((s) => (
              <span key={s.id} className="aire-text-subhead flex items-center gap-1.5 rounded-aire-full bg-aire-surface px-3.5 py-2.5 text-aire-ink shadow-aire-card">
                <Icon name={serviceIcon(s.categoria)} size={18} className="text-aire-accent-text" />
                {tr(s.categoria)}
              </span>
            ))}
            <button
              type="button"
              onClick={() => navigate("/cuenta/servicios")}
              className="aire-text-subhead flex min-h-11 items-center gap-1.5 rounded-aire-full border border-aire-hairline px-3.5 text-aire-ink-2 transition-transform duration-[100ms] ease-aire-pop active:scale-95"
            >
              <Icon name="add" size={18} />
              {servicios.length === 0 ? tr("Añadir servicio") : tr("Añadir")}
            </button>
          </div>
        </section>

        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="aire-text-title-2 text-aire-ink">{tr("Métodos de pago")}</h2>
            <button type="button" onClick={() => navigate("/perfil/editar")} className="aire-text-subhead min-h-11 font-semibold text-aire-accent-text">
              {tr("Editar")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {usuario.metodosPago.length === 0 ? (
              <MetodoPagoTarjeta text={tr("Añadir")} icon="add" onClick={() => navigate("/perfil/editar")} />
            ) : (
              usuario.metodosPago.map((m) => (
                <MetodoPagoTarjeta
                  key={m}
                  text={m === "Tarjeta" && usuario.tarjeta ? `${tr(m)} ·${usuario.tarjeta.ultimos4}` : tr(m)}
                  icon={paymentIcon(m)}
                  onClick={() => navigate(m === "Tarjeta" ? "/cuenta/tarjeta" : "/perfil/editar")}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <Sheet open={modalOpen} onClose={() => setModalOpen(false)} title={tr("Activar disponibilidad")} subtitle={tr("Puedes activarla ahora o definir un rango opcional.")} contained>
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <span className="aire-text-body flex-1 text-aire-ink">{tr("Usar rango opcional")}</span>
            <Switch checked={usarRango} onChange={setUsarRango} label={tr("Usar rango opcional")} />
          </div>

          {usarRango && (
            <div className="grid grid-cols-2 gap-3">
              <Input label={tr("Desde")} type="date" />
              <Input label={tr("Hora")} type="time" />
              <Input label={tr("Hasta")} type="date" />
              <Input label={tr("Hora")} type="time" />
            </div>
          )}

          <Button
            onClick={async () => {
              setModalOpen(false);
              setUsarRango(false);
              await guardarDisponibilidad(true);
            }}
          >
            {tr("Activar")}
          </Button>
          <Button variant="plain" onClick={() => setModalOpen(false)}>
            {tr("Cancelar")}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function MetodoPagoTarjeta({ text, icon, onClick }: { text: string; icon: string; onClick: () => void }) {
  return (
    <Card interactive onClick={onClick} className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft">
        <Icon name={icon} size={22} className="text-aire-accent-text" />
      </span>
      <span className="aire-text-subhead truncate font-semibold text-aire-ink">{text}</span>
    </Card>
  );
}
