# CIRA-Server

Backend real de CIRA para el MVP del curso de Aplicaciones Informáticas Globales.

- **Express** como servidor HTTP.
- **SQLite** vía el módulo nativo `node:sqlite` de Node.js (sin dependencias
  nativas que compilar, requiere Node 22.5+ con la flag experimental, o
  Node 24+ donde ya está estable).
- La base vive en `cira.db` (se crea y se siembra automáticamente al
  arrancar el servidor si está vacía).

## Uso

```bash
npm install
npm run dev      # levanta con recarga automática en http://localhost:3001
```

Para resembrar los datos de ejemplo desde cero, borrá `cira.db` (y los
archivos `cira.db-wal` / `cira.db-shm` si existen) y volvé a arrancar el
servidor.

## Exponer el backend durante la presentación

Como el profesor indicó que basta con simular un hosting real durante la
demo (no hace falta desplegarlo en un proveedor cloud), la forma más simple
es usar **Dev Tunnels de VS Code**:

1. Con el servidor corriendo (`npm run dev`), abrí la pestaña **PORTS** en
   VS Code.
2. Agregá el puerto `3001` y cambiá su visibilidad a **Public**.
3. VS Code genera una URL pública (`https://xxxx-3001.<region>.devtunnels.ms`).
4. En el frontend (`CIRA-Web`), definí esa URL en una variable de entorno
   `VITE_API_URL` antes de compilar/servir, para que la app apunte al túnel
   en lugar de `localhost`.

## Usuarios del equipo (multiusuario)

Hay 6 usuarios sembrados (`src/seed.js`), todos con el PIN **1234** (fase de pruebas):

| Id | Nombre | Teléfono | Correo | Plan | Servicios |
| --- | --- | --- | --- | --- | --- |
| `u-1` | Ian Villegas | 6104-4195 | ian.villegas.jimenez@est.una.ac.cr | Plus | Electricidad, Reparaciones |
| `u-2` | Marisol Hidalgo | 6361-7541 | marisol.hidalgo.murillo@est.una.ac.cr | Gratis | Limpieza, Cuidado de mascotas |
| `u-3` | Bayron Camacho | 8512-8068 | bayron.camacho.ledezma@est.una.ac.cr | Plus | Plomería, Cerrajería |
| `u-4` | Eduardo Picado | 6252-4226 | eduardo.picado.courrau@est.una.ac.cr | Plus | Electricidad, Reparaciones |
| `u-5` | José Jara | 7064-2458 | jose.jara.arias@est.una.ac.cr | Gratis | Plomería, Jardinería |
| `u-6` | Jixi Morales | 6481-8545 | jixi.morales.mendoza@est.una.ac.cr | Gratis | Jardinería, Mudanzas |

El login es `POST /api/auth/login` con **teléfono o correo** + PIN, y devuelve un
"token" que es el id del usuario; el frontend lo envía en la cabecera
`X-Cira-User`. **No es seguridad real**, solo permite que varias personas usen la
demo a la vez (cada pestaña del navegador guarda su propia sesión). La cédula es
solo un dato del perfil (ficticia en los usuarios de prueba).

Los planes, servicios, insignias y trabajos de ejemplo son datos de demostración
para ver Plus vs. gratis (p. ej. dos plomeros: Bayron Plus y José gratis).
Opcionalmente `server/usuarios.local.json` (`{ "u-1": { "telefono": "…" } }`)
sobrescribe teléfono, nombre o correo por id en cada arranque.

> Al cambiar el esquema (`VERSION_ESQUEMA` en `src/db.js`) la base local se
> recrea y se vuelve a sembrar automáticamente: son solo datos de prueba.
>
> Las fechas de los trabajos de ejemplo se calculan desde el día en que se crea la base.
> Para regenerarlas (por ejemplo, el día de la presentación): `npm run reset` y arranca de nuevo.

## Parámetros del modelo de negocio

En `src/config.js` (se pueden sobrescribir con variables de entorno):

| Variable | Defecto | Qué es |
| --- | --- | --- |
| `CIRA_COMISION_PCT` | 10 | Comisión de CIRA sobre pagos con tarjeta |
| `CIRA_URGENCIA_PCT` | 15 | Tarifa de urgencia (pago único por trabajo urgente) |
| `CIRA_URGENCIA_TRABAJADOR_PCT` | 10 | De esos puntos, los que van al trabajador como bono (CIRA se queda el resto: 5) |
| `CIRA_PLUS_PRECIO` | 2500 | Precio mensual del Plan Plus (colones) |
| `CIRA_RETRASO_ALERTAS_SEG` | 120 | Segundos que espera el plan gratis para ver una alerta (bajalo para la demo) |
| `CIRA_VENTANA_ALERTAS_MIN` | 30 | Minutos que una alerta sigue activa |

## Endpoints principales

