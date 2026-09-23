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

## Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/usuario` | Perfil del usuario actual |
| PUT | `/api/usuario` | Actualiza nombre/zona/descripción/métodos de pago |
| PUT | `/api/usuario/disponibilidad` | Cambia disponibilidad del trabajador |
| POST/DELETE | `/api/usuario/servicios[/:id]` | Agrega o elimina un servicio ofrecido |
| GET | `/api/trabajos` | Lista trabajos (filtros `publicador`, `postulado`) |
| POST | `/api/trabajos` | Publica un trabajo nuevo |
| PATCH | `/api/trabajos/:id/postular` | Postula/retira postulación |
| GET | `/api/trabajadores` | Lista trabajadores |
| GET | `/api/conversaciones[/:id]` | Lista o detalle de conversaciones |
| POST | `/api/conversaciones/:id/mensajes` | Envía un mensaje |
| GET | `/api/historial` | Historial de trabajos |
