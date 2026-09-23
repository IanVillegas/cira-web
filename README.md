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
