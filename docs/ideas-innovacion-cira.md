# CIRA — Ideas de innovación

Backlog de funcionalidades innovadoras para CIRA (curso Aplicaciones Informáticas Globales). Cada idea incluye su propósito, cómo funciona, su relación con el modelo de negocio y qué tan viable es para la demo del Entregable 2.

**Estados:** 💡 Propuesta · 🛠️ En desarrollo · ✅ Implementada · ❌ Descartada

---

## Resumen

| # | Idea | Estado | Prioridad |
|---|------|--------|-----------|
| 1 | Calificación por estrellas (bidireccional) | 💡 Propuesta | Alta |
| 2 | Diagnóstico con IA | 💡 Propuesta | Alta |
| 3 | Modo Urgencia con recargo dinámico | 💡 Propuesta | Alta |
| 4 | Pago protegido (escrow) con SINPE Móvil | 💡 Propuesta | Media |
| 5 | Verificación con insignias | 💡 Propuesta | Media |
| 6 | Plan CIRA Plus para trabajadores (alertas prioritarias) | 💡 Propuesta | Alta |

---

## 1. Calificación por estrellas (bidireccional)

**Problema que resuelve:** En trabajos informales no hay forma de saber si un trabajador (o un patrono) es confiable antes de contratarlo.

**Cómo funciona:**
- Al terminar un trabajo, **ambas partes** se califican de 1 a 5 estrellas: el patrono califica al trabajador y el trabajador califica al patrono.
- Se puede dejar un comentario opcional.
- El promedio se muestra en el perfil y en las tarjetas de exploración (`WorkerCard`, `JobCard`).
- Los trabajadores también pueden evitar patronos con mala reputación (por ejemplo, que no pagan a tiempo).

**Relación con el modelo de negocio:** Aumenta la confianza en la plataforma, lo que incrementa las transacciones y por ende las comisiones. Es la base del sistema de reputación.

**Viabilidad para la demo:** Alta. Requiere una tabla `ratings` en SQLite, un endpoint para calificar y mostrar el promedio en las pantallas existentes.

---

## 2. Diagnóstico con IA

**Problema que resuelve:** Muchas personas no saben qué tipo de trabajador necesitan ni cuánto debería costar el trabajo.

