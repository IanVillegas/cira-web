import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Icon, Input, Loader, PageHeader, Sheet, Spinner } from "@/components/aire";
import type { BadgeTone } from "@/components/aire/Badge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { localeActual, tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";
import { usePolling } from "@/lib/usePolling";
import type { EstadoDocumento, Verificacion } from "@/lib/types";

const ESTADO: Record<EstadoDocumento, { texto: string; tono: BadgeTone }> = {
  sin_enviar: { texto: "Sin enviar", tono: "neutral" },
  en_revision: { texto: "En revisión", tono: "warning" },
  verificada: { texto: "Verificada", tono: "success" },
  vencida: { texto: "Vencida", tono: "danger" },
};

const fechaLarga = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(localeActual(), { day: "numeric", month: "long", year: "numeric" });

const hoyIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Cuenta → Verificación: cédula (fotos del frente y reverso) y hoja de delincuencia (archivo y
 * fecha de emisión). Todo es simulado: los archivos no salen del teléfono y la revisión se
 * aprueba sola en unos segundos. Los demás usuarios solo ven las insignias.
 */
export function VerificacionPage() {
  const navigate = useNavigate();
  const { refrescarUsuario } = useAuth();
  const [v, setV] = useState<Verificacion | null>(null);
  const [error, setError] = useState(false);
  const [abierto, setAbierto] = useState<"cedula" | "antecedentes" | null>(null);
  const anterior = useRef<Verificacion | null>(null);
  // refrescarUsuario cambia en cada render del proveedor: se guarda en una ref para no recargar en bucle.
  const refrescar = useRef(refrescarUsuario);
  useEffect(() => {
    refrescar.current = refrescarUsuario;
  });

  const cargar = useCallback(
    () =>
      api.usuario
        .verificacion()
        .then((nueva) => {
          const prev = anterior.current;
          // Aviso cuando una revisión termina mientras la persona está en la pantalla.
          if (prev?.cedula.estado === "en_revision" && nueva.cedula.estado === "verificada") {
            mostrarToast(tr("Tu cédula quedó verificada"));
            refrescar.current();
          }
          if (prev?.antecedentes.estado === "en_revision" && nueva.antecedentes.estado === "verificada") {
            mostrarToast(tr("Tu hoja de delincuencia quedó al día"));
            refrescar.current();
          }
          anterior.current = nueva;
          setV(nueva);
        })
        .catch(() => setError(true)),
    [],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const enRevision = v?.cedula.estado === "en_revision" || v?.antecedentes.estado === "en_revision";
  usePolling(() => enRevision && cargar(), 2000);

  const enviado = (nueva: Verificacion) => {
    anterior.current = nueva;
    setV(nueva);
    setAbierto(null);
    refrescar.current();
    mostrarToast(tr("Documento enviado: lo estamos revisando"), "info");
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Verificación")}
        subtitle={tr("Genera confianza con tus clientes.")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-3 px-5 pt-2">
        <p className="aire-text-footnote flex items-start gap-2 rounded-aire-md bg-aire-surface-2 p-3 text-aire-ink-2">
          <Icon name="lock" size={18} className="mt-px shrink-0 text-aire-accent-text" />
          {tr("Tus documentos no se muestran a nadie: los demás solo ven la insignia en tu perfil. En esta demo los archivos no se guardan.")}
        </p>

        {error ? (
          <p className="aire-text-subhead text-center text-aire-danger-text">{tr("No se pudo conectar con el servidor local (CIRA-Server).")}</p>
        ) : !v ? (
          <Loader label={tr("Cargando...")} />
        ) : (
          <>
            <DocumentoCard
              icon="badge"
              titulo={tr("Cédula de identidad")}
              descripcion={tr("Confirma que eres quien dices ser. Es necesaria para aceptar urgencias.")}
              estado={v.cedula.estado}
              detalle={v.cedula.estado === "verificada" ? tr("Cédula {numero}", { numero: v.cedula.numero }) : undefined}
              accion={v.cedula.estado === "sin_enviar" ? { texto: tr("Verificar cédula"), onClick: () => setAbierto("cedula") } : undefined}
            />

            <DocumentoCard
              icon="description"
              titulo={tr("Hoja de delincuencia")}
              descripcion={tr("Certificado de antecedentes del Poder Judicial. Vale {n} meses desde que se emite.", {
                n: v.antecedentes.vigenciaMeses,
              })}
              estado={v.antecedentes.estado}
              detalle={
                v.antecedentes.venceEl
                  ? v.antecedentes.estado === "vencida"
                    ? tr("Venció el {fecha}", { fecha: fechaLarga(v.antecedentes.venceEl) })
                    : tr("Vigente hasta el {fecha}", { fecha: fechaLarga(v.antecedentes.venceEl) })
                  : undefined
              }
              accion={
                v.antecedentes.estado === "en_revision"
                  ? undefined
                  : {
                      texto:
                        v.antecedentes.estado === "vencida"
                          ? tr("Renovar hoja")
                          : v.antecedentes.estado === "verificada"
                            ? tr("Subir una más reciente")
                            : tr("Subir hoja"),
                      secundaria: v.antecedentes.estado === "verificada",
                      onClick: () => setAbierto("antecedentes"),
                    }
              }
            />
          </>
        )}
      </div>

      <Sheet
        open={abierto === "cedula"}
        onClose={() => setAbierto(null)}
        title={tr("Verificar cédula")}
        subtitle={tr("Usa tu cédula física, en un lugar con buena luz.")}
        contained
      >
        {abierto === "cedula" && v && <FlujoCedula numeroActual={v.cedula.numero} onEnviado={enviado} />}
      </Sheet>

      <Sheet
        open={abierto === "antecedentes"}
        onClose={() => setAbierto(null)}
        title={tr("Hoja de delincuencia")}
        subtitle={tr("Puedes pedirla gratis en línea en el sitio del Poder Judicial.")}
        contained
      >
        {abierto === "antecedentes" && v && <FlujoAntecedentes vigenciaMeses={v.antecedentes.vigenciaMeses} onEnviado={enviado} />}
      </Sheet>
    </div>
  );
}

function DocumentoCard({
  icon,
  titulo,
  descripcion,
  estado,
  detalle,
  accion,
}: {
  icon: string;
  titulo: string;
  descripcion: string;
  estado: EstadoDocumento;
  detalle?: string;
  accion?: { texto: string; onClick: () => void; secundaria?: boolean };
}) {
  const e = ESTADO[estado];
  return (
    <Card className="grid gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-aire-md bg-aire-accent-soft text-aire-accent-text">
          <Icon name={estado === "verificada" ? "verified" : icon} filled={estado === "verificada"} size={26} />
        </span>
        <div className="grid min-w-0 flex-1 gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="aire-text-headline text-aire-ink">{titulo}</p>
            <Badge tone={e.tono} dot pulse={estado === "en_revision"}>
              {tr(e.texto)}
            </Badge>
          </div>
          <p className="aire-text-footnote text-aire-ink-2">{descripcion}</p>
          {detalle && <p className="aire-text-footnote font-semibold text-aire-ink">{detalle}</p>}
        </div>
      </div>
      {estado === "en_revision" && (
        <p className="aire-text-footnote flex items-center gap-2 text-aire-ink-2">
          <Spinner size={16} />
          {tr("Estamos revisando tu documento. Suele tardar unos segundos.")}
        </p>
      )}
      {accion && (
        <Button variant={accion.secundaria ? "secondary" : "primary"} onClick={accion.onClick}>
          {accion.texto}
        </Button>
      )}
    </Card>
  );
}

/** Casilla para tomar o elegir un archivo; en el teléfono abre la cámara trasera. */
function CapturaArchivo({
  etiqueta,
  icono,
  accept,
  capture,
  archivo,
  onChange,
  formato = "foto",
}: {
  etiqueta: string;
  icono: string;
  accept: string;
  capture?: "environment" | "user";
  archivo: File | null;
  onChange: (f: File | null) => void;
  formato?: "foto" | "archivo";
}) {
  // Vista previa local (la imagen nunca sale del teléfono); se libera al cambiarla o al cerrar.
  const [vista, setVista] = useState<string | null>(null);
  const vistaRef = useRef<string | null>(null);
  useEffect(() => () => {
    if (vistaRef.current) URL.revokeObjectURL(vistaRef.current);
  }, []);

  const elegir = (f: File | null) => {
    if (vistaRef.current) URL.revokeObjectURL(vistaRef.current);
    vistaRef.current = f && f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
    setVista(vistaRef.current);
    onChange(f);
  };

  return (
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-aire-md border border-dashed border-aire-hairline bg-aire-surface-2 text-center transition-transform duration-[100ms] ease-aire-pop active:scale-[0.98] ${
        formato === "foto" ? "aspect-[1.586]" : "min-h-24 p-4"
      }`}
    >
      <input
        type="file"
        accept={accept}
        capture={capture}
        className="sr-only"
        onChange={(e) => elegir(e.target.files?.[0] ?? null)}
      />
      {vista ? (
        <>
          <img src={vista} alt={etiqueta} className="absolute inset-0 h-full w-full object-cover" />
          <span className="aire-text-caption absolute right-1.5 bottom-1.5 rounded-aire-full bg-aire-surface px-2 py-1 text-aire-ink shadow-aire-card">
            {tr("Cambiar")}
          </span>
        </>
      ) : archivo ? (
        <>
          <Icon name="task" filled size={28} className="text-aire-success-text" />
          <span className="aire-text-footnote max-w-full truncate px-2 font-semibold text-aire-ink">{archivo.name}</span>
          <span className="aire-text-caption text-aire-accent-text">{tr("Cambiar")}</span>
        </>
      ) : (
        <>
          <Icon name={icono} size={28} className="text-aire-accent-text" />
          <span className="aire-text-footnote font-semibold text-aire-ink">{etiqueta}</span>
        </>
      )}
    </label>
  );
}

function FlujoCedula({ numeroActual, onEnviado }: { numeroActual: string; onEnviado: (v: Verificacion) => void }) {
  const { usuario } = useAuth();
  const [frente, setFrente] = useState<File | null>(null);
  const [reverso, setReverso] = useState<File | null>(null);
  const [paso, setPaso] = useState<"fotos" | "leyendo" | "datos">("fotos");
  const [numero, setNumero] = useState(numeroActual);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "Lectura" simulada de la cédula: una pausa corta antes de mostrar los datos.
  useEffect(() => {
    if (paso !== "leyendo") return;
    const id = window.setTimeout(() => setPaso("datos"), 1400);
    return () => window.clearTimeout(id);
  }, [paso]);

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      onEnviado(await api.usuario.enviarCedula({ numero, frente: !!frente, reverso: !!reverso }));
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo completar la acción."));
    } finally {
      setEnviando(false);
    }
  };

  if (paso === "leyendo") {
    return (
      <div className="grid justify-items-center gap-3 py-8">
        <Spinner size={28} />
        <p className="aire-text-subhead text-aire-ink-2">{tr("Leyendo tu cédula…")}</p>
      </div>
    );
  }

  if (paso === "datos") {
    return (
      <div className="grid gap-4">
        <p className="aire-text-subhead text-aire-ink-2">{tr("Revisa que los datos que leímos sean correctos.")}</p>
        <Input label={tr("Nombre")} value={usuario?.nombre ?? ""} disabled />
        <Input
          label={tr("Número de cédula")}
          icon="badge"
          inputMode="numeric"
          placeholder="1-2345-6789"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          error={error ?? undefined}
        />
        <Button icon="send" loading={enviando} disabled={!numero.trim()} onClick={enviar}>
          {tr("Confirmar y enviar")}
        </Button>
        <Button variant="plain" onClick={() => setPaso("fotos")}>
          {tr("Volver a tomar las fotos")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <CapturaArchivo etiqueta={tr("Frente")} icono="add_a_photo" accept="image/*" capture="environment" archivo={frente} onChange={setFrente} />
        <CapturaArchivo etiqueta={tr("Reverso")} icono="add_a_photo" accept="image/*" capture="environment" archivo={reverso} onChange={setReverso} />
      </div>
      <p className="aire-text-footnote text-aire-ink-2">{tr("Que se lean bien los datos y no haya reflejos.")}</p>
      <Button icon="document_scanner" disabled={!frente || !reverso} onClick={() => setPaso("leyendo")}>
        {tr("Continuar")}
      </Button>
    </div>
  );
}

function FlujoAntecedentes({ vigenciaMeses, onEnviado }: { vigenciaMeses: number; onEnviado: (v: Verificacion) => void }) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [emision, setEmision] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      onEnviado(await api.usuario.enviarAntecedentes({ emision, archivo: archivo?.name ?? "" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo completar la acción."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid gap-4">
      <CapturaArchivo
        etiqueta={tr("Adjuntar PDF o foto")}
        icono="upload_file"
        accept="application/pdf,image/*"
        archivo={archivo}
        onChange={setArchivo}
        formato="archivo"
      />
      <Input
        label={tr("Fecha de emisión")}
        type="date"
        max={hoyIso()}
        value={emision}
        onChange={(e) => setEmision(e.target.value)}
        hint={tr("Debe tener menos de {n} meses.", { n: vigenciaMeses })}
        error={error ?? undefined}
      />
      <Button icon="send" loading={enviando} disabled={!archivo || !emision} onClick={enviar}>
        {tr("Enviar para revisión")}
      </Button>
    </div>
  );
}
