import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { CONFIG } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVO_LOCAL = path.join(__dirname, "..", "usuarios.local.json");

const PIN = CONFIG.PIN_PRUEBAS;
const EFECTIVO = "Efectivo";
const APP = "Pago en la app";

// Usuarios de prueba con teléfonos ficticios. Los teléfonos reales del equipo van en
// server/usuarios.local.json (excluido de git), por ejemplo:
//   { "u-1": { "telefono": "8888-0000", "nombre": "Nombre Real" } }
// Se aplican en cada arranque, sin tocar el resto de los datos.
const USUARIOS = [
  // id, nombre, cédula, teléfono, descripción, zona, lat, lng, plan, cédula✔, antecedentes✔, urgencias, base de trabajos
  ["u-1", "Ian Villegas", "1-2345-6789", "8888-0001", "Disponible para trabajos de electricidad y reparaciones menores en Alajuela y alrededores.", "Alajuela Centro", 10.0163, -84.2113, "gratis", 1, 0, 0, 23],
  ["u-2", "María Rojas", "1-1111-2222", "8888-0002", "Limpieza de casas y apartamentos.", "San José, Escazú", 9.9189, -84.1394, "gratis", 0, 0, 0, 0],
  ["u-3", "Carlos Méndez", "2-3333-4444", "8888-0003", "Reparaciones generales y pintura.", "Alajuela, Río Segundo", 10.0134, -84.2239, "gratis", 0, 0, 0, 0],
  ["u-4", "Douglas Solano", "2-5555-6666", "8888-0004", "Electricista con 10 años de experiencia. Atiendo urgencias.", "Alajuela Centro", 10.018, -84.213, "plus", 1, 1, 1, 52],
  ["u-5", "Josué Fernández", "1-7777-8888", "8888-0005", "Plomero y cerrajero. Respondo urgencias.", "Alajuela, Desamparados", 10.025, -84.25, "plus", 1, 0, 1, 8],
  ["u-6", "Kimberly Araya", "3-1212-3434", "8888-0006", "Limpieza profunda y cuidado de mascotas.", "Alajuela, Río Segundo", 10.0134, -84.2239, "gratis", 0, 0, 0, 0],
  ["u-7", "Melissa Chacón", "4-5656-7878", "8888-0007", "Jardinería y mudanzas.", "Heredia Centro", 9.9989, -84.1174, "gratis", 1, 0, 0, 0],
  ["u-8", "Laura Jiménez", "1-9090-1010", "8888-0008", "Busco ayuda para el hogar.", "Heredia Centro", 9.9989, -84.1174, "gratis", 0, 0, 0, 0],
  ["u-9", "Esteban Vargas", "5-1357-2468", "8888-0009", "Plomería básica y jardinería.", "Alajuela, Desamparados", 10.025, -84.25, "gratis", 0, 0, 0, 0],
];

const SERVICIOS = [
  ["s-1", "u-1", "Electricidad", "Instalación de tomacorrientes, lámparas y breakers.", 15000],
  ["s-2", "u-1", "Reparaciones", "Reparaciones generales del hogar.", 10000],
  ["s-3", "u-2", "Limpieza", "Limpieza de casas y apartamentos.", 20000],
  ["s-4", "u-3", "Reparaciones", "Pintura y arreglos.", 25000],
  ["s-5", "u-4", "Electricidad", "Instalaciones, cortos y urgencias eléctricas.", 18000],
  ["s-6", "u-4", "Reparaciones", "Reparaciones eléctricas menores.", 12000],
  ["s-7", "u-5", "Plomería", "Fugas, cañerías y cambio de piezas.", 20000],
  ["s-8", "u-5", "Cerrajería", "Apertura de puertas y cambio de chapas.", 20000],
  ["s-9", "u-6", "Limpieza", "Limpieza profunda.", 18000],
  ["s-10", "u-6", "Cuidado de mascotas", "Paseo y cuidado de mascotas.", 8000],
  ["s-11", "u-7", "Jardinería", "Poda y mantenimiento de jardines.", 12000],
  ["s-12", "u-7", "Mudanzas", "Ayuda para mudanzas pequeñas.", 25000],
  ["s-13", "u-9", "Plomería", "Reparaciones básicas de plomería.", 15000],
  ["s-14", "u-9", "Jardinería", "Poda y limpieza de zacate.", 10000],
];

