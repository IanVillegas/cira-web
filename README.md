# CIRA — MVP (Aplicaciones Informáticas Globales)

Monorepo con el frontend y el backend del MVP de CIRA, migrado desde el
proyecto original en .NET MAUI ([`CIRA-Frontend`](../CIRA-Frontend)) a un
mockup interactivo web con datos reales.

- [`web/`](web) — Frontend (React + TypeScript + Tailwind CSS, Vite).
- [`server/`](server) — Backend (Express + SQLite vía `node:sqlite`).

## Uso rápido

```bash
# Terminal 1 — backend
cd server
npm install
npm run dev      # http://localhost:3001

# Terminal 2 — frontend
cd web
npm install
npm run dev      # http://localhost:5173
```

Ver el README de cada carpeta para más detalle (endpoints de la API,
cómo exponer el backend con Dev Tunnels durante la presentación, etc.).

## Modo demo (un solo puerto, recomendado para presentar)

Compila la app y la sirve junto con el backend. Solo hay que abrir **un** puerto
y no hace falta `.env.local`.

```bash
cd server
npm install        # solo la primera vez (y `npm install` en web/)
npm run demo       # compila web/ y levanta todo en http://localhost:3001
```

La consola imprime la dirección para otros dispositivos, por ejemplo
`http://192.168.x.x:3001`: ábrela desde el teléfono conectado a la **misma red
WiFi** (si Windows pregunta por el firewall, permite Node.js en redes privadas).
Para exponerlo a Internet, el único puerto a publicar es el 3001.

Nota: por HTTP en la red local el navegador del teléfono bloquea
"Usar mi ubicación" (necesita HTTPS); el resto de la app funciona igual.
