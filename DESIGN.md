# CIRA Aire — sistema de diseño

El lenguaje visual de CIRA con la claridad de Apple: fondo gris perla, tarjetas blancas casi planas, un único azul de acción, píldoras, vidrio en las barras y movimiento con resorte. La interfaz se aparta para que se vean los trabajos y las personas; el movimiento confirma cada toque.

Esta guía es la fuente de verdad para cualquier interfaz nueva o rediseñada de `web/`. La versión navegable, con ejemplos interactivos en tema claro y oscuro, está en el artefacto «CIRA Aire» de claude.ai.

## Dónde está

| Qué | Archivo |
|---|---|
| Componentes React (TSX, sin dependencias nuevas) | `web/src/components/aire/` — impórtalos desde `@/components/aire` |
| Tokens (variables CSS `--aire-*`), estilos de texto `.aire-text-*` y estilos de los componentes (`.ca-*`) | `web/src/components/aire/aire.css` |
| Tokens como utilidades de Tailwind (`bg-aire-accent`, `rounded-aire-lg`…) | `web/src/components/aire/aire-tailwind.css` |
| Ambos se cargan desde | `web/src/index.css` |

**Por qué el prefijo `--aire-`:** Tailwind 4 ya usa `--radius-*`, `--font-sans`, `--ease-out` y `--shadow-*`. Con el prefijo, Aire convive con los tokens `cira-*` actuales sin cambiar ninguna pantalla existente.

**Contenedor:** envuelve la pantalla (o la app) en un elemento con `className="ca-root"`: fija fondo, fuente y color de texto. Para el tema oscuro, pon `data-theme="dark"` en `<html>` o en el contenedor.

## Principios

- **Un solo color de acción.** `aire-accent` marca lo que se puede tocar y lo que está activo: botón principal, pestaña, interruptor, foco. El resto es tinta (`aire-ink`, `aire-ink-2`) sobre `aire-bg` y `aire-surface`. No hay degradados decorativos.
- **Profundidad por superficie, no por sombra.** Las pantallas son `aire-bg`, el contenido va en `aire-surface` (tarjetas) y lo interno en `aire-surface-2`. Solo flota lo que de verdad flota: la barra inferior y los avisos de vidrio (`aire-glass`) y las hojas (`aire-shadow-float`).
- **Cada toque responde.** Todo lo que se puede presionar se encoge a `--aire-press-scale` (0.97) y vuelve con `--aire-ease-pop`. Los cambios de estado se deslizan con `--aire-ease-spring` y lo que aparece entra con `--aire-ease-out`.
- **Táctil primero.** Ningún control mide menos de 44px (`--aire-hit-target`). El texto principal va a 17px.

## Color

| Token (`--aire-…` / Tailwind `…-aire-…`) | Claro | Oscuro | Uso |
|---|---|---|---|
| `bg` | `#f5f5f7` | `#000000` | Fondo de la app |
| `surface` | `#ffffff` | `#1c1c1e` | Tarjetas, hojas, campos |
| `surface-2` | `#fafafc` | `#2c2c2e` | Bloques dentro de una tarjeta, celdas |
| `surface-3` | `#e8e8ed` | `#3a3a3c` | Rellenos neutros, pista del segmentado, skeleton |
| `ink` | `#1d1d1f` | `#f5f5f7` | Títulos y texto principal |
| `ink-2` | `#6e6e73` | `#a1a1a6` | Texto secundario (4.6:1 o más) |
| `ink-3` | `#86868b` | `#6e6e73` | Solo placeholders y deshabilitado (3.3:1, nunca texto que haya que leer) |
| `hairline` | `#0000001a` | `#ffffff24` | Bordes y divisores de 1px |
| `brand` | `#3e7be1` | `#3e7be1` | Azul exacto de CIRA: isotipo, ilustraciones, texto de 24px o más |
| `accent` / `on-accent` | `#2f6fdc` / blanco | igual | Botón principal, estados activos (4.7:1 con blanco) |
| `accent-text` | `#2867d1` | `#5aa2ff` | Enlaces y texto de acento |
| `accent-soft` | `#e8f0fd` | `#0f2a52` | Fondos de selección (chip activo, ícono destacado) |
| `success` / `-text` / `-soft` | `#34c759` / `#1d7f45` / `#e3f6e8` | `#30d158` / `#4cd77a` / `#0d2e18` | Éxito: relleno / texto / fondo |
| `warning` / `-text` / `-soft` | `#ff9f0a` / `#a65200` / `#fff1dc` | `#ff9f0a` / `#ffb340` / `#33230a` | Advertencia |
| `danger` / `-text` / `-soft` | `#ff3b30` / `#d70015` / `#ffe8ea` | `#ff453a` / `#ff6961` / `#3a1012` | Error y acciones destructivas |
| `glass` / `glass-border` | `#f5f5f7b8` / `#ffffffb3` | `#1c1c1eb8` / `#ffffff1a` | Barras y avisos de vidrio |
| `scrim` | `#00000059` | `#0000008c` | Velo detrás de hojas |
| `focus` | `#2f6fdc80` | `#5aa2ff99` | Anillo de foco de 3px |

