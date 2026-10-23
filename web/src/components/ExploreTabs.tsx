import { useLocation, useNavigate } from "react-router-dom";
import { SegmentedControl } from "@/components/aire";
import { tr } from "@/lib/i18n";

const TABS = [
  { value: "/explorar", label: "Trabajos" },
  { value: "/trabajadores", label: "Trabajadores" },
  { value: "/publicaciones", label: "Mis publicaciones" },
  { value: "/mis-trabajos", label: "Mis trabajos" },
];

/** Secciones de Explorar: control segmentado que sigue la ruta actual. */
export function ExploreTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const actual = TABS.find((t) => pathname.startsWith(t.value))?.value ?? TABS[0].value;
  return (
    <SegmentedControl
      items={TABS.map((t) => ({ value: t.value, label: tr(t.label) }))}
      value={actual}
      onChange={(v) => navigate(v)}
      label={tr("Explorar")}
    />
  );
}
