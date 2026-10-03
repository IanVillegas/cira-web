import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Loader } from "@/components/ui/Loader";
import { Card } from "@/components/ui/Card";
import { DistrictPickerSheet } from "@/components/DistrictPickerSheet";
import { LocationPreview } from "@/components/LocationPreview";
import { DISTRITOS, type Distrito } from "@/lib/districts";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { MetodoPago } from "@/lib/types";

const METODOS: { value: MetodoPago; icon: string }[] = [
  { value: "SINPE", icon: "smartphone" },
  { value: "Efectivo", icon: "payments" },
  { value: "Transferencia", icon: "account_balance" },
];

// El backend guarda un solo "nombre"; el formulario lo reparte en 4 campos como MAUI.
function separarNombre(nombre: string) {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length <= 1) return { nombre: p[0] ?? "", nombre2: "", apellido: "", apellido2: "" };
  if (p.length === 2) return { nombre: p[0], nombre2: "", apellido: p[1], apellido2: "" };
  if (p.length === 3) return { nombre: p[0], nombre2: "", apellido: p[1], apellido2: p[2] };
  return { nombre: p[0], nombre2: p[1], apellido: p[2], apellido2: p.slice(3).join(" ") };
}

function distritoDe(zona: string): Distrito | null {
  const z = zona.toLowerCase();
  return DISTRITOS.find((d) => z.includes(d.nombre.toLowerCase())) ?? null;
}

