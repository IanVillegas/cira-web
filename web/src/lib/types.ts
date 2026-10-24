export type Rol = "trabajador" | "empleador";

export type MetodoPago = "Efectivo" | "Tarjeta";

export type EstadoTrabajo =
  | "Pendiente"
  | "Asignado"
  | "En progreso"
  | "Finalizado"
  | "Cancelado";

export type Plan = "gratis" | "plus";

export type Insignia = "plus" | "cedula" | "antecedentes" | "mas50" | "urgencias";

export type EtapaTrabajo = "Aceptado" | "En camino" | "Llegó" | "Terminado";

export interface Usuario {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo?: string;
  descripcion: string;
  zona: string;
  fotoUrl?: string;
  lat?: number;
  lng?: number;
  metodosPago: MetodoPago[];
  /** Tarjeta registrada (simulada): nunca se guarda el número completo. */
  tarjeta: Tarjeta | null;
  servicios: ServicioUsuario[];
  disponible: boolean;
  plan: Plan;
  insignias: Insignia[];
  /** Promedio real de las calificaciones recibidas; null si todavía no tiene. */
  calificacion: number | null;
  numCalificaciones: number;
  trabajosCompletados: number;
  /** Cuántas personas lo tienen en "De confianza". */
  guardadoPor: number;
  verificacion: Verificacion;
  /** Trueques publicados este mes (el plan gratis tiene un límite). */
  truequesMes: number;
}

export type EstadoDocumento = "sin_enviar" | "en_revision" | "verificada" | "vencida";

/** Verificación simulada de documentos (solo la ve su dueño; los demás ven las insignias). */
export interface Verificacion {
  cedula: { estado: Exclude<EstadoDocumento, "vencida">; numero: string };
  antecedentes: {
    estado: EstadoDocumento;
    /** Fecha de emisión (YYYY-MM-DD). */
    emision: string | null;
    venceEl: string | null;
    vigenciaMeses: number;
  };
}

export type Frecuencia = "una_vez" | "semanal" | "quincenal" | "mensual";

export interface SerieInfo {
  id: string;
  frecuencia: Exclude<Frecuencia, "una_vez">;
  activa: boolean;
  aceptada: boolean;
  trabajadorId: string;
  trabajadorNombre?: string;
}

/** Mis propiedades: dirección guardada con instrucciones fijas. */
export interface Propiedad {
  id: string;
  nombre: string;
  ubicacion: string;
  lat?: number;
  lng?: number;
  instrucciones: string;
}

export interface ItemAgenda {
  rol: "cliente" | "trabajador";
  trabajo: Trabajo;
}

export interface Agenda {
  items: ItemAgenda[];
  /** Días (YYYY-MM-DD) que bloqueé. */
  bloqueos: string[];
}

export interface Trueque {
  /** Lo que el publicador ofreció a cambio. */
  ofrece: string;
  /** Lo que el publicador hará al final (lo ofrecido o la contrapropuesta elegida). */
  acordado?: string;
  /** Contrapropuesta de quien mira, si se postuló proponiendo otra cosa. */
  miPropuesta?: string;
  /** El trabajador aceptó el acuerdo (el publicador lo firma al elegirlo). */
  acuerdoAceptado: boolean;
  /** en_curso → primera (el trabajador entregó su parte) → finalizado. */
  etapa: "en_curso" | "primera" | "finalizado";
}

export interface ServicioUsuario {
  id: string;
  categoria: string;
  descripcion: string;
  precioAproximado?: number;
}

