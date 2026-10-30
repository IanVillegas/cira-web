import type {
  Actividad,
  Agenda,
  Alerta,
  ConfigNegocio,
  Frecuencia,
  Conversacion,
  HistorialItem,
  Ingresos,
  Mensaje,
  MetodoPago,
  NoLeidos,
  PerfilPublico,
  Propiedad,
  Plan,
  Trabajador,
  Trabajo,
  Usuario,
  Verificacion,
} from "./types";
import { tr } from "@/lib/i18n";

// En desarrollo apunta al backend local (CIRA-Server). Durante la presentación,
// si se expone el puerto 3001 con Dev Tunnels, basta con definir VITE_API_URL
// apuntando a esa URL pública al hacer el build.
// Se le quita cualquier "/" final: una URL pegada como "https://x.com/" no
// debe romper las rutas (evita el bug de "//api/..." -> 404).
// Sin VITE_API_URL: en desarrollo (npm run dev) se usa el backend en localhost:3001;
// en la versión compilada se usa el mismo origen, porque el backend sirve la app
// (modo "demo", un solo puerto).
const API_URL = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3001" : "")).replace(
  /\/+$/,
  "",
);

// Fase de pruebas: el "token" es el id del usuario. Vive en sessionStorage, así que cada
// pestaña mantiene su propia sesión (se pueden probar dos usuarios en el mismo navegador).
const TOKEN_KEY = "cira.token";

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token === null) sessionStorage.removeItem(TOKEN_KEY);
    else sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* almacenamiento no disponible */
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Cira-User": token } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(tr(body.error ?? `Error ${res.status} al llamar ${path}`));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