- Nunca escribas un hex en un componente: usa `var(--aire-…)` o la clase de Tailwind (`bg-aire-surface`, `text-aire-ink-2`, `border-aire-hairline`).
- Los colores de estado (`success`, `warning`, `danger`) son rellenos y puntos; para texto usa su versión `-text`. Siempre acompaña el color con una palabra o un ícono.

## Tipografía

Fuente del sistema Apple (SF Pro) en iPhone y Mac, e Inter en el resto (`--aire-font-sans`, `--aire-font-display`). Usa las clases `aire-text-<estilo>`:

| Clase | Tamaño / peso | Uso |
|---|---|---|
| `aire-text-large-title` | 34 / 700 | Título de las secciones principales |
| `aire-text-title-1` · `-title-2` · `-title-3` | 28 · 22 · 20 / 600–700 | Hojas, tarjetas destacadas |
| `aire-text-headline` | 17 / 600 | Nombres en tarjetas y filas |
| `aire-text-body` | 17 / 400 | Texto principal |
| `aire-text-callout` · `-subhead` | 16 · 15 / 400 | Botones, texto secundario |
| `aire-text-footnote` · `-caption` | 13 · 12 | Metadatos (distancia, fecha) |
| `aire-text-eyebrow` | 11 / 600, mayúsculas | Categoría, etiqueta de campo |
| `aire-text-figure` | 32 / 700 | Montos y cifras |

Interletrado negativo en todo texto de 15px o más; ya viene en cada clase.

## Espacio, forma y sombra

- Espaciado (`--aire-space-1` … `--aire-space-12`): 4, 8, 12, 16, 20, 24, 32, 48. Márgenes de pantalla de 20px, relleno de tarjeta de 16px, 12px entre tarjetas y 32px entre secciones.
- Radios (`rounded-aire-*`): `sm` 12 (inputs), `md` 16 (íconos contenedores, bloques internos), `lg` 22 (tarjetas), `xl` 32 (hojas, barra inferior) y `full` (botones, chips, controles).
- Sombras (`shadow-aire-*`): `card` en reposo (casi nada), `lift` al interactuar, `float` para lo que flota, `thumb` en pulgares y `accent` solo en el botón principal.

## Movimiento

| Momento | Duración | Curva | Ejemplo |
|---|---|---|---|
| Presionar | `--aire-dur-instant` (100ms) al hundirse, `--aire-dur-base` al volver | `--aire-ease-pop` | `Button`, `Card interactive`, chips |
| Cambiar de estado | `--aire-dur-base` (320ms) | `--aire-ease-spring` | píldora de `SegmentedControl` y `TabBar` |
| Confirmar | `--aire-dur-base` | `--aire-ease-pop` | check de `SelectableCard`, `Switch`, `Badge` |
| Aparecer | `--aire-dur-slow` (480ms), escalonado cada 45ms | `--aire-ease-out` | `Reveal`, `Stagger`, título de `PageHeader` |
| Hojas | `--aire-dur-sheet` (560ms) | `--aire-ease-spring` | `Sheet` |
| Avisar | `--aire-dur-slow` | `--aire-ease-pop` | `Toast` |
| Error | 420ms | sacudida | `Input` y `PinInput` con `error` |

- Anima solo `transform` y `opacity` (y `grid-template-rows` de `0fr` a `1fr` para expandir); nunca `top`, `left`, `height` ni `width` en listas.
- En Tailwind: `transition-transform duration-[320ms] ease-aire-spring`.
- Las listas que llegan con datos aparecen con `<Stagger>`; al cambiar de pestaña, cambia la `key` del `Stagger` para repetir la cascada.
- Con «reducir movimiento» activado en el sistema, todo cambia de forma instantánea; `aire.css` y `Reveal` ya lo respetan. No agregues animaciones que se salten esa regla.

