import { useEffect, useMemo, useState, type ReactNode } from "react";
import Supercluster from "supercluster";
import { cx } from "@/components/aire";
import { visualDeCategoria } from "@/lib/categorias";
import { tr } from "@/lib/i18n";
import { MapMarker, MarkerContent } from "./mapcn";
import { useMap } from "./mapContext";

// Pines de CIRA (estilos .ca-mappin* en components/aire/aire.css, sección "Mapa").

function Simbolo({ nombre }: { nombre: string }) {
  return <span className="material-symbols-rounded ca-mappin-icon">{nombre}</span>;
}

/** Gota con el ícono de la categoría. Las urgencias van en rojo y laten. */
export function PinTrabajo({ categoria, urgente = false }: { categoria: string; urgente?: boolean }) {
  return (
    <div className={cx("ca-mappin", urgente && "ca-mappin--urgente")}>
      <Simbolo nombre={visualDeCategoria(categoria).icono} />
    </div>
  );
}

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

/** Avatar con iniciales, punto de disponibilidad y su calificación. */
export function PinTrabajador({ nombre, disponible, calificacion }: { nombre: string; disponible: boolean; calificacion: number | null }) {
  return (
    <div className={cx("ca-mappin-avatar", !disponible && "ca-mappin-avatar--ocupado")}>
      <span className="ca-mappin-avatar-ini">{iniciales(nombre)}</span>
      <span className="ca-mappin-avatar-dot" />
      {calificacion != null && <span className="ca-mappin-avatar-nota">★ {calificacion.toFixed(1)}</span>}
    </div>
  );
}

/** Punto elegido al publicar o en la vista previa: gota grande en acento. */
export function PinSeleccionado() {
  return (
    <div className="ca-mappin ca-mappin--grande">
      <Simbolo nombre="home_pin" />
    </div>
  );
}

/** "Tu ubicación": punto azul con halo que respira. */
export function PinUsuario() {
  return <div className="ca-mappin-yo" />;
}

/** Ancla de MapLibre para cada tipo de pin: las gotas apoyan la punta; los círculos, el centro. */
export const ANCLA_GOTA = "bottom" as const;
export const ANCLA_CENTRO = "center" as const;

export interface PuntoMapa {
  id: string;
  lng: number;
  lat: number;
  /** Si hay una urgencia dentro de un grupo, el grupo se pinta en rojo. */
  urgente?: boolean;
}

/**
 * Agrupa los pines que quedan encimados (supercluster). Cada grupo es un círculo con
 * la cantidad; al tocarlo, el mapa se acerca hasta separarlos. Los sueltos se pintan
 * con `renderPunto`, así cada pantalla decide su pin y su popup.
 */
export function PinesAgrupados<T extends PuntoMapa>({ puntos, renderPunto }: { puntos: T[]; renderPunto: (p: T) => ReactNode }) {
  const { map } = useMap();
  const [vista, setVista] = useState<{ zoom: number; bbox: [number, number, number, number] } | null>(null);

  const indice = useMemo(() => {
    const sc = new Supercluster<{ i: number; urgente: boolean }, { urgente: boolean }>({
      radius: 52,
      maxZoom: 17,
      map: (p) => ({ urgente: p.urgente }),
      reduce: (acc, p) => {
        acc.urgente = acc.urgente || p.urgente;
      },
    });
    sc.load(
      puntos.map((p, i) => ({
        type: "Feature" as const,
        properties: { i, urgente: !!p.urgente },
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      })),
    );
    return sc;
  }, [puntos]);

  useEffect(() => {
    if (!map) return;
    const actualizar = () => {
      const b = map.getBounds();
      setVista({ zoom: Math.round(map.getZoom()), bbox: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] });
    };
    actualizar();
    map.on("moveend", actualizar);
    return () => {
      map.off("moveend", actualizar);
    };
  }, [map]);

  if (!vista) return null;

  return (
    <>
      {indice.getClusters(vista.bbox, vista.zoom).map((f) => {
        const [lng, lat] = f.geometry.coordinates;
        if ("cluster" in f.properties && f.properties.cluster) {
          const id = f.properties.cluster_id;
          const cantidad = f.properties.point_count;
          return (
            <MapMarker
              key={`g-${id}`}
              longitude={lng}
              latitude={lat}
              anchor={ANCLA_CENTRO}
              onClick={() => map?.easeTo({ center: [lng, lat], zoom: indice.getClusterExpansionZoom(id) + 0.5, duration: 500 })}
            >
              <MarkerContent>
                <div
                  role="button"
                  aria-label={`${tr("Lugares cercanos agrupados")}: ${cantidad}`}
                  className={cx("ca-mappin-grupo", f.properties.urgente && "ca-mappin-grupo--urgente")}
                >
                  {cantidad}
                </div>
              </MarkerContent>
            </MapMarker>
          );
        }
        const punto = puntos[(f.properties as { i: number }).i];
        return punto ? renderPunto(punto) : null;
      })}
    </>
  );
}
