/*
 * Núcleo de mapas de CIRA, adaptado de mapcn (https://github.com/AnmolSaini16/mapcn).
 * MIT License · Copyright (c) 2025 Anmoldeep Singh
 *
 * Cambios respecto al original:
 * - Solo Map, MapMarker, MarkerContent y MarkerPopup (lo que usa CIRA).
 * - Estilos con CIRA Aire (clases .ca-map*) en vez de shadcn/ui y lucide.
 * - Teselas vectoriales de OpenFreeMap (gratis, sin API key) en vez de CARTO.
 * - El tema sale de lib/tema.ts y el worker de MapLibre se empaqueta con Vite.
 */
import type * as MapLibreGL from "maplibre-gl";
import type { MarkerOptions, PopupOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon, Loader, cx } from "@/components/aire";
import { useTema } from "@/lib/tema";
import { tr } from "@/lib/i18n";
import { ESTILOS_MAPA, MapContext, useMap, type MapLibreModule } from "./mapContext";


let maplibrePromise: Promise<MapLibreModule> | null = null;

/** Carga MapLibre una sola vez (va en su propio chunk: no pesa en las demás pantallas). */
function loadMapLibre() {
  maplibrePromise ??= import("maplibre-gl")
    .then((lib) => {
      lib.setWorkerUrl(workerUrl);
      return lib;
    })
    .catch((error) => {
      maplibrePromise = null;
      throw error;
    });
  return maplibrePromise;
}

function useMapLib() {
  const { mapLib } = useMap();
  if (!mapLib) throw new Error("useMapLib debe usarse dentro de <Map>");
  return mapLib;
}

export type MapProps = {
  children?: ReactNode;
  className?: string;
  /** Centro inicial [lng, lat] (orden de MapLibre). */
  center: [number, number];
  /** Zoom de MapLibre (teselas de 512px: un nivel menos que en Leaflet para ver la misma zona). */
  zoom: number;
  /** Mapa fijo (vista previa): sin arrastrar ni zoom. */
  interactive?: boolean;
  /** Zoom con la rueda del mouse (desactivado en mapas dentro de formularios). */
  scrollZoom?: boolean;
  /** Se llama al tocar el mapa (no un pin) con [lng, lat]. */
  onClick?: (lngLat: { lng: number; lat: number }) => void;
};

/** Mapa vectorial de MapLibre que sigue el modo claro/oscuro de la app. */
export function Map({ children, className, center, zoom, interactive = true, scrollZoom = true, onClick }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLib, setMapLib] = useState<MapLibreModule | null>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fallo, setFallo] = useState(false);
  const { oscuro } = useTema();
  const estilo = oscuro ? ESTILOS_MAPA.oscuro : ESTILOS_MAPA.claro;
  const estiloActual = useRef(estilo);

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  });
  const initRef = useRef({ center, zoom, interactive, scrollZoom, estilo });

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreGL.Map | undefined;

    loadMapLibre()
      .then((lib) => {
        if (cancelled || !containerRef.current) return;
        const init = initRef.current;
        const instance = new lib.Map({
          container: containerRef.current,
          style: init.estilo,
          center: init.center,
          zoom: init.zoom,
          interactive: init.interactive,
          scrollZoom: init.scrollZoom,
          renderWorldCopies: false,
          attributionControl: { compact: true },
          locale: { "AttributionControl.ToggleAttribution": tr("Ver créditos del mapa") },
        });
        map = instance;
        estiloActual.current = init.estilo;
        let cargo = false;
        instance.on("load", () => {
          cargo = true;
          setIsLoaded(true);
        });
        // Si el estilo no llega (sin internet o el servicio caído), se avisa en vez de girar para siempre.
        instance.on("error", () => {
          if (!cargo && !instance.isStyleLoaded()) setFallo(true);
        });
        instance.on("click", (e) => {
          // Los toques en un pin abren su popup; no cuentan como toque en el mapa.
          if ((e.originalEvent.target as Element | null)?.closest?.(".maplibregl-marker")) return;
          onClickRef.current?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        });
        setMapLib(lib);
        setMapInstance(instance);
      })
      .catch(() => {
        if (!cancelled) setFallo(true);
      });

    return () => {
      cancelled = true;
      map?.remove();
      setIsLoaded(false);
      setMapInstance(null);
    };
  }, []);

  // Cambio de tema: se recarga el estilo; los pines (HTML) no se tocan.
  useEffect(() => {
    if (!mapInstance || estiloActual.current === estilo) return;
    estiloActual.current = estilo;
    mapInstance.setStyle(estilo);
  }, [mapInstance, estilo]);

  const contextValue = useMemo(() => ({ map: mapInstance, mapLib, isLoaded }), [mapInstance, mapLib, isLoaded]);

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cx("ca-map relative h-full w-full", className)}>
        {fallo ? (
          <div className="ca-map__estado">
            <Icon name="map" size={36} />
            <span className="aire-text-footnote">{tr("No se pudo cargar el mapa.")}</span>
          </div>
        ) : (
          !isLoaded && (
            <div className="ca-map__estado">
              <Loader label={tr("Cargando mapa...")} />
            </div>
          )
        )}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
}

