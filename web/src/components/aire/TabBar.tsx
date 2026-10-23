import { useLayoutEffect, useRef, useState } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export interface TabItem {
  key: string;
  label: string;
  icon: string;
  /** Contador rojo sobre el ícono (p. ej. mensajes sin leer); 0 u omitido no muestra nada. */
  badge?: number;
}

export interface TabBarProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  /** Flota como cápsula de vidrio sobre el contenido (por defecto) o queda pegada abajo. */
  floating?: boolean;
}

/**
 * Barra inferior de vidrio (reemplaza a BottomNav). Una burbuja suave se
 * desliza al ítem activo y su ícono se rellena con un pequeño salto.
 * Con React Router: value = sección actual, onChange = navigate(ruta).
 */
export function TabBar({ items, value, onChange, floating = true }: TabBarProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !active) return;
    const measure = () => setPill({ x: active.offsetLeft, w: active.offsetWidth });
    measure();
    // Re-medir si cambia el tamaño de la barra o de cualquier ítem (p. ej. al terminar de cargar la fuente).
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(row);
    row.querySelectorAll("button").forEach((el) => ro?.observe(el));
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      ro?.disconnect();
    };
  }, [value, items.length]);

  return (
    <nav className={cx("ca-tabbar", floating && "is-floating")} aria-label="Navegación principal">
      <div ref={rowRef} className="ca-tabbar__row" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        <span className={cx("ca-tabbar__pill", pill && "is-ready")} style={pill ? { width: pill.w, transform: `translateX(${pill.x}px)` } : undefined} aria-hidden="true" />
        {items.map((it) => {
          const active = it.key === value;
          return (
            <button
              key={it.key}
              type="button"
              className={cx("ca-tabbar__item", active && "is-active")}
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(it.key)}
            >
              <span className="ca-tabbar__icon">
                <Icon name={it.icon} filled={active} size={26} />
                {!!it.badge && it.badge > 0 && (
                  <i className="ca-tabbar__badge" aria-label={String(it.badge)}>
                    {it.badge > 9 ? "9+" : it.badge}
                  </i>
                )}
              </span>
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
