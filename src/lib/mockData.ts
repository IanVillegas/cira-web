import type {
  Conversacion,
  HistorialItem,
  Trabajador,
  Trabajo,
  Usuario,
} from "./types";

export const CATEGORIAS = [
  "Limpieza",
  "Plomería",
  "Electricidad",
  "Jardinería",
  "Mudanzas",
  "Transporte",
  "Cuidado de mascotas",
  "Reparaciones",
];

export const usuarioActual: Usuario = {
  id: "u-1",
  nombre: "Ian Villegas",
  cedula: "1-2345-6789",
  telefono: "8888-1234",
  descripcion:
    "Disponible para trabajos de electricidad y reparaciones menores en Alajuela y alrededores.",
  zona: "Alajuela Centro",
  metodosPago: ["SINPE", "Efectivo"],
  servicios: [
    {
      id: "s-1",
      categoria: "Electricidad",
      descripcion: "Instalación de tomacorrientes, lámparas y breakers.",
      precioAproximado: 15000,
    },
    {
      id: "s-2",
      categoria: "Reparaciones",
      descripcion: "Reparaciones generales del hogar.",
      precioAproximado: 10000,
    },
  ],
  disponible: true,
  calificacion: 4.8,
  trabajosCompletados: 23,
};

export const trabajosMock: Trabajo[] = [
  {
    id: "t-1",
    titulo: "Reparar fuga de agua en cocina",
    descripcion:
      "Se necesita plomero para revisar y reparar una fuga debajo del fregadero de la cocina. Herramientas propias.",
    categoria: "Plomería",
    ubicacion: "San José, Escazú",
    distanciaKm: 2.3,
    fecha: "Hoy, 3:00 p.m.",
    pago: 18000,
    metodoPago: "SINPE",
    publicador: "María Rojas",
    estado: "Pendiente",
    postulantes: 3,
    yaPostulado: false,
  },
  {
    id: "t-2",
    titulo: "Pintar sala y comedor",
    descripcion:
      "Pintura de dos ambientes, aproximadamente 40 m². La pintura ya está comprada.",
    categoria: "Reparaciones",
    ubicacion: "Alajuela, Río Segundo",
    distanciaKm: 1.1,
    fecha: "Mañana, 8:00 a.m.",
    pago: 45000,
    metodoPago: "Transferencia",
    publicador: "Carlos Méndez",
    estado: "Pendiente",
    postulantes: 5,
    yaPostulado: false,
  },
  {
    id: "t-3",
    titulo: "Mudanza de apartamento pequeño",
    descripcion:
      "Ayuda para mover cajas y muebles de un apartamento de 1 habitación a otro edificio cercano.",
    categoria: "Mudanzas",
    ubicacion: "Heredia Centro",
    distanciaKm: 5.8,
    fecha: "Sábado, 9:00 a.m.",
    pago: 25000,
    metodoPago: "Efectivo",
    publicador: "Laura Jiménez",
    estado: "Pendiente",
    postulantes: 1,
    yaPostulado: true,
  },
  {
    id: "t-4",
    titulo: "Poda de jardín y limpieza de zacate",
    descripcion:
      "Jardín de casa con zacate alto y algunos arbustos que necesitan poda.",
    categoria: "Jardinería",
    ubicacion: "Alajuela, Desamparados",
    distanciaKm: 0.6,
    fecha: "Hoy, 5:30 p.m.",
    pago: 12000,
    metodoPago: "SINPE",
    publicador: "Esteban Vargas",
    estado: "Pendiente",
    postulantes: 2,
    yaPostulado: false,
  },
];

export const trabajadoresMock: Trabajador[] = [
  {
    id: "w-1",
    nombre: "Douglas Solano",
    servicios: ["Electricidad", "Reparaciones"],
    distanciaKm: 0.9,
    calificacion: 4.9,
    disponible: true,
    zona: "Alajuela Centro",
  },
  {
    id: "w-2",
    nombre: "Kimberly Araya",
    servicios: ["Limpieza", "Cuidado de mascotas"],
    distanciaKm: 1.4,
    calificacion: 4.7,
    disponible: true,
    zona: "Río Segundo",
  },
  {
    id: "w-3",
    nombre: "Josué Fernández",
    servicios: ["Plomería"],
    distanciaKm: 3.2,
    calificacion: 4.5,
    disponible: false,
    zona: "Desamparados",
  },
  {
    id: "w-4",
    nombre: "Melissa Chacón",
    servicios: ["Jardinería", "Mudanzas"],
    distanciaKm: 4.0,
    calificacion: 4.6,
    disponible: true,
    zona: "Heredia Centro",
  },
];

export const conversacionesMock: Conversacion[] = [
  {
    id: "c-1",
    nombre: "María Rojas",
    ultimoMensaje: "Perfecto, te espero a las 3pm entonces",
    hora: "10:24 a.m.",
    noLeidos: 2,
    mensajes: [
      { id: "m-1", autor: "otro", texto: "Hola, vi que aplicaste al trabajo de la fuga de agua", hora: "10:10 a.m." },
      { id: "m-2", autor: "yo", texto: "Sí, tengo experiencia con ese tipo de reparaciones", hora: "10:15 a.m." },
      { id: "m-3", autor: "otro", texto: "Perfecto, te espero a las 3pm entonces", hora: "10:24 a.m." },
    ],
  },
  {
    id: "c-2",
    nombre: "Carlos Méndez",
    ultimoMensaje: "¿Cuánto tiempo estimás para la pintura?",
    hora: "Ayer",
    noLeidos: 0,
    mensajes: [
      { id: "m-4", autor: "otro", texto: "¿Cuánto tiempo estimás para la pintura?", hora: "Ayer, 6:40 p.m." },
    ],
  },
];

export const historialMock: HistorialItem[] = [
  {
    id: "h-1",
    titulo: "Instalación de lámparas",
    fecha: "12 sept 2026",
    pago: 15000,
    estado: "Finalizado",
    contraparte: "Ana Gómez",
  },
  {
    id: "h-2",
    titulo: "Reparación de breaker",
    fecha: "2 sept 2026",
    pago: 9000,
    estado: "Finalizado",
    contraparte: "Diego Salas",
  },
  {
    id: "h-3",
    titulo: "Cambio de tomacorrientes",
    fecha: "20 ago 2026",
    pago: 12000,
    estado: "Cancelado",
    contraparte: "Fabiola Ruiz",
  },
];

export const misPublicacionesMock: Trabajo[] = [
  {
    id: "p-1",
    titulo: "Limpieza profunda de apartamento",
    descripcion: "Limpieza general de apartamento de 2 habitaciones antes de mudanza.",
    categoria: "Limpieza",
    ubicacion: "Alajuela Centro",
    distanciaKm: 0,
    fecha: "Viernes, 1:00 p.m.",
    pago: 20000,
    metodoPago: "SINPE",
    publicador: "Ian Villegas",
    estado: "Pendiente",
    postulantes: 4,
    yaPostulado: false,
  },
];
