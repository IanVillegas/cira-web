import { db } from "./db.js";
import { CONFIG } from "./config.js";

// ── Utilidades ──────────────────────────────────────────────────────
/** SQLite guarda datetime('now') en UTC como "YYYY-MM-DD HH:MM:SS". */
export function parseFechaSql(valor) {
  return Date.parse(`${valor.replace(" ", "T")}Z`);
}

export function distanciaKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v == null)) return null;
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

const redondear1 = (n) => Math.round(n * 10) / 10;

/** Distancia entre dos puntos para mostrar en la app (0 si falta alguna coordenada). */
function distanciaMostrada(a, b) {
  const d = distanciaKm(a?.lat, a?.lng, b?.lat, b?.lng);
  return d == null ? 0 : redondear1(d);
}

export function obtenerUsuario(id) {
  return db.prepare("SELECT * FROM usuario WHERE id = ?").get(id);
}

// ── Reputación e insignias ──────────────────────────────────────────
export function reputacionDe(usuarioId) {
  const r = db
    .prepare("SELECT AVG(estrellas) AS promedio, COUNT(*) AS total FROM calificacion WHERE a_id = ?")
    .get(usuarioId);
  return {
    calificacion: r.total > 0 ? redondear1(r.promedio) : null,
    numCalificaciones: r.total,
  };
}

export function trabajosCompletadosDe(row) {
  const n = db
    .prepare("SELECT COUNT(*) AS n FROM trabajo WHERE trabajador_id = ? AND estado = 'Finalizado'")
    .get(row.id).n;
  return row.trabajos_base + n;
}

export function insigniasDe(row, completados) {
  const lista = [];
  if (row.plan === "plus") lista.push("plus");
  if (row.cedula_verificada) lista.push("cedula");
  if (row.antecedentes) lista.push("antecedentes");
  if (completados >= 50) lista.push("mas50");
  if (row.responde_urgencias) lista.push("urgencias");
  return lista;
}

function serviciosDe(usuarioId) {
  return db.prepare("SELECT * FROM servicio WHERE usuario_id = ?").all(usuarioId);
}

// ── Usuarios ────────────────────────────────────────────────────────
export function mapServicio(row) {
  return {
    id: row.id,
    categoria: row.categoria,
    descripcion: row.descripcion,
    precioAproximado: row.precio_aproximado ?? undefined,
  };
}

/** Usuario completo: solo se devuelve a su dueño. */
export function mapUsuario(row) {
  const completados = trabajosCompletadosDe(row);
  return {
    id: row.id,
    nombre: row.nombre,
    cedula: row.cedula,
    telefono: row.telefono,
    correo: row.correo,
    descripcion: row.descripcion,
    zona: row.zona,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    metodosPago: JSON.parse(row.metodos_pago),
    disponible: !!row.disponible,
    plan: row.plan,
    insignias: insigniasDe(row, completados),
    trabajosCompletados: completados,
    servicios: serviciosDe(row.id).map(mapServicio),
    ...reputacionDe(row.id),
  };
}

/** Lo que otros usuarios pueden ver de una persona (sin cédula, teléfono ni correo). */
export function mapTrabajador(row, viewer) {
  const completados = trabajosCompletadosDe(row);
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    servicios: serviciosDe(row.id).map((s) => s.categoria),
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    distanciaKm: distanciaMostrada(viewer, row),
    disponible: !!row.disponible,
    zona: row.zona,
    insignias: insigniasDe(row, completados),
    trabajosCompletados: completados,
    ...reputacionDe(row.id),
  };
}

export function mapPerfilPublico(row, viewer) {
  const comentarios = db
    .prepare(
      `SELECT c.estrellas, c.comentario, c.creado_en, u.nombre AS autor
         FROM calificacion c JOIN usuario u ON u.id = c.de_id
        WHERE c.a_id = ? AND c.comentario != ''
        ORDER BY c.creado_en DESC, c.rowid DESC LIMIT 10`,
    )
    .all(row.id)
    .map((c) => ({ autor: c.autor, estrellas: c.estrellas, comentario: c.comentario, fecha: c.creado_en }));
  return { ...mapTrabajador(row, viewer), comentarios };
}

