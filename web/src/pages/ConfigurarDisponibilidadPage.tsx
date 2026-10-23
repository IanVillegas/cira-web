import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Icon, Input, Loader, PageHeader, Switch } from "@/components/aire";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";

/** Réplica de ConfigurarDisponibilidadPage.xaml: estado actual + rango opcional + guardar. */
export function ConfigurarDisponibilidadPage() {
  const { usuario, refrescarUsuario } = useAuth();
  const navigate = useNavigate();
  const [disponible, setDisponible] = useState(true);
  const [usarRango, setUsarRango] = useState(false);
  const [rango, setRango] = useState({ desdeFecha: "", desdeHora: "", hastaFecha: "", hastaHora: "" });
  const [guardando, setGuardando] = useState(false);
  const [estado, setEstado] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) setDisponible(usuario.disponible);
  }, [usuario]);

  if (!usuario) return <Loader label={tr("Cargando disponibilidad...")} />;

  const guardar = async () => {
    if (usarRango) {
      const desde = new Date(`${rango.desdeFecha}T${rango.desdeHora || "00:00"}`);
      const hasta = new Date(`${rango.hastaFecha}T${rango.hastaHora || "00:00"}`);
      if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime()) || hasta <= desde) {
        return setEstado(tr("El rango de disponibilidad no es válido."));
      }
    }
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
              <p className="aire-text-footnote text-aire-ink-2">{usarRango ? tr("Rango configurado") : tr("Sin rango configurado")}</p>
            </div>
            <Switch checked={disponible} onChange={setDisponible} label={tr("Disponibilidad")} />
          </div>
        </Card>

        <Card className="grid gap-3.5">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="aire-text-headline text-aire-ink">{tr("Usar rango opcional")}</p>
              <p className="aire-text-footnote text-aire-ink-2">{tr("Define una fecha y hora de inicio y fin.")}</p>
            </div>
            <Switch checked={usarRango} onChange={setUsarRango} label={tr("Usar rango opcional")} />
          </div>

          {usarRango && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label={tr("Desde")} type="date" value={rango.desdeFecha} onChange={(e) => setRango({ ...rango, desdeFecha: e.target.value })} />
                <Input label={tr("Hora")} type="time" value={rango.desdeHora} onChange={(e) => setRango({ ...rango, desdeHora: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label={tr("Hasta")} type="date" value={rango.hastaFecha} onChange={(e) => setRango({ ...rango, hastaFecha: e.target.value })} />
                <Input label={tr("Hora")} type="time" value={rango.hastaHora} onChange={(e) => setRango({ ...rango, hastaHora: e.target.value })} />
              </div>
            </div>
          )}
        </Card>

        {estado && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{estado}</p>}

        <Button loading={guardando} onClick={guardar}>
          {tr("Guardar disponibilidad")}
        </Button>
      </div>
    </div>
  );
}
