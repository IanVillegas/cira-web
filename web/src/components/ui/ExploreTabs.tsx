import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

const TABS = [
  { to: "/explorar", label: "Trabajos" },
  { to: "/trabajadores", label: "Trabajadores" },
  { to: "/publicaciones", label: "Mis publicaciones" },
  { to: "/mis-trabajos", label: "Mis trabajos" },
];

/** Réplica de CiraExploreTabs: píldora blanca con borde; la pestaña activa va en acento. */
export function ExploreTabs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // La tira se desplaza horizontalmente: mantener visible la pestaña activa.
  useEffect(() => {
    const container = containerRef.current;
    const active = container?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!container || !active) return;
    container.scrollLeft = active.offsetLeft - (container.clientWidth - active.clientWidth) / 2;
  }, [pathname]);

  return (
    <div ref={containerRef} className="no-scrollbar overflow-x-auto px-5">
      <div className="inline-flex gap-0.5 rounded-[21px] border border-cira-border bg-cira-card p-0.5">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-[18px] px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                isActive ? "bg-cira-accent text-white" : "text-cira-text-primary"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
