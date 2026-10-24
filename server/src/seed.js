import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { CONFIG } from "./config.js";
import { extenderSerie } from "./agenda.js";
import { enDias, proximo } from "./fechas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVO_LOCAL = path.join(__dirname, "..", "usuarios.local.json");

const PIN = CONFIG.PIN_PRUEBAS;
const EFECTIVO = "Efectivo";
const APP = "Tarjeta";

// Usuarios del equipo (login por teléfono + PIN de pruebas). Opcionalmente,
// server/usuarios.local.json puede sobrescribir teléfono, nombre o correo por id
// (p. ej. { "u-1": { "telefono": "8888-0000" } }); se aplica en cada arranque.
const CORREOS = {
  "u-1": "ian.villegas.jimenez@est.una.ac.cr",
  "u-2": "marisol.hidalgo.murillo@est.una.ac.cr",
  "u-3": "bayron.camacho.ledezma@est.una.ac.cr",
  "u-4": "eduardo.picado.courrau@est.una.ac.cr",
  "u-5": "jose.jara.arias@est.una.ac.cr",
  "u-6": "jixi.morales.mendoza@est.una.ac.cr",
};

const USUARIOS = [
  // id, nombre, cédula (ficticia), teléfono, descripción, zona, lat, lng, plan, cédula✔, antecedentes✔, urgencias, base de trabajos
  ["u-1", "Ian Villegas", "1-1234-5678", "6104-4195", "Electricidad y reparaciones menores en Alajuela y alrededores.", "Alajuela Centro", 10.0163, -84.2113, "plus", 1, 1, 0, 23],
  ["u-2", "Marisol Hidalgo", "1-2345-6789", "6361-7541", "Limpieza de casas y cuidado de mascotas.", "San José, Escazú", 9.9189, -84.1394, "gratis", 0, 0, 0, 0],
  ["u-3", "Bayron Camacho", "2-3456-7890", "8512-8068", "Plomero y cerrajero. Respondo urgencias.", "Alajuela, Desamparados", 10.025, -84.25, "plus", 1, 0, 1, 8],
  ["u-4", "Eduardo Picado", "3-4567-8901", "6252-4226", "Electricista con 10 años de experiencia. Atiendo urgencias.", "Alajuela Centro", 10.018, -84.213, "plus", 1, 1, 1, 52],
  ["u-5", "José Jara", "4-5678-9012", "7064-2458", "Plomería básica y jardinería.", "Alajuela, Río Segundo", 10.0134, -84.2239, "gratis", 0, 0, 0, 0],
  ["u-6", "Jixi Morales", "5-6789-0123", "6481-8545", "Jardinería y mudanzas.", "Heredia Centro", 9.9989, -84.1174, "gratis", 1, 0, 0, 0],
];

const SERVICIOS = [
  ["s-1", "u-1", "Electricidad", "Instalación de tomacorrientes, lámparas y breakers.", 15000],
  ["s-2", "u-1", "Reparaciones", "Reparaciones generales del hogar.", 10000],
  ["s-3", "u-2", "Limpieza", "Limpieza de casas y apartamentos.", 20000],
  ["s-4", "u-2", "Cuidado de mascotas", "Paseo y cuidado de mascotas.", 8000],
  ["s-5", "u-3", "Plomería", "Fugas, cañerías y cambio de piezas.", 20000],
  ["s-6", "u-3", "Cerrajería", "Apertura de puertas y cambio de chapas.", 20000],
  ["s-7", "u-4", "Electricidad", "Instalaciones, cortos y urgencias eléctricas.", 18000],
  ["s-8", "u-4", "Reparaciones", "Reparaciones eléctricas menores.", 12000],
  ["s-9", "u-5", "Plomería", "Reparaciones básicas de plomería.", 15000],
  ["s-10", "u-5", "Jardinería", "Poda y limpieza de zacate.", 10000],
  ["s-11", "u-6", "Jardinería", "Poda y mantenimiento de jardines.", 12000],
  ["s-12", "u-6", "Mudanzas", "Ayuda para mudanzas pequeñas.", 25000],
  ["s-13", "u-6", "Limpieza", "Limpieza de casas y apartamentos amueblados.", 18000],
];

