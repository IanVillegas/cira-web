import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { IconTabs, PageHeader } from "@/components/aire";
import { tr } from "@/lib/i18n";

/** Las cuatro secciones "propias": lo que hago, lo que publiqué, mi agenda y mi gente de confianza. */
const SECCIONES = [
  {
    ruta: "/mis-trabajos",
    etiqueta: "Mis trabajos",
    icono: "assignment_turned_in",
    titulo: "Mis trabajos",
    subtitulo: "Consulta y gestiona tus trabajos activos.",
    accion: { icon: "history", label: "Ver historial", to: "/historial" },
  },
  {
    ruta: "/publicaciones",
    etiqueta: "Mis publicaciones",
    icono: "campaign",
    titulo: "Mis publicaciones",
    subtitulo: "Consulta y administra tus publicaciones.",
  },
  {
    ruta: "/agenda",
    etiqueta: "Agenda",
    icono: "calendar_month",
    titulo: "Mi agenda",
    subtitulo: "Lo que harás y lo que contrataste.",
    accion: { icon: "home_work", label: "Mis propiedades", to: "/cuenta/propiedades" },
  },
  {
    ruta: "/de-confianza",
    etiqueta: "De confianza",
    icono: "favorite",
    titulo: "De confianza",
    subtitulo: "Tus trabajadores guardados para volver a contratar.",
  },
] as const;

/**
 * Mis trabajos, Mis publicaciones, Agenda y De confianza como una sola sección:
 * la franja y la fila de círculos se quedan quietas, el círculo elegido se marca y
 * solo cambian el contenido y el título. Cambiar de opción no suma pasos al "atrás".
 */
export function GestionLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inicio = useRef<HTMLDivElement>(null);
  const actual = SECCIONES.find((s) => pathname.startsWith(s.ruta)) ?? SECCIONES[0];

  // Al cambiar de opción, el contenido nuevo empieza arriba.
  useEffect(() => {
    const scroller = inicio.current?.closest(".overflow-y-auto");
    scroller?.scrollTo({ top: 0 });
  }, [actual.ruta]);

  // "Atrás" vuelve a donde estaba antes de entrar (Explorar o Perfil); si se llegó por un link, a Explorar.
  const volver = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate("/explorar", { replace: true });
  };

  const accion = "accion" in actual ? actual.accion : undefined;

  return (
    <div ref={inicio} className="pb-6">
      <PageHeader
        title={tr(actual.titulo)}
        subtitle={tr(actual.subtitulo)}
        onBack={volver}
        backLabel={tr("Atrás")}
        action={accion ? { icon: accion.icon, label: tr(accion.label), onClick: () => navigate(accion.to) } : undefined}
      />
      <IconTabs
        items={SECCIONES.map((s) => ({ value: s.ruta, label: tr(s.etiqueta), icon: s.icono }))}
        value={actual.ruta}
        onChange={(ruta) => navigate(ruta, { replace: true })}
        label={tr("Mis secciones")}
      />
      <div key={actual.ruta} className="ca-gestion__contenido">
        <Outlet />
      </div>
    </div>
  );
}
