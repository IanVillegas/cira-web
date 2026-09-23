import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/auth";

export function PerfilPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return <Loader label="Cargando perfil..." />;

  return (
    <div className="pb-4">
      <PageHeader title="Perfil" icon="settings" onIconClick={() => navigate("/cuenta")} />

      <div className="px-5">
        <Card className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cira-secondary text-2xl font-semibold text-cira-accent">
            {usuario.nombre
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <p className="text-lg font-semibold text-cira-text-primary">{usuario.nombre}</p>
            <p className="text-sm text-cira-text-secondary">{usuario.zona}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-cira-text-secondary">
            <span className="flex items-center gap-1">
              <Icon name="star" filled size={16} className="text-amber-500" /> {usuario.calificacion}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="task_alt" size={16} className="text-cira-accent" /> {usuario.trabajosCompletados} trabajos
            </span>
          </div>
          <Button variant="outlined" onClick={() => navigate("/perfil/editar")}>
            Editar perfil
          </Button>
        </Card>

        <Card className="mt-4">
          <p className="mb-2 font-semibold text-cira-text-primary">Sobre mí</p>
          <p className="text-sm text-cira-text-secondary">{usuario.descripcion}</p>
        </Card>

        <Card className="mt-4">
          <p className="mb-2 font-semibold text-cira-text-primary">Métodos de pago</p>
          <div className="flex flex-wrap gap-2">
            {usuario.metodosPago.map((m) => (
              <Badge key={m}>{m}</Badge>
            ))}
          </div>
        </Card>

        <Card className="mt-4">
          <p className="mb-3 font-semibold text-cira-text-primary">Servicios que ofrezco</p>
          <div className="space-y-3">
            {usuario.servicios.map((s) => (
              <div key={s.id} className="flex items-start gap-2.5">
                <Icon name="work" size={18} className="mt-0.5 text-cira-accent" />
                <div>
                  <p className="text-sm font-semibold text-cira-text-primary">{s.categoria}</p>
                  <p className="text-sm text-cira-text-secondary">{s.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outlined" onClick={() => navigate("/publicaciones")}>
            Mis publicaciones
          </Button>
          <Button variant="outlined" onClick={() => navigate("/mis-trabajos")}>
            Mis trabajos
          </Button>
          <Button variant="outlined" onClick={() => navigate("/historial")}>
            Historial
          </Button>
          <Button variant="outlined" onClick={() => navigate("/cuenta")}>
            Cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}
