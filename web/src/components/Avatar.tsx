import { useState } from "react";
import { cx } from "@/components/aire";
import { iniciales } from "@/lib/iniciales";

interface AvatarProps {
  nombre: string;
  /** Foto del catálogo; sin foto (o si no carga) se muestran las iniciales. */
  src?: string | null;
  /** Diámetro en px. */
  size?: number;
  className?: string;
}

/** Foto de perfil redonda, o las iniciales sobre el azul suave cuando no hay foto. */
export function Avatar({ nombre, src, size = 48, className }: AvatarProps) {
  const [fallo, setFallo] = useState<string | null>(null);
  const conFoto = !!src && fallo !== src;
  return (
    <span
      className={cx("ca-avatar", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden="true"
    >
      {conFoto ? (
        <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFallo(src)} />
      ) : (
        iniciales(nombre)
      )}
    </span>
  );
}
