export function mapUsuario(row, servicios) {
  return {
    id: row.id,
    nombre: row.nombre,
    cedula: row.cedula,
    telefono: row.telefono,
    descripcion: row.descripcion,
    zona: row.zona,
    metodosPago: JSON.parse(row.metodos_pago),
    disponible: !!row.disponible,
    calificacion: row.calificacion,
    trabajosCompletados: row.trabajos_completados,
    servicios: servicios.map(mapServicio),
  };
}

export function mapServicio(row) {
  return {
    id: row.id,
    categoria: row.categoria,
    descripcion: row.descripcion,
    precioAproximado: row.precio_aproximado ?? undefined,
  };
}

export function mapTrabajo(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    categoria: row.categoria,
    ubicacion: row.ubicacion,
    distanciaKm: row.distancia_km,
    fecha: row.fecha,
    pago: row.pago,
    metodoPago: row.metodo_pago,
    publicador: row.publicador,
    estado: row.estado,
    postulantes: row.postulantes,
    yaPostulado: !!row.ya_postulado,
  };
}

export function mapTrabajador(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    servicios: JSON.parse(row.servicios),
    distanciaKm: row.distancia_km,
    calificacion: row.calificacion,
    disponible: !!row.disponible,
    zona: row.zona,
  };
}

export function mapMensaje(row) {
  return {
    id: row.id,
    autor: row.autor,
    texto: row.texto,
    hora: row.hora,
  };
}

export function mapConversacion(row, mensajes) {
  const ultimo = mensajes[mensajes.length - 1];
  return {
    id: row.id,
    nombre: row.nombre,
    ultimoMensaje: ultimo?.texto ?? "",
    hora: ultimo?.hora ?? "",
    noLeidos: 0,
    mensajes: mensajes.map(mapMensaje),
  };
}

export function mapHistorial(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    fecha: row.fecha,
    pago: row.pago,
    estado: row.estado,
    contraparte: row.contraparte,
  };
}
