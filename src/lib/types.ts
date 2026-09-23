export type Rol = "trabajador" | "empleador";

export type MetodoPago = "Efectivo" | "SINPE" | "Transferencia";

export type EstadoTrabajo =
  | "Pendiente"
  | "Asignado"
  | "En progreso"
  | "Finalizado"
  | "Cancelado";

export interface Usuario {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  descripcion: string;
  zona: string;
  fotoUrl?: string;
  metodosPago: MetodoPago[];
  servicios: ServicioUsuario[];
  disponible: boolean;
  calificacion: number;
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
  distanciaKm: number;
  fecha: string;
  pago: number;
  metodoPago: MetodoPago;
  publicador: string;
  estado: EstadoTrabajo;
  postulantes: number;
  yaPostulado: boolean;
}

export interface Trabajador {
  id: string;
  nombre: string;
  servicios: string[];
  distanciaKm: number;
  calificacion: number;
  disponible: boolean;
  zona: string;
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