type MarkerContextValue = { marker: MapLibreGL.Marker; map: MapLibreGL.Map | null };
const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) throw new Error("MarkerContent y MarkerPopup van dentro de <MapMarker>");
  return context;
}

export type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
} & Omit<MarkerOptions, "element">;

/** Pin con contenido HTML (React) anclado a una coordenada. */
export function MapMarker({ longitude, latitude, children, onClick, ...markerOptions }: MapMarkerProps) {
  const { map } = useMap();
  const { Marker } = useMapLib();
  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  });

  const marker = useMemo(() => {
    const instance = new Marker({ ...markerOptions, element: document.createElement("div") }).setLngLat([
      longitude,
      latitude,
    ]);
    instance.getElement().addEventListener("click", (e) => onClickRef.current?.(e));
    return instance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, marker]);

  useEffect(() => {
    const actual = marker.getLngLat();
    if (actual.lng !== longitude || actual.lat !== latitude) marker.setLngLat([longitude, latitude]);
  }, [marker, longitude, latitude]);

  return <MarkerContext.Provider value={{ marker, map }}>{children}</MarkerContext.Provider>;
}

/** Contenido visual del pin (los .ca-mappin* de aire.css). */
export function MarkerContent({ children, className }: { children: ReactNode; className?: string }) {
  const { marker } = useMarkerContext();
  return createPortal(<div className={cx("ca-map__marker", className)}>{children}</div>, marker.getElement());
}

export type MarkerPopupProps = {
  children: ReactNode;
  className?: string;
  /** Abre el globo al montarse y acomoda el mapa para que se vea completo (p. ej. "Ver en mapa"). */
  abrirAlInicio?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

/** Globo que se abre al tocar el pin, con la piel de Aire y botón para cerrar. */
export function MarkerPopup({ children, className, abrirAlInicio = false, ...popupOptions }: MarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const { Popup } = useMapLib();
  const container = useMemo(() => document.createElement("div"), []);

  const popup = useMemo(
    () =>
      new Popup({ offset: 16, maxWidth: "none", ...popupOptions, closeButton: false, className: "ca-map__popup-shell" }).setDOMContent(
        container,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!map) return;
    // Se vuelve a poner el contenido: al quitar el popup, MapLibre descarta su DOM.
    popup.setDOMContent(container);
    marker.setPopup(popup);
    return () => {
      marker.setPopup(null);
    };
  }, [map, marker, popup, container]);

  useEffect(() => {
    if (!map || !abrirAlInicio) return;
    // Un cuadro después: el pin ya está en el mapa (MapMarker lo agrega en su propio efecto).
    const id = requestAnimationFrame(() => {
      if (!popup.isOpen()) marker.togglePopup();
      // El pin queda más abajo del centro para que el globo no choque con el buscador.
      map.easeTo({ center: marker.getLngLat(), offset: [0, 130], duration: 500 });
    });
    return () => cancelAnimationFrame(id);
  }, [map, marker, popup, abrirAlInicio]);

  return createPortal(
    <div className={cx("ca-map__popup", className)}>
      <button type="button" className="ca-map__popup-close" aria-label={tr("Cerrar")} onClick={() => popup.remove()}>
        <Icon name="close" size={18} />
      </button>
      {children}
    </div>,
    container,
  );
}
