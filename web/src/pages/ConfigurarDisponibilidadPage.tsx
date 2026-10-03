import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { Switch } from "@/components/ui/Switch";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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

  if (!usuario) return <Loader label="Cargando disponibilidad..." />;

  const guardar = async () => {
    if (usarRango) {
      const desde = new Date(`${rango.desdeFecha}T${rango.desdeHora || "00:00"}`);
      const hasta = new Date(`${rango.hastaFecha}T${rango.hastaHora || "00:00"}`);
      if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime()) || hasta <= desde) {
        return setEstado("El rango de disponibilidad no es válido.");
      }
    }
    setGuardando(true);
    setEstado(null);
    try {
      await api.usuario.setDisponibilidad(disponible);
      await refrescarUsuario();
      navigate("/perfil");
    } catch {
      setEstado("No se pudo guardar. Verifica que el servidor esté corriendo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Disponibilidad"
        subtitle="Indica cuándo puedes recibir solicitudes."
        icon="event_available"
        showBack
      />

      <div className="flex flex-col gap-[18px] px-5 pt-2 pb-7">
        <div className="flex flex-col gap-3.5 rounded-[14px] bg-cira-card p-4">
          <h2 className="text-base font-semibold text-cira-text-primary">Estado actual</h2>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cira-nav-selected-bg">
              <Icon
                name={disponible ? "check_circle" : "cancel"}
                size={26}
                className={disponible ? "text-cira-accent" : "text-cira-text-helper"}
              />
            </span>
            <div className="flex-1">
              <p className="text-lg font-semibold text-cira-text-primary">
                {disponible ? "Disponible" : "No disponible"}
              </p>
              <p className="text-[13px] text-cira-text-secondary">
                {usarRango ? "Rango configurado" : "Sin rango configurado"}
              </p>
            </div>
            <Switch checked={disponible} onChange={setDisponible} label="Disponibilidad" />
          </div>
        </div>

        <div className="flex flex-col gap-3.5 rounded-[14px] bg-cira-card p-4">
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={usarRango}
              onChange={(e) => setUsarRango(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-cira-accent"
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold text-cira-text-primary">Usar rango opcional</span>
              <span className="text-[13px] text-cira-text-secondary">
                Define una fecha y hora de inicio y fin.
              </span>
            </span>
          </label>

          {usarRango && (
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <DateTimeField label="Desde" icon="calendar_month" type="date" value={rango.desdeFecha} onChange={(v) => setRango({ ...rango, desdeFecha: v })} />
                <DateTimeField label="Hora" icon="schedule" type="time" value={rango.desdeHora} onChange={(v) => setRango({ ...rango, desdeHora: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DateTimeField label="Hasta" icon="calendar_month" type="date" value={rango.hastaFecha} onChange={(v) => setRango({ ...rango, hastaFecha: v })} />
                <DateTimeField label="Hora" icon="schedule" type="time" value={rango.hastaHora} onChange={(v) => setRango({ ...rango, hastaHora: v })} />
              </div>
            </div>
          )}
        </div>

        {estado && <p className="text-[13px] text-cira-accent">{estado}</p>}

        <Button onClick={guardar} disabled={guardando}>
          GUARDAR DISPONIBILIDAD
        </Button>
      </div>
    </div>
  );
}