## Componentes

| Componente | Reemplaza a (en `components/ui/`) | Props clave |
|---|---|---|
| `Button` | `Button` | `variant` (`primary`, `secondary`, `tinted`, `outlined`, `destructive`, `plain`), `size` (`sm`, `md`, `lg`), `icon`, `loading`, `fullWidth` (por defecto `true`) |
| `Card` | `Card` | `interactive` (con `onClick`), `inset` (bloque interno), `padding` |
| `Input`, `TextArea` | `Input`, `TextArea`, `SelectField`, `DateTimeField`, `BudgetField` | `label`, `icon`, `prefix` («₡»), `trailing`, `hint`, `error` |
| `Field`, `FieldCaption` | `Field`, `FieldCaption` | `label`, `hint` |
| `Badge` | `Badge` | `tone` (`accent`, `success`, `warning`, `danger`, `neutral`), `dot`, `pulse` |
| `Switch` | `Switch` | `checked`, `onChange`, `label` |
| `SelectableCard` | `SelectableCard` | `icon`, `text`, `selected`, `onClick` |
| `FilterChip` | `FilterChip` | `label`, `active` |
| `SegmentedControl` | `ExploreTabs` | `items` (`{ value, label }`), `value`, `onChange`, `fullWidth`, `gutter` (margen lateral de 20px que se desplaza con el contenido) |
| `PinInput` | `PinInput` | igual que hoy + `error` |
| `PageHeader` | `PageHeader` | `title`, `subtitle` (una sola línea), `onBack`, `backLabel`, `action` (`{ icon, label, onClick }`), `large`, `reserveBar` (reserva la barra superior para que los títulos de sección queden a la misma altura) |
| `EmptyState` | `EmptyState` | `title`, `message`, `image` (`/images/empty_*.svg`), `action` |
| `Loader`, `Spinner`, `Skeleton` | `Loader` | `Skeleton`: `width`, `height`, `radius`, `lines` |
| `TabBar` | `BottomNav` | `items` (`{ key, label, icon, badge? }`), `value`, `onChange`, `floating`. `badge` pinta un contador rojo (mensajes sin leer) |
| `Sheet` | `DistrictPickerSheet` y similares | `open`, `onClose`, `title`, `subtitle`, `contained` |
| `Toast` | nuevo | `open`, `message`, `tone`, `icon`, `onClose`, `duration`, `onPress` (tocar el aviso hace algo, p. ej. abrir un chat) |
| `Dialog` | `SuccessModal` | `open`, `onClose`, `title`, `message`, `icon`, `tone` (`success`, `accent`, `danger`), `actions`, `contained`; el contenido extra va como `children` |
| `CreditCard` | nuevo | `brand`, `number`, `holder`, `expiry`, `cvv`, `flipped`, `onClick`, `labels`; tarjeta realista con chip y reverso que gira 180° al cambiar `flipped` (en táctil: al tocarla o al enfocar el CVV) |
| `Fab` | nuevo | `icon`, `label` (accesible, obligatoria), `onClick`; círculo de 56px para la acción principal de una lista |
| `Reveal`, `Stagger` | nuevos | `effect` (`up`, `scale`, `fade`), `delay`, `step` |
| `Icon` | `Icon` | `name` (Material Symbols Rounded), `filled`, `size` |
| `Calendar` | nuevo | `year`, `month`, `value`, `onChange`, `onMonthChange`, `marks`, `blocked`, `today`, `locale`, `labels` |

Con React Router:

```tsx
import { useLocation, useNavigate } from "react-router-dom";
import { TabBar } from "@/components/aire";

const TABS = [
  { key: "/mapa", label: "Mapa", icon: "map" },
  { key: "/explorar", label: "Explorar", icon: "explore" },
  { key: "/chats", label: "Chats", icon: "chat_bubble" },
  { key: "/perfil", label: "Perfil", icon: "person" },
];

export function AppTabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const value = TABS.find((t) => pathname.startsWith(t.key))?.key ?? "/explorar";
  return <TabBar items={TABS} value={value} onChange={navigate} />;
}
```

Tarjeta de trabajo típica:

