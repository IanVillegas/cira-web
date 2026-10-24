# CIRA — Ideas de innovación

Backlog de funcionalidades para CIRA (curso Aplicaciones Informáticas Globales). Cada idea incluye su propósito, cómo funciona, su relación con el modelo de negocio y qué tan viable es para la demo del entregable final.

Alineado con el resumen del grupo **"CIRA – Cambios para el entregable final"**. Lo que ya está en la app, explicado para la exposición, está en [`novedades-entregable-final.md`](novedades-entregable-final.md).

**Estados:** 💡 Propuesta · ✔️ Aprobada · 🛠️ En desarrollo · ✅ Implementada · ❌ Descartada · 🗺️ Roadmap (fase futura)

---

## Resumen

| # | Idea | Estado | Prioridad |
|---|------|--------|-----------|
| 1 | Calificaciones (bidireccionales) y reportes | ✅ Implementada | Alta |
| 2 | Diagnóstico / sugerencia de categoría con IA | ❌ Descartada → 🗺️ Roadmap | — |
| 3 | Modo Urgencia con tarifa de urgencia | ✅ Implementada | Alta |
| 4 | Pago con tarjeta y comisión de CIRA | ✅ Implementada | Alta |
| 5 | Verificación con insignias | ✅ Implementada (datos de prueba) | Media |
| 6 | Plan Plus para trabajadores (alertas prioritarias) | ✅ Implementada | Alta |
| 7 | Seguimiento del trabajo tipo Uber | ✅ Implementada | Media (la primera extra) |
| 8 | Compartir un trabajo por WhatsApp | ✅ Implementada | Baja |
| 9 | Idioma español / inglés | ✅ Implementada | Baja |
| 10 | Trueque de servicios ("Trueque de barrio") | ✅ Implementada (alcance recortado) | Media |

