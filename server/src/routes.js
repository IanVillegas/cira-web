import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import { CATEGORIAS_URGENTES, CONFIG, ETAPAS, METODOS_PAGO } from "./config.js";
import {
  calcularResumenPago,
  distanciaKm,
  mapConversacion,
  mapHistorial,
  mapMensaje,
  mapPerfilPublico,
  mapTrabajador,
  mapTrabajo,
  mapUsuario,
  obtenerUsuario,
  parseFechaSql,
  reputacionDe,
} from "./mappers.js";

export const router = Router();

const METODO_APP = "Pago en la app";
const ESTADOS_CERRADOS = ["Finalizado", "Cancelado"];
const error = (res, status, mensaje) => res.status(status).json({ error: mensaje });

// ── Autenticación (fase de pruebas) ─────────────────────────────────
// Login por teléfono (o correo) + PIN. El "token" es el id del usuario: alcanza para que
// varias personas usen la demo a la vez, pero NO es seguridad real.
const soloDigitos = (v) => String(v ?? "").replace(/\D/g, "");

function normalizarTelefono(v) {
  const d = soloDigitos(v);
  return d.length === 11 && d.startsWith("506") ? d.slice(3) : d;
}

router.post("/auth/login", (req, res) => {
  const { identifier, pin } = req.body;
  const buscado = String(identifier ?? "").trim();
  if (!buscado) return error(res, 400, "Ingresa tu teléfono o correo.");

  const usuarios = db.prepare("SELECT * FROM usuario").all();
  const tel = normalizarTelefono(buscado);
  const row = usuarios.find(
    (u) =>
      (tel && normalizarTelefono(u.telefono) === tel) ||
      (u.correo && u.correo.toLowerCase() === buscado.toLowerCase()),
  );
  if (!row) return error(res, 404, "No encontramos una cuenta con ese teléfono o correo.");
  if (row.pin !== String(pin ?? "")) return error(res, 401, "PIN incorrecto.");
  res.json({ token: row.id, usuario: mapUsuario(row) });
});

router.post("/auth/registro", (req, res) => {
  const { telefono, nombre, zona, lat, lng, pin } = req.body;
  const tel = normalizarTelefono(telefono);
  if (!/^\d{8}$/.test(tel)) return error(res, 400, "El teléfono debe tener 8 dígitos.");
  if (!nombre?.trim()) return error(res, 400, "El nombre es obligatorio.");
  if (!/^\d{4}$/.test(String(pin ?? ""))) return error(res, 400, "El PIN debe tener 4 dígitos.");
  const existe = db.prepare("SELECT telefono FROM usuario").all().some((u) => normalizarTelefono(u.telefono) === tel);
  if (existe) return error(res, 409, "Ya existe una cuenta con ese teléfono.");

  const id = `u-${randomUUID()}`;
  db.prepare(
    `INSERT INTO usuario (id, nombre, cedula, telefono, pin, zona, lat, lng, metodos_pago)
     VALUES (?, ?, '', ?, ?, ?, ?, ?, ?)`,
  ).run(id, nombre.trim(), tel, String(pin), zona ?? "", lat ?? null, lng ?? null, JSON.stringify(METODOS_PAGO));
  res.status(201).json({ token: id, usuario: mapUsuario(obtenerUsuario(id)) });
});

router.get("/config", (_req, res) => {
  res.json({
    comisionPct: CONFIG.COMISION_PCT,
    urgenciaPct: CONFIG.URGENCIA_PCT,
    plusPrecio: CONFIG.PLUS_PRECIO,
    retrasoGratisSeg: CONFIG.RETRASO_GRATIS_SEG,
    categoriasUrgentes: CATEGORIAS_URGENTES,
  });
});

router.use((req, res, next) => {
  const id = req.get("x-cira-user");
  if (!id || !obtenerUsuario(id)) return error(res, 401, "Inicia sesión para continuar.");
  req.usuarioId = id;
  next();
});

// ── Usuario / perfil ────────────────────────────────────────────────
router.get("/usuario", (req, res) => {
  res.json(mapUsuario(obtenerUsuario(req.usuarioId)));
});