```tsx
<Card className="grid gap-3">
  <p className="aire-text-eyebrow text-aire-accent-text">Jardinería</p>
  <p className="aire-text-headline">Corte de césped y poda</p>
  <p className="aire-text-figure">₡25 000</p>
  <Badge tone="warning" dot>Urgente</Badge>
  <div className="grid grid-cols-2 gap-2.5">
    <Button variant="secondary" icon="chat_bubble">Contactar</Button>
    <Button loading={enviando} onClick={postular}>Postularme</Button>
  </div>
</Card>
```

### Tarjeta de trabajo con foto (`JobCard`)

Única excepción a «sin degradados»: el degradado no decora, es el velo que hace legible el texto sobre la foto. Cada categoría tiene su foto en `web/public/images/categorias/<slug>.webp` (640×800, WebP) y su tono `--aire-cat-<slug>`; el mapeo está en `web/src/lib/categorias.ts` (las categorías sin foto, como Cerrajería, usan `--aire-cat-default`). Sobre la foto el texto usa `--aire-on-photo` / `--aire-on-photo-2`, los chips `--aire-photo-chip` y las píldoras `--aire-photo-glass`. La acción principal usa `Button variant="photo"` (o `"photo-soft"` para retirar la postulación); las secundarias son botones de ícono de 44px (`.ca-photocard__iconbtn`). Para sumar una foto: agrega la imagen, el token `--aire-cat-<slug>` y la entrada en `categorias.ts`.

En las listas de gestión (Mis publicaciones, Mis trabajos, Historial) la foto aparece como miniatura de 48px con `CategoriaThumb` (`apagado` la pone en gris para el historial), y en Trabajadores los servicios se muestran con `CategoriaChip`; ambos están en `web/src/components/CategoriaThumb.tsx`. La tarjeta grande con foto se reserva para Explorar.

### De confianza y Recontratar

- `ConfianzaButton` (corazón, `components/`): agrega o quita a alguien de "De confianza"; va en `WorkerCard` y en el perfil público. El corazón activo usa `accent-text` sobre `accent-soft`.
- `WorkerCard modo="confianza"` (pantalla `/de-confianza`): la acción principal es **Recontratar**; Chatear y Recomendar son secundarias.
- `GuardadoPor`: "Guardado por N clientes" en el perfil (solo el número, nunca quiénes).
- Recomendar usa `compartirPerfil` (`lib/compartir.ts`): menú nativo de compartir con el link al perfil en CIRA; nunca expone el teléfono.
- Recontratar abre `/crear-trabajo?para=<id>`: la publicación es una oferta directa que solo ve esa persona (en Mis trabajos, con Aceptar / No puedo). Si la rechaza, queda abierta para todos.

### Modo oscuro

La app elige el tema con `lib/tema.ts` (Cuenta → Apariencia: Automático, Claro u Oscuro; se guarda en `cira.tema`). El tema se aplica con `data-theme` en `<html>`, así que los tokens `--aire-*` cambian solos: cualquier pantalla hecha solo con tokens ya funciona en oscuro. Un script en `index.html` lo aplica antes de pintar para que no parpadee. Excepciones en `index.css`: las teselas del mapa se invierten y el patrón del login se atenúa. Los tonos de categoría y los textos sobre foto (`--aire-cat-*`, `--aire-on-photo*`) son iguales en ambos temas.

### Verificación de documentos

Cuenta → Verificación (`/cuenta/verificacion`). Cada documento es una tarjeta con su estado en `Badge`: Sin enviar (`neutral`), En revisión (`warning`, con `pulse`), Verificada (`success`) y Vencida (`danger`). Los flujos van en `Sheet`: la cédula pide fotos del frente y del reverso (en el teléfono abre la cámara), simula la lectura y muestra los datos para confirmar; la hoja de delincuencia pide el archivo y la fecha de emisión. Las imágenes solo se ven en el teléfono (vista previa local) y nunca se envían. Las insignias «Cédula verificada» y «Hoja de delincuencia al día» salen de aquí; sin cédula verificada, la tarjeta de una urgencia muestra «Verifica tu cédula» en lugar de «Aceptar urgencia». El Perfil muestra un recordatorio si la hoja venció o falta la cédula.

### Trueque

