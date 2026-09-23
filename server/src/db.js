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
