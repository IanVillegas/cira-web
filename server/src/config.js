// Parámetros del modelo de negocio de CIRA. Todos los cobros son simulados en la demo.
const num = (valor, porDefecto) => {
  const n = Number(valor);
  return Number.isFinite(n) ? n : porDefecto;
};

export const CONFIG = {
  /** PIN que usan todos los usuarios de prueba (fase de pruebas). */
  PIN_PRUEBAS: "1234",
  /** Comisión de CIRA sobre el monto cuando se paga en la app (%). Se suma al total que paga el cliente. */
  COMISION_PCT: num(process.env.CIRA_COMISION_PCT, 10),
  /** Tarifa de urgencia sobre el monto del trabajo (%). Pago único por trabajo urgente. */
  URGENCIA_PCT: num(process.env.CIRA_URGENCIA_PCT, 15),
  /** Precio mensual del Plan Plus (colones). */
  PLUS_PRECIO: num(process.env.CIRA_PLUS_PRECIO, 2500),
  /** Segundos que espera el plan gratis para recibir una alerta (los Plus la reciben primero). */
  RETRASO_GRATIS_SEG: num(process.env.CIRA_RETRASO_ALERTAS_SEG, 120),
  /** Entre trabajadores Plus, cada puesto del ranking espera estos segundos extra (mejor calificados primero). */
  ESCALON_PLUS_SEG: 10,
  /** Una alerta deja de mostrarse pasados estos minutos desde la publicación. */
  VENTANA_ALERTAS_MIN: num(process.env.CIRA_VENTANA_ALERTAS_MIN, 30),
  /** Radio máximo para alertar a un trabajador (km), si hay coordenadas. */
  RADIO_ALERTAS_KM: 15,
};

export const CATEGORIAS_URGENTES = ["Plomería", "Electricidad", "Cerrajería"];
export const METODOS_PAGO = ["Efectivo", "Pago en la app"];
export const ETAPAS = ["Aceptado", "En camino", "Llegó", "Terminado"];
