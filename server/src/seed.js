import { db } from "./db.js";

export function seedIfEmpty() {
  const yaHayDatos = db.prepare("SELECT COUNT(*) AS n FROM usuario").get().n > 0;
  if (yaHayDatos) return false;

  db.exec("BEGIN");

  db.prepare(
    `INSERT INTO usuario (id, nombre, cedula, telefono, descripcion, zona, metodos_pago, disponible, calificacion, trabajos_completados)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    "u-1",
    "Ian Villegas",
    "1-2345-6789",
    "8888-1234",
    "Disponible para trabajos de electricidad y reparaciones menores en Alajuela y alrededores.",
    "Alajuela Centro",
    JSON.stringify(["SINPE", "Efectivo"]),
    1,
    4.8,
    23,
  );

  const servicios = [
    ["s-1", "u-1", "Electricidad", "Instalación de tomacorrientes, lámparas y breakers.", 15000],
    ["s-2", "u-1", "Reparaciones", "Reparaciones generales del hogar.", 10000],
  ];
  const insertServicio = db.prepare(
    "INSERT INTO servicio (id, usuario_id, categoria, descripcion, precio_aproximado) VALUES (?, ?, ?, ?, ?)",
  );
  for (const s of servicios) insertServicio.run(...s);

  // Coordenadas reales aproximadas (Alajuela y alrededores, Costa Rica) para
  // que el mapa con Leaflet/OpenStreetMap tenga pines en ubicaciones reales.
  const trabajos = [
    ["t-1", "Reparar fuga de agua en cocina", "Se necesita plomero para revisar y reparar una fuga debajo del fregadero de la cocina. Herramientas propias.", "Plomería", "San José, Escazú", 9.9189, -84.1394, 2.3, "Hoy, 3:00 p.m.", 18000, "SINPE", "María Rojas", "Pendiente", 3, 0],
    ["t-2", "Pintar sala y comedor", "Pintura de dos ambientes, aproximadamente 40 m². La pintura ya está comprada.", "Reparaciones", "Alajuela, Río Segundo", 10.0134, -84.2239, 1.1, "Mañana, 8:00 a.m.", 45000, "Transferencia", "Carlos Méndez", "Pendiente", 5, 0],
    ["t-3", "Mudanza de apartamento pequeño", "Ayuda para mover cajas y muebles de un apartamento de 1 habitación a otro edificio cercano.", "Mudanzas", "Heredia Centro", 9.9989, -84.1174, 5.8, "Sábado, 9:00 a.m.", 25000, "Efectivo", "Laura Jiménez", "Pendiente", 1, 1],
    ["t-4", "Poda de jardín y limpieza de zacate", "Jardín de casa con zacate alto y algunos arbustos que necesitan poda.", "Jardinería", "Alajuela, Desamparados", 10.0250, -84.2500, 0.6, "Hoy, 5:30 p.m.", 12000, "SINPE", "Esteban Vargas", "Pendiente", 2, 0],
    ["p-1", "Limpieza profunda de apartamento", "Limpieza general de apartamento de 2 habitaciones antes de mudanza.", "Limpieza", "Alajuela Centro", 10.0163, -84.2113, 0, "Viernes, 1:00 p.m.", 20000, "SINPE", "Ian Villegas", "Pendiente", 4, 0],
  ];
  const insertTrabajo = db.prepare(
    `INSERT INTO trabajo (id, titulo, descripcion, categoria, ubicacion, lat, lng, distancia_km, fecha, pago, metodo_pago, publicador, estado, postulantes, ya_postulado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const t of trabajos) insertTrabajo.run(...t);

  const trabajadores = [
    ["w-1", "Douglas Solano", JSON.stringify(["Electricidad", "Reparaciones"]), 10.0180, -84.2130, 0.9, 4.9, 1, "Alajuela Centro"],
    ["w-2", "Kimberly Araya", JSON.stringify(["Limpieza", "Cuidado de mascotas"]), 10.0134, -84.2239, 1.4, 4.7, 1, "Río Segundo"],
    ["w-3", "Josué Fernández", JSON.stringify(["Plomería"]), 10.0250, -84.2500, 3.2, 4.5, 0, "Desamparados"],
    ["w-4", "Melissa Chacón", JSON.stringify(["Jardinería", "Mudanzas"]), 9.9989, -84.1174, 4.0, 4.6, 1, "Heredia Centro"],
  ];
  const insertTrabajador = db.prepare(
    "INSERT INTO trabajador (id, nombre, servicios, lat, lng, distancia_km, calificacion, disponible, zona) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const w of trabajadores) insertTrabajador.run(...w);

  const conversaciones = [
    ["c-1", "María Rojas"],
    ["c-2", "Carlos Méndez"],
  ];
  const insertConversacion = db.prepare("INSERT INTO conversacion (id, nombre) VALUES (?, ?)");
  for (const c of conversaciones) insertConversacion.run(...c);

  const mensajes = [
    ["m-1", "c-1", "otro", "Hola, vi que aplicaste al trabajo de la fuga de agua", "10:10 a.m."],
    ["m-2", "c-1", "yo", "Sí, tengo experiencia con ese tipo de reparaciones", "10:15 a.m."],
    ["m-3", "c-1", "otro", "Perfecto, te espero a las 3pm entonces", "10:24 a.m."],
    ["m-4", "c-2", "otro", "¿Cuánto tiempo estimás para la pintura?", "Ayer, 6:40 p.m."],
  ];
  const insertMensaje = db.prepare(
    "INSERT INTO mensaje (id, conversacion_id, autor, texto, hora) VALUES (?, ?, ?, ?, ?)",
  );
  for (const m of mensajes) insertMensaje.run(...m);

  const historial = [
    ["h-1", "Instalación de lámparas", "12 sept 2026", 15000, "Finalizado", "Ana Gómez"],
    ["h-2", "Reparación de breaker", "2 sept 2026", 9000, "Finalizado", "Diego Salas"],
    ["h-3", "Cambio de tomacorrientes", "20 ago 2026", 12000, "Cancelado", "Fabiola Ruiz"],
  ];
  const insertHistorial = db.prepare(
    "INSERT INTO historial (id, titulo, fecha, pago, estado, contraparte) VALUES (?, ?, ?, ?, ?, ?)",
  );
  for (const h of historial) insertHistorial.run(...h);

  db.exec("COMMIT");
  return true;
}

// Permite sembrar manualmente con `npm run seed`
if (import.meta.url === `file://${process.argv[1]}`) {
  const sembrado = seedIfEmpty();
  console.log(sembrado ? "Base de datos sembrada en cira.db" : "Ya había datos, no se modificó nada.");
}
