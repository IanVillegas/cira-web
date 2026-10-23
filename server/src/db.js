import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, "..", "cira.db");

export const db = new DatabaseSync(DB_PATH);

// Versión del esquema. Al subirla, la base local (solo datos de prueba) se recrea
// y se vuelve a sembrar: el modelo pasó de un usuario fijo a varios usuarios reales.
const VERSION_ESQUEMA = 5;

const TABLAS = [
  "alerta_descartada",
  "suscripcion",
  "pago",
  "reporte",
  "calificacion",
  "mensaje",
  "conversacion",
  "postulacion",
  "trabajo",
  "servicio",
  "usuario",
  // tablas del esquema 1
  "historial",
  "trabajador",
];

const versionActual = db.prepare("PRAGMA user_version").get().user_version;
if (versionActual < VERSION_ESQUEMA) {
  for (const tabla of TABLAS) db.exec(`DROP TABLE IF EXISTS ${tabla}`);
}

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS usuario (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    cedula TEXT NOT NULL,
    telefono TEXT NOT NULL,
    correo TEXT NOT NULL DEFAULT '',
    pin TEXT NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    zona TEXT NOT NULL DEFAULT '',
    lat REAL,
    lng REAL,
    metodos_pago TEXT NOT NULL DEFAULT '[]',
    disponible INTEGER NOT NULL DEFAULT 1,
    plan TEXT NOT NULL DEFAULT 'gratis',
    plan_desde TEXT,
    cedula_verificada INTEGER NOT NULL DEFAULT 0,
    antecedentes INTEGER NOT NULL DEFAULT 0,
    responde_urgencias INTEGER NOT NULL DEFAULT 0,
    trabajos_base INTEGER NOT NULL DEFAULT 0,
    tarjeta_marca TEXT,
    tarjeta_ultimos4 TEXT,
    tarjeta_titular TEXT,
    tarjeta_vence TEXT
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
    fecha TEXT NOT NULL,
    pago INTEGER NOT NULL,
    metodo_pago TEXT NOT NULL,
    publicador_id TEXT NOT NULL REFERENCES usuario(id),
    trabajador_id TEXT REFERENCES usuario(id),
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    etapa TEXT,
    urgente INTEGER NOT NULL DEFAULT 0,
    pagado INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    finalizado_en TEXT
  );

  CREATE TABLE IF NOT EXISTS postulacion (
    trabajo_id TEXT NOT NULL REFERENCES trabajo(id),
    usuario_id TEXT NOT NULL REFERENCES usuario(id),
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (trabajo_id, usuario_id)
  );

  CREATE TABLE IF NOT EXISTS conversacion (
    id TEXT PRIMARY KEY,
    usuario_a TEXT NOT NULL REFERENCES usuario(id),
    usuario_b TEXT NOT NULL REFERENCES usuario(id)
  );

  CREATE TABLE IF NOT EXISTS mensaje (
    id TEXT PRIMARY KEY,
    conversacion_id TEXT NOT NULL REFERENCES conversacion(id),
    autor_id TEXT NOT NULL REFERENCES usuario(id),
    texto TEXT NOT NULL,
    hora TEXT NOT NULL,
    leido INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS calificacion (
    id TEXT PRIMARY KEY,
    trabajo_id TEXT NOT NULL REFERENCES trabajo(id),
    de_id TEXT NOT NULL REFERENCES usuario(id),
    a_id TEXT NOT NULL REFERENCES usuario(id),
    estrellas INTEGER NOT NULL,
    comentario TEXT NOT NULL DEFAULT '',
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (trabajo_id, de_id)
  );

  CREATE TABLE IF NOT EXISTS reporte (
    id TEXT PRIMARY KEY,
    de_id TEXT NOT NULL REFERENCES usuario(id),
    a_id TEXT NOT NULL REFERENCES usuario(id),
    trabajo_id TEXT,
    motivo TEXT NOT NULL,
    detalle TEXT NOT NULL DEFAULT '',
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pago (
    id TEXT PRIMARY KEY,
    trabajo_id TEXT NOT NULL UNIQUE REFERENCES trabajo(id),
    metodo TEXT NOT NULL,
    monto INTEGER NOT NULL,
    comision INTEGER NOT NULL,
    tarifa_urgencia INTEGER NOT NULL,
    propina INTEGER NOT NULL DEFAULT 0,
    en_efectivo INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS suscripcion (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuario(id),
    monto INTEGER NOT NULL,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alerta_descartada (
    usuario_id TEXT NOT NULL REFERENCES usuario(id),
    trabajo_id TEXT NOT NULL REFERENCES trabajo(id),
    PRIMARY KEY (usuario_id, trabajo_id)
  );
`);

db.exec(`PRAGMA user_version = ${VERSION_ESQUEMA}`);
