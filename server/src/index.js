import express from "express";
import cors from "cors";
import { seedIfEmpty } from "./seed.js";
import { router } from "./routes.js";

seedIfEmpty();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // abierto para poder exponer el puerto con Dev Tunnels durante la demo
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, servicio: "CIRA API", version: "1.0.0" });
});

app.use("/api", router);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`CIRA API corriendo en http://localhost:${PORT}`);
});