router.put("/usuario", (req, res) => {
  const { nombre, zona, lat, lng, descripcion, metodosPago, telefono, correo, cedula } = req.body;
  if (metodosPago && !metodosPago.every((m) => METODOS_PAGO.includes(m))) {
    return error(res, 400, "Método de pago no válido.");
  }
  db.prepare(
    `UPDATE usuario SET
       nombre = COALESCE(?, nombre),
       zona = COALESCE(?, zona),
       lat = COALESCE(?, lat),
       lng = COALESCE(?, lng),
       descripcion = COALESCE(?, descripcion),
       metodos_pago = COALESCE(?, metodos_pago),
       telefono = COALESCE(?, telefono),
       correo = COALESCE(?, correo),
       cedula = COALESCE(?, cedula)
     WHERE id = ?`,
  ).run(
    nombre ?? null,
    zona ?? null,
    lat ?? null,
    lng ?? null,
    descripcion ?? null,
    metodosPago ? JSON.stringify(metodosPago) : null,
    telefono ?? null,
    correo ?? null,
    cedula ?? null,
    req.usuarioId,
  );
  res.json(mapUsuario(obtenerUsuario(req.usuarioId)));
});

router.put("/usuario/disponibilidad", (req, res) => {
  const { disponible } = req.body;
  db.prepare("UPDATE usuario SET disponible = ? WHERE id = ?").run(disponible ? 1 : 0, req.usuarioId);
  res.json({ disponible: !!disponible });
});

router.put("/usuario/plan", (req, res) => {
  const { plan } = req.body;
  if (plan !== "plus" && plan !== "gratis") return error(res, 400, "Plan no válido.");
  const yo = obtenerUsuario(req.usuarioId);
  if (plan === "plus" && yo.plan !== "plus") {
    // Pago simulado de la suscripción mensual.
    db.prepare("UPDATE usuario SET plan = 'plus', plan_desde = datetime('now') WHERE id = ?").run(yo.id);
    db.prepare("INSERT INTO suscripcion (id, usuario_id, monto) VALUES (?, ?, ?)").run(
      `sub-${randomUUID()}`,
      yo.id,
      CONFIG.PLUS_PRECIO,
    );
  } else if (plan === "gratis") {
    db.prepare("UPDATE usuario SET plan = 'gratis', plan_desde = NULL WHERE id = ?").run(yo.id);
  }
  res.json(mapUsuario(obtenerUsuario(req.usuarioId)));
});

router.post("/usuario/servicios", (req, res) => {
  const { categoria, descripcion, precioAproximado } = req.body;
  const id = `s-${randomUUID()}`;
  db.prepare(
    "INSERT INTO servicio (id, usuario_id, categoria, descripcion, precio_aproximado) VALUES (?, ?, ?, ?, ?)",
  ).run(id, req.usuarioId, categoria, descripcion, precioAproximado ?? null);
  res.status(201).json({ id, categoria, descripcion, precioAproximado });
});

router.put("/usuario/servicios/:id", (req, res) => {
  const { categoria, descripcion, precioAproximado } = req.body;
  const result = db
    .prepare(
      "UPDATE servicio SET categoria = ?, descripcion = ?, precio_aproximado = ? WHERE id = ? AND usuario_id = ?",
    )
    .run(categoria, descripcion, precioAproximado ?? null, req.params.id, req.usuarioId);
  if (result.changes === 0) return error(res, 404, "Servicio no encontrado.");
  res.json({ id: req.params.id, categoria, descripcion, precioAproximado });
});

router.delete("/usuario/servicios/:id", (req, res) => {
  db.prepare("DELETE FROM servicio WHERE id = ? AND usuario_id = ?").run(req.params.id, req.usuarioId);
  res.status(204).end();
});

// ── Trabajos ────────────────────────────────────────────────────────
const ORDEN_RECIENTES = "ORDER BY creado_en DESC, rowid DESC";