export interface Trabajo {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  lat?: number;
  lng?: number;
  distanciaKm: number;
  /** Fecha y hora locales ("2026-10-31T09:00"); null = lo antes posible (urgencias). */
  fecha: string | null;
  pago: number;
  metodoPago: MetodoPago;
  publicador: string;
  publicadorId: string;
  publicadorCalificacion: number | null;
  trabajadorId?: string;
  trabajadorNombre?: string;
  estado: EstadoTrabajo;
  etapa?: EtapaTrabajo;
  urgente: boolean;
  /** Oferta directa ("Recontratar"): a quién se le ofreció. */
  invitadoId?: string;
  invitadoNombre?: string;
  /** La oferta directa es para quien mira y todavía no responde. */
  invitacionParaMi: boolean;
  /** La persona invitada no pudo: la publicación quedó abierta para todos. */
  invitacionRechazada: boolean;
  /** Trueque: se paga con un servicio. `pago` es el diferencial en dinero (puede ser 0). */
  trueque: Trueque | null;
  /** CIRA Agenda: visita de un servicio recurrente. */
  serie: SerieInfo | null;
  /** Visita que el trabajador canceló: pendiente (el cliente decide), invitado o cubierto. */
  reemplazo: "pendiente" | "invitado" | "cubierto" | null;
  /** Propiedad del cliente; las instrucciones solo llegan al cliente y a quien hace el trabajo. */
  propiedad: { id: string; nombre: string; instrucciones?: string } | null;
  postulantes: number;
  yaPostulado: boolean;
  esMio: boolean;
  asignadoAMi: boolean;
  pagado: boolean;
  resumenPago: ResumenPago;
  calificadoPorMi: boolean;
  contraparteId?: string;
  contraparteNombre?: string;
  creadoEn: string;
}

export interface Tarjeta {
  marca: string;
  ultimos4: string;
  titular: string;
  vence: string;
}

export interface ResumenPago {
  monto: number;
  comision: number;
  tarifaUrgencia: number;
  propina: number;
  total: number;
  /** Parte que se entrega en mano (trabajos en efectivo). */
  enEfectivo: number;
  /** Parte que se cobra con la tarjeta registrada. */
  enTarjeta: number;
}

export interface MovimientoActividad {
  id: string;
  trabajoId: string;
  titulo: string;
  contraparte: string;
  fecha: string;
  metodo: MetodoPago;
  monto: number;
  comision: number;
  tarifaUrgencia: number;
  propina: number;
  total: number;
  enEfectivo: number;
  enTarjeta: number;
}

export interface Actividad {
  pagos: MovimientoActividad[];
  ganancias: MovimientoActividad[];
  totalPagado: number;
  totalGanado: number;
}

export interface NoLeidos {
  total: number;
  pendientes: { conversacionId: string; nombre: string; texto: string; cantidad: number }[];
}

export interface Trabajador {
  id: string;
  nombre: string;
  servicios: string[];
  lat?: number;
  lng?: number;
  distanciaKm: number;
  calificacion: number | null;
  numCalificaciones: number;
  disponible: boolean;
  zona: string;
  descripcion: string;
  insignias: Insignia[];
  trabajosCompletados: number;
  /** Contrapropuesta en un trueque (solo en la lista de postulantes). */
  propuesta?: string;
  /** Quien mira lo tiene en "De confianza". */
  deConfianza: boolean;
  /** Cuántas personas lo tienen en "De confianza" (nunca quiénes). */
  guardadoPor: number;
}

export interface ComentarioCalificacion {
  autor: string;
  estrellas: number;
  comentario: string;
  fecha: string;
  /** Solo en trueques: si cumplió su parte del acuerdo. */
  cumplioTrueque?: boolean;
}

export interface PerfilPublico extends Trabajador {
  comentarios: ComentarioCalificacion[];
}

export interface Alerta {
  trabajo: Trabajo;
  urgente: boolean;
  /** true si la recibe antes por tener el Plan Plus. */
  prioritaria: boolean;
  visibleDesde: string;
}

export interface ConfigNegocio {
  comisionPct: number;
  urgenciaPct: number;
  plusPrecio: number;
  retrasoGratisSeg: number;
  truequesGratisMes: number;
}

export interface Ingresos {
  planPlus: { total: number; cantidad: number };
  tarifaUrgencia: { total: number; cantidad: number };
  comisiones: { total: number; cantidad: number };
  total: number;
}

export interface Mensaje {
  id: string;
  autor: "yo" | "otro";
  texto: string;
  hora: string;
}

export interface Conversacion {
  id: string;
  nombre: string;
  contraparteId: string;
  ultimoMensaje: string;
  hora: string;
  noLeidos: number;
  mensajes: Mensaje[];
}

export interface HistorialItem {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string | null;
  pago: number;
  estado: EstadoTrabajo;
  contraparte: string;
}
