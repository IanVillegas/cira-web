export type Rol = "trabajador" | "empleador";

export type MetodoPago = "Efectivo" | "Pago en la app";

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
  servicios: ServicioUsuario[];
  disponible: boolean;
  plan: Plan;
  insignias: Insignia[];
  /** Promedio real de las calificaciones recibidas; null si todavía no tiene. */
  calificacion: number | null;
  numCalificaciones: number;
  trabajosCompletados: number;
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
  fecha: string;
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

export interface ResumenPago {
  monto: number;
  comision: number;
  tarifaUrgencia: number;
  total: number;
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
}

export interface ComentarioCalificacion {
  autor: string;
  estrellas: number;
  comentario: string;
  fecha: string;
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
  categoriasUrgentes: string[];
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
  fecha: string;
  pago: number;
  estado: EstadoTrabajo;
  contraparte: string;
}
