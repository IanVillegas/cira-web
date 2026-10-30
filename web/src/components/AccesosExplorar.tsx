import { useNavigate } from "react-router-dom";
import { IconTabs } from "@/components/aire";
import { tr } from "@/lib/i18n";

// Accesos rápidos de la pantalla de inicio de Explorar. Trabajos y Trabajadores ya
// están en la misma pantalla (con "Ver todos"), así que aquí van las secciones propias.
const ACCESOS = [
  { value: "/mis-trabajos", label: "Mis trabajos", icon: "assignment_turned_in" },
  { value: "/publicaciones", label: "Mis publicaciones", icon: "campaign" },
  { value: "/agenda", label: "Agenda", icon: "calendar_month" },
  { value: "/de-confianza", label: "De confianza", icon: "favorite" },
];

/** Fila de círculos con ícono que lleva a Mis trabajos, Mis publicaciones, Agenda y De confianza. */
export function AccesosExplorar() {
  const navigate = useNavigate();
  return (
    <IconTabs
      items={ACCESOS.map((a) => ({ value: a.value, label: tr(a.label), icon: a.icon }))}
      value=""
      onChange={(v) => navigate(v)}
      label={tr("Accesos rápidos")}
    />
  );
}
