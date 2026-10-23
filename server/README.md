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

## Usuarios de prueba (multiusuario)

Hay 9 usuarios sembrados con teléfonos ficticios `8888-0001` … `8888-0009` y el
PIN **1234** para todos (fase de pruebas). El login es
`POST /api/auth/login` con teléfono (o correo) + PIN y devuelve un "token" que es
el id del usuario; el frontend lo envía en la cabecera `X-Cira-User`. **No es
seguridad real**, solo permite que varias personas usen la demo a la vez
(cada pestaña del navegador guarda su propia sesión).

Para usar los teléfonos reales del equipo sin subirlos al repo, creá
`server/usuarios.local.json` (ya excluido de git por `*.local`):

```json
{ "u-1": { "telefono": "8888-0000", "nombre": "Nombre Real" } }
```

Se aplica en cada arranque. Los ids `u-1`…`u-9` salen de `src/seed.js`.

> Al cambiar el esquema (`VERSION_ESQUEMA` en `src/db.js`) la base local se
> recrea y se vuelve a sembrar automáticamente: son solo datos de prueba.

## Parámetros del modelo de negocio

En `src/config.js` (se pueden sobrescribir con variables de entorno):

| Variable | Defecto | Qué es |
| --- | --- | --- |
| `CIRA_COMISION_PCT` | 10 | Comisión de CIRA sobre pagos en la app |
| `CIRA_URGENCIA_PCT` | 15 | Tarifa de urgencia (pago único por trabajo urgente) |
| `CIRA_PLUS_PRECIO` | 2500 | Precio mensual del Plan Plus (colones) |
| `CIRA_RETRASO_ALERTAS_SEG` | 120 | Segundos que espera el plan gratis para ver una alerta (bajalo para la demo) |
| `CIRA_VENTANA_ALERTAS_MIN` | 30 | Minutos que una alerta sigue activa |

## Endpoints principales

Todos (salvo `auth` y `config`) requieren la cabecera `X-Cira-User`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/login`, `/api/auth/registro` | Inicia sesión / crea cuenta |
| GET | `/api/config` | Comisión, tarifa de urgencia, precio Plus |
| GET/PUT | `/api/usuario` | Perfil del usuario actual |
| PUT | `/api/usuario/disponibilidad`, `/api/usuario/plan` | Disponibilidad; cambio de plan Gratis/Plus (simulado) |
| POST/PUT/DELETE | `/api/usuario/servicios[/:id]` | Servicios ofrecidos |
| GET | `/api/usuarios/:id` | Perfil público: calificación, insignias, comentarios |
| GET | `/api/trabajos` | Trabajos abiertos de otros; `?publicadas=true` o `?mios=true` |
| POST | `/api/trabajos` | Publica (con `urgente: true` para el modo urgencia) |
| PATCH | `/api/trabajos/:id` | Edita una publicación pendiente (solo su dueño) |
| PATCH | `/api/trabajos/:id/postular` | Postula/retira postulación |
| GET/POST | `/api/trabajos/:id/postulantes`, `/asignar` | El publicador elige a un postulante |
| POST | `/api/trabajos/:id/aceptar-urgencia` | El primero que acepta se queda con la urgencia |
| PATCH | `/api/trabajos/:id/etapa` | Seguimiento: Aceptado → En camino → Llegó → Terminado |
| POST | `/api/trabajos/:id/cancelar`, `/pagar`, `/calificar` | Cancelar/retirarse, pago simulado, calificación 1–5 |
| POST | `/api/reportes` | Reportar a un usuario |
| GET | `/api/alertas`, POST `/api/alertas/:trabajoId/descartar` | Alertas por oficio y zona (Plus primero) |
| GET | `/api/trabajadores` | Personas que ofrecen servicios |
| GET/POST | `/api/conversaciones[/:id]`, `/api/conversaciones/:id/mensajes` | Chats entre dos usuarios |
| GET | `/api/historial`, `/api/ingresos` | Historial propio; ingresos de CIRA (demo) |