**Monetización (freemium):** la app es gratis para todos y CIRA gana dinero con tres fuentes, todas simuladas en la demo:
1. **Plan Plus**: suscripción mensual del trabajador (idea #6).
2. **Tarifa de urgencia**: pago único por trabajo urgente (idea #3).
3. **Comisión** sobre los pagos hechos en la app (idea #4).

El **trueque** (idea #10) no mueve dinero, así que se monetiza por el Plan Plus: el plan gratis permite 1 trueque al mes y Plus, ilimitados. Si el trueque lleva un diferencial en dinero y se paga con tarjeta, cobra la comisión normal.

---

## 1. Calificaciones (bidireccionales) y reportes

> Pendiente desde el semestre pasado.

**Problema que resuelve:** En trabajos informales no hay forma de saber si un trabajador (o un cliente) es confiable antes de contratarlo.

**Cómo funciona:**
- Al terminar un trabajo, **ambas partes** se califican de 1 a 5 estrellas y dejan un comentario: el cliente califica al trabajador y el trabajador califica al cliente.
- El promedio se muestra en el perfil y en las tarjetas de exploración (`WorkerCard`, `JobCard`).
- Un botón **Reportar usuario** en el perfil o el chat permite indicar un motivo (no se presentó, mal trato, cobro indebido, etc.).
- Los trabajadores también pueden evitar clientes con mala reputación (por ejemplo, que no pagan a tiempo).

**Relación con el modelo de negocio:** Aumenta la confianza en la plataforma, lo que incrementa las transacciones y por ende las comisiones. Es la base del sistema de reputación.

**Viabilidad para la demo:** Alta. Tablas `calificacion` y `reporte` en SQLite, endpoints para crearlas y el promedio calculado a partir de las calificaciones reales. Hoy la app solo muestra un promedio fijo de los datos de prueba.

---

## 2. Diagnóstico / sugerencia de categoría con IA — ❌ Descartada (queda en el roadmap)

**Idea original:** El cliente describe el problema o sube una foto y la IA sugiere la categoría, si es urgente y un rango de precio. En el primer entregable prometimos sugerir la categoría con IA.

**Por qué se quita de la app (justificación para el documento):**
- Las categorías son pocas y el selector ya es rápido; la IA no ahorra un esfuerzo real.
- Implica **costo por uso** de una API externa.
- Genera **dependencia de un proveedor externo**, un riesgo que identificamos en el análisis de Porter (poder de negociación de proveedores).
- Preferimos priorizar el **Modo Urgencia** (idea #3), que aporta más valor con el mismo esfuerzo.

**Qué sí se documenta:** cómo usamos IA para **desarrollar** la app (obligatorio en la rúbrica).

**Roadmap:** se puede retomar cuando haya volumen de trabajos que justifique el costo.

---

## 3. Modo Urgencia con tarifa de urgencia

> Idea propuesta por Mari. Ya estaba en el primer entregable como "publicaciones potenciadas para tareas urgentes"; falta llevarla a la app.

**Problema que resuelve:** Emergencias en el hogar (tubo quebrado con fuga, corto eléctrico, quedarse afuera sin llaves) necesitan ayuda inmediata, y hoy no hay forma rápida de conseguirla.

**Cómo funciona:**
- Al crear un trabajo, el cliente activa la opción **"Es urgente"**.
- Disponible para cualquier categoría (decisión tras la primera revisión; el documento original la limitaba a fontanería, electricidad y cerrajería).
- Se envía una alerta a los trabajadores **disponibles** de esa categoría más cercanos (usando las coordenadas `lat`/`lng` ya existentes); primero a los del Plan Plus (idea #6).
- El primero que acepta se queda con el trabajo.
- El trabajo se paga un poco mejor por ser inmediato, y el cliente paga una **tarifa de urgencia** que se muestra en el resumen del pago.

**Relación con el modelo de negocio:** La tarifa de urgencia es un ingreso por pago único para CIRA, y el trabajador gana más por responder rápido. El modelo de negocio **se ve funcionando** en la demo.

**Viabilidad para la demo:** Alta. La alerta se muestra como banner o pantalla dentro de la app, sin notificaciones push reales.

---

## 4. Pago con tarjeta y comisión de CIRA

**Problema que resuelve:** Falta de confianza en los pagos: el cliente teme pagar por adelantado y que no se haga el trabajo; el trabajador teme no recibir su pago.

**Cómo funciona:**
- Solo quedan dos métodos de pago: **Efectivo** y **Tarjeta**. Se eliminan SINPE y Transferencia (ya se quitaron en el primer entregable, pero siguen en el código).
- Con "Tarjeta" el resumen del pago muestra el monto del trabajo, la **comisión de CIRA** y, si aplica, la tarifa de urgencia.
- El pago es **simulado** (el profesor lo permite).
- Opcional: el dinero queda retenido hasta que ambas partes confirmen que el trabajo terminó; confirmar y calificar (idea #1) es el mismo paso.

**Relación con el modelo de negocio:** Justifica directamente la **comisión por transacción** y la hace visible en el flujo.

**Viabilidad para la demo:** Alta como simulación (pantalla de pago fingido). No requiere pasarela real.

---

## 5. Verificación con insignias

**Problema que resuelve:** Las estrellas solas no dicen si la persona es quien dice ser ni si tiene experiencia comprobada.

**Cómo funciona:** Badges visibles en el perfil y en las tarjetas:
- ⭐ **Plus** (se activa al suscribirse, idea #6)
- ✔️ Cédula verificada
- 📄 Hoja de delincuencia al día
- 🏅 +50 trabajos completados
- ⚡ Responde urgencias

**Relación con el modelo de negocio:** La insignia Plus hace visible la suscripción. Las demás aumentan la confianza.

**Viabilidad para la demo:** Alta. La insignia Plus es la mínima necesaria; las demás son campos en la base de datos y componentes visuales.

---

## 6. Plan Plus para trabajadores (alertas prioritarias)

> Idea propuesta por un compañero del equipo. Complementa el Modo Urgencia (idea #3).

**Problema que resuelve:** Los trabajadores pierden oportunidades porque no se enteran a tiempo de los trabajos cercanos. Por su parte, CIRA necesita un ingreso recurrente además de la comisión.

**Cómo funciona:** Pantalla de planes (**Gratis** y **Plus**) con un botón para suscribirse (pago simulado). Al activarlo, el trabajador ve su insignia en el perfil.

| | Plan Gratis | Plan Plus (suscripción mensual) |
|---|---|---|
| Perfil, postularse, chat | ✅ | ✅ |
| Explorar trabajos | ✅ | ✅ |
| Alertas de trabajos de su oficio en su zona | Unos minutos después | **Primero** |
| Alertas de urgencias (idea #3) | Unos minutos después | **Primero** |
| Insignia Plus en el perfil | ❌ | ✅ |

- Ejemplo: si soy electricista Plus y alguien cerca busca un electricista, me llega la alerta de inmediato y unos minutos antes que a los del plan gratis.
- **Ventaja de minutos, no exclusividad:** si solo los que pagan recibieran alertas, el cliente se podría quedar sin respuesta y los trabajadores gratis dejarían de usar la app.

**Valoración:**
- ✅ Agrega un ingreso recurrente y es fácil de explicar en el Business Model Canvas.
- ⚠️ Aporta más a la **monetización** que a la innovación.
- ⚠️ Al lanzar, con pocos trabajos, pocos pagarían por enterarse primero. El precio debe ser bajo, porque el público son trabajadores independientes.
- ⚠️ Conviene que, entre los Plus, la alerta llegue primero a los mejor calificados (idea #1), para que la prioridad no dependa solo de pagar.

**Viabilidad para la demo:** Alta. Un campo `plan` en el usuario, la pantalla de planes y la alerta como banner.

---

## 7. Seguimiento del trabajo tipo Uber

> Idea extra. Si sobra tiempo, es la primera que haríamos.

**Problema que resuelve:** En una urgencia, el cliente no sabe si el trabajador realmente viene ni cuánto falta.

**Cómo funciona:** Después de aceptar un trabajo urgente, el cliente ve el estado avanzar: **Aceptado → En camino → Llegó → Terminado**. El trabajador actualiza el estado desde su pantalla.

**Relación con el modelo de negocio:** Hace más valiosa la tarifa de urgencia y cierra el flujo de la demo (el estado "Terminado" lleva a pagar y calificar).

**Viabilidad para la demo:** Alta. Es un campo de estado en el trabajo; con dos usuarios conectados se ve el cambio del otro lado.

---

## 8. Compartir un trabajo por WhatsApp

> Idea extra.

**Cómo funciona:** Un botón en el detalle del trabajo genera un link y abre WhatsApp con el mensaje listo para enviar.

**Relación con el modelo de negocio:** En el primer entregable definimos WhatsApp como el canal para conseguir usuarios. Además da una métrica fácil: cuántos usuarios llegan por links compartidos.

**Viabilidad para la demo:** Alta. Se usa un link `wa.me` desde el frontend.

---

## 9. Idioma español / inglés

> Idea extra.

**Cómo funciona:** Selector de idioma en el menú de cuenta; los textos de la app cambian entre español e inglés.

**Relación con el modelo de negocio:** Es lo que más se conecta con el enfoque de aplicaciones **globales** y con la expansión a Latinoamérica del roadmap.

**Viabilidad para la demo:** Media. Hay que extraer los textos de ~20 pantallas a archivos de traducción; conviene hacerlo al final.

---

## 10. Trueque de servicios ("Trueque de barrio")

> Idea propuesta por una compañera del equipo. Valorada en grupo antes de implementarla; se hizo con un alcance recortado.

**Problema que resuelve:** Muchos trabajadores independientes necesitan servicios para su casa o su negocio, pero no siempre tienen el dinero para pagarlos. Pueden pagarlos con su propio trabajo.

**Propuesta original:** intercambio 1 a 1 de servicios sin créditos ni monedas internas, con diferencial en efectivo, contraofertas por chat, acuerdo digital, cierre en dos pasos, calificación cruzada obligatoria y un sistema de disputas y sanciones (evidencia con chat, geolocalización y fotos; congelamiento de la cuenta; suspensión de 30 días a la primera falta y expulsión permanente a la segunda; sanción al denunciante de mala fe).

**Valoración:**
- ⚠️ **Choca con el modelo de negocio:** un trueque no mueve dinero, así que CIRA no cobra nada. Además abre un hueco: marcar como trueque un trabajo pagado para no pagar la comisión. → Se resuelve atándolo al **Plan Plus** (gratis: 1 trueque al mes; Plus: ilimitados).
- ⚠️ **No resuelve el arranque ("huevo y gallina"), lo dificulta:** un trueque necesita que coincidan dos necesidades a la vez (yo necesito lo que tú ofreces y tú lo que yo ofrezco), algo más difícil con pocos usuarios que un trabajo pagado. Sí sirve como **mensaje de marketing** para el lanzamiento local.
- ⚠️ **Las sanciones son demasiado para el MVP:** bloquear por huella del dispositivo, verificar la geolocalización y resolver en 48 horas requiere un panel de administración que no existe y genera preguntas de privacidad; suspender 30 días a la primera falta es muy duro. Quedan como **política** (roadmap y términos de uso), no en la app. Se rescata la sanción al denunciante de mala fe.
- ✅ Gran parte ya existía: chat (contraofertas), seguimiento por etapas (cierre en dos pasos), calificación en ambas direcciones y "Reportar usuario" (disputas).

**Cómo funciona (lo implementado):**
- Al publicar, **Trueque** es un tercer método de pago (junto a Efectivo y Tarjeta): se indica qué se ofrece a cambio y, opcionalmente, un **diferencial** en colones (en efectivo o con tarjeta).
- Al postularse, el trabajador acepta lo ofrecido o **propone otra cosa** (contraoferta). El publicador ve la propuesta de cada postulante antes de elegir.
- **Acuerdo digital:** al elegir a alguien, el publicador firma el acuerdo (quién hace qué y cuándo); el trabajador lo acepta en *Mis trabajos* antes de empezar. Sin acuerdo aceptado no arranca el seguimiento.
- **Cierre en dos pasos:** el trabajador hace su parte con el seguimiento normal y la marca como **"Primera parte entregada"**; cuando recibe la parte del publicador, marca **"Trueque finalizado"**.
- Después se paga el diferencial (si hay) y ambos se califican, con la pregunta de si la otra persona **cumplió su parte**.
- Disputas: con el "Reportar usuario" existente.

**Relación con el modelo de negocio:** Empuja a los usuarios hacia el Plan Plus (trueques ilimitados) y el diferencial con tarjeta genera comisión. Refuerza el sentido de comunidad, que es parte de la propuesta de valor.

**Viabilidad para la demo:** Alta. Se apoya en el flujo de publicar, postular, seguimiento, pago y calificación que ya existe.

---

## Decisiones de implementación (para el documento)

- **Cobros (todos simulados):** el cliente paga el monto del trabajo **+ comisión de CIRA (10 %, solo si paga con tarjeta) + tarifa de urgencia (15 %, solo urgencias)**; el trabajador recibe el monto completo. Los porcentajes y el precio del Plus se cambian en `server/src/config.js`.
- **Tarjeta (simulada):** se registra en Cuenta → Mi tarjeta (se valida el formato; solo se guardan marca, últimos 4, titular y vencimiento). Es obligatoria para pagar con tarjeta y para publicar urgencias. Una urgencia puede pagarse en efectivo: el monto se entrega en mano y la tarifa de urgencia se cobra a la tarjeta.
- **Propina:** opcional al pagar (₡500, ₡1 000, ₡2 000 u otro monto); va completa para el trabajador y no genera comisión.
- **Mi actividad:** en Cuenta, lo que pagó (publicaciones) y lo que ganó (trabajos) cada usuario; distinto de "Ingresos de CIRA".
- **Avisos:** toasts y modal de éxito para confirmar acciones; los mensajes de chat sin leer se avisan con un toast y una insignia en la barra inferior.
- **Alertas:** se consultan cada 5 s (sin notificaciones push). Radio de 15 km; los Plus las ven al instante (los mejor calificados primero, +10 s por puesto) y el plan gratis tras 2 minutos (`CIRA_RETRASO_ALERTAS_SEG` para acortarlo en la demo). Una alerta dura 30 minutos.
- **Seguimiento:** aplica a cualquier trabajo asignado, no solo a urgencias. Al marcar "Terminado" el cliente paga y luego ambos califican.
- **Insignias:** Plus (según el plan), cédula y hoja de delincuencia (campos de prueba), +50 trabajos (calculado) y "Responde urgencias" (se activa al aceptar una).
- **Trueque (#10):** `pago` es el diferencial (puede ser 0) y `metodoPago`, cómo se paga. El límite del plan gratis está en `server/src/config.js` (`TRUEQUES_GRATIS_MES`). Un trueque no puede ser urgencia. Al elegir postulante, el publicador firma el acuerdo; sin que el trabajador lo acepte no arranca el seguimiento. "Terminado" en el seguimiento es la primera parte; el trueque termina cuando el trabajador marca que recibió la segunda, y si no hay diferencial queda pagado automáticamente.
- **Idioma (#9):** selector en Cuenta (recarga la app). Los textos viven en el código en español y `web/src/lib/i18n/en.ts` trae la traducción al inglés (clave = texto en español; si falta, se muestra en español). Los errores del servidor también se traducen. El contenido escrito por los usuarios (títulos, descripciones, chats) no se traduce.

## Cambios técnicos pendientes (no son ideas nuevas)

- ✅ **Quitar SINPE y Transferencia del código.** Siguen en `types.ts`, `CrearTrabajoPage.tsx` (SINPE viene por defecto), `EditProfilePage.tsx`, `PerfilPage.tsx` y `seed.js`. Solo deben quedar "Efectivo" y "Tarjeta".
- ✅ **Editar publicaciones.** El backend ya permite editar un trabajo (`PATCH /trabajos/:id`); falta el botón y la pantalla en "Mis publicaciones".
- ✅ **Usuarios definidos y multiusuario.** Login por teléfono con PIN `1234` para todos (fase de pruebas), para que varios compañeros puedan interactuar a la vez (postularse, chatear, calificar). Hoy el backend usa un usuario fijo (`u-1`). Los 6 usuarios del equipo (con sus teléfonos reales) están sembrados en `server/src/seed.js`; ver `server/README.md`.
- **Publicar en internet:** no es necesario. La demo corre local con `npm run demo` y los demás dispositivos se conectan por la misma red WiFi.

---

## Flujo integrado para la demo

1. El cliente crea un trabajo de fontanería y activa **"Es urgente"**.
2. La alerta llega primero a los fontaneros **Plus** cercanos y, minutos después, al resto.
3. Un trabajador acepta y el cliente ve el **seguimiento**: Aceptado → En camino → Llegó → Terminado.
4. El cliente paga con **Tarjeta** (con propina opcional); el resumen muestra la tarifa de urgencia y la comisión de CIRA.
5. Ambos se **califican con estrellas** y, si hace falta, pueden **reportar** al otro usuario.

---

## Ideas por evaluar

_(Agregar aquí nuevas propuestas del equipo; se valoran antes de pasarlas al resumen.)_
