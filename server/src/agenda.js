// CIRA Agenda: visitas de los servicios recurrentes, días bloqueados y días ocupados.
import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import { CONFIG } from "./config.js";
import { ahoraIso, diaDe, siguienteVisita } from "./fechas.js";

/** Visitas futuras que CIRA mantiene creadas por serie (se completan al consultar). */
export const VISITAS_ADELANTE = 4;
/** Tope de visitas por serie, para que una serie olvidada no crezca sin fin. */
const MAX_VISITAS = 52;

export const FRECUENCIAS = ["semanal", "quincenal", "mensual"];

/**
 * Mantiene `VISITAS_ADELANTE` visitas futuras de una serie aceptada y activa.
 * Cada visita es un trabajo ya asignado al trabajador de la serie (lo aceptó una vez).
 */
export function extenderSerie(serie) {
  if (!serie.aceptada || !serie.activa) return;
  const ahora = ahoraIso();
  const visitas = db.prepare("SELECT fecha, estado FROM trabajo WHERE serie_id = ? ORDER BY fecha").all(serie.id);
  if (visitas.length === 0 || visitas.length >= MAX_VISITAS) return;

  let ultima = visitas[visitas.length - 1].fecha;
  let futuras = visitas.filter((v) => v.fecha >= ahora && v.estado !== "Cancelado").length;
  const insertar = db.prepare(
    `INSERT INTO trabajo (id, titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodo_pago, publicador_id,
                          trabajador_id, estado, etapa, serie_id, propiedad_id, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Asignado', 'Aceptado', ?, ?, datetime('now', '-1 day'))`,
  );
  let total = visitas.length;
  while (futuras < VISITAS_ADELANTE && total < MAX_VISITAS) {
    ultima = siguienteVisita(ultima, serie.frecuencia);
    insertar.run(
      `t-${randomUUID()}`, serie.titulo, serie.descripcion, serie.categoria, serie.ubicacion, serie.lat, serie.lng,
      ultima, serie.pago, serie.metodo_pago, serie.publicador_id, serie.trabajador_id, serie.id, serie.propiedad_id,
    );
    if (ultima >= ahora) futuras++;
    total++;
  }
}

/** Completa las visitas de todas las series activas en las que participa una persona. */
export function extenderSeriesDe(usuarioId) {
  const series = db
    .prepare("SELECT * FROM serie WHERE (publicador_id = ? OR trabajador_id = ?) AND activa = 1 AND aceptada = 1")
    .all(usuarioId, usuarioId);
  for (const s of series) extenderSerie(s);
}

export const obtenerSerie = (id) => (id ? db.prepare("SELECT * FROM serie WHERE id = ?").get(id) : null);

export function estaBloqueado(usuarioId, dia) {
  return !!db.prepare("SELECT 1 FROM bloqueo WHERE usuario_id = ? AND fecha = ?").get(usuarioId, dia);
}

/** ¿Tiene un trabajo asignado ese día? */
export function tieneTrabajoEseDia(usuarioId, dia, excluirTrabajoId = "") {
  return !!db
    .prepare(
      `SELECT 1 FROM trabajo
        WHERE trabajador_id = ? AND estado IN ('Asignado', 'En progreso') AND substr(fecha, 1, 10) = ? AND id != ?`,
    )
    .get(usuarioId, dia, excluirTrabajoId);
}

/**
 * Días no disponibles de una persona entre dos fechas (YYYY-MM-DD): los que bloqueó y los que
 * ya tiene un trabajo asignado. No dice con quién ni qué trabajo (privacidad).
 */
export function diasOcupados(usuarioId, desde, hasta) {
  extenderSeriesDe(usuarioId);
  const bloqueados = db
    .prepare("SELECT fecha FROM bloqueo WHERE usuario_id = ? AND fecha BETWEEN ? AND ?")
    .all(usuarioId, desde, hasta)
    .map((r) => r.fecha);
  const conTrabajo = db
    .prepare(
      `SELECT DISTINCT substr(fecha, 1, 10) AS dia FROM trabajo
        WHERE trabajador_id = ? AND estado IN ('Asignado', 'En progreso') AND fecha IS NOT NULL
          AND substr(fecha, 1, 10) BETWEEN ? AND ?`,
    )
    .all(usuarioId, desde, hasta)
    .map((r) => r.dia);
  return [...new Set([...bloqueados, ...conTrabajo])].sort();
}

/**
 * Limpieza entre huéspedes que el limpiador habitual no respondió (o rechazó): pasa a urgencia y
 * se avisa a los trabajadores cercanos. La tarifa de urgencia se cobra con tarjeta; si el cliente
 * no tiene una registrada, queda publicada para todos sin ser urgencia.
 */
export function escalarTurno(row) {
  const cliente = db.prepare("SELECT tarjeta_ultimos4 FROM usuario WHERE id = ?").get(row.publicador_id);
  db.prepare(
    `UPDATE trabajo SET invitado_id = NULL, invitacion_rechazada = 0, escalado = 1, escalar_en = NULL,
       urgente = ?, creado_en = datetime('now')
     WHERE id = ?`,
  ).run(cliente?.tarjeta_ultimos4 ? 1 : 0, row.id);
}

/** Escala las limpiezas entre huéspedes cuyo plazo para el limpiador habitual ya venció. */
export function escalarTurnosVencidos() {
  const vencidos = db
    .prepare(
      `SELECT * FROM trabajo
        WHERE turno = 1 AND escalado = 0 AND estado = 'Pendiente' AND trabajador_id IS NULL
          AND escalar_en IS NOT NULL AND escalar_en <= datetime('now')`,
    )
    .all();
  for (const row of vencidos) escalarTurno(row);
}

/** Minutos que tiene el limpiador habitual para responder. */
export const minutosParaEscalar = () => CONFIG.ESCALAR_TURNO_MIN;

export { diaDe };