// ── Pagos ───────────────────────────────────────────────────────────
/**
 * Resumen del pago. Las urgencias siempre se pagan en la app; la comisión de CIRA y la tarifa
 * de urgencia se suman al monto del trabajo (el trabajador recibe el monto completo).
 */
export function calcularResumenPago(monto, urgente, metodo) {
  const enApp = metodo === "Pago en la app";
  const comision = enApp ? Math.round((monto * CONFIG.COMISION_PCT) / 100) : 0;
  const tarifaUrgencia = urgente ? Math.round((monto * CONFIG.URGENCIA_PCT) / 100) : 0;
  return { monto, comision, tarifaUrgencia, total: monto + comision + tarifaUrgencia };
}

// ── Trabajos ────────────────────────────────────────────────────────
export function mapTrabajo(row, viewerId) {
  const viewer = obtenerUsuario(viewerId);
  const publicador = obtenerUsuario(row.publicador_id);
  const trabajador = row.trabajador_id ? obtenerUsuario(row.trabajador_id) : null;
  const postulantes = db.prepare("SELECT COUNT(*) AS n FROM postulacion WHERE trabajo_id = ?").get(row.id).n;
  const yaPostulado = !!db
    .prepare("SELECT 1 FROM postulacion WHERE trabajo_id = ? AND usuario_id = ?")
    .get(row.id, viewerId);
  const calificadoPorMi = !!db
    .prepare("SELECT 1 FROM calificacion WHERE trabajo_id = ? AND de_id = ?")
    .get(row.id, viewerId);
  const esPublicador = row.publicador_id === viewerId;
  const contraparte = esPublicador ? trabajador : publicador;

  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    categoria: row.categoria,
    ubicacion: row.ubicacion,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    distanciaKm: distanciaMostrada(viewer, row),
    fecha: row.fecha,
    pago: row.pago,
    metodoPago: row.metodo_pago,
    publicador: publicador.nombre,
    publicadorId: publicador.id,
    publicadorCalificacion: reputacionDe(publicador.id).calificacion,
    trabajadorId: trabajador?.id,
    trabajadorNombre: trabajador?.nombre,
    estado: row.estado,
    etapa: row.etapa ?? undefined,
    urgente: !!row.urgente,
    postulantes,
    yaPostulado,
    esMio: esPublicador,
    asignadoAMi: row.trabajador_id === viewerId,
    pagado: !!row.pagado,
    resumenPago: calcularResumenPago(row.pago, !!row.urgente, row.metodo_pago),
    calificadoPorMi,
    contraparteId: contraparte?.id,
    contraparteNombre: contraparte?.nombre,
    creadoEn: row.creado_en,
  };
}

// ── Chats ───────────────────────────────────────────────────────────
export function mapMensaje(row, viewerId) {
  return {
    id: row.id,
    autor: row.autor_id === viewerId ? "yo" : "otro",
    texto: row.texto,
    hora: row.hora,
  };
}

export function mapConversacion(row, viewerId) {
  const otroId = row.usuario_a === viewerId ? row.usuario_b : row.usuario_a;
  const otro = obtenerUsuario(otroId);
  const mensajes = db
    .prepare("SELECT * FROM mensaje WHERE conversacion_id = ? ORDER BY creado_en ASC, rowid ASC")
    .all(row.id);
  const ultimo = mensajes[mensajes.length - 1];
  return {
    id: row.id,
    nombre: otro.nombre,
    contraparteId: otro.id,
    ultimoMensaje: ultimo?.texto ?? "",
    hora: ultimo?.hora ?? "",
    noLeidos: 0,
    mensajes: mensajes.map((m) => mapMensaje(m, viewerId)),
  };
}

// ── Historial ───────────────────────────────────────────────────────
export function mapHistorial(row, viewerId) {
  const otroId = row.publicador_id === viewerId ? row.trabajador_id : row.publicador_id;
  const otro = otroId ? obtenerUsuario(otroId) : null;
  return {
    id: row.id,
    titulo: row.titulo,
    fecha: row.fecha,
    pago: row.pago,
    estado: row.estado,
    contraparte: otro?.nombre ?? "Sin asignar",
  };
}
