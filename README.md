# CIRA-Web

Frontend web de CIRA (React + TypeScript + Tailwind CSS), migrado desde el
proyecto original en .NET MAUI. Es el MVP para el curso de Aplicaciones
Informáticas Globales: un mockup interactivo que conecta empleadores con
trabajadores mediante geolocalización, perfiles y chat.

## Requisitos

- Node.js 22.5+ (recomendado 24+) — se usa para correr también el backend.
- El backend [`CIRA-Server`](../CIRA-Server) corriendo en paralelo para
  datos reales (SQLite). Sin él, la mayoría de pantallas muestran un estado
  de "sin conexión" en vez de datos.

## Uso

```bash
# 1. Backend (en otra terminal, desde CIRA-Server)
cd ../CIRA-Server && npm install && npm run dev

# 2. Frontend
npm install
npm run dev      # http://localhost:5173
```

Por defecto el frontend apunta a `http://localhost:3001`. Para apuntar a
otra URL (por ejemplo un túnel público durante la presentación), copiá
`.env.example` a `.env.local` y ajustá `VITE_API_URL`.

## Estructura

- `src/lib/api.ts` — cliente HTTP hacia CIRA-Server.
- `src/lib/auth.tsx` — sesión simulada (login por teléfono/OTP) + datos
  reales del usuario obtenidos del backend.
- `src/components/ui/` — sistema de diseño (Button, Card, Input, PageHeader,
  BottomNav, etc.), portado 1:1 desde los tokens de
  `CIRA-Frontend/Resources/Styles/*.xaml`.
- `src/pages/` — una pantalla por archivo, replicando las vistas del
  proyecto MAUI original (`CIRA-Frontend/Views/`).
- `src/layouts/PhoneFrame.tsx` — envuelve cada pantalla en un "marco de
  teléfono" para que la experiencia se sienta como una app móvil incluso
  en desktop.

## Deploy

El proyecto está pensado para desplegarse en Vercel (build de Vite
está­ndar: `npm run build`, output `dist`). Ver conversación del proyecto
para más detalle sobre la estrategia de publicación.
