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
- Textos de interfaz en español, de tú, con mayúscula inicial; las MAYÚSCULAS solo en etiquetas `aire-text-eyebrow`.

## Pantallas existentes

Las pantallas actuales usan `components/ui/` y los tokens `cira-*` de `web/src/index.css`. No las cambies salvo que la tarea lo pida; si la tarea pide rediseñar una, migrala completa a Aire.