// Trabajos abiertos. id, título, descripción, categoría, ubicación, lat, lng, fecha, pago, método, publicador
const TRABAJOS_ABIERTOS = [
  ["t-1", "Reparar fuga de agua en cocina", "Se necesita plomero para revisar y reparar una fuga debajo del fregadero de la cocina. Herramientas propias.", "Plomería", "San José, Escazú", 9.9189, -84.1394, enDias(1, "15:00"), 18000, APP, "u-2"],
  ["t-2", "Pintar sala y comedor", "Pintura de dos ambientes, aproximadamente 40 m². La pintura ya está comprada.", "Reparaciones", "Alajuela, Río Segundo", 10.0134, -84.2239, enDias(2, "08:00"), 45000, APP, "u-5"],
  ["t-3", "Mudanza de apartamento pequeño", "Ayuda para mover cajas y muebles de un apartamento de 1 habitación a otro edificio cercano.", "Mudanzas", "Heredia Centro", 9.9989, -84.1174, proximo(6, "09:00"), 25000, EFECTIVO, "u-5"],
  ["t-4", "Poda de jardín y limpieza de zacate", "Jardín de casa con zacate alto y algunos arbustos que necesitan poda.", "Jardinería", "Alajuela, Desamparados", 10.025, -84.25, enDias(1, "17:30"), 12000, APP, "u-3"],
  ["t-5", "Traer sofá comprado en Heredia", "Compré un sofá de 3 plazas en Marketplace y necesito traerlo hasta mi casa. Ideal si tienes pickup o carro grande.", "Transporte", "Alajuela, San Rafael", 10.004, -84.208, proximo(0, "10:00"), 10000, APP, "u-6"],
  ["t-6", "Baño y cepillado para gato", "Gato de pelo largo, tranquilo. Necesita baño, secado y cepillado en casa.", "Cuidado de mascotas", "Alajuela, Guácima", 9.98, -84.255, proximo(4, "16:00"), 8000, EFECTIVO, "u-3"],
  ["t-7", "Instalar lámparas en terraza", "Instalación de tres lámparas exteriores y un interruptor nuevo. Los materiales ya están comprados.", "Electricidad", "Alajuela, El Coyol", 10.005, -84.27, enDias(1, "14:00"), 22000, APP, "u-6"],
  ["p-1", "Limpieza profunda de apartamento", "Limpieza general de apartamento de 2 habitaciones antes de mudanza.", "Limpieza", "Alajuela Centro", 10.0163, -84.2113, proximo(5, "13:00"), 20000, APP, "u-1"],
];

// Oferta directa ("Recontratar"): id, título, descripción, categoría, ubicación, lat, lng, fecha, pago, método, publicador, invitado
const OFERTA_DIRECTA = [
  "o-1", "Revisar breaker que se dispara", "Igual que la vez pasada: el breaker de la cocina se dispara cuando uso el horno.",
  "Electricidad", "Alajuela, Río Segundo", 10.0134, -84.2239, proximo(1, "09:00"), 15000, APP, "u-5", "u-1",
];

// Trueques abiertos: id, título, descripción, categoría, ubicación, lat, lng, fecha, diferencial, método del diferencial, publicador, qué ofrece
const TRUEQUES = [
  ["p-2", "Subir refrigeradora al segundo piso", "Necesito ayuda para subir una refrigeradora por la escalera. Tengo carretilla.", "Mudanzas", "Alajuela Centro", 10.0163, -84.2113, proximo(6, "16:00"), 2000, EFECTIVO, "u-1", "Reviso la instalación eléctrica de tu casa (2 horas)"],
  ["tr-1", "Cambiar chapa y bisagras de la puerta", "Puerta de la entrada que no cierra bien. Ya compré la chapa nueva.", "Reparaciones", "Alajuela, Desamparados", 10.026, -84.251, proximo(0, "10:00"), 0, EFECTIVO, "u-3", "Destapo y reviso las tuberías de tu baño o cocina"],
];

// Postulaciones a trueques: trabajo, usuario, contrapropuesta (null = acepta lo ofrecido).
const POSTULACIONES_TRUEQUE = [
  ["p-2", "u-6", null],
  ["p-2", "u-3", "Cambiar 2 tomacorrientes de su taller"],
];

