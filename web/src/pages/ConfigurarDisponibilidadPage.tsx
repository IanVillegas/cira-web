import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Icon, Loader, PageHeader, Switch } from "@/components/aire";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";

/** Disponibilidad general (sí/no) y acceso a la agenda para bloquear días concretos. */
export function ConfigurarDisponibilidadPage() {
  const { usuario, refrescarUsuario } = useAuth();
  const navigate = useNavigate();
  const [disponible, setDisponible] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estado, setEstado] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) setDisponible(usuario.disponible);
  }, [usuario]);

  if (!usuario) return <Loader label={tr("Cargando disponibilidad...")} />;

  const guardar = async () => {
    setGuardando(true);
    setEstado(null);
    try {
      await api.usuario.setDisponibilidad(disponible);
      await refrescarUsuario();
      navigate("/perfil");
    } catch {
      setEstado(tr("No se pudo guardar. Verifica que el servidor esté corriendo."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Disponibilidad")}
        subtitle={tr("Indica cuándo puedes recibir solicitudes.")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-4 px-5 pt-2">
        <Card className="grid gap-3.5">
          <h2 className="aire-text-title-3 text-aire-ink">{tr("Estado actual")}</h2>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft">
              <Icon name={disponible ? "check_circle" : "cancel"} filled size={26} className={disponible ? "text-aire-accent-text" : "text-aire-ink-3"} />
            </span>
            <div className="flex-1">
              <p className="aire-text-headline text-aire-ink">{disponible ? tr("Disponible") : tr("No disponible")}</p>
              <p className="aire-text-footnote text-aire-ink-2">
                {disponible ? tr("Recibes alertas y ofertas de trabajo.") : tr("No recibes alertas ni ofertas nuevas.")}
              </p>
            </div>
            <Switch checked={disponible} onChange={setDisponible} label={tr("Disponibilidad")} />
          </div>
        </Card>

        <Card interactive onClick={() => navigate("/agenda")} className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft">
            <Icon name="event_busy" size={24} className="text-aire-accent-text" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="aire-text-headline text-aire-ink">{tr("Días que no puedes trabajar")}</p>
            <p className="aire-text-footnote text-aire-ink-2">{tr("Márcalos en tu agenda: nadie te ofrecerá trabajo directo esos días.")}</p>
          </div>
          <Icon name="chevron_forward" size={22} className="shrink-0 text-aire-ink-2" />
        </Card>

        {estado && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{estado}</p>}

        <Button loading={guardando} onClick={guardar}>
          {tr("Guardar disponibilidad")}
        </Button>
      </div>
    </div>
  );
}