// Trabajos abiertos. id, título, descripción, categoría, ubicación, lat, lng, fecha, pago, método, publicador
const TRABAJOS_ABIERTOS = [
  ["t-1", "Reparar fuga de agua en cocina", "Se necesita plomero para revisar y reparar una fuga debajo del fregadero de la cocina. Herramientas propias.", "Plomería", "San José, Escazú", 9.9189, -84.1394, "Hoy, 3:00 p.m.", 18000, APP, "u-2"],
  ["t-2", "Pintar sala y comedor", "Pintura de dos ambientes, aproximadamente 40 m². La pintura ya está comprada.", "Reparaciones", "Alajuela, Río Segundo", 10.0134, -84.2239, "Mañana, 8:00 a.m.", 45000, APP, "u-3"],
  ["t-3", "Mudanza de apartamento pequeño", "Ayuda para mover cajas y muebles de un apartamento de 1 habitación a otro edificio cercano.", "Mudanzas", "Heredia Centro", 9.9989, -84.1174, "Sábado, 9:00 a.m.", 25000, EFECTIVO, "u-8"],
  ["t-4", "Poda de jardín y limpieza de zacate", "Jardín de casa con zacate alto y algunos arbustos que necesitan poda.", "Jardinería", "Alajuela, Desamparados", 10.025, -84.25, "Hoy, 5:30 p.m.", 12000, APP, "u-9"],
  ["p-1", "Limpieza profunda de apartamento", "Limpieza general de apartamento de 2 habitaciones antes de mudanza.", "Limpieza", "Alajuela Centro", 10.0163, -84.2113, "Viernes, 1:00 p.m.", 20000, APP, "u-1"],
];

const POSTULACIONES = [
  ["t-1", "u-1"], ["t-1", "u-9"], ["t-1", "u-3"],
  ["t-2", "u-1"], ["t-2", "u-6"],
  ["t-3", "u-1"],
  ["t-4", "u-7"],
  ["p-1", "u-6"], ["p-1", "u-2"], ["p-1", "u-3"], ["p-1", "u-7"],
];

// Trabajos terminados (historial y base de las calificaciones reales).
// id, título, categoría, ubicación, fecha, pago, método, publicador, trabajador, estado, ⭐ del cliente al trabajador, ⭐ del trabajador al cliente, comentario
const TRABAJOS_CERRADOS = [
  ["h-1", "Instalación de lámparas", "Electricidad", "San José, Escazú", "12 sept 2026", 15000, EFECTIVO, "u-2", "u-1", "Finalizado", 5, 5, "Muy puntual y ordenado."],
  ["h-2", "Reparación de breaker", "Electricidad", "Alajuela, Río Segundo", "2 sept 2026", 9000, APP, "u-3", "u-1", "Finalizado", 5, 4, "Resolvió el problema rápido."],
  ["h-3", "Cambio de tomacorrientes", "Electricidad", "Heredia Centro", "20 ago 2026", 12000, EFECTIVO, "u-8", "u-1", "Cancelado", null, null, ""],
  ["h-4", "Corto circuito en la cocina", "Electricidad", "Alajuela Centro", "28 ago 2026", 20000, APP, "u-3", "u-4", "Finalizado", 5, 5, "Llegó en 15 minutos."],
  ["h-5", "Instalación de ventiladores", "Electricidad", "Heredia Centro", "30 ago 2026", 16000, EFECTIVO, "u-8", "u-4", "Finalizado", 5, 3, "Excelente trabajo."],
  ["h-6", "Cambio de panel eléctrico", "Electricidad", "San José, Escazú", "5 sept 2026", 40000, APP, "u-2", "u-4", "Finalizado", 4, 5, "Buen servicio, un poco caro."],
  ["h-7", "Reparar tubería del baño", "Plomería", "Alajuela Centro", "1 sept 2026", 22000, APP, "u-3", "u-5", "Finalizado", 5, 4, "Muy profesional."],
  ["h-8", "Cambio de chapa de puerta", "Cerrajería", "Heredia Centro", "8 sept 2026", 18000, EFECTIVO, "u-8", "u-5", "Finalizado", 4, 2, "Cumplió con lo acordado."],
  ["h-9", "Limpieza de apartamento", "Limpieza", "San José, Escazú", "10 sept 2026", 18000, EFECTIVO, "u-2", "u-6", "Finalizado", 4, 5, "Todo quedó limpio."],
  ["h-10", "Fuga en el lavatorio", "Plomería", "Alajuela, Río Segundo", "15 sept 2026", 12000, EFECTIVO, "u-3", "u-9", "Finalizado", 3, 5, "Tardó un poco más de lo esperado."],
];

const MENSAJES = [
  ["m-1", "c-1", "u-2", "Hola, vi que aplicaste al trabajo de la fuga de agua", "10:10 a.m."],
  ["m-2", "c-1", "u-1", "Sí, tengo experiencia con ese tipo de reparaciones", "10:15 a.m."],
  ["m-3", "c-1", "u-2", "Perfecto, te espero a las 3pm entonces", "10:24 a.m."],
  ["m-4", "c-2", "u-3", "¿Cuánto tiempo estimás para la pintura?", "Ayer, 6:40 p.m."],
];

export function seedIfEmpty() {
  const yaHayDatos = db.prepare("SELECT COUNT(*) AS n FROM usuario").get().n > 0;
  if (!yaHayDatos) sembrar();
  aplicarUsuariosLocales();
  return !yaHayDatos;
}