**Cómo funciona:**
- El cliente sube una **foto** o **describe el problema** con sus palabras (ej. "se me reventó un tubo debajo del fregadero").
- La IA:
  - Clasifica la **categoría** del servicio (fontanería, electricidad, etc.).
  - Detecta si es **urgente** (y puede activar el Modo Urgencia, idea #3).
  - Sugiere un **rango de precio de referencia**.
- Con eso se precarga el formulario de "Publicar trabajo".

**Relación con el modelo de negocio:** Reduce la fricción al publicar, lo que genera más trabajos publicados. Diferenciador fuerte frente a la competencia (grupos de Facebook, WhatsApp, recomendaciones de boca en boca).

**Viabilidad para la demo:** Alta. Una llamada a una API de LLM con visión desde el backend Express. **Cumple el requisito de uso de cloud/IA del Entregable 2.**

---

## 3. Modo Urgencia con recargo dinámico

> Idea propuesta por Mari.

**Problema que resuelve:** Emergencias en el hogar (tubo quebrado con fuga, corto eléctrico, quedarse afuera sin llaves) necesitan ayuda inmediata, y hoy no hay forma rápida de conseguirla.

**Cómo funciona:**
- Al publicar, el cliente marca el trabajo como **urgente** (o la IA lo sugiere).
- Limitado a categorías críticas: fontanería, electricidad y cerrajería.
- Se envía una alerta solo a los trabajadores **disponibles en este momento** dentro de un radio corto (usando el mapa con Leaflet y las coordenadas `lat`/`lng` ya existentes).
- El primero que acepta se queda con el trabajo; se muestra un tiempo estimado de llegada.
- Se aplica un **recargo visible** (ej. +40%) sobre la tarifa, similar a la tarifa dinámica de Uber.

**Relación con el modelo de negocio:** CIRA cobra una comisión mayor en trabajos urgentes. El trabajador gana más por responder rápido. El modelo de negocio **se ve funcionando** en la demo.

**Viabilidad para la demo:** Media-alta. Las notificaciones pueden simularse dentro de la app (banner o pantalla de alerta) sin push real.

---

## 4. Pago protegido (escrow) con SINPE Móvil

**Problema que resuelve:** Falta de confianza en los pagos: el cliente teme pagar por adelantado y que no se haga el trabajo; el trabajador teme no recibir su pago.

**Cómo funciona:**
- El cliente paga a CIRA al contratar (SINPE Móvil simulado).
- El dinero queda **retenido** hasta que ambas partes confirmen que el trabajo terminó.
- Confirmar el trabajo y **calificar con estrellas** (idea #1) es el mismo paso.
- Al confirmar, se libera el pago al trabajador menos la comisión de CIRA.

**Relación con el modelo de negocio:** Justifica directamente la **comisión por transacción** y la hace visible en el flujo.

**Viabilidad para la demo:** Alta como simulación (pantalla de "pago" fingido, como pidió el profesor). No requiere pasarela real.

---

## 5. Verificación con insignias

**Problema que resuelve:** Las estrellas solas no dicen si la persona es quien dice ser ni si tiene experiencia comprobada.

**Cómo funciona:** Badges visibles en el perfil y en las tarjetas:
- ✔️ Cédula verificada
- 📄 Hoja de delincuencia al día
- 🏅 +50 trabajos completados
- ⚡ Responde urgencias

**Relación con el modelo de negocio:** Posible monetización futura (verificación premium o destacar perfiles verificados).

**Viabilidad para la demo:** Alta. Son campos en la base de datos y componentes visuales.

---

## 6. Plan CIRA Plus para trabajadores (alertas prioritarias)

> Idea propuesta por un compañero del equipo. Complementa el Modo Urgencia de Mari (idea #3).

**Problema que resuelve:** Los trabajadores pierden oportunidades porque no se enteran a tiempo de los trabajos cercanos. Por su parte, CIRA necesita una fuente de ingreso recurrente además de la comisión por transacción.

**Cómo funciona:** Modelo *freemium* con dos planes para trabajadores:

| | Plan Básico (gratis) | Plan Plus (suscripción mensual) |
|---|---|---|
| Perfil, postularse, chat | ✅ | ✅ |
| Explorar trabajos | ✅ | ✅ |
| Alertas de trabajos de su oficio en su zona | Con demora | **Instantáneas y primero** |
| Alertas de urgencias (idea #3) | Si nadie Plus acepta | **Prioridad** |
| Panel "Te están buscando cerca" | ❌ | ✅ |
| Perfil destacado en búsquedas | ❌ | ✅ |

- **Alerta prioritaria:** si soy electricista Plus y alguien cerca publica que necesita un electricista, me llega la notificación de inmediato, antes que a los trabajadores del plan básico.
- **Panel "Te están buscando cerca":** al abrir la app, el trabajador Plus ve primero la lista de clientes cercanos que buscan su oficio, ordenada por distancia (usando el mapa y las coordenadas `lat`/`lng`).

**A tener en cuenta:**
- La prioridad debe ser una **ventaja de tiempo** (ej. los Plus reciben la alerta 2–3 minutos antes), no una exclusividad. Así el cliente siempre recibe respuesta y los trabajadores gratuitos siguen teniendo oportunidades.
- Se puede combinar con la reputación: entre los Plus, la alerta llega primero a los mejor calificados (idea #1).

**Relación con el modelo de negocio:** Agrega una segunda fuente de ingresos (**suscripción**) a la comisión por transacción. Debe reflejarse en el Business Model Canvas (fuentes de ingreso y segmentos de clientes).

**Viabilidad para la demo:** Alta. Un campo `plan` en el usuario, una pantalla de planes con "pago" simulado y la alerta mostrada como banner dentro de la app.

---

## Flujo integrado para la demo

Las ideas se conectan en un solo recorrido:

1. El cliente toma una foto del tubo quebrado.
2. La **IA** detecta: fontanería, urgente, rango de precio sugerido.
3. Se activa el **Modo Urgencia** y se alerta a fontaneros cercanos disponibles, primero a los del **Plan Plus**.
4. Un trabajador **verificado** acepta.
5. El cliente paga y el dinero queda **retenido**.
6. Al terminar, ambos confirman y se **califican con estrellas**; se libera el pago.

---

## Ideas por evaluar

_(Agregar aquí nuevas propuestas del equipo)_
