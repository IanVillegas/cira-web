import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CreditCard, Input, Loader, PageHeader } from "@/components/aire";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { marcaDe, numeroEnmascarado } from "@/lib/tarjeta";
import { mostrarToast } from "@/lib/toast";

const soloDigitos = (v: string) => v.replace(/\D/g, "");

function formatearNumero(v: string) {
  return soloDigitos(v).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

function formatearVence(v: string) {
  const d = soloDigitos(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

/** Tarjeta simulada: se valida el formato, pero solo se guardan marca, últimos 4, titular y vencimiento. */
export function TarjetaPage() {
  const navigate = useNavigate();
  const { usuario, refrescarUsuario } = useAuth();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ numero: "", titular: "", vence: "", cvv: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // La tarjeta gira al enfocar el CVV (muestra el reverso) y un momento al tocarla o al guardarla.
  const [cvvEnfocado, setCvvEnfocado] = useState(false);
  const [giroBreve, setGiroBreve] = useState(false);
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  // Al entrar con una tarjeta ya registrada, gira sola una vez (y regresa) para mostrar el reverso.
  const giroAlEntrar = useRef(false);
  const tieneTarjeta = !!usuario?.tarjeta;
  useEffect(() => {
    if (!tieneTarjeta || giroAlEntrar.current) return;
    const t = window.setTimeout(() => {
      giroAlEntrar.current = true;
      girarUnMomento();
    }, 500);
    return () => window.clearTimeout(t);
  }, [tieneTarjeta]);

  const girarUnMomento = () => {
    window.clearTimeout(temporizador.current);
    setGiroBreve(true);
    temporizador.current = window.setTimeout(() => setGiroBreve(false), 2200);
  };

  if (!usuario) return <Loader label={tr("Cargando tarjeta...")} />;
  const tarjeta = usuario.tarjeta;
  const mostrarForm = !tarjeta || editando;

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await api.usuario.guardarTarjeta(form);
      await refrescarUsuario();
      setForm({ numero: "", titular: "", vence: "", cvv: "" });
      setEditando(false);
      mostrarToast(tr("Tarjeta registrada"));
      girarUnMomento();
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("No se pudo guardar la tarjeta."));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!window.confirm(tr("¿Eliminar la tarjeta registrada?"))) return;
    await api.usuario.eliminarTarjeta();
    await refrescarUsuario();
    mostrarToast(tr("Tarjeta eliminada"), "info");
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Mi tarjeta")}
        subtitle={tr("Para pagar con tarjeta y publicar urgencias")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
        large={false}
      />

      <div className="grid gap-4 px-5 pt-2">
        <CreditCard
          brand={mostrarForm ? marcaDe(form.numero) : (tarjeta?.marca ?? "Tarjeta")}
          number={mostrarForm || !tarjeta ? numeroEnmascarado(form.numero) : `•••• •••• •••• ${tarjeta.ultimos4}`}
          holder={mostrarForm || !tarjeta ? form.titular : tarjeta.titular}
          expiry={mostrarForm || !tarjeta ? form.vence : tarjeta.vence}
          cvv={mostrarForm ? "•".repeat(form.cvv.length) : ""}
          flipped={cvvEnfocado || giroBreve}
          onClick={girarUnMomento}
          label={tr("Tarjeta")}
          labels={{ holder: tr("Titular"), expires: tr("Vence"), namePlaceholder: tr("NOMBRE APELLIDO"), fine: tr("CIRA · Tarjeta simulada") }}
        />

        {mostrarForm ? (
          <Card className="grid gap-3">
            <p className="aire-text-subhead text-aire-ink-2">
              {tr("Es una simulación: no se cobra nada real. Puedes usar 4242 4242 4242 4242 con cualquier fecha futura y código.")}
            </p>
            <Input
              inputMode="numeric"
              icon="credit_card"
              placeholder={tr("Número de tarjeta")}
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: formatearNumero(e.target.value) })}
            />
            <Input placeholder={tr("Nombre del titular")} value={form.titular} onChange={(e) => setForm({ ...form, titular: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input inputMode="numeric" placeholder="MM/AA" value={form.vence} onChange={(e) => setForm({ ...form, vence: formatearVence(e.target.value) })} />
              <Input
                inputMode="numeric"
                type="password"
                placeholder="CVV"
                maxLength={4}
                value={form.cvv}
                onFocus={() => setCvvEnfocado(true)}
                onBlur={() => setCvvEnfocado(false)}
                onChange={(e) => setForm({ ...form, cvv: soloDigitos(e.target.value) })}
              />
            </div>
            {error && <p className="aire-text-footnote text-center font-semibold text-aire-danger-text">{error}</p>}
            <Button loading={guardando} onClick={guardar}>
              {tr("Guardar tarjeta")}
            </Button>
            {tarjeta && (
              <Button variant="plain" onClick={() => setEditando(false)}>
                {tr("Cancelar")}
              </Button>
            )}
          </Card>
        ) : (
          <>
            <Button variant="secondary" icon="edit" onClick={() => setEditando(true)}>
              {tr("Cambiar tarjeta")}
            </Button>
            <Button variant="destructive" icon="delete" onClick={eliminar}>
              {tr("Eliminar tarjeta")}
            </Button>
            <Button variant="plain" onClick={() => navigate("/crear-trabajo")}>
              {tr("Crear una publicación")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