router.get("/trabajos", (req, res) => {
  const yo = req.usuarioId;
  const { publicadas, mios } = req.query;
  let rows;
  if (publicadas === "true") {
    rows = db.prepare(`SELECT * FROM trabajo WHERE publicador_id = ? AND estado != 'Cancelado' ${ORDEN_RECIENTES}`).all(yo);
    const lista = rows.map((r) => mapTrabajo(r, yo));
    // Un trabajo terminado sale de la lista cuando ya se pagó y se calificó.
    return res.json(lista.filter((t) => t.estado !== "Finalizado" || !t.pagado || !t.calificadoPorMi));
  }
  if (mios === "true") {
    rows = db
      .prepare(
        `SELECT * FROM trabajo
          WHERE publicador_id != ? AND estado != 'Cancelado'
            AND (trabajador_id = ? OR id IN (SELECT trabajo_id FROM postulacion WHERE usuario_id = ?))
          ${ORDEN_RECIENTES}`,
      )
      .all(yo, yo, yo);
    const lista = rows.map((r) => mapTrabajo(r, yo));
    return res.json(lista.filter((t) => t.estado !== "Finalizado" || !t.calificadoPorMi));
  }
  rows = db
    .prepare(
      `SELECT * FROM trabajo
        WHERE estado = 'Pendiente' AND trabajador_id IS NULL AND publicador_id != ? ${ORDEN_RECIENTES}`,
    )
    .all(yo);
  res.json(rows.map((r) => mapTrabajo(r, yo)));
});

function trabajoDe(req, res) {
  const row = db.prepare("SELECT * FROM trabajo WHERE id = ?").get(req.params.id);
  if (!row) error(res, 404, "Trabajo no encontrado.");
  return row;
}

const responderTrabajo = (req, res, id, status = 200) =>
  res.status(status).json(mapTrabajo(db.prepare("SELECT * FROM trabajo WHERE id = ?").get(id), req.usuarioId));

router.get("/trabajos/:id", (req, res) => {
  const row = trabajoDe(req, res);
  if (row) responderTrabajo(req, res, row.id);
});

