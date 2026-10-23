import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Icon, Input, Loader, PageHeader, SelectableCard } from "@/components/aire";
import { DistrictPickerSheet } from "@/components/DistrictPickerSheet";
import { LocationPreview } from "@/components/LocationPreview";
import { DISTRITOS, type Distrito } from "@/lib/districts";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { MetodoPago } from "@/lib/types";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";

const METODOS: { value: MetodoPago; icon: string }[] = [
  { value: "Efectivo", icon: "payments" },
  { value: "Tarjeta", icon: "credit_card" },
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

  if (!usuario) return <Loader label={tr("Cargando perfil...")} />;

  const nombreCompleto = [nombres.nombre, nombres.nombre2, nombres.apellido, nombres.apellido2]
    .map((n) => n.trim())
    .filter(Boolean)
    .join(" ");

  const toggleMetodo = (m: MetodoPago) =>
    setMetodos((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const guardar = async () => {
    if (!nombres.nombre.trim() || !nombres.apellido.trim())
      return setError(tr("El primer nombre y el primer apellido son obligatorios."));
    if (!/^\d{8}$/.test(contacto.telefono)) return setError(tr("El teléfono debe tener 8 dígitos."));
    if (!zonaTexto) return setError(tr("Selecciona tu distrito."));
    if (metodos.length === 0) return setError(tr("Selecciona al menos un método de pago."));

    setGuardando(true);
    setError(null);
    try {
      await api.usuario.actualizar({
        nombre: nombreCompleto,
        telefono: contacto.telefono,
        correo: contacto.correo.trim(),
        cedula: contacto.cedula.trim(),
        zona: zonaTexto,
        lat: distrito?.lat,
        lng: distrito?.lng,
        metodosPago: metodos,
      });
      await refrescarUsuario();
      mostrarToast(tr("Perfil actualizado"));
      navigate("/perfil");
    } catch {
      setError(tr("No se pudo guardar. Verifica que el servidor esté corriendo."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Editar perfil")}
        subtitle={tr("Mantén tu información visible para clientes.")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-4 px-5 pt-2">
        <Card className="flex items-center gap-3.5">
          <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-aire-lg bg-aire-accent-soft">
            <Icon name="person" filled size={38} className="text-aire-accent-text" />
          </span>
          <div className="grid min-w-0 gap-0.5">
            <span className="aire-text-eyebrow text-aire-ink-2">{tr("PERFIL PUBLICO")}</span>
            <span className="aire-text-title-3 truncate text-aire-ink">{nombreCompleto || tr("Tus datos")}</span>
            <span className="aire-text-footnote truncate text-aire-ink-2">{zonaTexto}</span>
          </div>
        </Card>

        <Card className="grid gap-3">
          <h2 className="aire-text-title-3 text-aire-ink">{tr("Nombre")}</h2>
          <Input placeholder={tr("Primer nombre")} value={nombres.nombre} onChange={(e) => setNombres({ ...nombres, nombre: e.target.value })} />
          <Input placeholder={tr("Segundo nombre")} value={nombres.nombre2} onChange={(e) => setNombres({ ...nombres, nombre2: e.target.value })} />
          <Input placeholder={tr("Primer apellido")} value={nombres.apellido} onChange={(e) => setNombres({ ...nombres, apellido: e.target.value })} />
          <Input placeholder={tr("Segundo apellido")} value={nombres.apellido2} onChange={(e) => setNombres({ ...nombres, apellido2: e.target.value })} />
        </Card>

        <Card className="grid gap-3">
          <h2 className="aire-text-title-3 text-aire-ink">{tr("Contacto")}</h2>
          <Input
            type="tel"
            inputMode="numeric"
            icon="call"
            maxLength={8}
            placeholder={tr("Teléfono")}
            value={contacto.telefono}
            onChange={(e) => setContacto({ ...contacto, telefono: e.target.value.replace(/\D/g, "") })}
          />
          <Input type="email" icon="mail" placeholder={tr("Correo")} value={contacto.correo} onChange={(e) => setContacto({ ...contacto, correo: e.target.value })} />
          <Input icon="badge" placeholder={tr("Cédula (opcional)")} value={contacto.cedula} onChange={(e) => setContacto({ ...contacto, cedula: e.target.value })} />
        </Card>

        <Card className="grid gap-3">
          <div>
            <h2 className="aire-text-title-3 text-aire-ink">{tr("Ubicación")}</h2>
            <p className="aire-text-footnote text-aire-ink-2">{tr("Selecciona el distrito y ajusta el pin si necesitas una ubicación más exacta.")}</p>
          </div>
          <Input
            readOnly
            icon="location_on"
            placeholder={tr("Selecciona tu distrito")}
            value={distrito ? `${distrito.nombre}, ${distrito.canton}` : zonaTexto}
            onClick={() => setPickerOpen(true)}
            trailing={<Icon name="expand_more" size={22} />}
            style={{ cursor: "pointer" }}
          />
          <LocationPreview center={distrito ? [distrito.lat, distrito.lng] : null} text={zonaTexto || tr("Ajusta tu ubicación en el mapa")} />
        </Card>

        <Card className="grid gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="aire-text-title-3 text-aire-ink">{tr("Métodos de pago")}</h2>
              <p className="aire-text-footnote text-aire-ink-2">{tr("Elige como prefieres recibir pagos.")}</p>
            </div>
            <span className="aire-text-footnote shrink-0 font-semibold text-aire-accent-text">{tr("{n} seleccionados", { n: metodos.length })}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {METODOS.map((m) => (
              <SelectableCard key={m.value} icon={m.icon} text={tr(m.value)} selected={metodos.includes(m.value)} onClick={() => toggleMetodo(m.value)} />
            ))}
          </div>
        </Card>

        {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}

        <Button loading={guardando} onClick={guardar}>
          {tr("Guardar cambios")}
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
