import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedIfEmpty } from "./seed.js";
import { router } from "./routes.js";

seedIfEmpty();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // abierto para poder exponer el puerto con Dev Tunnels durante la demo
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, servicio: "CIRA API", version: "1.0.0" });
});

app.use("/api", router);

// Modo demo: si existe la app compilada (web/dist) este mismo servidor la sirve,
// así toda la demo (app + datos) sale por un solo puerto.
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "web", "dist");
const sirveApp = fs.existsSync(path.join(dist, "index.html"));

if (sirveApp) {
  app.use(express.static(dist));
  // Cualquier ruta que no sea de la API devuelve la app (React Router resuelve la pantalla).
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`CIRA API corriendo en http://localhost:${PORT}`);
  console.log(
    sirveApp
      ? "Sirviendo también la app compilada (web/dist) en el mismo puerto."
      : "App compilada no encontrada: ejecuta `npm run build` en web/ para el modo demo.",
  );
});