/** Réplica de EditProfilePage.xaml: vista previa, nombre, contacto, ubicación y métodos de pago. */
export function EditProfilePage() {
  const { usuario, refrescarUsuario } = useAuth();
  const navigate = useNavigate();
  const [nombres, setNombres] = useState({ nombre: "", nombre2: "", apellido: "", apellido2: "" });
  const [contacto, setContacto] = useState({ telefono: "", correo: "", cedula: "" });
  const [distrito, setDistrito] = useState<Distrito | null>(null);
  const [zonaTexto, setZonaTexto] = useState("");
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;
    setNombres(separarNombre(usuario.nombre));
    setContacto({ telefono: usuario.telefono, correo: usuario.correo ?? "", cedula: usuario.cedula });
    setDistrito(distritoDe(usuario.zona));
    setZonaTexto(usuario.zona);
    setMetodos(usuario.metodosPago);
  }, [usuario]);

  if (!usuario) return <Loader label="Cargando perfil..." />;

  const nombreCompleto = [nombres.nombre, nombres.nombre2, nombres.apellido, nombres.apellido2]
    .map((n) => n.trim())
    .filter(Boolean)
    .join(" ");

  const toggleMetodo = (m: MetodoPago) =>
    setMetodos((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const guardar = async () => {
    if (!nombres.nombre.trim() || !nombres.apellido.trim())
      return setError("El primer nombre y el primer apellido son obligatorios.");
    if (!/^\d{8}$/.test(contacto.telefono)) return setError("El teléfono debe tener 8 dígitos.");
    if (!zonaTexto) return setError("Selecciona tu distrito.");
    if (metodos.length === 0) return setError("Selecciona al menos un método de pago.");

    setGuardando(true);
    setError(null);
    try {
      await api.usuario.actualizar({
        nombre: nombreCompleto,
        telefono: contacto.telefono,
        correo: contacto.correo.trim(),
        cedula: contacto.cedula.trim(),
        zona: zonaTexto,
        metodosPago: metodos,
      });
      await refrescarUsuario();
      navigate("/perfil");
    } catch {
      setError("No se pudo guardar. Verifica que el servidor esté corriendo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Editar perfil"
        subtitle="Mantén tu información visible para clientes."
        icon="person"
        showBack
      />

      <div className="flex flex-col gap-4 px-5 pt-2 pb-9">
        <Card className="flex items-center gap-3.5">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-3xl border-2 border-cira-card bg-cira-header-icon-bg">
            <Icon name="person" size={38} className="text-cira-accent" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] text-cira-text-secondary">PERFIL PUBLICO</span>
            <span className="truncate text-[21px] font-semibold text-cira-text-primary">
              {nombreCompleto || "Tus datos"}
            </span>
            <span className="truncate text-[13px] text-cira-text-secondary">{zonaTexto}</span>
          </div>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <h2 className="text-base font-semibold text-cira-text-primary">Nombre</h2>
          <Input placeholder="Primer nombre" value={nombres.nombre} onChange={(e) => setNombres({ ...nombres, nombre: e.target.value })} />
          <Input placeholder="Segundo nombre" value={nombres.nombre2} onChange={(e) => setNombres({ ...nombres, nombre2: e.target.value })} />
          <Input placeholder="Primer apellido" value={nombres.apellido} onChange={(e) => setNombres({ ...nombres, apellido: e.target.value })} />
          <Input placeholder="Segundo apellido" value={nombres.apellido2} onChange={(e) => setNombres({ ...nombres, apellido2: e.target.value })} />
        </Card>

        <Card className="flex flex-col gap-3.5">
          <h2 className="text-base font-semibold text-cira-text-primary">Contacto</h2>
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={8}
            placeholder="Telefono"
            value={contacto.telefono}
            onChange={(e) => setContacto({ ...contacto, telefono: e.target.value.replace(/\D/g, "") })}
          />
          <Input
            type="email"
            placeholder="Correo"
            value={contacto.correo}
            onChange={(e) => setContacto({ ...contacto, correo: e.target.value })}
          />
          <Input
            placeholder="Cedula opcional"
            value={contacto.cedula}
            onChange={(e) => setContacto({ ...contacto, cedula: e.target.value })}
          />
        </Card>

        <Card className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-[3px]">
            <h2 className="text-base font-semibold text-cira-text-primary">Ubicacion</h2>
            <p className="text-xs text-cira-text-secondary">
              Selecciona el distrito y ajusta el pin si necesitas una ubicación más exacta.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex min-h-14 items-center justify-between rounded-cira-input bg-cira-input-bg px-3.5 text-left text-cira-control"
          >
            <span className={zonaTexto ? "text-cira-text-primary" : "text-cira-text-helper"}>
              {distrito ? `${distrito.nombre}, ${distrito.canton}` : zonaTexto || "Selecciona tu distrito"}
            </span>
            <Icon name="keyboard_arrow_down" size={24} className="text-cira-text-secondary" />
          </button>
          <LocationPreview
            center={distrito ? [distrito.lat, distrito.lng] : null}
            text={zonaTexto || "Ajusta tu ubicación en el mapa"}
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold text-cira-text-primary">Métodos de pago</h2>
              <p className="text-xs text-cira-text-secondary">Elige como prefieres recibir pagos.</p>
            </div>
            <span className="self-center text-xs font-semibold text-cira-accent">
              {metodos.length} seleccionados
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {METODOS.map((m) => {
              const active = metodos.includes(m.value);
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggleMetodo(m.value)}
                  aria-pressed={active}
                  className={`flex w-[92px] flex-col items-center gap-2 rounded-2xl bg-cira-card p-2.5 ${
                    active ? "border-2 border-cira-accent" : "border-2 border-cira-border"
                  }`}
                >
                  <span
                    className={`flex h-[38px] w-[38px] items-center justify-center rounded-xl ${
                      active ? "bg-cira-accent" : "bg-cira-surface-muted"
                    }`}
                  >
                    <Icon name={m.icon} size={22} className={active ? "text-cira-card" : "text-cira-accent"} />
                  </span>
                  <span className="text-[9px] font-semibold text-cira-text-primary uppercase">{m.value}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {error && <p className="text-center text-[13px] text-cira-accent">{error}</p>}

        <Button onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <DistrictPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(d) => {
          setDistrito(d);
          setZonaTexto(`${d.nombre}, ${d.canton}`);
          setPickerOpen(false);
          setError(null);
        }}
      />
    </div>
  );
}
