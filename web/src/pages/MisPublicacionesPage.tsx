import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, Loader, PageHeader, Stagger } from "@/components/aire";
import { Vacio } from "@/components/Vacio";
import { PublicacionCard } from "@/components/PublicacionCard";
import { RatingSheet } from "@/components/RatingSheet";
import { PagarSheet } from "@/components/PagarSheet";
import { PagoResumen } from "@/components/PagoResumen";
import { mostrarToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { usePolling } from "@/lib/usePolling";
import type { Trabajo } from "@/lib/types";
import { tr } from "@/lib/i18n";

export function MisPublicacionesPage() {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState<Trabajo[] | null>(null);
  const [aCalificar, setACalificar] = useState<Trabajo | null>(null);
  const [aPagar, setAPagar] = useState<Trabajo | null>(null);
  const [pagado, setPagado] = useState<Trabajo | null>(null);

  const cargar = useCallback(
    () => api.trabajos.listar({ publicadas: true }).then(setPublicaciones).catch(() => setPublicaciones((p) => p ?? [])),
    [],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);
  // Para ver el seguimiento (En camino, Llegó…) sin recargar.
  usePolling(cargar, 5000);

  // Una calificación enviada saca el trabajo de la lista si ya estaba pagado.
  const actualizar = (t: Trabajo) =>
    setPublicaciones((prev) =>
      (prev ?? [])
        .map((p) => (p.id === t.id ? t : p))
        .filter((p) => p.estado !== "Cancelado" && (p.estado !== "Finalizado" || !p.pagado || !p.calificadoPorMi)),
    );

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("Mis publicaciones")}
        subtitle={tr("Consulta y administra tus publicaciones.")}
        onBack={() => navigate("/explorar")}
        backLabel={tr("Explorar")}
        large={false}
      />

      <div className="grid gap-3 px-5 pt-4">
        <Button icon="add" onClick={() => navigate("/crear-trabajo")}>
          {tr("Crear publicación")}
        </Button>

        {publicaciones === null ? (
          <Loader label={tr("Cargando publicaciones...")} />
        ) : publicaciones.length === 0 ? (
          <Vacio title={tr("No tienes publicaciones todavía")} message={tr("Crea tu primera publicación para recibir postulantes.")} />
        ) : (
          <Stagger className="grid gap-3">
            {publicaciones.map((trabajo) => (
              <PublicacionCard key={trabajo.id} trabajo={trabajo} onChange={actualizar} onRate={setACalificar} onPay={setAPagar} />
            ))}
          </Stagger>
        )}
      </div>

      <RatingSheet
        trabajo={aCalificar}
        onClose={() => setACalificar(null)}
        onDone={(t) => {
          setACalificar(null);
          actualizar(t);
          mostrarToast(tr("¡Gracias por tu calificación!"));
        }}
      />

      <PagarSheet
        trabajo={aPagar}
        onClose={() => setAPagar(null)}
        onPaid={(t) => {
          setAPagar(null);
          actualizar(t);
          setPagado(t);
        }}
      />

      <Dialog
        open={pagado !== null}
        contained
        onClose={() => setPagado(null)}
        title={tr("¡Pago realizado!")}
        message={tr("Le pagaste a {nombre}.", { nombre: pagado?.trabajadorNombre ?? "" })}
        actions={
          <>
            <Button
              onClick={() => {
                const t = pagado;
                setPagado(null);
                if (t && !t.calificadoPorMi) setACalificar(t);
              }}
            >
              {tr("Calificar ahora")}
            </Button>
            <Button variant="plain" onClick={() => setPagado(null)}>
              {tr("Ahora no")}
            </Button>
          </>
        }
      >
        {pagado && <PagoResumen resumen={pagado.resumenPago} trueque={!!pagado.trueque} />}
      </Dialog>
    </div>
  );
}
