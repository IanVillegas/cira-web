import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import {
  mapUsuario,
  mapTrabajo,
  mapTrabajador,
  mapConversacion,
  mapHistorial,
} from "./mappers.js";

export const router = Router();

const USUARIO_ID = "u-1"; // MVP de un solo usuario local, coherente con el alcance del curso.

// ── Usuario / perfil ────────────────────────────────────────────────
router.get("/usuario", (_req, res) => {
  const row = db.prepare("SELECT * FROM usuario WHERE id = ?").get(USUARIO_ID);
  const servicios = db.prepare("SELECT * FROM servicio WHERE usuario_id = ?").all(USUARIO_ID);
  res.json(mapUsuario(row, servicios));
});

router.put("/usuario", (req, res) => {
  const { nombre, zona, descripcion, metodosPago } = req.body;
  db.prepare(
    "UPDATE usuario SET nombre = ?, zona = ?, descripcion = ?, metodos_pago = ? WHERE id = ?",
  ).run(nombre, zona, descripcion, JSON.stringify(metodosPago ?? []), USUARIO_ID);
  const row = db.prepare("SELECT * FROM usuario WHERE id = ?").get(USUARIO_ID);
  const servicios = db.prepare("SELECT * FROM servicio WHERE usuario_id = ?").all(USUARIO_ID);
  res.json(mapUsuario(row, servicios));
});

router.put("/usuario/disponibilidad", (req, res) => {
  const { disponible } = req.body;
  db.prepare("UPDATE usuario SET disponible = ? WHERE id = ?").run(disponible ? 1 : 0, USUARIO_ID);
  res.json({ disponible: !!disponible });
});

router.post("/usuario/servicios", (req, res) => {
  const { categoria, descripcion, precioAproximado } = req.body;
  const id = `s-${randomUUID()}`;
  db.prepare(
    "INSERT INTO servicio (id, usuario_id, categoria, descripcion, precio_aproximado) VALUES (?, ?, ?, ?, ?)",
  ).run(id, USUARIO_ID, categoria, descripcion, precioAproximado ?? null);
  res.status(201).json({ id, categoria, descripcion, precioAproximado });
});

router.delete("/usuario/servicios/:id", (req, res) => {
  db.prepare("DELETE FROM servicio WHERE id = ? AND usuario_id = ?").run(req.params.id, USUARIO_ID);
  res.status(204).end();
});

// ── Trabajos ────────────────────────────────────────────────────────
router.get("/trabajos", (req, res) => {
  const { publicador, postulado } = req.query;
  let sql = "SELECT * FROM trabajo WHERE 1=1";
  const params = [];
  if (publicador) {
    sql += " AND publicador = ?";
    params.push(publicador);
  }
  if (postulado === "true") {
    sql += " AND ya_postulado = 1";
  }
  sql += " ORDER BY creado_en DESC";
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(mapTrabajo));
});

router.post("/trabajos", (req, res) => {
  const { titulo, descripcion, categoria, ubicacion, fecha, pago, metodoPago, publicador } = req.body;
  if (!titulo || !categoria || !ubicacion || !fecha || !(pago > 0)) {
    return res.status(400).json({ error: "Faltan campos obligatorios o el pago no es válido." });
  }
  const id = `t-${randomUUID()}`;
  db.prepare(
    `INSERT INTO trabajo (id, titulo, descripcion, categoria, ubicacion, distancia_km, fecha, pago, metodo_pago, publicador, estado, postulantes, ya_postulado)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'Pendiente', 0, 0)`,
  ).run(id, titulo, descripcion ?? "", categoria, ubicacion, fecha, pago, metodoPago, publicador ?? "Ian Villegas");
  const row = db.prepare("SELECT * FROM trabajo WHERE id = ?").get(id);
  res.status(201).json(mapTrabajo(row));
});

router.patch("/trabajos/:id/postular", (req, res) => {
  const row = db.prepare("SELECT * FROM trabajo WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Trabajo no encontrado." });

  const nuevoEstado = row.ya_postulado ? 0 : 1;
  const nuevosPostulantes = Math.max(0, row.postulantes + (nuevoEstado ? 1 : -1));
  db.prepare("UPDATE trabajo SET ya_postulado = ?, postulantes = ? WHERE id = ?").run(
    nuevoEstado,
    nuevosPostulantes,
    req.params.id,
  );
  const actualizado = db.prepare("SELECT * FROM trabajo WHERE id = ?").get(req.params.id);
  res.json(mapTrabajo(actualizado));
});

router.patch("/trabajos/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM trabajo WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Trabajo no encontrado." });

  const { titulo, descripcion, ubicacion, fecha, pago, estado } = req.body;
  db.prepare(
    `UPDATE trabajo SET
       titulo = COALESCE(?, titulo),
       descripcion = COALESCE(?, descripcion),
       ubicacion = COALESCE(?, ubicacion),
       fecha = COALESCE(?, fecha),
       pago = COALESCE(?, pago),
       estado = COALESCE(?, estado)
     WHERE id = ?`,
  ).run(titulo, descripcion, ubicacion, fecha, pago, estado, req.params.id);
  const actualizado = db.prepare("SELECT * FROM trabajo WHERE id = ?").get(req.params.id);
  res.json(mapTrabajo(actualizado));
});

// ── Trabajadores ────────────────────────────────────────────────────
router.get("/trabajadores", (_req, res) => {
  const rows = db.prepare("SELECT * FROM trabajador ORDER BY distancia_km ASC").all();
  res.json(rows.map(mapTrabajador));
});

// ── Conversaciones / mensajes ───────────────────────────────────────
router.get("/conversaciones", (_req, res) => {
  const conversaciones = db.prepare("SELECT * FROM conversacion").all();
  const result = conversaciones.map((c) => {
    const mensajes = db
      .prepare("SELECT * FROM mensaje WHERE conversacion_id = ? ORDER BY creado_en ASC")
      .all(c.id);
    return mapConversacion(c, mensajes);
  });
  res.json(result);
});

router.get("/conversaciones/:id", (req, res) => {
  const c = db.prepare("SELECT * FROM conversacion WHERE id = ?").get(req.params.id);
  if (!c) return res.status(404).json({ error: "Conversación no encontrada." });
  const mensajes = db
    .prepare("SELECT * FROM mensaje WHERE conversacion_id = ? ORDER BY creado_en ASC")
    .all(c.id);
  res.json(mapConversacion(c, mensajes));
});

router.post("/conversaciones/:id/mensajes", (req, res) => {
  const { texto, autor = "yo" } = req.body;
  if (!texto?.trim()) return res.status(400).json({ error: "El mensaje no puede estar vacío." });

  const conversacion = db.prepare("SELECT * FROM conversacion WHERE id = ?").get(req.params.id);
  if (!conversacion) return res.status(404).json({ error: "Conversación no encontrada." });

  const id = `m-${randomUUID()}`;
  const hora = new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
  db.prepare(
    "INSERT INTO mensaje (id, conversacion_id, autor, texto, hora) VALUES (?, ?, ?, ?, ?)",
  ).run(id, req.params.id, autor, texto.trim(), hora);

  res.status(201).json({ id, autor, texto: texto.trim(), hora });
});

// ── Historial ───────────────────────────────────────────────────────
router.get("/historial", (_req, res) => {
  const rows = db.prepare("SELECT * FROM historial ORDER BY fecha DESC").all();
  res.json(rows.map(mapHistorial));
});
