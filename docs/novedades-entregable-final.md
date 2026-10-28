# CIRA — Novedades para el entregable final

Guía de lo que incorporamos a CIRA desde el commit `9379bfb` (cuando empezamos el backlog de ideas y el nuevo diseño) hasta hoy. Sirve para **preparar la exposición**: cada funcionalidad trae el problema que resuelve, cómo se muestra en la demo, por qué la hicimos así y cómo se conecta con el modelo de negocio.

> **Regla del documento:** cada vez que se agregue o cambie una funcionalidad, se actualiza su sección (o se crea una) y se anota en el [Registro de cambios](#13-registro-de-cambios). Las ideas se valoran primero en [`ideas-innovacion-cira.md`](ideas-innovacion-cira.md); aquí solo entra lo que ya está en la app.

**Rama:** `cambios` · **Curso:** Aplicaciones Informáticas Globales (UNA) · **Equipo:** Ian, Marisol, Bayron, Eduardo, José y Jixi

---

## Contenido

1. [Resumen en una página](#1-resumen-en-una-página)
2. [De dónde partimos](#2-de-dónde-partimos)
3. [Hilo de la exposición](#3-hilo-de-la-exposición)
4. [Experiencia y diseño](#4-experiencia-y-diseño)
5. [Confianza entre desconocidos](#5-confianza-entre-desconocidos)
6. [Cómo gana dinero CIRA](#6-cómo-gana-dinero-cira)
7. [Operación del servicio](#7-operación-del-servicio)
8. [Conexión con el Business Model Canvas](#8-conexión-con-el-business-model-canvas)
9. [Métricas que la app permite medir](#9-métricas-que-la-app-permite-medir)
10. [Qué es real y qué es simulado](#10-qué-es-real-y-qué-es-simulado)
11. [Guion de la demo](#11-guion-de-la-demo)
12. [Decisiones descartadas y preguntas probables](#12-decisiones-descartadas-y-preguntas-probables)
13. [Registro de cambios](#13-registro-de-cambios)

---

## 1. Resumen en una página

En esta etapa CIRA pasó de un **mockup interactivo de un solo usuario** a una **app multiusuario con el modelo de negocio funcionando**: varias personas usan la demo a la vez, publican, se postulan, chatean, pagan (simulado), se califican y se verifican. Todo con un sistema de diseño propio.

| Bloque | Qué incorporamos | Por qué importa en la exposición |
|---|---|---|
| **Experiencia** | Sistema de diseño CIRA Aire, Explorar como inicio con filas que se deslizan, tarjetas con foto por categoría, barra flotante, modo oscuro, español/inglés, mapa con pines que informan | La app se ve y se siente como un producto real, no como un prototipo |
| **Confianza** | Calificaciones en ambas direcciones, reportes, verificación de cédula y hoja de delincuencia, "De confianza" | Contratar a un desconocido es el mayor freno del mercado informal |
| **Monetización** | Comisión por pago con tarjeta, tarifa de urgencia, Plan Plus, propina, "Ingresos de CIRA" | El profesor pidió que el modelo de negocio **se vea funcionando**, no solo en el Canvas |
| **Operación** | Multiusuario, Modo Urgencia con alertas, seguimiento tipo Uber, ofertas directas, trueque, **agenda con servicios recurrentes, reemplazos, propiedades y limpieza entre huéspedes** | Cubre el ciclo completo: necesidad → contacto → trabajo → pago → reputación → **siguiente visita** |

**En números:** 26 commits, ~155 archivos cambiados, ~13 000 líneas nuevas, 31 pantallas, ~880 textos traducidos al inglés.

**Mensaje central para la exposición:**
> CIRA conecta a personas que necesitan un servicio con trabajadores independientes de su zona, y resuelve lo que más frena ese mercado: **la desconfianza**. Gana dinero solo cuando aporta valor: cuando el pago pasa por la app, cuando hay una urgencia y cuando un trabajador quiere enterarse primero.

---

## 2. De dónde partimos

**Lo que teníamos al iniciar esta etapa** (Entregable 1 + migración a web):

- La app de Móviles (.NET MAUI) migrada a **React + TypeScript + Tailwind**, con un backend **Express + SQLite** y un **mapa real** (Leaflet + OpenStreetMap, sin costo).
- **Un solo usuario fijo** en el backend: no se podía mostrar la interacción entre cliente y trabajador.
- Métodos de pago SINPE, Transferencia y Efectivo, sin que CIRA participara en el pago.
- Calificaciones y verificaciones **escritas a mano** en los datos de prueba.
- Un diseño heredado de MAUI, con poco control visual.

**Lo que pedía el curso para el entregable final:** demo con el flujo esencial funcionando, uso de cloud o IA, validación con 3 usuarios externos, métricas, **monetización coherente con el Canvas** y roadmap. El profesor aclaró que basta con un mockup interactivo, pero que lo que se muestre tiene que ser coherente con el modelo de negocio (si se cobra comisión, se tiene que ver).

Esa última condición guió casi todas las decisiones de este documento.

---

## 3. Hilo de la exposición

Orden sugerido. Cada paso responde a una pregunta del público:

1. **¿Qué problema hay?** Contratar servicios del hogar a alguien que no conoces da miedo, y el trabajador independiente no tiene cómo demostrar que es confiable.
2. **¿Cómo lo resuelve CIRA?** Explorar trabajos y trabajadores cerca ([§4.3.2](#432-explorar-como-pantalla-de-inicio-filas-que-se-deslizan-y-detalle-en-hoja)), con reputación y verificación visibles ([§5](#5-confianza-entre-desconocidos)).
3. **¿Y si es una emergencia?** Modo Urgencia + seguimiento tipo Uber ([§7.2](#72-modo-urgencia-y-alertas), [§7.3](#73-seguimiento-del-trabajo-tipo-uber)).
4. **¿Cómo gana dinero?** Comisión, urgencia y Plan Plus, mostrados en vivo ([§6](#6-cómo-gana-dinero-cira)).
5. **¿Por qué la gente vuelve?** "De confianza", recontratar y los servicios recurrentes de la agenda ([§5.3](#53-de-confianza-y-recontratar), [§7.6](#76-cira-agenda-servicios-recurrentes-reemplazos-y-propiedades)).
6. **¿Qué nos diferencia?** Trueque de servicios para la comunidad ([§7.5](#75-trueque-de-servicios)).
7. **¿Cómo lo medimos?** Métricas ([§9](#9-métricas-que-la-app-permite-medir)).
8. **Honestidad técnica:** qué es real y qué simulado ([§10](#10-qué-es-real-y-qué-es-simulado)).

---

## 4. Experiencia y diseño

### 4.1 Sistema de diseño CIRA Aire

**Qué es:** un sistema de diseño propio (colores, tipografía, espacios, movimiento y 20+ componentes) con la claridad de las apps de Apple aplicada a la marca de CIRA. Toda la app está hecha con él.

**Problema que resuelve:** en MAUI teníamos poco control visual y cada pantalla se veía distinta. Para que la demo pareciera un producto, necesitábamos consistencia.

**Cómo funciona:**
- Un solo color de acción (el azul de CIRA) marca lo que se puede tocar. El resto es tinta sobre fondo gris perla.
- Todo lo que se presiona responde con una animación corta, y las listas aparecen en cascada.
- Accesibilidad: controles de al menos 44 px, texto principal de 17 px y contraste de 4.5:1. Si el teléfono pide "reducir movimiento", se respeta.
- Componentes listos: botones, tarjetas, campos, hojas inferiores, avisos, barra de pestañas, etc.

**Por qué así:**
- Un sistema de diseño hace que cualquier persona del equipo (o Claude Code) construya pantallas nuevas que se ven igual. Por eso las funcionalidades de las secciones siguientes se pudieron hacer rápido.
- Los colores son *tokens* (`--aire-*`): cambiar uno cambia toda la app. Gracias a eso el modo oscuro ([§4.4](#44-modo-oscuro)) salió casi gratis.

**Qué decir en la exposición:** "Creamos nuestro propio sistema de diseño para que la experiencia sea consistente y accesible; todas las pantallas usan los mismos componentes."

**Dónde está:** `DESIGN.md` (guía), `web/src/components/aire/` · Commits `9743b42`, `e3c414a`, `70dd88b`

---

### 4.2 Tarjetas con la foto de cada categoría

**Qué es:** en Explorar (la hoja de detalle y la lista completa), cada trabajo se muestra con una foto de su categoría (limpieza, plomería, electricidad, jardinería, mudanzas, transporte, mascotas, reparaciones) que se funde en un degradado del color de la foto, con el texto encima.

**Problema que resuelve:** una lista de textos iguales no invita a explorar. La foto permite reconocer el tipo de trabajo de un vistazo, sin leer.

**Cómo funciona:**
- La foto ocupa la parte de arriba; el degradado la funde con un tono oscuro de la misma foto para que el texto se lea.
- Arriba van la categoría y el pago; abajo, título, ubicación, quién publica y su calificación, descripción y fecha.
- Una sola acción principal (Postularme o Aceptar urgencia) y tres secundarias: chat, compartir y mapa.

**Por qué así:**
- **Solo en Explorar.** Es donde hay que "vender" el trabajo. En las pantallas de gestión (*Mis publicaciones*, *Mis trabajos*, *Historial*) lo importante es ver mucho de un vistazo, así que ahí la foto es una **miniatura de 48 px**. En *Historial* va en gris para indicar que es un trabajo cerrado.
- **En Trabajadores no hay foto grande**, porque ahí lo protagonista es la persona: avatar con iniciales y los servicios como chips con mini foto.
- Fotos libres de derechos, comprimidas a WebP (~45 KB cada una).

**Qué decir:** "Diseño expresivo donde el usuario descubre, diseño funcional donde gestiona."

**Dónde está:** `web/src/components/JobCard.tsx`, `CategoriaThumb.tsx`, `lib/categorias.ts` · Commits `55feda1`, `29fd091`

---

### 4.3 Barra de navegación flotante

**Qué es:** la barra inferior es una cápsula de vidrio que flota sobre el contenido; las tarjetas pasan por detrás y se ven a través del vidrio.

**Por qué así:** es el patrón de las apps móviles actuales y le da profundidad a la interfaz. Cada pantalla reserva al final el alto de la barra para que nada quede tapado, y el mapa llega hasta el borde inferior.

**Decisión relacionada:** no agregamos un quinto botón a la barra (por ejemplo, para "De confianza"). La barra es para lo que se usa todos los días (Mapa, Explorar, Chats, Perfil); lo ocasional va dentro de esas pantallas.

**Dónde está:** `web/src/layouts/AppShell.tsx` · Commits `ed68772`, `5655f7e`

---

### 4.3.1 Títulos en la misma línea que los botones

**Qué es:** el título de cada pantalla comparte fila con sus botones: a la izquierda la flecha para volver (un círculo, como el resto de botones), al centro el título y a la derecha la acción de la pantalla (campana de Alertas, historial, ajustes, reportar…). El subtítulo queda debajo, alineado con el título.

**Problema:** antes los botones iban en una fila propia encima del título. En las pantallas principales eso dejaba un hueco vacío a la izquierda de la campana, y en las internas el "‹ Atrás" ocupaba una línea entera solo para él.

**Por qué así:** se gana espacio vertical para el contenido (en el teléfono se ve una tarjeta más) y el encabezado se lee de un vistazo. Es el mismo patrón en las 23 pantallas porque todas usan el mismo componente.

**Franja de color (después):** el encabezado va sobre una **franja del azul de CIRA** con el título, el subtítulo y los botones (círculos blancos) encima; el contenido empieza en una lámina redondeada que "sube" sobre la franja, y la barra del navegador del teléfono toma el mismo azul. Va en todas las pantallas menos **Perfil** (que lleva su foto y datos arriba) y **Mapa** (que es pantalla completa). Así cada pantalla tiene una identidad clara y la marca está presente sin recargar el contenido. *Mis trabajos* y *Mis publicaciones* usan el mismo encabezado que *Agenda* y *De confianza* (título grande y botón atrás).

**Dónde está:** `web/src/components/aire/PageHeader.tsx`, sección "Encabezado" de `web/src/components/aire/aire.css` · Commit `4600a31`

---

### 4.3.2 Explorar como pantalla de inicio: filas que se deslizan y detalle en hoja

**Qué es:** Explorar dejó de ser una lista larga y pasó a ser una **pantalla de inicio**:
1. **Accesos rápidos** en círculos con ícono: *Mis trabajos, Mis publicaciones, Agenda* y *De confianza*.
2. **Urgentes** (solo si hay): las urgencias más cercanas, con la etiqueta roja. "Se lo queda quien acepte primero".
3. **Trabajos:** los 5 más cercanos, en una fila que se desliza a lo ancho.
4. **Trabajadores:** 5, los disponibles primero y entre ellos los mejor calificados (tu propio perfil no aparece).

Cada fila tiene **"Ver todos"** (y una tarjeta final "Ver los N") que abre la **lista completa en vertical**, con sus filtros (*Cercanía* y *Trueques* en trabajos; *Disponibles* y *De confianza* en trabajadores). Las tarjetas de las filas son **compactas y del mismo tamaño** (las de trabajo con la foto fundida en el tono de su categoría, como la tarjeta grande): al tocarlas se abre una **hoja desde abajo** (se cierra deslizando hacia abajo desde cualquier parte) con la información completa y todas las acciones (Postularme o Aceptar urgencia, chat, compartir, mapa; o Ver perfil y Contactar). Los links compartidos por WhatsApp, las alertas y el botón *Ver trabajo* del mapa abren directamente la hoja de ese trabajo.

**Problema:** la lista vertical con tarjetas grandes obligaba a recorrer todo para descubrir trabajadores, y las secciones iban en un control con scroll horizontal donde "Mis publicaciones" quedaba cortada.

**Por qué así:**
- Es el patrón de inicio de las apps de servicios (Airbnb, Rappi, Uber): se ve un poco de todo sin desplazarse y cada fila invita a deslizar (se asoma la siguiente tarjeta).
- **Las urgencias van de primero** porque son una fuente de ingreso (tarifa del 15 %, [§6.1](#61-las-fuentes-de-ingreso)) y la propuesta más fuerte para el cliente.
- **Hoja y no modal centrado:** en el teléfono se cierra deslizando hacia abajo y cabe toda la tarjeta con sus botones.
- **El botón "+" para crear una publicación** está ahora en *Mis publicaciones* (donde se gestionan), no en el inicio de Explorar.
- **Trabajos y Trabajadores ya no son pestañas:** están en la misma pantalla, así que los accesos quedan para lo propio (lo que hago, lo que publiqué, mi agenda, mi gente de confianza).

**Qué decir en la exposición:** "Al abrir CIRA ves lo urgente, lo que hay cerca y quién está libre, sin desplazarte. Tocás una tarjeta y tenés todo para postularte o contactar."

**Dónde está:** `web/src/pages/ExplorarPage.tsx` (inicio), `web/src/components/Carrusel.tsx` (filas), `web/src/components/TarjetasCompactas.tsx`, `web/src/components/DetalleSheets.tsx` (hojas de detalle), `web/src/components/AccesosExplorar.tsx` y `web/src/components/aire/IconTabs.tsx`; las listas completas en `ExplorarTrabajosPage.tsx` (`/explorar/trabajos`) y `ExplorarTrabajadoresPage.tsx` · Commits `d79ead1`, `f466b8b`

---

### 4.4 Modo oscuro

**Qué es:** en **Cuenta → Apariencia** se elige *Automático* (igual que el teléfono), *Claro* u *Oscuro*. La app recuerda la elección.

**Cómo funciona:**
- Como todos los colores son tokens del sistema de diseño, al cambiar de tema cambia toda la app.
- El tema se aplica antes de cargar la página para que no haya un destello blanco.
- El mapa cambia a un estilo oscuro propio (ver [§4.6](#46-mapa-con-estilo-propio-y-pines-que-informan)) y el fondo del inicio de sesión se atenúa para no encandilar.

**Por qué importa:** es una expectativa básica de cualquier app hoy, ahorra batería en pantallas OLED y demuestra que el sistema de diseño está bien hecho (no hubo que tocar pantalla por pantalla).

**Dónde está:** `web/src/lib/tema.ts`, `index.html` · Commit `09c4cbf`

---

### 4.5 Español e inglés

**Qué es:** selector de idioma en Cuenta. Toda la interfaz, los estados, las categorías y los errores del servidor se traducen; fechas y números siguen el idioma.

**Por qué importa:** es lo que más se conecta con el enfoque de **aplicaciones globales** del curso y con la expansión a Latinoamérica del roadmap. El contenido que escriben los usuarios (títulos, chats) no se traduce.

**Dónde está:** `web/src/lib/i18n.ts`, `web/src/lib/i18n/en.ts` · Commit `27c5b68`

---

### 4.6 Mapa con estilo propio y pines que informan

**Qué es:** el mapa dejó de verse como el OpenStreetMap genérico. Ahora es un **mapa vectorial** (MapLibre GL, con componentes adaptados de mapcn): zoom suave, calles nítidas en cualquier nivel, un estilo claro sobrio y un **modo oscuro de verdad**. Los pines están diseñados con CIRA Aire:
- **Trabajos:** una gota azul con el ícono de su categoría (llave para plomería, rayo para electricidad, patita para mascotas…). Las **urgencias van en rojo y laten**.
- **Trabajadores:** un avatar con sus iniciales, un aro y un punto **verde si está disponible** (gris si está ocupado) y su **calificación** debajo.
- **Tu ubicación:** un punto azul con un halo que respira; el punto que se marca al publicar es una gota más grande.
- **"Ver en mapa" lleva al punto exacto:** el botón de mapa de un trabajo (en su hoja o en la lista) abre el mapa centrado en ese trabajo, con su globo abierto y su pin por encima de los vecinos.
- **Pines agrupados:** cuando varios quedan encimados se juntan en un círculo con la cantidad (rojo si adentro hay una urgencia); al tocarlo, el mapa se acerca hasta separarlos. Tu propio perfil no aparece en el mapa.
- Los popups usan las mismas superficies, radios y sombras del resto de la app, y **llevan a la acción**: un trabajo tiene *Ver trabajo* (abre Explorar con ese trabajo primero y desplegado, listo para postularse) y *Contactar* (chat con quien lo publicó); un trabajador tiene *Ver perfil* y *Contactar*. En lo tuyo solo aparece *Ver*.

**Problema:** con pines idénticos había que tocar cada uno para saber qué era, y los que estaban cerca se tapaban entre sí. El mapa no comunicaba nada a simple vista y desentonaba con el resto del diseño.

**Por qué así:** en un vistazo se sabe qué se necesita, dónde, qué es urgente y quién está libre y bien calificado cerca, sin abrir nada. Sigue siendo gratis y sin API key: el estilo es de **OpenFreeMap**, que sirve los datos de OpenStreetMap sin registro ni límites de uso. (Probamos CARTO, pero ahora exige API key.) mapcn es software libre (MIT); tomamos solo su núcleo y lo vestimos con CIRA Aire.

**Qué decir en la exposición:** "Abrimos el mapa y en un segundo se ve lo urgente en rojo y quién está disponible en verde, con su calificación. Tocamos un trabajador y desde ahí mismo lo contactamos: del mapa al chat en dos toques."

**Dónde está:** `web/src/components/mapa/` (`mapcn.tsx`: mapa, pines y popups; `Pines.tsx`: diseño de los pines y agrupación; `mapContext.ts`: estilos del mapa), `web/src/pages/MapaPage.tsx` (popups con acciones), sección "Mapa" de `web/src/components/aire/aire.css` · Commits `65f5d4d`, `980b0b3`, `d383f6b`

---

## 5. Confianza entre desconocidos

> El problema central del mercado de servicios informales es que **no sabes si puedes confiar** en la otra persona. Esta sección es el corazón de la propuesta de valor.

### 5.1 Calificaciones en ambas direcciones y reportes

**Qué es:** al terminar un trabajo, **ambas partes** se califican de 1 a 5 estrellas con un comentario: el cliente al trabajador y el trabajador al cliente. Cualquiera puede **reportar** a otro usuario con un motivo.

**Problema que resuelve:** el cliente no sabe si el trabajador es bueno, y el trabajador tampoco sabe si el cliente paga a tiempo o trata bien.

**Por qué así:**
- Calificar en las dos direcciones protege también al trabajador, que es nuestro usuario más vulnerable.
- El promedio se calcula con las calificaciones reales, no con un número fijo.

**Dónde está:** `RatingSheet.tsx`, `ReportSheet.tsx` · Commit `69e0de2`

---

### 5.2 Verificación de cédula y hoja de delincuencia

**Qué es:** en **Cuenta → Verificación**, cada persona verifica su identidad y sube su hoja de delincuencia. Las insignias "Cédula verificada" y "Hoja de delincuencia al día" ahora se **ganan** con este proceso; antes estaban escritas a mano.

**Cómo funciona:**
- **Cédula:** se toma foto del frente y del reverso (en el teléfono se abre la cámara). La app "lee" la cédula, muestra nombre y número para confirmar, y el documento pasa unos segundos *En revisión* antes de quedar *Verificado*.
- **Hoja de delincuencia:** se adjunta el PDF o una foto con su fecha de emisión. Vale **3 meses**; al vencer, la insignia desaparece y la app pide renovarla.
- **Estados visibles:** Sin enviar → En revisión → Verificada (o Vencida).
- **Recordatorio** en el Perfil si la hoja venció o falta la cédula.
- **Sin cédula verificada no se pueden aceptar urgencias.** El servidor también lo valida.
- Si alguien cambia el número de cédula en su perfil, tiene que volver a verificarla.

**Por qué así:**
- **Privacidad:** las fotos nunca salen del teléfono; los demás usuarios solo ven la insignia. En la demo ni siquiera se guardan los archivos.
- **Vigencia:** una insignia que se gana una vez y dura para siempre no da confianza. La hoja de delincuencia del Poder Judicial tiene fecha, y pedir que esté al día la hace creíble.
- **Incentivo:** pedir la cédula para las urgencias da una razón concreta para verificarse, justo donde el cliente corre más riesgo (alguien que entra a su casa con poco aviso).

**Qué decir:** "La verificación no es decorativa: tiene estados, vence, y desbloquea las urgencias."

**Dónde está:** `web/src/pages/VerificacionPage.tsx` · Commit `07e3d10`

---

### 5.3 "De confianza" y recontratar

**Qué es:** cada cliente puede guardar a sus trabajadores favoritos (con un corazón) en **"De confianza"**, para volver a contratarlos, chatear con ellos o recomendarlos.

**Cómo funciona:**
- Corazón en cada tarjeta de Trabajadores y en el perfil; filtro "De confianza" en Trabajadores y acceso desde el Perfil.
- **Recontratar:** abre el formulario de publicación como **oferta directa** para esa persona. Solo ella la ve, en *Mis trabajos*, con **Aceptar** o **No puedo**. Si no puede, la publicación queda abierta para todos automáticamente.
- **Recomendar:** abre el menú de compartir del teléfono (WhatsApp, Telegram, copiar link) con el link al perfil dentro de CIRA.
- **"Guardado por N clientes"** en el perfil: solo el número, nunca quiénes.

**Por qué así:**
- **Retención:** en servicios del hogar la gente quiere volver a llamar a la misma persona. Sin esta función, la segunda vez la contactaría por fuera de la app.
- **Evitar que el trato salga de la app:** recontratar *dentro* de CIRA es más fácil que hacerlo por WhatsApp, y el pago, el seguimiento y la calificación siguen registrados. Por eso el link de recomendar lleva al perfil y **nunca muestra el teléfono**.
- **"Guardado por N"** es una señal de reputación más creíble que las estrellas: alguien que te guarda planea volver a contratarte.
- Le cambiamos el nombre de "wishlist" (que suena a tienda en línea) a "De confianza".

**Qué decir:** "Las estrellas dicen si alguien es bueno; 'De confianza' dice que la gente vuelve a contratarlo."

**Dónde está:** `ConfianzaButton.tsx`, `DeConfianzaPage.tsx`, `lib/compartir.ts` · Commit `fcd565a`

---

## 6. Cómo gana dinero CIRA

> Modelo **freemium**: la app es gratis para todos y CIRA cobra solo cuando aporta valor. Todos los cobros son **simulados** en la demo, pero se ven funcionando de principio a fin.

### 6.1 Las fuentes de ingreso

| Fuente | Cuánto | Quién paga | Cuándo se ve en la demo |
|---|---|---|---|
| **Comisión por pago con tarjeta** | 10 % del monto | El cliente, solo si paga con tarjeta | Resumen del pago al publicar y al pagar |
| **Tarifa de urgencia** | 15 % del monto | El cliente, solo en urgencias | Al publicar una urgencia y al pagarla |
| **Plan Plus** | ₡2 500 al mes | El trabajador, opcional | Cuenta → Plan Plus |

El trabajador siempre recibe el **monto completo** del trabajo, más la propina. Los porcentajes y el precio se cambian en `server/src/config.js`.

### 6.2 Pago con tarjeta (simulado)

**Qué es:** quedan dos métodos: **Efectivo** y **Tarjeta** (se quitaron SINPE y Transferencia). Con tarjeta, el resumen muestra el monto, la comisión de CIRA y, si aplica, la tarifa de urgencia.

**Cómo funciona:**
- La tarjeta se registra en **Cuenta → Mi tarjeta**: una tarjeta realista con chip y marca que gira al escribir el CVV. Solo se guardan la marca, los últimos 4 dígitos, el titular y el vencimiento.
- Es obligatoria para pagar con tarjeta y para publicar urgencias. Una urgencia sí puede pagarse en efectivo: el monto va en mano y la tarifa se cobra a la tarjeta.
- **Propina** opcional al pagar (₡500, ₡1 000, ₡2 000 u otro monto): va completa al trabajador y no genera comisión.

**Por qué así:** la comisión solo existe si el pago pasa por la app. Para que la gente prefiera pagar con tarjeta, el valor para el cliente es la protección del pago y el registro de lo que pagó.

**Dónde está:** `TarjetaPage.tsx`, `PagarSheet.tsx`, `PagoResumen.tsx` · Commits `69e0de2`, `d20f690`, `70dd88b`

### 6.3 Plan Plus para trabajadores

**Qué es:** suscripción mensual opcional para trabajadores.

| | Gratis | Plus |
|---|---|---|
| Perfil, postularse, chat, explorar | ✅ | ✅ |
| Alertas de trabajos de su oficio en su zona | 2 minutos después | **Primero** |
| Alertas de urgencias | 2 minutos después | **Primero** |
| Insignia Plus en el perfil | — | ✅ |
| Trueques al mes ([§7.5](#75-trueque-de-servicios)) | 1 | Ilimitados |

**Por qué así:**
- **Ventaja de minutos, no exclusividad:** si solo los que pagan recibieran alertas, el cliente podría quedarse sin respuesta y los trabajadores gratis dejarían de usar la app.
- **Entre los Plus, primero los mejor calificados.** La prioridad no depende solo de pagar: también de hacer buen trabajo.
- Precio bajo, porque el público son trabajadores independientes.

**Dónde está:** `PlanPage.tsx`, alertas en `server/src/routes.js` · Commit `69e0de2`

### 6.4 Transparencia: Mi actividad e Ingresos de CIRA

- **Mi actividad** (Cuenta): cada usuario ve lo que pagó y lo que ganó.
- **Ingresos de CIRA (demo)**: pantalla que suma en vivo lo que CIRA ganó por Plan Plus, tarifas de urgencia y comisiones. **Sirve para mostrar el modelo de negocio funcionando durante la exposición.**

**Dónde está:** `ActividadPage.tsx`, `IngresosPage.tsx` · Commit `d20f690`

---

## 7. Operación del servicio

### 7.1 Multiusuario: el equipo usa la demo a la vez

**Qué es:** login por teléfono o correo con PIN `1234` y seis usuarios sembrados (los integrantes del equipo), con distintos planes y servicios. Cada pestaña o teléfono puede tener su propia sesión.

**Por qué importa:** antes había un usuario fijo y no se podía mostrar lo más importante, que es la **interacción**: uno publica, otro se postula, chatean, se paga y se califican. Ahora cada integrante puede tener su teléfono durante la presentación.

**Usuarios de la demo:** Ian (Plus), Marisol (gratis), Bayron (Plus), Eduardo (Plus), José (gratis) y Jixi (gratis). Detalle en `server/README.md`.

**Commits:** `69e0de2`, `7527420`, `80baa17`

---

### 7.2 Modo Urgencia y alertas

**Qué es:** al publicar se puede marcar **"Es urgente"** (tubo quebrado, corto eléctrico, quedarse afuera sin llaves). Se avisa a los trabajadores disponibles de ese oficio más cercanos, y **el primero que acepta se queda con el trabajo**.

**Cómo funciona:**
- Disponible para cualquier categoría; al principio solo eran plomería, electricidad y cerrajería, y lo abrimos tras la primera revisión.
- Alerta dentro de la app (banner y pantalla de Alertas), con un radio de 15 km. Primero a los Plus (los mejor calificados antes) y 2 minutos después al resto.
- La tarifa de urgencia (15 %) se muestra en el resumen. Las urgencias tienen su propia fila de primero en Explorar y van arriba en la lista completa.
- Para aceptar una urgencia hay que tener la **cédula verificada** ([§5.2](#52-verificación-de-cédula-y-hoja-de-delincuencia)).

**Por qué así:** la urgencia es donde el cliente más valora la rapidez y donde más dispuesto está a pagar. Por eso concentra una fuente de ingreso y la exigencia de verificación.

**Commits:** `69e0de2`, `cfb1ac2`

---

### 7.3 Seguimiento del trabajo tipo Uber

**Qué es:** después de asignar un trabajo, el cliente ve avanzar el estado: **Aceptado → En camino → Llegó → Terminado**. El trabajador lo actualiza desde *Mis trabajos* y el cliente lo ve en vivo.

**Por qué importa:** en una urgencia, la mayor angustia es no saber si el trabajador viene. Además cierra el flujo de la demo, porque "Terminado" lleva a pagar y calificar.

**Commit:** `69e0de2`

---

### 7.4 Gestión de publicaciones, chat y compartir

- **Mis publicaciones:** editar, ver postulantes con su reputación y elegir a uno; cancelar.
- **Chat** entre cliente y trabajador, con aviso y contador de mensajes sin leer.
- **Compartir un trabajo por WhatsApp** con el mensaje listo. En el Entregable 1 definimos WhatsApp como el canal para conseguir usuarios, y esto lo vuelve medible.
- **Avisos** (toasts) que confirman cada acción.

**Commits:** `69e0de2`, `d20f690`

---

### 7.5 Trueque de servicios

> Idea propuesta por una compañera; se valoró en grupo y se implementó con un alcance recortado. La valoración completa está en [`ideas-innovacion-cira.md`](ideas-innovacion-cira.md#10-trueque-de-servicios-trueque-de-barrio).

**Qué es:** se puede pagar un trabajo **con otro servicio** ("te subo la refrigeradora si me revisas la instalación eléctrica"), con un **diferencial en dinero** opcional si los trabajos no valen lo mismo.

**Cómo funciona:**
1. Al publicar, **Trueque** aparece como tercer método de pago, junto a Efectivo y Tarjeta: se indica qué se ofrece a cambio y el diferencial opcional.
2. Al postularse, el trabajador **acepta lo ofrecido o propone otra cosa** (contraoferta). El publicador ve la propuesta de cada postulante.
3. **Acuerdo digital:** al elegir a alguien, el publicador firma el acuerdo (quién hace qué y cuándo) y el trabajador lo acepta antes de empezar.
4. **Cierre en dos pasos:** el trabajador marca *"Entregué mi parte"* y, cuando recibe la del publicador, *"Recibí su parte: finalizar trueque"*. Mientras tanto, el publicador no puede cancelar.
5. Se paga el diferencial (si lo hay) y ambos califican, con la pregunta extra **"¿Cumplió su parte?"**, que queda como insignia en los comentarios del perfil.
6. Filtro *Trueques* en Explorar.

**Por qué así (lo que recortamos y por qué):**
- **Choca con el modelo de negocio:** un trueque no mueve dinero, así que CIRA no cobraría nada y además abre un hueco para saltarse la comisión. → Lo atamos al **Plan Plus**: el plan gratis tiene 1 trueque al mes y Plus, ilimitados. Si el diferencial se paga con tarjeta, cobra la comisión normal.
- **No resuelve el arranque de la plataforma, lo dificulta:** un trueque necesita que coincidan dos necesidades a la vez, algo más difícil con pocos usuarios. Lo presentamos como **diferenciador de comunidad** y gancho de marketing para el lanzamiento local, no como estrategia de crecimiento.
- **Las sanciones de la propuesta original** (bloqueo por huella del dispositivo, verificación por geolocalización, suspensión de 30 días a la primera falta) requieren un panel de administración que no existe y generan preguntas de privacidad. Quedan como **política futura**; en la app, las disputas van por "Reportar usuario".

**Qué decir:** "El trueque fortalece la comunidad y empuja a los usuarios al Plan Plus, en vez de quitarle ingresos a la plataforma."

**Dónde está:** `PostularTruequeSheet.tsx`, `AcuerdoTrueque.tsx` · Commit `360d721`

---

### 7.6 CIRA Agenda: servicios recurrentes, reemplazos y propiedades

> Une dos ideas que llegaron juntas: *CIRA Agenda* (el trabajador convierte trabajos ocasionales en ingresos recurrentes) y *CIRA para alquileres vacacionales* (la propiedad lista antes del próximo huésped). La valoración está en [`ideas-innovacion-cira.md`](ideas-innovacion-cira.md#11-agenda-servicios-recurrentes-y-propiedades).

**Qué es:** una **agenda** para trabajadores y clientes, conectada con "Recontratar", que permite contratar el mismo servicio **cada semana, cada dos semanas o cada mes**, cubrir con un reemplazo la visita que el trabajador no pueda hacer y guardar **propiedades** con sus instrucciones.

**Problema que resuelve:**
- El trabajador no tenía dónde ver qué días ya tiene trabajo ni cómo avisar qué días no puede.
- Quien necesita una limpieza cada viernes tenía que volver a contratarla cada semana.
- Quien administra un Airbnb, un condominio o varios apartamentos repetía siempre la dirección y las instrucciones.
- Si el trabajador de siempre no podía un día, el cliente se quedaba sin servicio.

**Cómo funciona:**
1. **Mi agenda** (Perfil, Cuenta o Disponibilidad): calendario del mes con un punto por día según lo que haya: trabajo propio, servicio contratado, visita que necesita reemplazo o trabajo hecho. Se filtra por rol (*como trabajador / como cliente*) y por propiedad. Al tocar un día se ve lo agendado, y el trabajador puede **marcarlo como no disponible**: nadie le puede enviar ofertas directas ese día.
2. **Recontratar con frecuencia:** al recontratar se elige *Una vez, Semanal, Quincenal o Mensual*. Arriba de la fecha aparece la **disponibilidad de la persona** en las próximas tres semanas (libre u ocupado, nunca qué ni con quién). Si se elige un día ocupado, la app lo advierte y no deja enviar la oferta.
3. **La persona acepta una sola vez** y CIRA agenda las próximas visitas: siempre hay cuatro creadas por adelantado. Cada visita es un trabajo normal (seguimiento, pago, calificación). En *Mis trabajos* y *Mis publicaciones* se muestra solo la próxima visita; el resto está en la agenda.
4. **Reemplazo:** si el trabajador toca *"No puedo ir a esta visita"*, la visita **no se publica para todos**: el cliente ve "Falta reemplazo" y sugerencias de personas del mismo oficio, **libres ese día**, con sus trabajadores **"De confianza" primero**. Al elegir una, le llega como oferta directa solo para esa visita; si dice que no, el cliente elige a otra. La serie sigue con el trabajador de siempre. También puede publicar esa visita para todos.
5. **Mis propiedades** (Cuenta, el ícono de casa de la Agenda o el botón **+** junto a sus filtros de dirección): direcciones con nombre ("Apartamento Escazú") e **instrucciones fijas** (dónde está la llave, qué revisar). Al publicar o recontratar se elige la propiedad en un toque y se llenan la dirección y el mapa. Las instrucciones **solo las ven el cliente y quien hace el trabajo**.
6. Cualquiera de los dos puede **terminar el servicio recurrente**: se cancelan las visitas que no han empezado.

**Cambio de fondo: fechas reales.** Antes las fechas eran texto libre ("Sábado, 4:00 p.m."), con el que no se puede armar un calendario, y el rango de disponibilidad de la pantalla de Disponibilidad no se guardaba. Ahora cada trabajo tiene **fecha y hora reales** en hora de Costa Rica, o ninguna si es una urgencia ("lo antes posible"). La app las muestra de forma natural ("Mañana, 9:00 a. m.", "Viernes, 1:00 p. m.", "31 oct") en el idioma elegido, y *Mis trabajos* y *Mis publicaciones* se ordenan por lo más próximo. El rango que no se guardaba se reemplazó por los días bloqueados de la agenda.

**Por qué así:**
- **Retención y monetización:** una contratación produce muchas transacciones futuras, y cada visita pagada con tarjeta genera su comisión. Es la funcionalidad que más mueve el modelo de negocio por cliente.
- **Recurrencia solo con oferta directa:** para repetir un servicio hay que saber quién lo hará cada vez. Por eso nace de "Recontratar" y de "De confianza".
- **El reemplazo no se publica para todos por defecto:** el cliente ya confía en alguien, y su red de confianza es la mejor fuente de suplentes. Así lo defendemos frente a herramientas de agenda como Jobber: la diferencia es la **recurrencia + los reemplazos dentro de la comunidad local**.
- **Privacidad:** la disponibilidad solo dice libre u ocupado, y las instrucciones de la propiedad no las ve nadie más.
- **Lo que quedó para la siguiente fase:** la lista de verificación con fotos (baño limpio, llaves, luces) y crear un trabajo relacionado desde una visita (la limpieza detecta un grifo dañado → plomero). Abren el segmento de anfitriones con una mensualidad por propiedad.

**Qué decir:** *"CIRA no solo ayuda a conseguir trabajo: ayuda a construir una cartera de clientes. Y si un día el trabajador no puede, tu propia red de confianza lo cubre."*

**Dónde está:** `AgendaPage.tsx`, `PropiedadesPage.tsx`, `components/aire/Calendar.tsx`, `DisponibilidadStrip.tsx`, `ReemplazoVisita.tsx`, `lib/fechas.ts`; en el servidor `agenda.js` y `fechas.js` · Commit `173f953`

---

### 7.7 Limpieza entre huéspedes y trabajos con hora límite

> Surgió al revisar la agenda: un Airbnb no limpia "cada viernes". Limpia cuando sale un huésped, y tiene que quedar listo antes de que entre el siguiente, muchas veces con poco aviso. Valoración en [`ideas-innovacion-cira.md`](ideas-innovacion-cira.md#12-limpieza-entre-huéspedes-y-trabajos-con-hora-límite).

**Qué es:** dos cosas que se complementan:
- **Hora límite ("Listo antes de")** para cualquier trabajo, también para las urgencias.
- **Limpieza entre huéspedes:** el anfitrión registra cuándo sale el huésped y cuándo entra el próximo. CIRA se la ofrece primero a su **limpiador habitual** y, si no responde a tiempo, la **pasa sola a urgencia**.

**Problema que resuelve:**
- La recurrencia fija ([§7.6](#76-cira-agenda-servicios-recurrentes-reemplazos-y-propiedades)) no sirve para alquileres de corta estancia, donde las limpiezas dependen de las reservas.
- Una urgencia era "lo antes posible", sin hora. No había forma de decir *"el huésped sale a las 11 y el próximo entra a las 3: tiene que estar listo antes"*.

**Cómo funciona:**
1. Al publicar cualquier trabajo hay un campo opcional **"Listo antes de"**. Si la hora es antes del inicio, se entiende que es al día siguiente. Se ve en las tarjetas de Explorar, en las alertas, en *Mis trabajos*, *Mis publicaciones* y en la agenda, donde el trabajo aparece como un rango (*11:00 a. m. – 3:00 p. m.*).
2. En **Mis propiedades** se elige el **limpiador habitual** de cada propiedad entre los trabajadores "De confianza" que ofrecen Limpieza.
3. **Registrar salida de huésped** (en la propiedad): cuándo sale, cuándo entra el próximo, el monto y cómo se paga.
4. CIRA crea la limpieza con esa ventana y le llega al limpiador habitual como oferta directa, con las instrucciones de la propiedad.
5. Si no responde en **10 minutos** (configurable con `CIRA_ESCALAR_TURNO_MIN`) o dice que no, **pasa sola a urgencia**: se avisa a los trabajadores cercanos de Limpieza (Plus primero) y se cobra la tarifa de urgencia. El anfitrión ve cuánto falta y puede tocar **"Pasar a urgencia ahora"**. Sin limpiador habitual (o si lo tiene bloqueado ese día), es urgencia desde el inicio.

**Por qué así:**
- **Reusa el Modo Urgencia** en vez de crear otro sistema: el mismo radio, la prioridad Plus, la exigencia de cédula verificada y la tarifa de urgencia.
- **Primero la relación de confianza, después la red:** el limpiador de siempre conoce la propiedad; la urgencia es el respaldo para que el próximo huésped nunca encuentre la casa sucia.
- **La tarifa de urgencia se cobra donde más valor tiene:** un anfitrión prefiere pagar un 15 % más que recibir una mala reseña.
- **Lo que queda para el roadmap:** leer las reservas solas del calendario de Airbnb o Booking (ambos exportan iCal). En la demo se registran a mano, y conviene decirlo así.

**Qué decir:** *"El anfitrión no necesita coordinar a nadie: registra que el huésped sale, y CIRA se asegura de que la propiedad esté lista antes de que llegue el siguiente."*

**Dónde está:** `SalidaHuespedSheet.tsx`, `PropiedadesPage.tsx`, `PublicacionCard.tsx`, `VisitaInfo.tsx`; en el servidor `POST /api/propiedades/:id/entre-huespedes` y el escalado en `agenda.js` · Commit `68ca7db`

---

## 8. Conexión con el Business Model Canvas

| Bloque del Canvas | Qué lo respalda en la app |
|---|---|
| **Segmentos de clientes** | Clientes (hogares y pequeños negocios) y trabajadores independientes: dos lados del mercado, con pantallas para cada uno (*Mis publicaciones* / *Mis trabajos*). A futuro, **administradores de propiedades** (Airbnb, condominios), que ya pueden usar *Mis propiedades* y los servicios recurrentes |
| **Propuesta de valor** | Cliente: encontrar a alguien confiable y cercano, incluso en una emergencia. Trabajador: más trabajos, reputación que demuestra su calidad y clientes que vuelven |
| **Canales** | App web en el teléfono; WhatsApp para compartir trabajos y recomendar perfiles (links que llevan a CIRA) |
| **Relación con clientes** | Autoservicio + comunidad: calificaciones, "De confianza", trueque, avisos y chat. **Relación continua** con los servicios recurrentes de la agenda |
| **Fuentes de ingreso** | Comisión del 10 % (tarjeta), tarifa de urgencia del 15 % y Plan Plus de ₡2 500/mes; visibles en "Ingresos de CIRA". Los servicios recurrentes multiplican las comisiones por cliente; a futuro, mensualidad por propiedad para anfitriones |
| **Recursos clave** | La plataforma, la base de usuarios verificados y su reputación acumulada |
| **Actividades clave** | Emparejar trabajos con trabajadores cercanos, verificar identidades, procesar pagos y moderar reportes |
| **Socios clave** | Pasarela de pagos (a futuro), Poder Judicial (hoja de delincuencia), OpenStreetMap y OpenFreeMap (mapas sin costo) |
| **Estructura de costos** | Hosting y mantenimiento. Costos bajos por decisión: mapas gratis (OpenStreetMap) y sin API de IA de pago |

---

## 9. Métricas que la app permite medir

Para el punto de "métricas de lanzamiento y operación". Todas salen de datos que la app ya registra:

| Métrica | Qué indica | De dónde sale |
|---|---|---|
| Trabajos publicados y tasa de asignación | Si hay oferta y demanda | Trabajos y su estado |
| Tiempo hasta que una urgencia es aceptada | Si el Modo Urgencia cumple su promesa | Fecha de creación y de asignación |
| % de pagos con tarjeta | Cuánto del volumen genera comisión | Pagos |
| Conversión a Plan Plus | Si la suscripción tiene valor | Usuarios por plan y suscripciones |
| % de usuarios verificados | Nivel de confianza de la red | Verificación |
| **Tasa de recontratación** | Si los clientes vuelven (retención) | Ofertas directas aceptadas |
| Servicios recurrentes activos y visitas por cliente | Ingresos recurrentes y lealtad | Agenda (series y sus visitas) |
| % de visitas cubiertas por un reemplazo | Si la red de confianza sostiene el servicio | Visitas con reemplazo |
| Días bloqueados por trabajador | Capacidad real de la oferta | Agenda |
| Limpiezas entre huéspedes cubiertas a tiempo (antes de la hora límite) | Si CIRA cumple su promesa al anfitrión | Fecha de cierre vs. hora límite |
| % que acepta el limpiador habitual vs. % que pasa a urgencia | Fuerza de la relación de confianza y uso de la tarifa de urgencia | Limpiezas entre huéspedes |
| "Guardado por" promedio | Lealtad hacia los trabajadores | De confianza |
| Calificación promedio y reportes por cada 100 trabajos | Calidad del servicio | Calificaciones y reportes |
| Trueques que terminan cumplidos | Salud del trueque | Calificaciones con "¿Cumplió su parte?" |
| Usuarios que llegan por links compartidos | Rendimiento del canal WhatsApp | Links de compartir y recomendar |
| Ingresos por fuente | Mezcla del modelo freemium | Ingresos de CIRA |

---

## 10. Qué es real y qué es simulado

Conviene decirlo con claridad en la exposición: el profesor pidió un mockup interactivo, y ser transparentes da credibilidad.

| Real (funciona de verdad) | Simulado (por diseño, para la demo) |
|---|---|
| Base de datos SQLite que persiste entre recargas | Inicio de sesión: PIN `1234` para todos, sin SMS ni seguridad real |
| Varios usuarios a la vez, chat, postulaciones, calificaciones | Pagos con tarjeta y suscripción Plus: no se cobra dinero |
| Mapa vectorial real (MapLibre + OpenFreeMap) con geocodificación (OpenStreetMap); pines por categoría, urgencia y disponibilidad, agrupados si se enciman | Verificación de documentos: la "lectura" de la cédula y la revisión son automáticas |
| Cálculo de comisiones, tarifas, propinas e ingresos | Alertas: se consultan cada pocos segundos, sin notificaciones push |
| Agenda, fechas, servicios recurrentes, reemplazos y propiedades (validados en el servidor) | Las visitas de los servicios recurrentes se crean al consultar la app, no con una tarea programada |
| Escalado a urgencia de las limpiezas entre huéspedes (por tiempo o por rechazo) | Las reservas se registran a mano (en producción se leerían del calendario de Airbnb o Booking) |
| Reglas de negocio (límites del plan, vigencia de la hoja, acuerdo del trueque) validadas en el servidor | Los archivos de verificación no se guardan |

---

## 11. Guion de la demo

Unos 8 minutos. Cada integrante con su teléfono conectado (`npm run demo` en `server/`; ver `README.md`). La base se recrea sola con datos de ejemplo listos para este guion.

| # | Quién | Qué mostrar | Sección |
|---|---|---|---|
| 1 | Cualquiera | Explorar: filas de Urgentes, Trabajos y Trabajadores; tocar una tarjeta abre su hoja; *Ver todos* con filtros; modo oscuro desde Cuenta → Apariencia | 4.2, 4.3.2, 4.4 |
| 2 | Eduardo (cliente) | Registra su tarjeta en Cuenta → Mi tarjeta (número de prueba `4242 4242 4242 4242`) y publica una **urgencia de plomería** pagando con tarjeta: el resumen muestra la tarifa de urgencia y la comisión | 6.1, 6.2, 7.2 |
| 3 | Bayron (Plus, plomero) | Recibe la alerta primero, acepta la urgencia y avanza el seguimiento hasta "Terminado" | 6.3, 7.3 |
| 4 | Marisol (sin cédula verificada) | En Explorar, las urgencias le piden "Verifica tu cédula"; verifica en vivo desde el recordatorio del Perfil y queda habilitada | 5.2, 7.2 |
| 5 | Eduardo | Ve el seguimiento en vivo, paga con propina y califica a Bayron | 5.1, 6.2 |
| 6 | Cualquiera | Cuenta → Ingresos de CIRA: lo que la plataforma ganó con lo que acabamos de hacer | 6.4 |
| 7 | Ian | Perfil de un trabajador: corazón, "Guardado por N", Recomendar y Recontratar → oferta directa | 5.3 |
| 8 | Ian / Bayron | Trueque "Subir refrigeradora": la contrapropuesta de Bayron, el acuerdo y el cierre en dos pasos | 7.5 |
| 9 | Ian | Su hoja de delincuencia viene vencida: la renueva | 5.2 |
| 10 | Ian | **Mi agenda**: la limpieza semanal con Marisol en "Apartamento Escazú", filtro por propiedad | 7.6 |
| 11 | Marisol | En *Mis trabajos* ve la visita del viernes con las instrucciones de la llave y toca **"No puedo ir a esta visita"** | 7.6 |
| 12 | Ian | En *Mis publicaciones* aparece "Falta reemplazo": elige a **Jixi** (De confianza, libre ese día); Jixi acepta desde su teléfono | 7.6 |
| 13 | Ian | Recontrata a Eduardo **cada mes** en "Casa Alajuela": la disponibilidad muestra sus días ocupados; Eduardo acepta una vez y su agenda se llena sola | 7.6 |
| 14 | Ian | *Mis propiedades* → Apartamento Escazú → **Registrar salida de huésped** (sale hoy, entra otro esta noche): se la ofrece a Marisol, su limpiadora habitual | 7.7 |
| 15 | Ian / Jixi | Ian toca **"Pasar a urgencia ahora"**; a Jixi le llega como urgencia con "Listo antes de…" y la acepta | 7.7, 7.2 |

> Para no esperar los 2 minutos del plan gratis en las alertas, se puede arrancar el servidor con `CIRA_RETRASO_ALERTAS_SEG=10`.
>
> **El día de la presentación**, corre `npm run reset` en `server/` antes de arrancar: las fechas de los datos de ejemplo se calculan desde el día en que se crea la base (mañana, el próximo viernes…).

---

## 12. Decisiones descartadas y preguntas probables

### Lo que decidimos no hacer (y por qué)

| Idea | Decisión | Por qué |
|---|---|---|
| Sugerir la categoría con IA | Descartada (queda en el roadmap) | Pocas categorías; costo por uso y dependencia de un proveedor externo (Porter) |
| Contacto por WhatsApp con el trabajador | Quitado | El trato saldría de la app y se perdería el pago, el seguimiento y la reputación. Sí se comparten links que llevan a CIRA |
| Quinto botón en la barra para "De confianza" | No | La barra es para lo diario; lo ocasional va dentro de Perfil y Trabajadores |
| Tarjeta grande con foto en todas las pantallas | Solo en Explorar | En gestión importa ver mucho de un vistazo |
| Sanciones automáticas del trueque | Como política futura | Requieren un panel de administración y generan preguntas de privacidad |
| Lista de verificación con fotos para propiedades y trabajo relacionado automático | Siguiente fase de "Mis propiedades" | Dificultad alta y abre otro segmento (anfitriones con mensualidad por propiedad) |
| Publicar para todos la visita que el trabajador cancela | Primero se ofrecen reemplazos | El cliente ya confía en alguien; su red "De confianza" es la mejor fuente de suplentes |
| Sincronizar el calendario de Airbnb o Booking | Roadmap | En la demo las salidas se registran a mano; en producción se leerían del iCal de cada plataforma |
| Créditos o monedas internas para el trueque | No | La propuesta original los descartaba; lo resolvimos con el diferencial en dinero |

### Preguntas que nos pueden hacer

- **"¿Cómo gana dinero si el trueque no mueve dinero?"** → Por el Plan Plus (trueques ilimitados) y la comisión del diferencial con tarjeta ([§7.5](#75-trueque-de-servicios)).
- **"¿Cómo evitan que se vayan a WhatsApp después del primer trabajo?"** → Recontratar dentro de la app es más fácil, el teléfono no se muestra, y la reputación y el seguimiento solo existen dentro de CIRA ([§5.3](#53-de-confianza-y-recontratar)).
- **"¿Por qué alguien pagaría Plus si igual recibe las alertas?"** → En urgencias, llegar primero es quedarse con el trabajo; y entre los Plus gana el mejor calificado ([§6.3](#63-plan-plus-para-trabajadores)).
- **"¿Cómo verifican de verdad la cédula?"** → En la demo es simulado; en producción se integraría con un servicio de verificación de identidad y la consulta de la hoja del Poder Judicial. El flujo y los estados ya están diseñados para eso ([§5.2](#52-verificación-de-cédula-y-hoja-de-delincuencia)).
- **"¿En qué se diferencia de una app de agenda como Jobber?"** → Jobber organiza la agenda de un negocio; CIRA conecta a un cliente con trabajadores de su comunidad y, si el de siempre no puede, propone un reemplazo de su propia red de confianza ([§7.6](#76-cira-agenda-servicios-recurrentes-reemplazos-y-propiedades)).
- **"¿Y si el Airbnb no limpia en días fijos?"** → Para eso es la limpieza entre huéspedes: se registra la salida y la entrada, se le ofrece al limpiador habitual y, si no responde, pasa a urgencia con hora límite ([§7.7](#77-limpieza-entre-huéspedes-y-trabajos-con-hora-límite)).
- **"¿Qué pasa si el trabajador se va a la competencia con el cliente recurrente?"** → La agenda, los reemplazos, el pago protegido y la reputación solo existen dentro de CIRA; salir de la app es perder todo eso.
- **"¿Dónde está la IA o la nube?"** → Usamos IA (Claude Code) para desarrollar la app y su sistema de diseño; la app corre como servicio web y se puede publicar en la nube.
- **"¿Qué pasa si un trabajador no cumple?"** → Reportes, calificación de cumplimiento en el trueque y la verificación vinculada a la cédula.

---

## 13. Registro de cambios

Del más reciente al más antiguo. **Al agregar una funcionalidad:** se suma una fila aquí y se actualiza o crea su sección arriba.

| Commit | Qué entró | Sección |
|---|---|---|
| `PENDIENTE` | Encabezado sobre franja azul en todas las pantallas (menos Perfil y Mapa); botón + de crear publicación en Mis publicaciones | 4.3.1, 4.3.2 |
| `ff2e1cf` | "Ver en mapa" abre el mapa en el trabajo con su globo; la hoja ya no hace saltar la pantalla al abrirse | 4.6, 4.3.2 |
| `ddcb8ee` | Hoja que se cierra deslizando desde cualquier parte, tarjetas con degradado y sin sombra cortada, "+" de propiedades en la Agenda | 4.3.2, 7.6 |
| `f466b8b` | Explorar como inicio: accesos, filas de Urgentes, Trabajos y Trabajadores, Ver todos y detalle en hoja | 4.3.2 |
| `d79ead1` | Secciones de Explorar como círculos con ícono (sin scroll) | 4.3.2 |
| `d383f6b` | Mapa vectorial con MapLibre (núcleo de mapcn) y OpenFreeMap; pines agrupados | 4.6 |
| `4600a31` | Títulos en la misma fila que los botones de atrás y de acción | 4.3.1 |
| `c94ab33` | El mapa vuelve a OpenStreetMap con filtro (CARTO pedía API key) | 4.6 |
| `da749fb` | Corrige el campo del PIN del login, que tomaba los estilos de los pines del mapa | 4.6 |
| `980b0b3` | Popups del mapa con Ver trabajo / Ver perfil y Contactar | 4.6 |
| `65f5d4d` | Mapa con estilo propio y pines por categoría, urgencia y disponibilidad | 4.6 |
| `68ca7db` | Limpieza entre huéspedes y trabajos con hora límite (idea #12) | 7.7 |
| `3790bba` | Registro del commit de la agenda en esta guía | — |
| `173f953` | CIRA Agenda: fechas reales, servicios recurrentes, reemplazos y propiedades (idea #11) | 7.6 |
| `bb585b5` | Esta guía de novedades | — |
| `360d721` | Trueque de servicios (idea #10) | 7.5, 6.3 |
| `07e3d10` | Verificación de cédula y hoja de delincuencia | 5.2 |
| `09c4cbf` | Modo oscuro | 4.4 |
| `5655f7e` | Botón "+" junto a la barra; listas visibles en pantallas pequeñas | 4.3 |
| `ed68772` | Barra inferior flotante sobre el contenido | 4.3 |
| `fcd565a` | De confianza: guardar, recomendar y recontratar | 5.3 |
| `29fd091` | Miniaturas de categoría en las pantallas de gestión | 4.2 |
| `55feda1` | Tarjetas de trabajo con foto por categoría | 4.2 |
| `4052114` | La tarjeta registrada gira al entrar a Mi tarjeta | 6.2 |
| `70dd88b` | Ajustes de diseño y tarjeta de crédito realista | 4.1, 6.2 |
| `e3c414a` | Toda la interfaz migrada a CIRA Aire | 4.1 |
| `cfb1ac2` | Modo urgencia para cualquier categoría | 7.2 |
| `d20f690` | Tarjeta, propina, Mi actividad, avisos y ajustes de la primera revisión | 6.2, 6.4, 7.4 |
| `80baa17` | Ian pasa al Plan Plus para la presentación | 7.1 |
| `7527420` | Los 6 usuarios del equipo | 7.1 |
| `27c5b68` | Español e inglés | 4.5 |
| `69e0de2` | Multiusuario, calificaciones, urgencias, pagos, Plan Plus y seguimiento | 5.1, 6, 7 |
| `9743b42` | Sistema de diseño CIRA Aire | 4.1 |
| `0c7ea79` | Ideas alineadas con el resumen del entregable final | — |
| `9379bfb` | Backlog de ideas de innovación | — |
