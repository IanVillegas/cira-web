import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, "..", "cira.db");

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS usuario (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    cedula TEXT NOT NULL,
    telefono TEXT NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    zona TEXT NOT NULL DEFAULT '',
    metodos_pago TEXT NOT NULL DEFAULT '[]',
    disponible INTEGER NOT NULL DEFAULT 1,
    calificacion REAL NOT NULL DEFAULT 5,
    trabajos_completados INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS servicio (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuario(id),
    categoria TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    precio_aproximado INTEGER
  );

  CREATE TABLE IF NOT EXISTS trabajo (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    categoria TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    lat REAL,
    lng REAL,
    distancia_km REAL NOT NULL DEFAULT 0,
    fecha TEXT NOT NULL,
    pago INTEGER NOT NULL,
    metodo_pago TEXT NOT NULL,
    publicador TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    postulantes INTEGER NOT NULL DEFAULT 0,
    ya_postulado INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trabajador (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    servicios TEXT NOT NULL DEFAULT '[]',
    lat REAL,
    lng REAL,
    distancia_km REAL NOT NULL DEFAULT 0,
    calificacion REAL NOT NULL DEFAULT 5,
    disponible INTEGER NOT NULL DEFAULT 1,
    zona TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS conversacion (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS mensaje (
    id TEXT PRIMARY KEY,
    conversacion_id TEXT NOT NULL REFERENCES conversacion(id),
    autor TEXT NOT NULL,
    texto TEXT NOT NULL,
    hora TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS historial (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    fecha TEXT NOT NULL,
    pago INTEGER NOT NULL,
    estado TEXT NOT NULL,
    contraparte TEXT NOT NULL
  );
`);

// Migración simple: agrega columnas nuevas a bases ya existentes (creadas
// antes de sumar lat/lng) sin perder los datos que ya tenga el usuario.
function agregarColumnaSiFalta(tabla, columna, definicion) {
  const columnas = db.prepare(`PRAGMA table_info(${tabla})`).all();
  const existe = columnas.some((c) => c.name === columna);
  if (!existe) {
    db.exec(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
  }
}

agregarColumnaSiFalta("trabajo", "lat", "REAL");
agregarColumnaSiFalta("trabajo", "lng", "REAL");
agregarColumnaSiFalta("trabajador", "lat", "REAL");
agregarColumnaSiFalta("trabajador", "lng", "REAL");

// Backfill de coordenadas para bases sembradas antes de sumar lat/lng: si
// las filas de ejemplo ya existen pero quedaron sin coordenadas, se las
// completa (no toca trabajos/trabajadores creados por el usuario después).
const COORDENADAS_SEED = {
  "t-1": [9.9189, -84.1394],
  "t-2": [10.0134, -84.2239],
  "t-3": [9.9989, -84.1174],
  "t-4": [10.025, -84.25],
  "p-1": [10.0163, -84.2113],
  "w-1": [10.018, -84.213],
  "w-2": [10.0134, -84.2239],
  "w-3": [10.025, -84.25],
  "w-4": [9.9989, -84.1174],
};

const backfillTrabajo = db.prepare("UPDATE trabajo SET lat = ?, lng = ? WHERE id = ? AND lat IS NULL");
const backfillTrabajador = db.prepare("UPDATE trabajador SET lat = ?, lng = ? WHERE id = ? AND lat IS NULL");
for (const [id, [lat, lng]] of Object.entries(COORDENADAS_SEED)) {
  if (id.startsWith("w-")) backfillTrabajador.run(lat, lng, id);
  else backfillTrabajo.run(lat, lng, id);
}
