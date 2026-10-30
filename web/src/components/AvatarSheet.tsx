import { useEffect, useState } from "react";
import { Button, Icon, Loader, Sheet, cx } from "@/components/aire";
import { Avatar } from "./Avatar";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { mostrarToast } from "@/lib/toast";

/**
 * Elegir la foto de perfil del catálogo de avatares (solo para la demo: en producción
 * cada persona subiría su propia foto). Las imágenes salen de public/images/cira-avatars.
 */
export function AvatarSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { usuario, refrescarUsuario } = useAuth();
  const [catalogo, setCatalogo] = useState<string[] | null>(null);
  const [guardando, setGuardando] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!open || catalogo) return;
    api.avatares().then(setCatalogo).catch(() => setCatalogo([]));
  }, [open, catalogo]);

  const elegir = async (avatar: string | null) => {
    setGuardando(avatar);
    try {
      await api.usuario.cambiarAvatar(avatar);
      await refrescarUsuario();
      mostrarToast(avatar ? tr("Foto de perfil actualizada") : tr("Volviste a tus iniciales"));
      onClose();
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : tr("No se pudo cambiar la foto."));
    } finally {
      setGuardando(undefined);
    }
  };

  const actual = usuario?.avatar ?? null;

  return (
    <Sheet open={open} onClose={onClose} title={tr("Foto de perfil")} subtitle={tr("Elige cómo te verán los demás.")} contained>
      {catalogo === null ? (
        <Loader label={tr("Cargando...")} />
      ) : catalogo.length === 0 ? (
        <p className="aire-text-subhead py-6 text-center text-aire-ink-2">{tr("No hay imágenes en el catálogo.")}</p>
      ) : (
        <div className="grid gap-4 pb-1">
          <div className="ca-avatargrid" role="listbox" aria-label={tr("Foto de perfil")}>
            {catalogo.map((src, i) => (
              <button
                key={src}
                type="button"
                role="option"
                aria-selected={actual === src}
                aria-label={tr("Avatar {n}", { n: i + 1 })}
                className={cx("ca-avatargrid__item", actual === src && "is-selected")}
                disabled={guardando !== undefined}
                onClick={() => elegir(src)}
              >
                <img src={src} alt="" loading="lazy" decoding="async" />
                {actual === src && (
                  <span className="ca-avatargrid__check">
                    <Icon name="check" size={16} />
                  </span>
                )}
              </button>
            ))}
          </div>
          {actual && usuario && (
            <Button variant="secondary" loading={guardando === null} onClick={() => elegir(null)}>
              <Avatar nombre={usuario.nombre} size={24} />
              {tr("Usar mis iniciales")}
            </Button>
          )}
        </div>
      )}
    </Sheet>
  );
}