export const api = {
  auth: {
    existe: (identifier: string) => post<{ existe: boolean }>("/auth/existe", { identifier }),
    login: (identifier: string, pin: string) =>
      post<{ token: string; usuario: Usuario }>("/auth/login", { identifier, pin }),
    registro: (datos: { telefono: string; nombre: string; zona: string; lat?: number; lng?: number; pin: string }) =>
      post<{ token: string; usuario: Usuario }>("/auth/registro", datos),
  },

  config: () => request<ConfigNegocio>("/config"),

  /** Catálogo de avatares de la demo (imágenes en public/images/cira-avatars). */
  avatares: () => request<string[]>("/avatares"),

  usuario: {
    obtener: () => request<Usuario>("/usuario"),
    cambiarAvatar: (avatar: string | null) =>
      request<Usuario>("/usuario/avatar", { method: "PUT", body: JSON.stringify({ avatar }) }),
    actualizar: (
      datos: Partial<
        Pick<Usuario, "nombre" | "zona" | "lat" | "lng" | "descripcion" | "metodosPago" | "telefono" | "correo" | "cedula">
      >,
    ) => request<Usuario>("/usuario", { method: "PUT", body: JSON.stringify(datos) }),
    setDisponibilidad: (disponible: boolean) =>
      request<{ disponible: boolean }>("/usuario/disponibilidad", {
        method: "PUT",
        body: JSON.stringify({ disponible }),
      }),
    guardarTarjeta: (datos: { numero: string; titular: string; vence: string; cvv: string }) =>
      request<Usuario>("/usuario/tarjeta", { method: "PUT", body: JSON.stringify(datos) }),
    eliminarTarjeta: () => request<void>("/usuario/tarjeta", { method: "DELETE" }),
    cambiarPlan: (plan: Plan) => request<Usuario>("/usuario/plan", { method: "PUT", body: JSON.stringify({ plan }) }),
    agregarServicio: (servicio: { categoria: string; descripcion: string; precioAproximado?: number }) =>
      request("/usuario/servicios", { method: "POST", body: JSON.stringify(servicio) }),
    actualizarServicio: (
      id: string,
      servicio: { categoria: string; descripcion: string; precioAproximado?: number },
    ) => request(`/usuario/servicios/${id}`, { method: "PUT", body: JSON.stringify(servicio) }),
    eliminarServicio: (id: string) => request(`/usuario/servicios/${id}`, { method: "DELETE" }),
    /** Verificación simulada: los archivos no se envían, solo que se tomaron y la fecha de emisión. */
    verificacion: () => request<Verificacion>("/usuario/verificacion"),
    enviarCedula: (datos: { numero: string; frente: boolean; reverso: boolean }) =>
      post<Verificacion>("/usuario/verificacion/cedula", datos),
    enviarAntecedentes: (datos: { emision: string; archivo: string }) =>
      post<Verificacion>("/usuario/verificacion/antecedentes", datos),
  },

  usuarios: {
    perfil: (id: string) => request<PerfilPublico>(`/usuarios/${id}`),
  },

  trabajos: {
    /** Sin parámetros: trabajos abiertos de otras personas. */
    listar: (params?: { publicadas?: boolean; mios?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.publicadas) qs.set("publicadas", "true");
      if (params?.mios) qs.set("mios", "true");
      const suffix = qs.toString() ? `?${qs}` : "";
      return request<Trabajo[]>(`/trabajos${suffix}`);
    },
    obtener: (id: string) => request<Trabajo>(`/trabajos/${id}`),
    /** Con `invitadoId` es una oferta directa: solo esa persona la ve hasta que responda. */
    crear: (
      datos: DatosTrabajo & {
        urgente?: boolean;
        invitadoId?: string;
        trueque?: boolean;
        ofrece?: string;
        /** Con `invitadoId`: servicio recurrente (CIRA genera las siguientes visitas al aceptar). */
        frecuencia?: Frecuencia;
        propiedadId?: string;
      },
    ) => post<Trabajo>("/trabajos", datos),
    editar: (id: string, datos: Partial<DatosTrabajo> & { ofrece?: string }) =>
      request<Trabajo>(`/trabajos/${id}`, { method: "PATCH", body: JSON.stringify(datos) }),
    /** En un trueque, `propuesta` es la contraoferta (qué pide a cambio); vacía = acepta lo ofrecido. */
    postular: (id: string, propuesta?: string) =>
      request<Trabajo>(`/trabajos/${id}/postular`, { method: "PATCH", body: JSON.stringify({ propuesta }) }),
    /** Visita que el trabajador canceló: sugerencias de reemplazo, elegir uno o publicarla para todos. */
    reemplazos: (id: string) => request<Trabajador[]>(`/trabajos/${id}/reemplazos`),
    elegirReemplazo: (id: string, trabajadorId: string) => post<Trabajo>(`/trabajos/${id}/reemplazo`, { trabajadorId }),
    publicarAbierto: (id: string) => post<Trabajo>(`/trabajos/${id}/publicar-abierto`),
    /** Limpieza entre huéspedes: no esperar al limpiador habitual, pasarla a urgencia ya. */
    escalar: (id: string) => post<Trabajo>(`/trabajos/${id}/escalar`),
    aceptarTrueque: (id: string) => post<Trabajo>(`/trabajos/${id}/trueque/aceptar`),
    finalizarTrueque: (id: string) => post<Trabajo>(`/trabajos/${id}/trueque/finalizar`),
    postulantes: (id: string) => request<Trabajador[]>(`/trabajos/${id}/postulantes`),
    asignar: (id: string, trabajadorId: string) => post<Trabajo>(`/trabajos/${id}/asignar`, { trabajadorId }),
    aceptarInvitacion: (id: string) => post<Trabajo>(`/trabajos/${id}/invitacion/aceptar`),
    rechazarInvitacion: (id: string) => post<Trabajo>(`/trabajos/${id}/invitacion/rechazar`),
    aceptarUrgencia: (id: string) => post<Trabajo>(`/trabajos/${id}/aceptar-urgencia`),
    avanzarEtapa: (id: string) => request<Trabajo>(`/trabajos/${id}/etapa`, { method: "PATCH" }),
    cancelar: (id: string) => post<Trabajo>(`/trabajos/${id}/cancelar`),
    pagar: (id: string, propina = 0) => post<Trabajo>(`/trabajos/${id}/pagar`, { propina }),
    calificar: (id: string, estrellas: number, comentario: string, cumplio?: boolean) =>
      post<Trabajo>(`/trabajos/${id}/calificar`, { estrellas, comentario, cumplio }),
  },

  trabajadores: {
    listar: () => request<Trabajador[]>("/trabajadores"),
  },

  /** CIRA Agenda: calendario, días bloqueados y servicios recurrentes. */
  agenda: {
    obtener: (desde: string, hasta: string) => request<Agenda>(`/agenda?desde=${desde}&hasta=${hasta}`),
    bloquear: (fecha: string) => post<{ fecha: string }>("/agenda/bloqueos", { fecha }),
    desbloquear: (fecha: string) => request<void>(`/agenda/bloqueos/${fecha}`, { method: "DELETE" }),
    /** Días no disponibles de otra persona: solo "ocupado", nunca qué ni con quién. */
    ocupado: (usuarioId: string, desde: string, hasta: string) =>
      request<{ ocupados: string[] }>(`/usuarios/${usuarioId}/ocupado?desde=${desde}&hasta=${hasta}`),
    terminarSerie: (serieId: string) => post<void>(`/series/${serieId}/cancelar`),
  },

  propiedades: {
    listar: () => request<Propiedad[]>("/propiedades"),
    crear: (datos: Omit<Propiedad, "id" | "limpiadorNombre">) => post<Propiedad>("/propiedades", datos),
    editar: (id: string, datos: Omit<Propiedad, "id" | "limpiadorNombre">) =>
      request<Propiedad>(`/propiedades/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
    eliminar: (id: string) => request<void>(`/propiedades/${id}`, { method: "DELETE" }),
    /** Registrar la salida de un huésped: crea la limpieza con la ventana hasta la entrada del próximo. */
    entreHuespedes: (id: string, datos: { salida: string; entrada: string; pago: number; metodoPago: MetodoPago; notas?: string }) =>
      post<Trabajo>(`/propiedades/${id}/entre-huespedes`, datos),
  },

  /** "De confianza": trabajadores guardados para volver a contratar. */
  favoritos: {
    listar: () => request<Trabajador[]>("/favoritos"),
    agregar: (id: string) => post<Trabajador>(`/favoritos/${id}`),
    quitar: (id: string) => request<Trabajador>(`/favoritos/${id}`, { method: "DELETE" }),
  },

  reportes: {
    crear: (datos: { usuarioId: string; motivo: string; detalle?: string; trabajoId?: string }) =>
      post<{ id: string }>("/reportes", datos),
  },

  alertas: {
    listar: () => request<Alerta[]>("/alertas"),
    descartar: (trabajoId: string) => post<void>(`/alertas/${trabajoId}/descartar`),
  },

  conversaciones: {
    listar: () => request<Conversacion[]>("/conversaciones"),
    noLeidos: () => request<NoLeidos>("/conversaciones/no-leidos"),
    obtener: (id: string) => request<Conversacion>(`/conversaciones/${id}`),
    /** Abre (o reutiliza) la conversación con otra persona. */
    con: (usuarioId: string) => post<Conversacion>("/conversaciones", { usuarioId }),
    enviarMensaje: (id: string, texto: string) => post<Mensaje>(`/conversaciones/${id}/mensajes`, { texto }),
  },

  historial: {
    listar: () => request<HistorialItem[]>("/historial"),
  },

  actividad: () => request<Actividad>("/actividad"),

  ingresos: () => request<Ingresos>("/ingresos"),
};

export interface DatosTrabajo {
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  lat?: number;
  lng?: number;
  /** "2026-10-31T09:00"; se omite en las urgencias (lo antes posible). */
  fecha?: string;
  /** Hora límite ("listo antes de"); null la quita al editar. */
  limite?: string | null;
  pago: number;
  metodoPago: MetodoPago;
}
