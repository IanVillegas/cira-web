import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Icon, Input, Loader, PageHeader } from "@/components/aire";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";
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
        <div className="flex h-[176px] flex-col justify-between rounded-aire-lg bg-aire-accent p-5 text-aire-on-accent shadow-aire-accent">
          <div className="flex items-center justify-between">
            <Icon name="contactless" size={30} />
            <span className="aire-text-headline">{tarjeta?.marca ?? tr("Sin tarjeta")}</span>
          </div>
          <p className="aire-text-title-2 tracking-[0.18em]">{tarjeta ? `•••• •••• •••• ${tarjeta.ultimos4}` : "•••• •••• •••• ••••"}</p>
          <div className="aire-text-footnote flex items-end justify-between uppercase">
            <span>{tarjeta?.titular ?? tr("Titular")}</span>
            <span>{tarjeta?.vence ?? "MM/AA"}</span>
          </div>
        </div>

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
