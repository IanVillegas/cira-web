import { tr } from "./i18n";
import { mostrarToast } from "./toast";

/**
 * Recomendar a un trabajador: abre el menú nativo de compartir del teléfono
 * (WhatsApp, Telegram, copiar…) con el link a su perfil en CIRA. El link no
 * muestra el teléfono de la persona: el contacto sigue dentro de la app.
 */
export async function compartirPerfil(trabajador: { id: string; nombre: string }) {
  const url = `${window.location.origin}/usuarios/${trabajador.id}`;
  const text = tr("Te recomiendo a {nombre} en CIRA:", { nombre: trabajador.nombre });
  try {
    if (navigator.share) {
      await navigator.share({ title: trabajador.nombre, text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    mostrarToast(tr("Link del perfil copiado"), "info");
  } catch (e) {
    // Cerrar el menú de compartir no es un error.
    if (e instanceof DOMException && e.name === "AbortError") return;
    mostrarToast(tr("No se pudo compartir el perfil."), "error");
  }
}