Todos (salvo `auth` y `config`) requieren la cabecera `X-Cira-User`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/existe`, `/login`, `/registro` (`/api/auth/…`) | Verifica la cuenta, inicia sesión, crea cuenta |
| GET | `/api/avatares` | Catálogo de fotos de perfil (archivos de `web/public/images/cira-avatars`, solo demo) |
| PUT | `/api/usuario/avatar` | Elige la foto (`avatar`: una URL del catálogo, o `null` para las iniciales) |
| GET | `/api/config` | Comisión, tarifa de urgencia, precio Plus |
| GET/PUT | `/api/usuario` | Perfil del usuario actual |
| GET/POST | `/api/usuario/verificacion`, `/cedula`, `/antecedentes` | Verificación simulada: estado de cada documento; enviar cédula (fotos + número) u hoja de delincuencia (archivo + fecha de emisión). Pasa "En revisión" `CIRA_REVISION_SEG` segundos (6 por defecto) y se aprueba sola; la hoja vale 3 meses |
| PUT/DELETE | `/api/usuario/tarjeta` | Registra (simulada) o elimina la tarjeta |
| PUT | `/api/usuario/disponibilidad`, `/api/usuario/plan` | Disponibilidad; cambio de plan Gratis/Plus (simulado) |
| POST/PUT/DELETE | `/api/usuario/servicios[/:id]` | Servicios ofrecidos |
| GET | `/api/usuarios/:id` | Perfil público: calificación, insignias, comentarios |
| GET | `/api/trabajos` | Trabajos abiertos de otros; `?publicadas=true` o `?mios=true` |
| POST | `/api/trabajos` | Publica (`fecha` como `"2026-10-31T09:00"`, hora de Costa Rica; sin fecha si es urgente. `urgente: true` para el modo urgencia, `invitadoId` para una oferta directa —con `frecuencia` `semanal`/`quincenal`/`mensual` es un servicio recurrente—, `propiedadId` para usar una propiedad, `limite` como hora límite ("listo antes de"), o `trueque: true` + `ofrece` para un trueque; ahí `pago` es el diferencial y puede ser 0. Plan gratis: `CIRA_TRUEQUES_GRATIS_MES` trueques al mes, 1 por defecto) |
| PATCH | `/api/trabajos/:id` | Edita una publicación pendiente (solo su dueño) |
| PATCH | `/api/trabajos/:id/postular` | Postula/retira postulación (en un trueque, `propuesta` es la contraoferta) |
| GET/POST | `/api/trabajos/:id/postulantes`, `/asignar` | El publicador elige a un postulante |
| POST | `/api/trabajos/:id/invitacion/aceptar`, `/rechazar` | La persona invitada acepta la oferta directa o la rechaza (queda abierta para todos) |
| POST | `/api/trabajos/:id/trueque/aceptar`, `/finalizar` | Trueque: el trabajador acepta el acuerdo; luego cierra el trueque al recibir la parte del publicador |
| POST | `/api/trabajos/:id/aceptar-urgencia` | El primero que acepta se queda con la urgencia |
| PATCH | `/api/trabajos/:id/etapa` | Seguimiento: Aceptado → En camino → Llegó → Terminado |
| POST | `/api/trabajos/:id/cancelar`, `/pagar`, `/calificar` | Cancelar/retirarse, pago simulado (con `propina` opcional), calificación 1–5 |
| POST | `/api/reportes` | Reportar a un usuario |
| GET | `/api/alertas`, POST `/api/alertas/:trabajoId/descartar` | Alertas por oficio y zona (Plus primero) |
| GET | `/api/agenda?desde&hasta` | Agenda de quien consulta: trabajos con fecha como cliente o trabajador (`rol`) y sus días bloqueados |
| POST/DELETE | `/api/agenda/bloqueos[/:fecha]` | Marca o quita un día como no disponible (nadie le envía ofertas directas ese día) |
| GET | `/api/usuarios/:id/ocupado?desde&hasta` | Días no disponibles de otra persona (bloqueados o con trabajo asignado), sin detalles |
| GET/POST | `/api/trabajos/:id/reemplazos`, `/reemplazo`, `/publicar-abierto` | Visita de un servicio recurrente que el trabajador canceló: sugerencias, elegir reemplazo (oferta directa) o publicarla para todos |
| POST | `/api/series/:id/cancelar` | Termina un servicio recurrente (cliente o trabajador) |
| GET/POST/PUT/DELETE | `/api/propiedades[/:id]` | Mis propiedades: nombre, ubicación, instrucciones y limpiador habitual (`limpiadorId`) |
| POST | `/api/propiedades/:id/entre-huespedes` | Limpieza entre huéspedes (`salida`, `entrada`, `pago`, `metodoPago`): se ofrece al limpiador habitual y pasa a urgencia si no responde en `CIRA_ESCALAR_TURNO_MIN` minutos (10 por defecto) o la rechaza |
| POST | `/api/trabajos/:id/escalar` | El anfitrión pasa ya a urgencia una limpieza entre huéspedes |
| GET | `/api/trabajadores` | Personas que ofrecen servicios (con `deConfianza` y `guardadoPor`) |
| GET/POST/DELETE | `/api/favoritos[/:id]` | "De confianza": lista, agrega o quita trabajadores guardados |
| GET/POST | `/api/conversaciones[/:id]`, `/api/conversaciones/:id/mensajes` | Chats entre dos usuarios |
| GET | `/api/conversaciones/no-leidos` | Mensajes sin leer (insignia y avisos) |
| GET | `/api/historial`, `/api/actividad`, `/api/ingresos` | Historial; pagos hechos y ganancias propias; ingresos de CIRA (demo) |
