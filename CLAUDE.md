# CIRA — instrucciones para Claude

Monorepo del MVP de CIRA: `web/` (React 19 + TypeScript + Tailwind 4 + Vite) y `server/` (Express + SQLite). Detalles de uso en `README.md`.

## Comandos (en `web/`)

- `npm run dev` — servidor de desarrollo
- `npm run build` — `tsc -b` + build de Vite; debe pasar sin errores antes de dar algo por terminado
- `npm run lint` — oxlint; no agregues advertencias nuevas

## Diseño: CIRA Aire

Toda interfaz nueva o rediseñada sigue **`DESIGN.md`**. Léelo antes de tocar cualquier pantalla o componente visual.

- Usa los componentes de `@/components/aire` (Button, Card, Input, SegmentedControl, TabBar, Sheet, Toast, Stagger…) antes de escribir uno propio. Si falta algo, créalo en `web/src/components/aire/` siguiendo el mismo patrón (clases `ca-*` en `aire.css`, tokens `--aire-*`) y documéntalo en `DESIGN.md`.
- Colores, radios, sombras, tipografía y movimiento salen **solo** de los tokens `--aire-*` (o de sus utilidades de Tailwind `*-aire-*` y las clases `aire-text-*`). No escribas hex, `rounded-2xl`, `shadow-lg`, `text-blue-600` ni curvas de animación inventadas.
- Un solo color de acción (`aire-accent`) y una acción principal por pantalla o tarjeta.
- Todo lo que se puede presionar responde (los componentes ya lo hacen). Anima solo `transform` y `opacity`, con las duraciones y curvas de `DESIGN.md`, y respeta `prefers-reduced-motion`.
- Envuelve cada pantalla de Aire en `className="ca-root"`. No mezcles componentes de `components/ui/` y `components/aire/` en la misma pantalla.
- Controles de al menos 44px, texto principal de 17px, contraste de texto de 4.5:1 o más (`aire-ink-3` nunca para texto que haya que leer).
- Textos de interfaz en español, de tú, con mayúscula inicial; las MAYÚSCULAS solo en etiquetas `aire-text-eyebrow`. Todo texto visible pasa por `tr()` y, si es nuevo, se agrega su traducción en `web/src/lib/i18n/en.ts`.
- Una clase `ca-*` de Aire pisa a las utilidades de Tailwind (están fuera de `@layer`): para cambiar su color o tamaño usa una prop del componente o `style` con un token `var(--aire-…)`, no una clase `text-*`.

## Pantallas

Todas las pantallas de `web/` están hechas con Aire y ya no existen `components/ui/` ni los tokens `cira-*`. Las pantallas viven en `web/src/pages/` y los componentes con lógica de CIRA (tarjetas, hojas de pago/calificación, `SelectSheet`, `Vacio`…) en `web/src/components/`; están listados en `DESIGN.md`. Los avisos se disparan con `mostrarToast` (`@/lib/toast`) y los textos pasan por `tr()` (`@/lib/i18n`, traducciones en `lib/i18n/en.ts`).

Backend (`server/`): login por teléfono o correo con PIN `1234`; el detalle de usuarios, endpoints y parámetros del modelo de negocio está en `server/README.md`.

## Documento de novedades

`docs/novedades-entregable-final.md` es la guía de la exposición final con todo lo que se incorporó desde el commit `9379bfb`. **Cada vez que agregues o cambies una funcionalidad, actualízalo en el mismo commit:** su sección (qué es, problema, cómo funciona, por qué así, qué decir en la exposición y dónde está en el código), las tablas que la mencionen (resumen, Canvas, métricas, real vs. simulado, guion) y una fila nueva en el Registro de cambios. Si el cambio solo se valoró y no está en la app, va en `docs/ideas-innovacion-cira.md`.
