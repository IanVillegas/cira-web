import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Loader, PageHeader, Stagger } from "@/components/aire";
import { Vacio } from "@/components/Vacio";
import { WorkerCard } from "@/components/WorkerCard";
import { api } from "@/lib/api";
import { tr } from "@/lib/i18n";
import type { Trabajador } from "@/lib/types";

/** "Mis trabajadores de confianza": gente guardada para recontratar, chatear o recomendar. */
export function DeConfianzaPage() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Trabajador[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.favoritos
      .listar()
      .then(setLista)
      .catch(() => setError(true));
  }, []);

  const actualizar = (t: Trabajador) =>
    // Al quitar el corazón, la persona sale de la lista.
    setLista((prev) => (t.deConfianza ? prev?.map((x) => (x.id === t.id ? t : x)) : prev?.filter((x) => x.id !== t.id)) ?? prev);

  return (
    <div className="pb-6">
      <PageHeader
        title={tr("De confianza")}
        subtitle={tr("Tus trabajadores guardados para volver a contratar.")}
        onBack={() => navigate(-1)}
        backLabel={tr("Atrás")}
      />

      <div className="grid gap-3 px-5 pt-2">
        {error ? (
          <Vacio image="empty_no_signal" title={tr("Sin conexión")} message={tr("No se pudo conectar con el servidor local (CIRA-Server).")} />
        ) : lista === null ? (
          <Loader label={tr("Cargando...")} />
        ) : lista.length === 0 ? (
          <Vacio
            title={tr("Todavía no tienes trabajadores de confianza")}
            message={tr("Toca el corazón en un trabajador para guardarlo y recontratarlo cuando lo necesites.")}
            action={
              <Button variant="secondary" icon="group" onClick={() => navigate("/trabajadores")}>
                {tr("Explorar trabajadores")}
              </Button>
            }
          />
        ) : (
          <Stagger className="grid gap-3">
            {lista.map((t) => (
              <WorkerCard key={t.id} trabajador={t} modo="confianza" onChange={actualizar} />
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
