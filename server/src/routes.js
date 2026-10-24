import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import { CONFIG, ETAPAS, METODOS_PAGO } from "./config.js";
import {
  FRECUENCIAS,
  diasOcupados,
  estaBloqueado,
  extenderSerie,
  extenderSeriesDe,
  obtenerSerie,
  tieneTrabajoEseDia,
} from "./agenda.js";
import { RE_DIA, diaDe, fechaHoraValida, hoyIso } from "./fechas.js";
import {
  calcularResumenPago,
  distanciaKm,
  mapConversacion,
  mapHistorial,
  mapMensaje,
  mapPerfilPublico,
  mapPropiedad,
  mapTrabajador,
  mapTrabajo,
  mapUsuario,
  mapVerificacion,
  resolverRevision,
  truequesDelMes,
  contarNoLeidos,
  obtenerUsuario,
  parseFechaSql,
  reputacionDe,
} from "./mappers.js";

export const router = Router();

const ESTADOS_CERRADOS = ["Finalizado", "Cancelado"];
/** Una oferta directa todavía sin respuesta: nadie más la ve ni puede postularse. */
const INVITACION_PENDIENTE = "(invitado_id IS NOT NULL AND invitacion_rechazada = 0)";
const invitacionPendiente = (row) => !!row.invitado_id && !row.invitacion_rechazada;
const error = (res, status, mensaje) => res.status(status).json({ error: mensaje });

const MSG_SIN_TARJETA = "Registra una tarjeta en tu cuenta para pagar con tarjeta o publicar una urgencia.";

/** Con tarjeta, o en una urgencia (la tarifa se cobra con tarjeta), el usuario necesita una tarjeta registrada. */
function tarjetaOk(usuarioId, metodo, urgente) {
  if (metodo !== "Tarjeta" && !urgente) return true;
  return !!obtenerUsuario(usuarioId).tarjeta_ultimos4;
}

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

/** Paso 1 del login: avisa enseguida si la cuenta no existe. */
router.post("/auth/existe", (req, res) => {
  const buscado = String(req.body.identifier ?? "").trim();
  if (!buscado) return error(res, 400, "Ingresa tu teléfono o correo.");
  const tel = normalizarTelefono(buscado);
  const existe = db
    .prepare("SELECT telefono, correo FROM usuario")
    .all()
    .some(
      (u) =>
        (tel && normalizarTelefono(u.telefono) === tel) ||
        (u.correo && u.correo.toLowerCase() === buscado.toLowerCase()),
    );
  if (!existe) return error(res, 404, "No encontramos una cuenta con ese teléfono o correo.");
  res.json({ existe: true });
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
    truequesGratisMes: CONFIG.TRUEQUES_GRATIS_MES,
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
  res.json(mapUsuario(resolverRevision(obtenerUsuario(req.usuarioId))));
});

// ── Verificación de documentos (simulada) ───────────────────────────
// Los archivos nunca llegan al servidor: solo se registra que se enviaron y, para la hoja de
// delincuencia, su fecha de emisión. Pasados unos segundos "En revisión" se aprueban solos.
router.get("/usuario/verificacion", (req, res) => {
  res.json(mapVerificacion(resolverRevision(obtenerUsuario(req.usuarioId))));
});

const normalizarCedula = (v) => String(v ?? "").replace(/\D/g, "");

router.post("/usuario/verificacion/cedula", (req, res) => {
  const { numero, frente, reverso } = req.body;
  if (!frente || !reverso) return error(res, 400, "Toma la foto del frente y del reverso de tu cédula.");
  const digitos = normalizarCedula(numero);
  if (digitos.length < 9 || digitos.length > 12) return error(res, 400, "El número de cédula no es válido.");
  const yo = obtenerUsuario(req.usuarioId);
  if (yo.cedula_verificada && normalizarCedula(yo.cedula) === digitos) return error(res, 409, "Tu cédula ya está verificada.");
  db.prepare("UPDATE usuario SET cedula = ?, cedula_verificada = 0, cedula_enviada_en = datetime('now') WHERE id = ?").run(
    String(numero).trim(),
    req.usuarioId,
  );
  res.json(mapVerificacion(obtenerUsuario(req.usuarioId)));
});