- Al publicar, **Trueque** es una tercera `SelectableCard` junto a Efectivo y Tarjeta; abre «¿Qué ofreces a cambio?» y el diferencial opcional. El plan gratis ve su cupo del mes; sin cupo, el aviso va en `warning-soft` con el enlace al Plan Plus.
- En `JobCard`, la píldora del precio dice «Trueque» (+ diferencial) y lo ofrecido va en un bloque `.ca-photocard__swap`. Postularse abre `PostularTruequeSheet` (aceptar lo ofrecido o proponer otra cosa).
- `AcuerdoTrueque` muestra las dos partes del trato (quién hace qué y cuándo) con un check por parte cumplida; lo ven el publicador y el trabajador.
- En `RatingSheet`, un trueque pide además «¿Cumplió su parte?»; en el perfil público el comentario lleva la insignia «Cumplió / No cumplió el trueque».

### Agenda

- `Calendar` (`components/aire/Calendar.tsx`, clases `.ca-cal*`): calendario mensual, semanas de lunes a domingo, días de 44px. Props: `year`, `month`, `value`, `onChange`, `onMonthChange`, `marks` (hasta tres puntos por día: `accent` trabajo propio, `success` servicio contratado, `warning` falta reemplazo, `neutral` hecho), `blocked` (días con fondo `surface-3`), `today`, `locale`, `labels`. El día elegido lleva `accent`.
- `DisponibilidadStrip` (`components/`): las próximas tres semanas de otra persona como píldoras `.ca-daypill` (punto `success` libre, `danger` ocupado); nunca muestra qué ni con quién.
- `VisitaInfo`: insignias de servicio recurrente («Cada viernes») y propiedad; con `instrucciones`, el bloque de instrucciones para quien hace el trabajo.
- `ReemplazoVisita`: aviso en `warning-soft` y sugerencias de reemplazo (los «De confianza» primero) cuando el trabajador cancela una visita.
- Fechas: siempre con `fechaTrabajo()` / `fechaDia()` / `diaLargo()` de `lib/fechas.ts` («Mañana, 9:00 a. m.»); nunca muestres la fecha ISO cruda.

## Voz y contenido

- Habla de tú, con verbos claros: «Postularme», «Publicar trabajo», «Elegir distrito».
- Botones y pestañas en mayúscula inicial. Las MAYÚSCULAS quedan solo para `aire-text-eyebrow` y `FieldCaption`: «PAGO ESTIMADO», «JARDINERÍA».
- Montos en colones con espacio de miles: «₡25 000».
- Los estados vacíos dicen qué pasa y qué hacer.
- Sin emoji en la interfaz.

## Íconos e imágenes

- Material Symbols Rounded (ya cargada en `index.html` con los ejes de relleno y peso). Contorno en estado normal y relleno en activo o seleccionado.
- Isotipo: `web/public/images/cira_isotipo_outline_blue.svg`. Ilustraciones de estados vacíos: `web/public/images/empty_*.svg`.

## Componentes de la app construidos sobre Aire

Viven en `web/src/components/` (no en `aire/`) porque dependen de la lógica de CIRA, pero solo usan componentes y tokens de Aire:

| Componente | Para qué |
|---|---|
| `SelectSheet` | Selector de una opción: campo de solo lectura que abre una `Sheet` con la lista (categorías) |
| `Vacio` | `EmptyState` con la ilustración elegida por nombre (`empty_no_signal`, …) |
| `ExploreTabs` | `SegmentedControl` de Explorar atado a la ruta |
| `ToastHost` y `lib/toast.ts` | `mostrarToast(texto, tipo, accion?)` desde cualquier lugar; el host muestra el aviso más reciente con `Toast` |
| `JobCard`, `WorkerCard`, `PublicacionCard`, `JobStatusCard` | Tarjetas de trabajo y personas (una acción principal por tarjeta) |
| `PagarSheet`, `RatingSheet`, `ReportSheet`, `DistrictPickerSheet` | Hojas de pago con propina, calificación, reporte y distrito |

- Las rejillas `grid` de una columna miden como mucho el ancho disponible (regla global en `index.css`): un texto con `truncate` no ensancha la tarjeta.

## Migración

Toda la interfaz de `web/` ya usa Aire: se eliminó `components/ui/` y los tokens `cira-*`. Si agregas una pantalla o un componente nuevo, usa Aire y envuélvelo en el marco `ca-root` que ya pone `PhoneFrame`. Las hojas y diálogos se montan con `contained` para quedar dentro del marco del teléfono.