router.post("/trabajos", (req, res) => {
  const { titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodoPago, urgente } = req.body;
  const esUrgente = !!urgente;
  if (!titulo || !categoria || !ubicacion || !(pago > 0) || (!fecha && !esUrgente)) {
    return error(res, 400, "Faltan campos obligatorios o el pago no es válido.");
  }
  if (esUrgente && !CATEGORIAS_URGENTES.includes(categoria)) {
    return error(res, 400, `El modo urgencia solo aplica a: ${CATEGORIAS_URGENTES.join(", ")}.`);
  }
  // Las urgencias siempre se pagan en la app para poder cobrar la tarifa de urgencia.
  const metodo = esUrgente ? METODO_APP : metodoPago;
  if (!METODOS_PAGO.includes(metodo)) return error(res, 400, "Método de pago no válido.");

  const id = `t-${randomUUID()}`;
  db.prepare(
    `INSERT INTO trabajo (id, titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodo_pago, publicador_id, urgente)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id, titulo, descripcion ?? "", categoria, ubicacion, lat ?? null, lng ?? null,
    fecha || "Lo antes posible", pago, metodo, req.usuarioId, esUrgente ? 1 : 0,
  );
  responderTrabajo(req, res, id, 201);
});

/** Editar una publicación: solo su dueño y mientras nadie haya sido asignado. */
router.patch("/trabajos/:id", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.publicador_id !== req.usuarioId) return error(res, 403, "Solo puedes editar tus publicaciones.");
  if (row.estado !== "Pendiente") return error(res, 409, "Solo se pueden editar publicaciones pendientes.");

  const { titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodoPago } = req.body;
  if (pago != null && !(pago > 0)) return error(res, 400, "El pago no es válido.");
  if (row.urgente && categoria && !CATEGORIAS_URGENTES.includes(categoria)) {
    return error(res, 400, "Una urgencia debe mantener una categoría crítica.");
  }
  const metodo = row.urgente ? METODO_APP : metodoPago;
  if (metodo && !METODOS_PAGO.includes(metodo)) return error(res, 400, "Método de pago no válido.");

  db.prepare(
    `UPDATE trabajo SET
       titulo = COALESCE(?, titulo),
       descripcion = COALESCE(?, descripcion),
       categoria = COALESCE(?, categoria),
       ubicacion = COALESCE(?, ubicacion),
       lat = COALESCE(?, lat),
       lng = COALESCE(?, lng),
       fecha = COALESCE(?, fecha),
       pago = COALESCE(?, pago),
       metodo_pago = COALESCE(?, metodo_pago)
     WHERE id = ?`,
  ).run(
    titulo ?? null, descripcion ?? null, categoria ?? null, ubicacion ?? null,
    lat ?? null, lng ?? null, fecha ?? null, pago ?? null, metodo ?? null, row.id,
  );
  responderTrabajo(req, res, row.id);
});

router.patch("/trabajos/:id/postular", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.publicador_id === req.usuarioId) return error(res, 400, "No puedes postularte a tu propio trabajo.");
  if (row.estado !== "Pendiente") return error(res, 409, "Este trabajo ya no recibe postulaciones.");

  const existe = db
    .prepare("SELECT 1 FROM postulacion WHERE trabajo_id = ? AND usuario_id = ?")
    .get(row.id, req.usuarioId);
  if (existe) {
    db.prepare("DELETE FROM postulacion WHERE trabajo_id = ? AND usuario_id = ?").run(row.id, req.usuarioId);
  } else {
    db.prepare("INSERT INTO postulacion (trabajo_id, usuario_id) VALUES (?, ?)").run(row.id, req.usuarioId);
  }
  responderTrabajo(req, res, row.id);
});

router.get("/trabajos/:id/postulantes", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.publicador_id !== req.usuarioId) return error(res, 403, "Solo el publicador ve los postulantes.");
  const yo = obtenerUsuario(req.usuarioId);
  const postulantes = db
    .prepare("SELECT usuario_id FROM postulacion WHERE trabajo_id = ? ORDER BY creado_en, rowid")
    .all(row.id)
    .map((p) => mapTrabajador(obtenerUsuario(p.usuario_id), yo));
  res.json(postulantes);
});

/** El publicador elige a uno de sus postulantes. */
router.post("/trabajos/:id/asignar", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.publicador_id !== req.usuarioId) return error(res, 403, "Solo el publicador puede asignar el trabajo.");
  if (row.estado !== "Pendiente") return error(res, 409, "Este trabajo ya fue asignado.");
  const { trabajadorId } = req.body;
  const postulo = db
    .prepare("SELECT 1 FROM postulacion WHERE trabajo_id = ? AND usuario_id = ?")
    .get(row.id, trabajadorId);
  if (!postulo) return error(res, 400, "Esa persona no se ha postulado.");

  db.prepare("UPDATE trabajo SET trabajador_id = ?, estado = 'Asignado', etapa = 'Aceptado' WHERE id = ?").run(
    trabajadorId,
    row.id,
  );
  responderTrabajo(req, res, row.id);
});

/** Modo urgencia: el primer trabajador que acepta se queda con el trabajo. */
router.post("/trabajos/:id/aceptar-urgencia", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (!row.urgente) return error(res, 400, "Este trabajo no es una urgencia.");
  if (row.publicador_id === req.usuarioId) return error(res, 400, "No puedes aceptar tu propia urgencia.");
  if (row.estado !== "Pendiente" || row.trabajador_id) {
    return error(res, 409, "Otra persona ya aceptó esta urgencia.");
  }
  db.prepare("UPDATE trabajo SET trabajador_id = ?, estado = 'Asignado', etapa = 'Aceptado' WHERE id = ?").run(
    req.usuarioId,
    row.id,
  );
  db.prepare("UPDATE usuario SET responde_urgencias = 1 WHERE id = ?").run(req.usuarioId);
  responderTrabajo(req, res, row.id);
});

/** El trabajador asignado avanza el seguimiento: Aceptado → En camino → Llegó → Terminado. */
router.patch("/trabajos/:id/etapa", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.trabajador_id !== req.usuarioId) return error(res, 403, "Solo el trabajador asignado actualiza el seguimiento.");
  if (ESTADOS_CERRADOS.includes(row.estado)) return error(res, 409, "El trabajo ya terminó.");

  const siguiente = ETAPAS[ETAPAS.indexOf(row.etapa) + 1];
  if (!siguiente) return error(res, 409, "El trabajo ya está en su última etapa.");
  const estado = siguiente === "Terminado" ? "Finalizado" : siguiente === "Llegó" ? "En progreso" : row.estado;
  db.prepare(
    `UPDATE trabajo SET etapa = ?, estado = ?,
       finalizado_en = CASE WHEN ? = 'Finalizado' THEN datetime('now') ELSE finalizado_en END
     WHERE id = ?`,
  ).run(siguiente, estado, estado, row.id);
  responderTrabajo(req, res, row.id);
});

/** Cancelar: el publicador cancela el trabajo; el trabajador solo se retira (el trabajo vuelve a quedar abierto). */
router.post("/trabajos/:id/cancelar", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (ESTADOS_CERRADOS.includes(row.estado)) return error(res, 409, "El trabajo ya terminó.");

  if (row.publicador_id === req.usuarioId) {
    db.prepare("UPDATE trabajo SET estado = 'Cancelado' WHERE id = ?").run(row.id);
  } else {
    db.prepare("DELETE FROM postulacion WHERE trabajo_id = ? AND usuario_id = ?").run(row.id, req.usuarioId);
    if (row.trabajador_id === req.usuarioId) {
      db.prepare("UPDATE trabajo SET trabajador_id = NULL, estado = 'Pendiente', etapa = NULL WHERE id = ?").run(row.id);
    }
  }
  responderTrabajo(req, res, row.id);
});

/** Pago simulado: el publicador paga un trabajo terminado. */
router.post("/trabajos/:id/pagar", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.publicador_id !== req.usuarioId) return error(res, 403, "Solo el publicador puede pagar.");
  if (row.estado !== "Finalizado") return error(res, 409, "El trabajo aún no está terminado.");
  if (row.pagado) return error(res, 409, "Este trabajo ya fue pagado.");

  const r = calcularResumenPago(row.pago, !!row.urgente, row.metodo_pago);
  db.prepare(
    "INSERT INTO pago (id, trabajo_id, metodo, monto, comision, tarifa_urgencia, total) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(`pg-${randomUUID()}`, row.id, row.metodo_pago, r.monto, r.comision, r.tarifaUrgencia, r.total);
  db.prepare("UPDATE trabajo SET pagado = 1 WHERE id = ?").run(row.id);
  responderTrabajo(req, res, row.id);
});

router.post("/trabajos/:id/calificar", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  const esPublicador = row.publicador_id === req.usuarioId;
  if (!esPublicador && row.trabajador_id !== req.usuarioId) return error(res, 403, "No participaste en este trabajo.");
  if (row.estado !== "Finalizado") return error(res, 409, "Solo se califica un trabajo terminado.");

  const estrellas = Number(req.body.estrellas);
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
    return error(res, 400, "La calificación debe ser de 1 a 5 estrellas.");
  }
  const yaCalifico = db
    .prepare("SELECT 1 FROM calificacion WHERE trabajo_id = ? AND de_id = ?")
    .get(row.id, req.usuarioId);
  if (yaCalifico) return error(res, 409, "Ya calificaste este trabajo.");

  db.prepare(
    "INSERT INTO calificacion (id, trabajo_id, de_id, a_id, estrellas, comentario) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(
    `k-${randomUUID()}`,
    row.id,
    req.usuarioId,
    esPublicador ? row.trabajador_id : row.publicador_id,
    estrellas,
    String(req.body.comentario ?? "").trim().slice(0, 500),
  );
  responderTrabajo(req, res, row.id);
});

// ── Trabajadores y perfiles ─────────────────────────────────────────
/** Todas las personas que ofrecen al menos un servicio (menos quien consulta). */
router.get("/trabajadores", (req, res) => {
  const yo = obtenerUsuario(req.usuarioId);
  const rows = db
    .prepare("SELECT * FROM usuario WHERE id != ? AND id IN (SELECT usuario_id FROM servicio)")
    .all(req.usuarioId);
  res.json(rows.map((r) => mapTrabajador(r, yo)).sort((a, b) => a.distanciaKm - b.distanciaKm));
});

router.get("/usuarios/:id", (req, res) => {
  const row = obtenerUsuario(req.params.id);
  if (!row) return error(res, 404, "Usuario no encontrado.");
  res.json(mapPerfilPublico(row, obtenerUsuario(req.usuarioId)));
});

router.post("/reportes", (req, res) => {
  const { usuarioId, motivo, detalle, trabajoId } = req.body;
  if (!motivo?.trim()) return error(res, 400, "Indica el motivo del reporte.");
  if (usuarioId === req.usuarioId) return error(res, 400, "No puedes reportarte a ti mismo.");
  if (!obtenerUsuario(usuarioId)) return error(res, 404, "Usuario no encontrado.");

  const id = `r-${randomUUID()}`;
  db.prepare("INSERT INTO reporte (id, de_id, a_id, trabajo_id, motivo, detalle) VALUES (?, ?, ?, ?, ?, ?)").run(
    id, req.usuarioId, usuarioId, trabajoId ?? null, motivo.trim(), String(detalle ?? "").trim().slice(0, 500),
  );
  res.status(201).json({ id });
});

// ── Alertas (Plan Plus y Modo Urgencia) ─────────────────────────────
function ofreceCategoria(usuarioId, categoria) {
  return !!db.prepare("SELECT 1 FROM servicio WHERE usuario_id = ? AND categoria = ?").get(usuarioId, categoria);
}

function dentroDelRadio(a, b) {
  const d = distanciaKm(a.lat, a.lng, b.lat, b.lng);
  return d == null || d <= CONFIG.RADIO_ALERTAS_KM;
}

/**
 * Trabajos abiertos de mi oficio y mi zona. Los Plus los ven primero (los mejor calificados,
 * antes); el plan gratis los ve unos minutos después. Las urgencias van primero en la lista.
 */
function calcularAlertas(usuarioId) {
  const yo = obtenerUsuario(usuarioId);
  if (!yo.disponible) return [];
  const ahora = Date.now();
  const ventanaMs = CONFIG.VENTANA_ALERTAS_MIN * 60_000;

  const abiertos = db
    .prepare(
      `SELECT * FROM trabajo
        WHERE estado = 'Pendiente' AND trabajador_id IS NULL AND publicador_id != ?
          AND id NOT IN (SELECT trabajo_id FROM alerta_descartada WHERE usuario_id = ?)
        ${ORDEN_RECIENTES}`,
    )
    .all(usuarioId, usuarioId);

  const alertas = [];
  for (const trabajo of abiertos) {
    const creado = parseFechaSql(trabajo.creado_en);
    if (ahora - creado > ventanaMs) continue;
    if (!ofreceCategoria(usuarioId, trabajo.categoria) || !dentroDelRadio(yo, trabajo)) continue;

    let retrasoSeg = CONFIG.RETRASO_GRATIS_SEG;
    if (yo.plan === "plus") {
      const plusCandidatos = db
        .prepare("SELECT * FROM usuario WHERE plan = 'plus' AND disponible = 1 AND id != ?")
        .all(trabajo.publicador_id)
        .filter((u) => ofreceCategoria(u.id, trabajo.categoria) && dentroDelRadio(u, trabajo))
        .sort((a, b) => (reputacionDe(b.id).calificacion ?? 0) - (reputacionDe(a.id).calificacion ?? 0) || a.id.localeCompare(b.id));
      retrasoSeg = plusCandidatos.findIndex((u) => u.id === yo.id) * CONFIG.ESCALON_PLUS_SEG;
    }
    const visibleDesde = creado + retrasoSeg * 1000;
    if (ahora < visibleDesde) continue;

    alertas.push({
      trabajo: mapTrabajo(trabajo, usuarioId),
      urgente: !!trabajo.urgente,
      prioritaria: yo.plan === "plus",
      visibleDesde: new Date(visibleDesde).toISOString(),
    });
  }
  return alertas.sort((a, b) => Number(b.urgente) - Number(a.urgente));
}

router.get("/alertas", (req, res) => {
  res.json(calcularAlertas(req.usuarioId));
});

router.post("/alertas/:trabajoId/descartar", (req, res) => {
  db.prepare("INSERT OR IGNORE INTO alerta_descartada (usuario_id, trabajo_id) VALUES (?, ?)").run(
    req.usuarioId,
    req.params.trabajoId,
  );
  res.status(204).end();
});

// ── Conversaciones / mensajes ───────────────────────────────────────
function conversacionDe(req, res) {
  const c = db.prepare("SELECT * FROM conversacion WHERE id = ?").get(req.params.id);
  if (!c || (c.usuario_a !== req.usuarioId && c.usuario_b !== req.usuarioId)) {
    error(res, 404, "Conversación no encontrada.");
    return null;
  }
  return c;
}

router.get("/conversaciones", (req, res) => {
  const filas = db
    .prepare("SELECT * FROM conversacion WHERE usuario_a = ? OR usuario_b = ?")
    .all(req.usuarioId, req.usuarioId);
  res.json(filas.map((c) => mapConversacion(c, req.usuarioId)));
});

/** Abre (o reutiliza) la conversación con otra persona: botones "Comunícate" y "Contactar". */
router.post("/conversaciones", (req, res) => {
  const { usuarioId } = req.body;
  if (!usuarioId || usuarioId === req.usuarioId || !obtenerUsuario(usuarioId)) {
    return error(res, 400, "Usuario no válido.");
  }
  let c = db
    .prepare(
      `SELECT * FROM conversacion
        WHERE (usuario_a = ? AND usuario_b = ?) OR (usuario_a = ? AND usuario_b = ?)`,
    )
    .get(req.usuarioId, usuarioId, usuarioId, req.usuarioId);
  if (!c) {
    const id = `c-${randomUUID()}`;
    db.prepare("INSERT INTO conversacion (id, usuario_a, usuario_b) VALUES (?, ?, ?)").run(id, req.usuarioId, usuarioId);
    c = db.prepare("SELECT * FROM conversacion WHERE id = ?").get(id);
  }
  res.status(201).json(mapConversacion(c, req.usuarioId));
});

router.get("/conversaciones/:id", (req, res) => {
  const c = conversacionDe(req, res);
  if (c) res.json(mapConversacion(c, req.usuarioId));
});

router.post("/conversaciones/:id/mensajes", (req, res) => {
  const { texto } = req.body;
  if (!texto?.trim()) return error(res, 400, "El mensaje no puede estar vacío.");
  const c = conversacionDe(req, res);
  if (!c) return;

  const id = `m-${randomUUID()}`;
  const hora = new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
  db.prepare("INSERT INTO mensaje (id, conversacion_id, autor_id, texto, hora) VALUES (?, ?, ?, ?, ?)").run(
    id, c.id, req.usuarioId, texto.trim(), hora,
  );
  res.status(201).json(mapMensaje({ id, autor_id: req.usuarioId, texto: texto.trim(), hora }, req.usuarioId));
});

// ── Historial ───────────────────────────────────────────────────────
router.get("/historial", (req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM trabajo
        WHERE (publicador_id = ? OR trabajador_id = ?) AND estado IN ('Finalizado', 'Cancelado')
        ORDER BY COALESCE(finalizado_en, creado_en) DESC, rowid DESC`,
    )
    .all(req.usuarioId, req.usuarioId);
  res.json(rows.map((r) => mapHistorial(r, req.usuarioId)));
});

// ── Ingresos de CIRA (vista de demostración del modelo de negocio) ──
router.get("/ingresos", (_req, res) => {
  const suma = (sql) => db.prepare(sql).get();
  const plus = suma("SELECT COALESCE(SUM(monto), 0) AS total, COUNT(*) AS n FROM suscripcion");
  const urgencia = suma("SELECT COALESCE(SUM(tarifa_urgencia), 0) AS total, COUNT(*) AS n FROM pago WHERE tarifa_urgencia > 0");
  const comision = suma("SELECT COALESCE(SUM(comision), 0) AS total, COUNT(*) AS n FROM pago WHERE comision > 0");
  res.json({
    planPlus: { total: plus.total, cantidad: plus.n },
    tarifaUrgencia: { total: urgencia.total, cantidad: urgencia.n },
    comisiones: { total: comision.total, cantidad: comision.n },
    total: plus.total + urgencia.total + comision.total,
  });
});