router.post("/usuario/verificacion/antecedentes", (req, res) => {
  const { emision, archivo } = req.body;
  if (!archivo) return error(res, 400, "Adjunta el PDF o una foto de tu hoja de delincuencia.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(emision ?? ""))) return error(res, 400, "Indica la fecha de emisión.");
  const hoy = new Date().toISOString().slice(0, 10);
  if (emision > hoy) return error(res, 400, "La fecha de emisión no puede ser futura.");
  const limite = new Date();
  limite.setUTCMonth(limite.getUTCMonth() - CONFIG.VIGENCIA_ANTECEDENTES_MESES);
  if (emision < limite.toISOString().slice(0, 10)) {
    return error(res, 400, `La hoja tiene más de ${CONFIG.VIGENCIA_ANTECEDENTES_MESES} meses: solicita una nueva.`);
  }
  db.prepare(
    "UPDATE usuario SET antecedentes = 0, antecedentes_emision = ?, antecedentes_enviada_en = datetime('now') WHERE id = ?",
  ).run(emision, req.usuarioId);
  res.json(mapVerificacion(obtenerUsuario(req.usuarioId)));
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
       cedula = COALESCE(?, cedula),
       -- Cambiar el número de cédula obliga a verificarla de nuevo.
       cedula_verificada = CASE WHEN ? IS NOT NULL AND ? != cedula THEN 0 ELSE cedula_verificada END,
       cedula_enviada_en = CASE WHEN ? IS NOT NULL AND ? != cedula THEN NULL ELSE cedula_enviada_en END
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
    cedula ?? null,
    cedula ?? null,
    cedula ?? null,
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

// ── Tarjeta (simulada): solo se guardan marca, últimos 4, titular y vencimiento ──
function pasaLuhn(numero) {
  let suma = 0;
  for (let i = 0; i < numero.length; i++) {
    let d = Number(numero[numero.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
  }
  return suma % 10 === 0;
}

function marcaDe(numero) {
  if (/^4/.test(numero)) return "Visa";
  if (/^(5[1-5]|2(2[2-9][1-9]|[3-6]\d\d|7[01]\d|720))/.test(numero)) return "Mastercard";
  if (/^3[47]/.test(numero)) return "American Express";
  return "Tarjeta";
}

router.put("/usuario/tarjeta", (req, res) => {
  const numero = soloDigitos(req.body.numero);
  const titular = String(req.body.titular ?? "").trim();
  const vence = String(req.body.vence ?? "").trim();
  const cvv = soloDigitos(req.body.cvv);
  if (numero.length < 13 || numero.length > 19 || !pasaLuhn(numero)) {
    return error(res, 400, "El número de tarjeta no es válido.");
  }
  if (!titular) return error(res, 400, "Ingresa el nombre del titular.");
  const m = /^(\d{2})\/(\d{2})$/.exec(vence);
  const mes = m ? Number(m[1]) : 0;
  const anio = m ? 2000 + Number(m[2]) : 0;
  const hoy = new Date();
  if (!m || mes < 1 || mes > 12 || anio * 12 + mes < hoy.getFullYear() * 12 + hoy.getMonth() + 1) {
    return error(res, 400, "La fecha de vencimiento no es válida.");
  }
  if (cvv.length < 3 || cvv.length > 4) return error(res, 400, "El código de seguridad no es válido.");

  db.prepare(
    "UPDATE usuario SET tarjeta_marca = ?, tarjeta_ultimos4 = ?, tarjeta_titular = ?, tarjeta_vence = ? WHERE id = ?",
  ).run(marcaDe(numero), numero.slice(-4), titular, vence, req.usuarioId);
  res.json(mapUsuario(obtenerUsuario(req.usuarioId)));
});

router.delete("/usuario/tarjeta", (req, res) => {
  db.prepare(
    "UPDATE usuario SET tarjeta_marca = NULL, tarjeta_ultimos4 = NULL, tarjeta_titular = NULL, tarjeta_vence = NULL WHERE id = ?",
  ).run(req.usuarioId);
  res.status(204).end();
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
/** Mis publicaciones y Mis trabajos: lo más próximo primero (las urgencias, sin fecha, arriba). */
const ORDEN_FECHA = "ORDER BY fecha IS NOT NULL, fecha ASC, rowid ASC";

/**
 * De cada servicio recurrente se muestra solo la próxima visita pendiente (el resto se ve en la
 * Agenda); las visitas terminadas que aún piden pago o calificación, y las que esperan
 * reemplazo, se muestran siempre.
 */
function soloProximaVisita(lista) {
  const vistas = new Set();
  return lista.filter((t) => {
    if (!t.serie || t.estado === "Finalizado" || t.reemplazo) return true;
    if (vistas.has(t.serie.id)) return false;
    vistas.add(t.serie.id);
    return true;
  });
}

router.get("/trabajos", (req, res) => {
  const yo = req.usuarioId;
  const { publicadas, mios } = req.query;
  let rows;
  if (publicadas === "true" || mios === "true") extenderSeriesDe(yo);
  if (publicadas === "true") {
    rows = db.prepare(`SELECT * FROM trabajo WHERE publicador_id = ? AND estado != 'Cancelado' ${ORDEN_FECHA}`).all(yo);
    const lista = rows.map((r) => mapTrabajo(r, yo));
    // Un trabajo terminado sale de la lista cuando ya se pagó y se calificó.
    return res.json(soloProximaVisita(lista.filter((t) => t.estado !== "Finalizado" || !t.pagado || !t.calificadoPorMi)));
  }
  if (mios === "true") {
    rows = db
      .prepare(
        `SELECT * FROM trabajo
          WHERE publicador_id != ? AND estado != 'Cancelado'
            AND (trabajador_id = ? OR id IN (SELECT trabajo_id FROM postulacion WHERE usuario_id = ?)
                 OR (invitado_id = ? AND invitacion_rechazada = 0))
          ${ORDEN_FECHA}`,
      )
      .all(yo, yo, yo, yo);
    const lista = rows.map((r) => mapTrabajo(r, yo));
    return res.json(soloProximaVisita(lista.filter((t) => t.estado !== "Finalizado" || !t.calificadoPorMi)));
  }
  rows = db
    .prepare(
      `SELECT * FROM trabajo
        WHERE estado = 'Pendiente' AND trabajador_id IS NULL AND publicador_id != ?
          AND NOT ${INVITACION_PENDIENTE} AND reemplazo IS NULL ${ORDEN_RECIENTES}`,
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
  const { titulo, descripcion, categoria, lat, lng, pago, metodoPago, urgente, invitadoId, trueque, ofrece, frecuencia, propiedadId } =
    req.body;
  let { ubicacion } = req.body;
  const esUrgente = !!urgente;
  // Una urgencia se atiende "lo antes posible": no lleva fecha.
  const fecha = esUrgente ? null : req.body.fecha;
  if (!esUrgente && !fechaHoraValida(fecha)) return error(res, 400, "Indica la fecha y la hora del trabajo.");
  if (!esUrgente && diaDe(fecha) < hoyIso()) return error(res, 400, "La fecha del trabajo ya pasó.");

  // Mis propiedades: la dirección y las coordenadas salen de la propiedad elegida.
  let propiedad = null;
  if (propiedadId) {
    propiedad = db.prepare("SELECT * FROM propiedad WHERE id = ? AND usuario_id = ?").get(propiedadId, req.usuarioId);
    if (!propiedad) return error(res, 404, "Propiedad no encontrada.");
    ubicacion = ubicacion || propiedad.ubicacion;
  }
  const latFinal = lat ?? propiedad?.lat ?? null;
  const lngFinal = lng ?? propiedad?.lng ?? null;

  // Servicio recurrente: solo como oferta directa (hace falta saber quién lo hará cada vez).
  const recurrente = frecuencia && frecuencia !== "una_vez";
  if (recurrente) {
    if (!FRECUENCIAS.includes(frecuencia)) return error(res, 400, "Frecuencia no válida.");
    if (!invitadoId) return error(res, 400, "Un servicio recurrente se ofrece a una persona: usa Recontratar.");
    if (esUrgente || trueque) return error(res, 400, "Un servicio recurrente no puede ser urgencia ni trueque.");
  }
  const esTrueque = !!trueque;
  if (esTrueque) {
    if (!String(ofrece ?? "").trim()) return error(res, 400, "Indica qué ofreces a cambio.");
    if (esUrgente) return error(res, 400, "Un trueque no puede ser urgencia.");
    const yo = obtenerUsuario(req.usuarioId);
    if (yo.plan !== "plus" && truequesDelMes(yo.id) >= CONFIG.TRUEQUES_GRATIS_MES) {
      return error(res, 403, "Ya usaste tu trueque de este mes. Con el Plan Plus son ilimitados.");
    }
  }
  if (invitadoId) {
    if (invitadoId === req.usuarioId) return error(res, 400, "No puedes contratarte a ti mismo.");
    if (!obtenerUsuario(invitadoId)) return error(res, 404, "Usuario no encontrado.");
    if (esUrgente) return error(res, 400, "Una oferta directa no puede ser urgencia.");
    if (estaBloqueado(invitadoId, diaDe(fecha))) return error(res, 409, "Esa persona marcó ese día como no disponible.");
  }
  // En un trueque el pago es el diferencial en dinero: puede ser 0.
  const pagoValido = esTrueque ? Number(pago ?? 0) >= 0 : pago > 0;
  if (!titulo || !categoria || !ubicacion || !pagoValido) {
    return error(res, 400, "Faltan campos obligatorios o el pago no es válido.");
  }
  const metodo = metodoPago;
  if (!METODOS_PAGO.includes(metodo)) return error(res, 400, "Método de pago no válido.");
  // Un trueque sin diferencial no cobra nada: no hace falta tarjeta.
  const cobraTarjeta = esTrueque ? Number(pago) > 0 && metodo === "Tarjeta" : true;
  if (cobraTarjeta && !tarjetaOk(req.usuarioId, metodo, esUrgente)) return error(res, 400, MSG_SIN_TARJETA);

  const id = `t-${randomUUID()}`;
  const monto = Math.round(Number(pago ?? 0));
  let serieId = null;
  if (recurrente) {
    serieId = `se-${randomUUID()}`;
    db.prepare(
      `INSERT INTO serie (id, publicador_id, trabajador_id, frecuencia, titulo, descripcion, categoria, ubicacion, lat, lng,
                          pago, metodo_pago, propiedad_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      serieId, req.usuarioId, invitadoId, frecuencia, titulo, descripcion ?? "", categoria, ubicacion, latFinal, lngFinal,
      monto, metodo, propiedad?.id ?? null,
    );
  }
  db.prepare(
    `INSERT INTO trabajo (id, titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodo_pago, publicador_id, urgente, invitado_id,
                          es_trueque, ofrece, serie_id, propiedad_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id, titulo, descripcion ?? "", categoria, ubicacion, latFinal, lngFinal,
    fecha, monto, metodo, req.usuarioId, esUrgente ? 1 : 0, invitadoId || null,
    esTrueque ? 1 : 0, esTrueque ? String(ofrece).trim().slice(0, 300) : null, serieId, propiedad?.id ?? null,
  );
  responderTrabajo(req, res, id, 201);
});

/** Editar una publicación: solo su dueño y mientras nadie haya sido asignado. */
router.patch("/trabajos/:id", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.publicador_id !== req.usuarioId) return error(res, 403, "Solo puedes editar tus publicaciones.");
  if (row.estado !== "Pendiente") return error(res, 409, "Solo se pueden editar publicaciones pendientes.");

  const { titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodoPago, ofrece } = req.body;
  if (fecha != null && !row.urgente && !fechaHoraValida(fecha)) return error(res, 400, "Indica la fecha y la hora del trabajo.");
  if (pago != null && !(row.es_trueque ? pago >= 0 : pago > 0)) return error(res, 400, "El pago no es válido.");
  if (row.es_trueque && ofrece != null && !String(ofrece).trim()) return error(res, 400, "Indica qué ofreces a cambio.");
  const metodo = metodoPago;
  if (metodo && !METODOS_PAGO.includes(metodo)) return error(res, 400, "Método de pago no válido.");
  if (!tarjetaOk(req.usuarioId, metodo ?? row.metodo_pago, !!row.urgente)) return error(res, 400, MSG_SIN_TARJETA);

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
       metodo_pago = COALESCE(?, metodo_pago),
       ofrece = CASE WHEN es_trueque = 1 THEN COALESCE(?, ofrece) ELSE ofrece END
     WHERE id = ?`,
  ).run(
    titulo ?? null, descripcion ?? null, categoria ?? null, ubicacion ?? null,
    lat ?? null, lng ?? null, row.urgente ? null : (fecha ?? null), pago ?? null, metodo ?? null,
    ofrece != null ? String(ofrece).trim().slice(0, 300) : null, row.id,
  );
  responderTrabajo(req, res, row.id);
});

router.patch("/trabajos/:id/postular", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.publicador_id === req.usuarioId) return error(res, 400, "No puedes postularte a tu propio trabajo.");
  if (row.estado !== "Pendiente") return error(res, 409, "Este trabajo ya no recibe postulaciones.");
  if (invitacionPendiente(row)) return error(res, 409, "Este trabajo es una oferta directa para otra persona.");

  const existe = db
    .prepare("SELECT 1 FROM postulacion WHERE trabajo_id = ? AND usuario_id = ?")
    .get(row.id, req.usuarioId);
  if (existe) {
    db.prepare("DELETE FROM postulacion WHERE trabajo_id = ? AND usuario_id = ?").run(row.id, req.usuarioId);
  } else {
    // En un trueque se puede proponer otra cosa a cambio (contraoferta).
    const propuesta = row.es_trueque ? String(req.body?.propuesta ?? "").trim().slice(0, 300) || null : null;
    db.prepare("INSERT INTO postulacion (trabajo_id, usuario_id, propuesta) VALUES (?, ?, ?)").run(row.id, req.usuarioId, propuesta);
  }
  responderTrabajo(req, res, row.id);
});

router.get("/trabajos/:id/postulantes", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.publicador_id !== req.usuarioId) return error(res, 403, "Solo el publicador ve los postulantes.");
  const yo = obtenerUsuario(req.usuarioId);
  const postulantes = db
    .prepare("SELECT usuario_id, propuesta FROM postulacion WHERE trabajo_id = ? ORDER BY creado_en, rowid")
    .all(row.id)
    .map((p) => ({ ...mapTrabajador(obtenerUsuario(p.usuario_id), yo), propuesta: p.propuesta ?? undefined }));
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
    .prepare("SELECT propuesta FROM postulacion WHERE trabajo_id = ? AND usuario_id = ?")
    .get(row.id, trabajadorId);
  if (!postulo) return error(res, 400, "Esa persona no se ha postulado.");

  db.prepare("UPDATE trabajo SET trabajador_id = ?, estado = 'Asignado', etapa = 'Aceptado' WHERE id = ?").run(
    trabajadorId,
    row.id,
  );
  // Trueque: al elegir, el publicador firma el acuerdo (lo que ofreció o la contrapropuesta);
  // falta que el trabajador lo acepte.
  if (row.es_trueque) {
    db.prepare("UPDATE trabajo SET trueque_acordado = ?, acuerdo_aceptado = 0, trueque_etapa = NULL WHERE id = ?").run(
      postulo.propuesta || row.ofrece,
      row.id,
    );
  }
  responderTrabajo(req, res, row.id);
});

/** Oferta directa ("Recontratar"): la persona invitada acepta y queda asignada. */
router.post("/trabajos/:id/invitacion/aceptar", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.invitado_id !== req.usuarioId || !invitacionPendiente(row)) return error(res, 403, "Esta oferta no es para ti.");
  if (row.estado !== "Pendiente" || row.trabajador_id) return error(res, 409, "Esta oferta ya no está disponible.");
  db.prepare(
    `UPDATE trabajo SET trabajador_id = ?, estado = 'Asignado', etapa = 'Aceptado',
       reemplazo = CASE WHEN reemplazo = 'invitado' THEN 'cubierto' ELSE reemplazo END
     WHERE id = ?`,
  ).run(req.usuarioId, row.id);
  // Primera visita de un servicio recurrente: aceptarla es aceptar la serie; CIRA agenda las siguientes.
  const serie = obtenerSerie(row.serie_id);
  if (serie && !serie.aceptada && serie.trabajador_id === req.usuarioId) {
    db.prepare("UPDATE serie SET aceptada = 1 WHERE id = ?").run(serie.id);
    extenderSerie({ ...serie, aceptada: 1 });
  }
  // Aceptar una oferta directa de trueque es aceptar sus términos.
  if (row.es_trueque) db.prepare("UPDATE trabajo SET trueque_acordado = ofrece, acuerdo_aceptado = 1 WHERE id = ?").run(row.id);
  responderTrabajo(req, res, row.id);
});

/** La persona invitada no puede: la publicación queda abierta para todos. */
router.post("/trabajos/:id/invitacion/rechazar", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (row.invitado_id !== req.usuarioId || !invitacionPendiente(row)) return error(res, 403, "Esta oferta no es para ti.");
  if (row.reemplazo === "invitado") {
    // El reemplazo no puede: la visita vuelve a esperar que el cliente elija a otra persona.
    db.prepare("UPDATE trabajo SET invitado_id = NULL, reemplazo = 'pendiente' WHERE id = ?").run(row.id);
    return responderTrabajo(req, res, row.id);
  }
  const serie = obtenerSerie(row.serie_id);
  if (serie && !serie.aceptada) {
    // No acepta el servicio recurrente: la serie se descarta y esta visita queda como un trabajo normal.
    db.prepare("UPDATE serie SET activa = 0 WHERE id = ?").run(serie.id);
    db.prepare("UPDATE trabajo SET serie_id = NULL WHERE id = ?").run(row.id);
  }
  db.prepare("UPDATE trabajo SET invitacion_rechazada = 1, creado_en = datetime('now') WHERE id = ?").run(row.id);
  responderTrabajo(req, res, row.id);
});

// ── Trueque: acuerdo y cierre en dos pasos ──────────────────────────
/** El trabajador elegido acepta el acuerdo del trueque; recién entonces arranca el seguimiento. */
router.post("/trabajos/:id/trueque/aceptar", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (!row.es_trueque) return error(res, 400, "Este trabajo no es un trueque.");
  if (row.trabajador_id !== req.usuarioId) return error(res, 403, "Este acuerdo no es para ti.");
  if (row.estado !== "Asignado") return error(res, 409, "Este acuerdo ya no se puede aceptar.");
  db.prepare("UPDATE trabajo SET acuerdo_aceptado = 1 WHERE id = ?").run(row.id);
  responderTrabajo(req, res, row.id);
});

/** El trabajador recibió la parte del publicador: el trueque termina (luego se paga el diferencial y se califica). */
router.post("/trabajos/:id/trueque/finalizar", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (!row.es_trueque) return error(res, 400, "Este trabajo no es un trueque.");
  if (row.trabajador_id !== req.usuarioId) return error(res, 403, "Solo quien recibe la segunda parte cierra el trueque.");
  if (row.trueque_etapa !== "primera") return error(res, 409, "Primero entrega tu parte del trueque.");
  db.prepare(
    `UPDATE trabajo SET estado = 'Finalizado', trueque_etapa = 'finalizado', finalizado_en = datetime('now'),
       pagado = CASE WHEN pago = 0 THEN 1 ELSE pagado END
     WHERE id = ?`,
  ).run(row.id);
  responderTrabajo(req, res, row.id);
});

/** Modo urgencia: el primer trabajador que acepta se queda con el trabajo. */
router.post("/trabajos/:id/aceptar-urgencia", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (!row.urgente) return error(res, 400, "Este trabajo no es una urgencia.");
  if (row.publicador_id === req.usuarioId) return error(res, 400, "No puedes aceptar tu propia urgencia.");
  if (!resolverRevision(obtenerUsuario(req.usuarioId)).cedula_verificada) {
    return error(res, 403, "Verifica tu cédula para aceptar urgencias.");
  }
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

  if (row.es_trueque && !row.acuerdo_aceptado) return error(res, 409, "Primero acepta el acuerdo del trueque.");

  const siguiente = ETAPAS[ETAPAS.indexOf(row.etapa) + 1];
  if (!siguiente) return error(res, 409, "El trabajo ya está en su última etapa.");
  // En un trueque, "Terminado" es solo la primera parte: falta la del publicador.
  const primeraParte = row.es_trueque && siguiente === "Terminado";
  const estado = primeraParte
    ? "En progreso"
    : siguiente === "Terminado" ? "Finalizado" : siguiente === "Llegó" ? "En progreso" : row.estado;
  db.prepare(
    `UPDATE trabajo SET etapa = ?, estado = ?,
       trueque_etapa = CASE WHEN ? THEN 'primera' ELSE trueque_etapa END,
       finalizado_en = CASE WHEN ? = 'Finalizado' THEN datetime('now') ELSE finalizado_en END
     WHERE id = ?`,
  ).run(siguiente, estado, primeraParte ? 1 : 0, estado, row.id);
  responderTrabajo(req, res, row.id);
});

/** Cancelar: el publicador cancela el trabajo; el trabajador solo se retira (el trabajo vuelve a quedar abierto). */
router.post("/trabajos/:id/cancelar", (req, res) => {
  const row = trabajoDe(req, res);
  if (!row) return;
  if (ESTADOS_CERRADOS.includes(row.estado)) return error(res, 409, "El trabajo ya terminó.");

  if (row.publicador_id === req.usuarioId) {
    // Con la primera parte de un trueque ya entregada, el publicador debe cumplir la suya.
    if (row.trueque_etapa === "primera") return error(res, 409, "Ya recibiste tu parte del trueque: falta que cumplas la tuya.");
    db.prepare("UPDATE trabajo SET estado = 'Cancelado' WHERE id = ?").run(row.id);
  } else {
    db.prepare("DELETE FROM postulacion WHERE trabajo_id = ? AND usuario_id = ?").run(row.id, req.usuarioId);
    if (row.trabajador_id === req.usuarioId && row.serie_id) {
      // Visita de un servicio recurrente: no se publica para todos; el cliente elige un reemplazo.
      db.prepare(
        "UPDATE trabajo SET trabajador_id = NULL, estado = 'Pendiente', etapa = NULL, invitado_id = NULL, reemplazo = 'pendiente' WHERE id = ?",
      ).run(row.id);
    } else if (row.trabajador_id === req.usuarioId) {
      db.prepare(
        `UPDATE trabajo SET trabajador_id = NULL, estado = 'Pendiente', etapa = NULL,
           trueque_acordado = NULL, acuerdo_aceptado = 0, trueque_etapa = NULL
         WHERE id = ?`,
      ).run(row.id);
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

  const propina = Math.round(Number(req.body.propina ?? 0));
  if (!Number.isFinite(propina) || propina < 0 || propina > 1_000_000) return error(res, 400, "La propina no es válida.");
  const r = calcularResumenPago(row.pago, !!row.urgente, row.metodo_pago, propina);
  if (r.enTarjeta > 0 && !obtenerUsuario(req.usuarioId).tarjeta_ultimos4) return error(res, 400, MSG_SIN_TARJETA);
  db.prepare(
    `INSERT INTO pago (id, trabajo_id, metodo, monto, comision, tarifa_urgencia, propina, en_efectivo, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(`pg-${randomUUID()}`, row.id, row.metodo_pago, r.monto, r.comision, r.tarifaUrgencia, r.propina, r.enEfectivo, r.total);
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
    "INSERT INTO calificacion (id, trabajo_id, de_id, a_id, estrellas, comentario, cumplio) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(
    `k-${randomUUID()}`,
    row.id,
    req.usuarioId,
    esPublicador ? row.trabajador_id : row.publicador_id,
    estrellas,
    String(req.body.comentario ?? "").trim().slice(0, 500),
    // Trueque: además de la calidad, si la otra persona cumplió su parte del acuerdo.
    row.es_trueque && typeof req.body.cumplio === "boolean" ? (req.body.cumplio ? 1 : 0) : null,
  );
  responderTrabajo(req, res, row.id);
});

// ── CIRA Agenda: reemplazos y series ────────────────────────────────
/** Visita que espera reemplazo, vista por su cliente. */
function visitaSinTrabajador(req, res) {
  const row = trabajoDe(req, res);
  if (!row) return null;
  if (row.publicador_id !== req.usuarioId) {
    error(res, 403, "Solo el cliente decide el reemplazo.");
    return null;
  }
  if (row.reemplazo !== "pendiente") {
    error(res, 409, "Esta visita no está esperando un reemplazo.");
    return null;
  }
  return row;
}

/**
 * Sugerencias de reemplazo: personas del mismo oficio, disponibles y libres ese día. Primero los
 * "De confianza" del cliente; luego los mejor calificados y más cercanos.
 */
router.get("/trabajos/:id/reemplazos", (req, res) => {
  const row = visitaSinTrabajador(req, res);
  if (!row) return;
  const yo = obtenerUsuario(req.usuarioId);
  const dia = row.fecha ? diaDe(row.fecha) : hoyIso();
  const serie = obtenerSerie(row.serie_id);
  const candidatos = db
    .prepare("SELECT * FROM usuario WHERE id != ? AND id != ? AND disponible = 1")
    .all(req.usuarioId, serie?.trabajador_id ?? "")
    .filter((u) => ofreceCategoria(u.id, row.categoria) && !estaBloqueado(u.id, dia) && !tieneTrabajoEseDia(u.id, dia, row.id))
    .map((u) => mapTrabajador(u, yo))
    .sort(
      (a, b) =>
        Number(b.deConfianza) - Number(a.deConfianza) ||
        (b.calificacion ?? 0) - (a.calificacion ?? 0) ||
        a.distanciaKm - b.distanciaKm,
    )
    .slice(0, 5);
  res.json(candidatos);
});

/** El cliente elige un reemplazo: le llega como oferta directa solo para esta visita. */
router.post("/trabajos/:id/reemplazo", (req, res) => {
  const row = visitaSinTrabajador(req, res);
  if (!row) return;
  const { trabajadorId } = req.body;
  const u = obtenerUsuario(trabajadorId);
  if (!u || trabajadorId === req.usuarioId) return error(res, 404, "Usuario no encontrado.");
  if (!ofreceCategoria(u.id, row.categoria)) return error(res, 400, "Esa persona no ofrece este servicio.");
  if (row.fecha && estaBloqueado(u.id, diaDe(row.fecha))) return error(res, 409, "Esa persona marcó ese día como no disponible.");
  db.prepare("UPDATE trabajo SET invitado_id = ?, invitacion_rechazada = 0, reemplazo = 'invitado' WHERE id = ?").run(u.id, row.id);
  responderTrabajo(req, res, row.id);
});

/** En vez de un reemplazo elegido, la visita se publica para que cualquiera se postule. */
router.post("/trabajos/:id/publicar-abierto", (req, res) => {
  const row = visitaSinTrabajador(req, res);
  if (!row) return;
  db.prepare("UPDATE trabajo SET reemplazo = NULL, creado_en = datetime('now') WHERE id = ?").run(row.id);
  responderTrabajo(req, res, row.id);
});

/** Terminar un servicio recurrente (cliente o trabajador): se cancelan las visitas que no han empezado. */
router.post("/series/:id/cancelar", (req, res) => {
  const serie = obtenerSerie(req.params.id);
  if (!serie) return error(res, 404, "Servicio recurrente no encontrado.");
  if (serie.publicador_id !== req.usuarioId && serie.trabajador_id !== req.usuarioId) {
    return error(res, 403, "No participas en este servicio recurrente.");
  }
  db.prepare("UPDATE serie SET activa = 0 WHERE id = ?").run(serie.id);
  db.prepare(
    `UPDATE trabajo SET estado = 'Cancelado'
      WHERE serie_id = ? AND estado IN ('Pendiente', 'Asignado') AND (etapa IS NULL OR etapa = 'Aceptado')`,
  ).run(serie.id);
  res.status(204).end();
});

// ── CIRA Agenda: calendario y días bloqueados ───────────────────────
function rangoDe(req, res) {
  const { desde, hasta } = req.query;
  if (!RE_DIA.test(String(desde ?? "")) || !RE_DIA.test(String(hasta ?? "")) || desde > hasta) {
    error(res, 400, "El rango de fechas no es válido.");
    return null;
  }
  return { desde, hasta };
}

/**
 * Todo lo agendado de quien consulta: como cliente (sus publicaciones con fecha) y como
 * trabajador (lo asignado y las ofertas directas que esperan su respuesta), más sus días bloqueados.
 */
router.get("/agenda", (req, res) => {
  const rango = rangoDe(req, res);
  if (!rango) return;
  const yo = req.usuarioId;
  extenderSeriesDe(yo);
  const rows = db
    .prepare(
      `SELECT * FROM trabajo
        WHERE estado != 'Cancelado' AND fecha IS NOT NULL AND substr(fecha, 1, 10) BETWEEN ? AND ?
          AND (publicador_id = ? OR trabajador_id = ? OR (invitado_id = ? AND invitacion_rechazada = 0 AND trabajador_id IS NULL))
        ORDER BY fecha, rowid`,
    )
    .all(rango.desde, rango.hasta, yo, yo, yo);
  const bloqueos = db
    .prepare("SELECT fecha FROM bloqueo WHERE usuario_id = ? AND fecha BETWEEN ? AND ? ORDER BY fecha")
    .all(yo, rango.desde, rango.hasta)
    .map((b) => b.fecha);
  res.json({
    items: rows.map((r) => ({ rol: r.publicador_id === yo ? "cliente" : "trabajador", trabajo: mapTrabajo(r, yo) })),
    bloqueos,
  });
});

router.post("/agenda/bloqueos", (req, res) => {
  const { fecha } = req.body;
  if (!RE_DIA.test(String(fecha ?? ""))) return error(res, 400, "La fecha no es válida.");
  if (fecha < hoyIso()) return error(res, 400, "No puedes bloquear un día que ya pasó.");
  db.prepare("INSERT OR IGNORE INTO bloqueo (usuario_id, fecha) VALUES (?, ?)").run(req.usuarioId, fecha);
  res.status(201).json({ fecha });
});

router.delete("/agenda/bloqueos/:fecha", (req, res) => {
  db.prepare("DELETE FROM bloqueo WHERE usuario_id = ? AND fecha = ?").run(req.usuarioId, req.params.fecha);
  res.status(204).end();
});

/** Días no disponibles de otra persona (para elegir fecha al recontratar): solo "ocupado", nunca qué ni con quién. */
router.get("/usuarios/:id/ocupado", (req, res) => {
  const rango = rangoDe(req, res);
  if (!rango) return;
  if (!obtenerUsuario(req.params.id)) return error(res, 404, "Usuario no encontrado.");
  res.json({ ocupados: diasOcupados(req.params.id, rango.desde, rango.hasta) });
});

// ── Mis propiedades ─────────────────────────────────────────────────
function datosPropiedad(req, res) {
  const nombre = String(req.body.nombre ?? "").trim().slice(0, 60);
  const ubicacion = String(req.body.ubicacion ?? "").trim().slice(0, 200);
  if (!nombre) return error(res, 400, "Ponle un nombre a la propiedad."), null;
  if (!ubicacion) return error(res, 400, "Indica la ubicación de la propiedad."), null;
  const lat = Number.isFinite(req.body.lat) ? req.body.lat : null;
  const lng = Number.isFinite(req.body.lng) ? req.body.lng : null;
  return { nombre, ubicacion, lat, lng, instrucciones: String(req.body.instrucciones ?? "").trim().slice(0, 500) };
}

router.get("/propiedades", (req, res) => {
  const rows = db.prepare("SELECT * FROM propiedad WHERE usuario_id = ? ORDER BY creado_en, rowid").all(req.usuarioId);
  res.json(rows.map(mapPropiedad));
});

router.post("/propiedades", (req, res) => {
  const d = datosPropiedad(req, res);
  if (!d) return;
  const id = `pr-${randomUUID()}`;
  db.prepare("INSERT INTO propiedad (id, usuario_id, nombre, ubicacion, lat, lng, instrucciones) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    id, req.usuarioId, d.nombre, d.ubicacion, d.lat, d.lng, d.instrucciones,
  );
  res.status(201).json(mapPropiedad(db.prepare("SELECT * FROM propiedad WHERE id = ?").get(id)));
});

router.put("/propiedades/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM propiedad WHERE id = ? AND usuario_id = ?").get(req.params.id, req.usuarioId);
  if (!row) return error(res, 404, "Propiedad no encontrada.");
  const d = datosPropiedad(req, res);
  if (!d) return;
  db.prepare("UPDATE propiedad SET nombre = ?, ubicacion = ?, lat = ?, lng = ?, instrucciones = ? WHERE id = ?").run(
    d.nombre, d.ubicacion, d.lat, d.lng, d.instrucciones, row.id,
  );
  res.json(mapPropiedad(db.prepare("SELECT * FROM propiedad WHERE id = ?").get(row.id)));
});

router.delete("/propiedades/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM propiedad WHERE id = ? AND usuario_id = ?").get(req.params.id, req.usuarioId);
  if (!row) return error(res, 404, "Propiedad no encontrada.");
  // Los trabajos y servicios recurrentes conservan su dirección; solo pierden el enlace a la propiedad.
  db.prepare("UPDATE trabajo SET propiedad_id = NULL WHERE propiedad_id = ?").run(row.id);
  db.prepare("UPDATE serie SET propiedad_id = NULL WHERE propiedad_id = ?").run(row.id);
  db.prepare("DELETE FROM propiedad WHERE id = ?").run(row.id);
  res.status(204).end();
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

// ── De confianza (trabajadores guardados) ───────────────────────────
router.get("/favoritos", (req, res) => {
  const yo = obtenerUsuario(req.usuarioId);
  const rows = db
    .prepare(
      `SELECT u.* FROM favorito f JOIN usuario u ON u.id = f.trabajador_id
        WHERE f.usuario_id = ? ORDER BY f.creado_en DESC, f.rowid DESC`,
    )
    .all(req.usuarioId);
  res.json(rows.map((r) => mapTrabajador(r, yo)));
});

router.post("/favoritos/:id", (req, res) => {
  if (req.params.id === req.usuarioId) return error(res, 400, "No puedes agregarte a ti mismo.");
  const row = obtenerUsuario(req.params.id);
  if (!row) return error(res, 404, "Usuario no encontrado.");
  db.prepare("INSERT OR IGNORE INTO favorito (usuario_id, trabajador_id) VALUES (?, ?)").run(req.usuarioId, row.id);
  res.status(201).json(mapTrabajador(row, obtenerUsuario(req.usuarioId)));
});

router.delete("/favoritos/:id", (req, res) => {
  const row = obtenerUsuario(req.params.id);
  if (!row) return error(res, 404, "Usuario no encontrado.");
  db.prepare("DELETE FROM favorito WHERE usuario_id = ? AND trabajador_id = ?").run(req.usuarioId, row.id);
  res.json(mapTrabajador(row, obtenerUsuario(req.usuarioId)));
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
          AND NOT ${INVITACION_PENDIENTE} AND reemplazo IS NULL
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

/** Mensajes sin leer de todas mis conversaciones (insignia del chat y avisos dentro de la app). */
router.get("/conversaciones/no-leidos", (req, res) => {
  const filas = db
    .prepare("SELECT * FROM conversacion WHERE usuario_a = ? OR usuario_b = ?")
    .all(req.usuarioId, req.usuarioId);
  const pendientes = [];
  let total = 0;
  for (const c of filas) {
    const n = contarNoLeidos(c.id, req.usuarioId);
    if (n === 0) continue;
    total += n;
    const ultimo = db
      .prepare("SELECT texto FROM mensaje WHERE conversacion_id = ? AND autor_id != ? AND leido = 0 ORDER BY creado_en DESC, rowid DESC LIMIT 1")
      .get(c.id, req.usuarioId);
    const otro = obtenerUsuario(c.usuario_a === req.usuarioId ? c.usuario_b : c.usuario_a);
    pendientes.push({ conversacionId: c.id, nombre: otro.nombre, texto: ultimo.texto, cantidad: n });
  }
  res.json({ total, pendientes });
});

router.get("/conversaciones/:id", (req, res) => {
  const c = conversacionDe(req, res);
  if (!c) return;
  const conversacion = mapConversacion(c, req.usuarioId);
  // Abrir la conversación marca como leídos los mensajes de la otra persona.
  db.prepare("UPDATE mensaje SET leido = 1 WHERE conversacion_id = ? AND autor_id != ?").run(c.id, req.usuarioId);
  res.json(conversacion);
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
        ORDER BY COALESCE(fecha, replace(finalizado_en, ' ', 'T'), replace(creado_en, ' ', 'T')) DESC, rowid DESC`,
    )
    .all(req.usuarioId, req.usuarioId);
  res.json(rows.map((r) => mapHistorial(r, req.usuarioId)));
});

// ── Actividad: lo que pagué y lo que gané ───────────────────────────
router.get("/actividad", (req, res) => {
  const filas = db
    .prepare(
      `SELECT p.*, t.titulo, t.publicador_id, t.trabajador_id
         FROM pago p JOIN trabajo t ON t.id = p.trabajo_id
        WHERE t.publicador_id = ? OR t.trabajador_id = ?
        ORDER BY p.creado_en DESC, p.rowid DESC`,
    )
    .all(req.usuarioId, req.usuarioId);

  const mapear = (p, otroId) => ({
    id: p.id,
    trabajoId: p.trabajo_id,
    titulo: p.titulo,
    contraparte: obtenerUsuario(otroId)?.nombre ?? "",
    fecha: p.creado_en,
    metodo: p.metodo,
    monto: p.monto,
    comision: p.comision,
    tarifaUrgencia: p.tarifa_urgencia,
    propina: p.propina,
    total: p.total,
    enEfectivo: p.en_efectivo,
    enTarjeta: p.total - p.en_efectivo,
  });

  const pagos = filas.filter((p) => p.publicador_id === req.usuarioId).map((p) => mapear(p, p.trabajador_id));
  // El trabajador recibe el monto completo más la propina; CIRA se queda con comisión y tarifa.
  const ganancias = filas
    .filter((p) => p.trabajador_id === req.usuarioId)
    .map((p) => ({ ...mapear(p, p.publicador_id), total: p.monto + p.propina }));

  res.json({
    pagos,
    ganancias,
    totalPagado: pagos.reduce((a, p) => a + p.total, 0),
    totalGanado: ganancias.reduce((a, p) => a + p.total, 0),
  });
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
