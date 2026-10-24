import type {
  Actividad,
  Alerta,
  ConfigNegocio,
  Conversacion,
  HistorialItem,
  Ingresos,
  Mensaje,
  MetodoPago,
  NoLeidos,
  PerfilPublico,
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

  usuario: {
    obtener: () => request<Usuario>("/usuario"),
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
    crear: (datos: DatosTrabajo & { urgente?: boolean; invitadoId?: string }) => post<Trabajo>("/trabajos", datos),
    editar: (id: string, datos: Partial<DatosTrabajo>) =>
      request<Trabajo>(`/trabajos/${id}`, { method: "PATCH", body: JSON.stringify(datos) }),
    postular: (id: string) => request<Trabajo>(`/trabajos/${id}/postular`, { method: "PATCH" }),
    postulantes: (id: string) => request<Trabajador[]>(`/trabajos/${id}/postulantes`),
    asignar: (id: string, trabajadorId: string) => post<Trabajo>(`/trabajos/${id}/asignar`, { trabajadorId }),
    aceptarInvitacion: (id: string) => post<Trabajo>(`/trabajos/${id}/invitacion/aceptar`),
    rechazarInvitacion: (id: string) => post<Trabajo>(`/trabajos/${id}/invitacion/rechazar`),
    aceptarUrgencia: (id: string) => post<Trabajo>(`/trabajos/${id}/aceptar-urgencia`),
    avanzarEtapa: (id: string) => request<Trabajo>(`/trabajos/${id}/etapa`, { method: "PATCH" }),
    cancelar: (id: string) => post<Trabajo>(`/trabajos/${id}/cancelar`),
    pagar: (id: string, propina = 0) => post<Trabajo>(`/trabajos/${id}/pagar`, { propina }),
    calificar: (id: string, estrellas: number, comentario: string) =>
      post<Trabajo>(`/trabajos/${id}/calificar`, { estrellas, comentario }),
  },

  trabajadores: {
    listar: () => request<Trabajador[]>("/trabajadores"),
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
  fecha: string;
  pago: number;
  metodoPago: MetodoPago;
}