function sembrar() {
  db.exec("BEGIN");

  const insertUsuario = db.prepare(
    `INSERT INTO usuario (id, nombre, cedula, telefono, pin, descripcion, zona, lat, lng, metodos_pago, disponible, plan, plan_desde,
                          cedula_verificada, antecedentes, responde_urgencias, trabajos_base)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
  );
  for (const [id, nombre, cedula, tel, desc, zona, lat, lng, plan, cedulaOk, antec, urg, base] of USUARIOS) {
    insertUsuario.run(
      id, nombre, cedula, tel, PIN, desc, zona, lat, lng,
      JSON.stringify([EFECTIVO, APP]),
      plan, plan === "plus" ? new Date().toISOString() : null,
      cedulaOk, antec, urg, base,
    );
  }

  const insertServicio = db.prepare(
    "INSERT INTO servicio (id, usuario_id, categoria, descripcion, precio_aproximado) VALUES (?, ?, ?, ?, ?)",
  );
  for (const s of SERVICIOS) insertServicio.run(...s);

  // Los trabajos sembrados se crean "viejos" para que no disparen alertas al arrancar.
  const insertTrabajo = db.prepare(
    `INSERT INTO trabajo (id, titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodo_pago, publicador_id,
                          trabajador_id, estado, etapa, urgente, pagado, creado_en, finalizado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, datetime('now', '-1 day'), ?)`,
  );
  for (const [id, titulo, desc, cat, ubic, lat, lng, fecha, pago, metodo, pub] of TRABAJOS_ABIERTOS) {
    insertTrabajo.run(id, titulo, desc, cat, ubic, lat, lng, fecha, pago, metodo, pub, null, "Pendiente", null, 0, null);
  }

  const insertPostulacion = db.prepare("INSERT INTO postulacion (trabajo_id, usuario_id) VALUES (?, ?)");
  for (const p of POSTULACIONES) insertPostulacion.run(...p);

  const insertCalificacion = db.prepare(
    "INSERT INTO calificacion (id, trabajo_id, de_id, a_id, estrellas, comentario) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const insertPago = db.prepare(
    "INSERT INTO pago (id, trabajo_id, metodo, monto, comision, tarifa_urgencia, total) VALUES (?, ?, ?, ?, ?, 0, ?)",
  );
  for (const [id, titulo, cat, ubic, fecha, pago, metodo, pub, trab, estado, estCliente, estTrab, comentario] of TRABAJOS_CERRADOS) {
    const finalizado = estado === "Finalizado";
    insertTrabajo.run(
      id, titulo, "", cat, ubic, null, null, fecha, pago, metodo, pub, trab, estado,
      finalizado ? "Terminado" : null, finalizado ? 1 : 0, finalizado ? "2026-09-01 12:00:00" : null,
    );
    if (!finalizado) continue;
    if (estCliente) insertCalificacion.run(`k-${id}-c`, id, pub, trab, estCliente, comentario);
    if (estTrab) insertCalificacion.run(`k-${id}-t`, id, trab, pub, estTrab, "");
    const comision = metodo === APP ? Math.round((pago * CONFIG.COMISION_PCT) / 100) : 0;
    if (metodo === APP) insertPago.run(`pg-${id}`, id, metodo, pago, comision, pago + comision);
  }

  const insertSuscripcion = db.prepare("INSERT INTO suscripcion (id, usuario_id, monto) VALUES (?, ?, ?)");
  for (const [id, , , , , , , , plan] of USUARIOS) {
    if (plan === "plus") insertSuscripcion.run(`sub-${id}`, id, CONFIG.PLUS_PRECIO);
  }

  const insertConversacion = db.prepare("INSERT INTO conversacion (id, usuario_a, usuario_b) VALUES (?, ?, ?)");
  insertConversacion.run("c-1", "u-1", "u-2");
  insertConversacion.run("c-2", "u-1", "u-3");
  const insertMensaje = db.prepare(
    "INSERT INTO mensaje (id, conversacion_id, autor_id, texto, hora) VALUES (?, ?, ?, ?, ?)",
  );
  for (const m of MENSAJES) insertMensaje.run(...m);

  db.exec("COMMIT");
}

function aplicarUsuariosLocales() {
  if (!fs.existsSync(ARCHIVO_LOCAL)) return;
  let datos;
  try {
    datos = JSON.parse(fs.readFileSync(ARCHIVO_LOCAL, "utf8"));
  } catch {
    console.warn("usuarios.local.json no es un JSON válido: se ignora.");
    return;
  }
  const update = db.prepare(
    "UPDATE usuario SET telefono = COALESCE(?, telefono), nombre = COALESCE(?, nombre), correo = COALESCE(?, correo) WHERE id = ?",
  );
  for (const [id, d] of Object.entries(datos)) update.run(d.telefono ?? null, d.nombre ?? null, d.correo ?? null, id);
}

// Permite sembrar manualmente con `npm run seed`
if (import.meta.url === `file://${process.argv[1]}`) {
  const sembrado = seedIfEmpty();
  console.log(sembrado ? "Base de datos sembrada en cira.db" : "Ya había datos, no se modificó nada.");
}
