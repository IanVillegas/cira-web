import { useLocation, useNavigate } from "react-router-dom";
import { IconTabs } from "@/components/aire";
import { tr } from "@/lib/i18n";

const TABS = [
  { value: "/explorar", label: "Trabajos", icon: "work" },
  { value: "/trabajadores", label: "Trabajadores", icon: "engineering" },
  { value: "/mis-trabajos", label: "Mis trabajos", icon: "assignment_turned_in" },
  { value: "/publicaciones", label: "Mis publicaciones", icon: "campaign" },
];

/** Secciones de Explorar: círculos con ícono atados a la ruta actual (sin scroll). */
export function ExploreTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const actual = TABS.find((t) => pathname.startsWith(t.value))?.value ?? TABS[0].value;
  return (
    <IconTabs
      items={TABS.map((t) => ({ value: t.value, label: tr(t.label), icon: t.icon }))}
      value={actual}
      onChange={(v) => navigate(v)}
      label={tr("Explorar")}
    />
  );
}