// Mis propiedades (de Ian): id, dueño, nombre, ubicación, lat, lng, instrucciones.
const PROPIEDADES = [
  ["pr-1", "u-1", "Apartamento Escazú", "San José, Escazú", 9.9189, -84.1394,
    "Lo alquilo por Airbnb. La llave está con el guarda de la entrada. Los productos de limpieza están bajo el fregadero; cambiar las sábanas y dejar toallas limpias."],
  ["pr-2", "u-1", "Casa Alajuela", "Alajuela Centro", 10.0163, -84.2113,
    "Tocar el timbre del portón negro. Hay un perro amigable en el patio."],
];

// CIRA Agenda: Ian contrata a Marisol para limpiar el Apartamento Escazú cada viernes.
// Ya hubo una visita (el viernes pasado, pagada y calificada); CIRA genera las próximas.
const SERIE_DEMO = {
  id: "se-1", publicador: "u-1", trabajador: "u-2", frecuencia: "semanal",
  titulo: "Limpieza semanal del apartamento", descripcion: "Limpieza general entre huéspedes: baño, cocina, pisos y cambio de ropa de cama.",
  categoria: "Limpieza", propiedad: "pr-1", pago: 20000, metodo: APP, hora: "09:00",
};

// Agenda: días que cada trabajador marcó como no disponibles (días a partir de hoy).
const BLOQUEOS = [
  ["u-2", 5], ["u-4", 2], ["u-4", 3], ["u-4", 9],
];

// "De confianza": quién guardó a quién (usuario, trabajador).
const FAVORITOS = [
  ["u-1", "u-4"], ["u-1", "u-3"], ["u-1", "u-6"],
  ["u-2", "u-1"], ["u-5", "u-1"], ["u-6", "u-1"],
  ["u-2", "u-4"], ["u-5", "u-4"], ["u-6", "u-4"],
  ["u-6", "u-3"],
];

// Hoja de delincuencia: hace cuántos días se emitió. La de Ian ya venció (más de 3 meses) para
// poder mostrar en la demo cómo se renueva; la de Eduardo está vigente.
const DIAS_EMISION_ANTECEDENTES = { "u-1": 125, "u-4": 20 };
const haceDias = (n) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

const POSTULACIONES = [
  ["t-1", "u-1"], ["t-1", "u-5"], ["t-1", "u-3"],
  ["t-2", "u-1"], ["t-2", "u-4"],
  ["t-3", "u-1"], ["t-3", "u-6"],
  ["t-4", "u-6"], ["t-4", "u-5"],
  ["p-1", "u-2"], ["p-1", "u-6"], ["p-1", "u-4"], ["p-1", "u-3"],
];

// Trabajos terminados (historial y base de las calificaciones reales).
// id, título, categoría, ubicación, fecha, pago, método, publicador, trabajador, estado, ⭐ del cliente al trabajador, ⭐ del trabajador al cliente, comentario
const TRABAJOS_CERRADOS = [
  ["h-1", "Instalación de lámparas", "Electricidad", "San José, Escazú", "2026-09-12T10:00", 15000, EFECTIVO, "u-2", "u-1", "Finalizado", 5, 5, "Muy puntual y ordenado."],
  ["h-2", "Reparación de breaker", "Electricidad", "Alajuela, Río Segundo", "2026-09-02T09:00", 9000, APP, "u-5", "u-1", "Finalizado", 5, 4, "Resolvió el problema rápido."],
  ["h-3", "Cambio de tomacorrientes", "Electricidad", "Heredia Centro", "2026-08-20T15:00", 12000, EFECTIVO, "u-6", "u-1", "Cancelado", null, null, ""],
  ["h-4", "Corto circuito en la cocina", "Electricidad", "Alajuela Centro", "2026-08-28T19:30", 20000, APP, "u-5", "u-4", "Finalizado", 5, 5, "Llegó en 15 minutos."],
  ["h-5", "Instalación de ventiladores", "Electricidad", "Heredia Centro", "2026-08-30T10:00", 16000, EFECTIVO, "u-6", "u-4", "Finalizado", 5, 3, "Excelente trabajo."],
  ["h-6", "Cambio de panel eléctrico", "Electricidad", "San José, Escazú", "2026-09-05T08:00", 40000, APP, "u-2", "u-4", "Finalizado", 4, 5, "Buen servicio, un poco caro."],
  ["h-7", "Reparar tubería del baño", "Plomería", "Alajuela Centro", "2026-09-01T14:00", 22000, APP, "u-5", "u-3", "Finalizado", 5, 4, "Muy profesional."],
  ["h-8", "Cambio de chapa de puerta", "Cerrajería", "Heredia Centro", "2026-09-08T11:00", 18000, EFECTIVO, "u-6", "u-3", "Finalizado", 4, 2, "Cumplió con lo acordado."],
  ["h-9", "Limpieza de apartamento", "Limpieza", "Alajuela Centro", "2026-09-10T09:00", 18000, EFECTIVO, "u-1", "u-2", "Finalizado", 4, 5, "Todo quedó limpio."],
  ["h-10", "Fuga en el lavatorio", "Plomería", "Alajuela Centro", "2026-09-15T16:00", 12000, EFECTIVO, "u-1", "u-5", "Finalizado", 3, 5, "Tardó un poco más de lo esperado."],
];

