import type {
  Conversacion,
  HistorialItem,
  Mensaje,
  MetodoPago,
  Trabajador,
  Trabajo,
  Usuario,
} from "./types";

// En desarrollo apunta al backend local (CIRA-Server). Durante la presentación,
// si se expone el puerto 3001 con Dev Tunnels, basta con definir VITE_API_URL
// apuntando a esa URL pública al hacer el build.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status} al llamar ${path}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  usuario: {
    obtener: () => request<Usuario>("/usuario"),
    actualizar: (datos: Partial<Pick<Usuario, "nombre" | "zona" | "descripcion" | "metodosPago">>) =>
      request<Usuario>("/usuario", { method: "PUT", body: JSON.stringify(datos) }),
    setDisponibilidad: (disponible: boolean) =>
      request<{ disponible: boolean }>("/usuario/disponibilidad", {
        method: "PUT",
        body: JSON.stringify({ disponible }),
      }),
    agregarServicio: (servicio: { categoria: string; descripcion: string; precioAproximado?: number }) =>
      request("/usuario/servicios", { method: "POST", body: JSON.stringify(servicio) }),
    eliminarServicio: (id: string) => request(`/usuario/servicios/${id}`, { method: "DELETE" }),
  },

  trabajos: {
    listar: (params?: { publicador?: string; postulado?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.publicador) qs.set("publicador", params.publicador);
      if (params?.postulado) qs.set("postulado", "true");
      const suffix = qs.toString() ? `?${qs}` : "";
      return request<Trabajo[]>(`/trabajos${suffix}`);
    },
    crear: (datos: {
      titulo: string;
      descripcion: string;
      categoria: string;
      ubicacion: string;
      lat?: number;
      lng?: number;
      fecha: string;
      pago: number;
      metodoPago: MetodoPago;
      publicador?: string;
    }) => request<Trabajo>("/trabajos", { method: "POST", body: JSON.stringify(datos) }),
    postular: (id: string) => request<Trabajo>(`/trabajos/${id}/postular`, { method: "PATCH" }),
  },

  trabajadores: {
    listar: () => request<Trabajador[]>("/trabajadores"),
  },

  conversaciones: {
    listar: () => request<Conversacion[]>("/conversaciones"),
    obtener: (id: string) => request<Conversacion>(`/conversaciones/${id}`),
    enviarMensaje: (id: string, texto: string) =>
      request<Mensaje>(`/conversaciones/${id}/mensajes`, {
        method: "POST",
        body: JSON.stringify({ texto }),
      }),
  },

  historial: {
    listar: () => request<HistorialItem[]>("/historial"),
  },
};
