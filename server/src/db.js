import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, "..", "cira.db");

export const db = new DatabaseSync(DB_PATH);

// Versión del esquema. Al subirla, la base local (solo datos de prueba) se recrea
// y se vuelve a sembrar: el modelo pasó de un usuario fijo a varios usuarios reales.
const VERSION_ESQUEMA = 10;

const TABLAS = [
  "bloqueo",
  "propiedad",
  "serie",
  "favorito",
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
    -- Verificación simulada: cuándo se envió cada documento (los archivos no se guardan).
    cedula_enviada_en TEXT,
    antecedentes_enviada_en TEXT,
    antecedentes_emision TEXT,
    responde_urgencias INTEGER NOT NULL DEFAULT 0,
    trabajos_base INTEGER NOT NULL DEFAULT 0,
    tarjeta_marca TEXT,
    tarjeta_ultimos4 TEXT,
    tarjeta_titular TEXT,
    tarjeta_vence TEXT,
    -- Foto de perfil elegida del catálogo de avatares (URL dentro de /images/cira-avatars/).
    avatar TEXT
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
    -- Fecha y hora locales de Costa Rica ("2026-10-31T09:00"); NULL = lo antes posible (urgencias).
    fecha TEXT,
    -- Hora límite: "listo antes de" (misma forma que fecha). En una limpieza entre huéspedes, la entrada del próximo.
    limite TEXT,
    -- Limpieza entre huéspedes: se ofrece al limpiador habitual y, si no responde antes de escalar_en
    -- (UTC, como creado_en), pasa sola a urgencia.
    turno INTEGER NOT NULL DEFAULT 0,
    escalar_en TEXT,
    escalado INTEGER NOT NULL DEFAULT 0,
    pago INTEGER NOT NULL,
    metodo_pago TEXT NOT NULL,
    publicador_id TEXT NOT NULL REFERENCES usuario(id),
    trabajador_id TEXT REFERENCES usuario(id),
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    etapa TEXT,
    urgente INTEGER NOT NULL DEFAULT 0,
    -- Oferta directa ("Recontratar"): solo esta persona la ve hasta que acepte o rechace.
    invitado_id TEXT REFERENCES usuario(id),
    invitacion_rechazada INTEGER NOT NULL DEFAULT 0,
    -- Trueque: se paga con un servicio (ofrece) y, opcionalmente, un diferencial en dinero (pago).
    es_trueque INTEGER NOT NULL DEFAULT 0,
    ofrece TEXT,
    -- Lo que el publicador hará al final (lo ofrecido o la contrapropuesta elegida).
    trueque_acordado TEXT,
    -- El trabajador aceptó el acuerdo (el publicador lo firma al elegirlo).
    acuerdo_aceptado INTEGER NOT NULL DEFAULT 0,
    -- null → en curso; 'primera' → el trabajador entregó su parte; 'finalizado'.
    trueque_etapa TEXT,
    -- Visita de un servicio recurrente (CIRA Agenda) y propiedad del cliente donde se hace.
    serie_id TEXT REFERENCES serie(id),
    propiedad_id TEXT REFERENCES propiedad(id),
    -- Visita de una serie que el trabajador canceló: 'pendiente' (el cliente decide), 'invitado'
    -- (se le ofreció a un reemplazo) o 'cubierto' (el reemplazo aceptó).
    reemplazo TEXT,
    pagado INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    finalizado_en TEXT
  );

  CREATE TABLE IF NOT EXISTS postulacion (
    trabajo_id TEXT NOT NULL REFERENCES trabajo(id),
    usuario_id TEXT NOT NULL REFERENCES usuario(id),
    -- En un trueque: contrapropuesta (qué pide a cambio); null = acepta lo ofrecido.
    propuesta TEXT,
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
    -- Solo en trueques: si la otra persona cumplió su parte del acuerdo.
    cumplio INTEGER,
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

  -- Agenda: días que un trabajador marcó como no disponibles.
  CREATE TABLE IF NOT EXISTS bloqueo (
    usuario_id TEXT NOT NULL REFERENCES usuario(id),
    fecha TEXT NOT NULL,
    PRIMARY KEY (usuario_id, fecha)
  );

  -- Mis propiedades: direcciones guardadas con instrucciones fijas (llave, qué revisar…).
  CREATE TABLE IF NOT EXISTS propiedad (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuario(id),
    nombre TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    lat REAL,
    lng REAL,
    instrucciones TEXT NOT NULL DEFAULT '',
    -- Quien limpia normalmente la propiedad: recibe primero las limpiezas entre huéspedes.
    limpiador_id TEXT REFERENCES usuario(id),
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Servicio recurrente: plantilla de las visitas (cada visita es un trabajo con serie_id).
  CREATE TABLE IF NOT EXISTS serie (
    id TEXT PRIMARY KEY,
    publicador_id TEXT NOT NULL REFERENCES usuario(id),
    trabajador_id TEXT NOT NULL REFERENCES usuario(id),
    frecuencia TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    categoria TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    lat REAL,
    lng REAL,
    pago INTEGER NOT NULL,
    metodo_pago TEXT NOT NULL,
    propiedad_id TEXT REFERENCES propiedad(id),
    -- El trabajador aceptó la primera visita: desde ahí CIRA genera las siguientes.
    aceptada INTEGER NOT NULL DEFAULT 0,
    activa INTEGER NOT NULL DEFAULT 1,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- "De confianza": trabajadores que cada usuario guardó para volver a contratar.
  CREATE TABLE IF NOT EXISTS favorito (
    usuario_id TEXT NOT NULL REFERENCES usuario(id),
    trabajador_id TEXT NOT NULL REFERENCES usuario(id),
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (usuario_id, trabajador_id)
  );

  CREATE TABLE IF NOT EXISTS alerta_descartada (
    usuario_id TEXT NOT NULL REFERENCES usuario(id),
    trabajo_id TEXT NOT NULL REFERENCES trabajo(id),
    PRIMARY KEY (usuario_id, trabajo_id)
  );
`);

// Columnas agregadas después: se suman sin recrear la base (así no se pierden los datos de prueba).
const columnasUsuario = db.prepare("PRAGMA table_info(usuario)").all().map((c) => c.name);
if (!columnasUsuario.includes("avatar")) db.exec("ALTER TABLE usuario ADD COLUMN avatar TEXT");

db.exec(`PRAGMA user_version = ${VERSION_ESQUEMA}`);