const MENSAJES = [
  ["m-1", "c-1", "u-2", "Hola, vi que aplicaste al trabajo de la fuga de agua", "10:10 a.m."],
  ["m-2", "c-1", "u-1", "Sí, tengo experiencia con ese tipo de reparaciones", "10:15 a.m."],
  ["m-3", "c-1", "u-2", "Perfecto, te espero a las 3pm entonces", "10:24 a.m."],
  ["m-4", "c-2", "u-5", "¿Cuánto tiempo estimás para la pintura?", "Ayer, 6:40 p.m."],
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
    `INSERT INTO usuario (id, nombre, cedula, telefono, correo, pin, descripcion, zona, lat, lng, metodos_pago, disponible, plan, plan_desde,
                          cedula_verificada, antecedentes, antecedentes_emision, responde_urgencias, trabajos_base)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const [id, nombre, cedula, tel, desc, zona, lat, lng, plan, cedulaOk, antec, urg, base] of USUARIOS) {
    insertUsuario.run(
      id, nombre, cedula, tel, CORREOS[id], PIN, desc, zona, lat, lng,
      JSON.stringify([EFECTIVO, APP]),
      plan, plan === "plus" ? new Date().toISOString() : null,
      cedulaOk, antec, antec && DIAS_EMISION_ANTECEDENTES[id] ? haceDias(DIAS_EMISION_ANTECEDENTES[id]) : null, urg, base,
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

  // Oferta directa de ejemplo: José recontrata a Ian (la ve en "Mis trabajos").
  db.prepare(
    `INSERT INTO trabajo (id, titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodo_pago, publicador_id,
                          estado, invitado_id, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?, datetime('now', '-1 day'))`,
  ).run(...OFERTA_DIRECTA);

  const insertFavorito = db.prepare("INSERT INTO favorito (usuario_id, trabajador_id) VALUES (?, ?)");
  for (const f of FAVORITOS) insertFavorito.run(...f);

  const insertTrueque = db.prepare(
    `INSERT INTO trabajo (id, titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodo_pago, publicador_id,
                          estado, es_trueque, ofrece, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', 1, ?, datetime('now', '-1 day'))`,
  );
  for (const t of TRUEQUES) insertTrueque.run(...t);

  const insertPropiedad = db.prepare(
    "INSERT INTO propiedad (id, usuario_id, nombre, ubicacion, lat, lng, instrucciones) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  for (const p of PROPIEDADES) insertPropiedad.run(...p);

  const insertBloqueo = db.prepare("INSERT OR IGNORE INTO bloqueo (usuario_id, fecha) VALUES (?, ?)");
  for (const [u, dias] of BLOQUEOS) insertBloqueo.run(u, enDias(dias, "00:00").slice(0, 10));

  const insertPostulacion = db.prepare("INSERT INTO postulacion (trabajo_id, usuario_id, propuesta) VALUES (?, ?, ?)");
  for (const [t, u] of POSTULACIONES) insertPostulacion.run(t, u, null);
  for (const p of POSTULACIONES_TRUEQUE) insertPostulacion.run(...p);

  const insertCalificacion = db.prepare(
    "INSERT INTO calificacion (id, trabajo_id, de_id, a_id, estrellas, comentario) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const insertPago = db.prepare(
    "INSERT INTO pago (id, trabajo_id, metodo, monto, comision, tarifa_urgencia, propina, en_efectivo, total) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)",
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
    insertPago.run(`pg-${id}`, id, metodo, pago, comision, metodo === EFECTIVO ? pago : 0, pago + comision);
  }

  sembrarSerie();

  const insertSuscripcion = db.prepare("INSERT INTO suscripcion (id, usuario_id, monto) VALUES (?, ?, ?)");
  for (const [id, , , , , , , , plan] of USUARIOS) {
    if (plan === "plus") insertSuscripcion.run(`sub-${id}`, id, CONFIG.PLUS_PRECIO);
  }

  const insertConversacion = db.prepare("INSERT INTO conversacion (id, usuario_a, usuario_b) VALUES (?, ?, ?)");
  insertConversacion.run("c-1", "u-1", "u-2");
  insertConversacion.run("c-2", "u-1", "u-5");
  const insertMensaje = db.prepare(
    "INSERT INTO mensaje (id, conversacion_id, autor_id, texto, hora, leido) VALUES (?, ?, ?, ?, ?, 1)",
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

/** Servicio recurrente de la demo: una visita pasada (pagada y calificada) y las próximas. */
function sembrarSerie() {
  const s = SERIE_DEMO;
  const prop = PROPIEDADES.find((p) => p[0] === s.propiedad);
  const [, , , ubicacion, lat, lng] = prop;
  db.prepare(
    `INSERT INTO serie (id, publicador_id, trabajador_id, frecuencia, titulo, descripcion, categoria, ubicacion, lat, lng,
                        pago, metodo_pago, propiedad_id, aceptada, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now', '-8 day'))`,
  ).run(s.id, s.publicador, s.trabajador, s.frecuencia, s.titulo, s.descripcion, s.categoria, ubicacion, lat, lng, s.pago, s.metodo, s.propiedad);

  // El viernes pasado (una semana antes del próximo viernes).
  const viernesPasado = (() => {
    const proximoViernes = proximo(5, s.hora);
    const d = new Date(`${proximoViernes}:00Z`);
    d.setUTCDate(d.getUTCDate() - 7);
    return d.toISOString().slice(0, 16);
  })();
  db.prepare(
    `INSERT INTO trabajo (id, titulo, descripcion, categoria, ubicacion, lat, lng, fecha, pago, metodo_pago, publicador_id,
                          trabajador_id, estado, etapa, pagado, serie_id, propiedad_id, creado_en, finalizado_en)
     VALUES ('v-1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Finalizado', 'Terminado', 1, ?, ?, datetime('now', '-8 day'), datetime('now', '-6 day'))`,
  ).run(s.titulo, s.descripcion, s.categoria, ubicacion, lat, lng, viernesPasado, s.pago, s.metodo, s.publicador, s.trabajador, s.id, s.propiedad);
  const comision = Math.round((s.pago * CONFIG.COMISION_PCT) / 100);
  db.prepare(
    "INSERT INTO pago (id, trabajo_id, metodo, monto, comision, tarifa_urgencia, propina, en_efectivo, total) VALUES ('pg-v-1', 'v-1', ?, ?, ?, 0, 0, 0, ?)",
  ).run(s.metodo, s.pago, comision, s.pago + comision);
  const calificar = db.prepare("INSERT INTO calificacion (id, trabajo_id, de_id, a_id, estrellas, comentario) VALUES (?, 'v-1', ?, ?, ?, ?)");
  calificar.run("k-v-1-c", s.publicador, s.trabajador, 5, "Dejó el apartamento impecable para los huéspedes.");
  calificar.run("k-v-1-t", s.trabajador, s.publicador, 5, "");

  extenderSerie({ id: s.id, aceptada: 1, activa: 1, frecuencia: s.frecuencia, titulo: s.titulo, descripcion: s.descripcion,
    categoria: s.categoria, ubicacion, lat, lng, pago: s.pago, metodo_pago: s.metodo, publicador_id: s.publicador,
    trabajador_id: s.trabajador, propiedad_id: s.propiedad });
}
