# Video de presentación

Teaser de ~1:41 de CIRA en formato **Samsung Galaxy S24 Ultra** (1440 × 3120 px, vertical, 30 fps, H.264 + AAC 48 kHz),
grabado de la app real con Playwright: `cira-demo-s24ultra.mp4`.

Perfil protagonista: **Ian Villegas, teléfono 61044195** (PIN `1234`), que inicia sesión en cámara.
Cuando entra Bayron (plomero, Plan Plus) se corta a su teléfono con la etiqueta de rol arriba.

## Guion

| # | Escena | Quién | Qué cuenta |
|---|---|---|---|
| 0 | Apertura | — | Marca y el problema: "Se rompe una tubería y es sábado" |
| 1 | Login | Ian | Entra con su teléfono y PIN |
| 2 | Explorar | Ian | Trabajos y personas cercanas; perfil de Bayron con reputación y verificación |
| 3 | Mapa | Ian | Pines por categoría, filtra Plomería, abre el pin de Bayron |
| 4 | Urgencia | Ian | Publica "Fuga de agua en el baño" con tarjeta: resumen con comisión y tarifa de urgencia |
| 5 | Alerta | Bayron | Recibe la alerta primero (Prioridad Plus), la acepta y sale en camino |
| 6 | Seguimiento | Ian | Lo sigue en vivo |
| 7 | Terminar | Bayron | Llega y marca el trabajo como terminado |
| 8 | Pago | Ian | Paga con tarjeta, deja propina y califica con 5 estrellas |
| 9 | Ingresos | Ian | Cuenta → Ingresos de CIRA: lo que la plataforma ganó |
| 10 | Confianza | Ian | Recontrata a Bayron cada mes |
| 11 | Cierre | — | "Contrata con confianza" y el equipo |

Rótulos animados en cada momento, transiciones suaves, un círculo que marca cada toque,
música ambiental original (sintetizada en `lib/musica.py`, sin derechos de autor) y sonidos sutiles al tocar.

## Cómo grabarlo

Necesita **internet** (el mapa descarga sus teselas de `tiles.openfreemap.org`), Node 22, `ffmpeg`,
Python 3 con `numpy` y Playwright con Chromium (`npm i -g playwright && npx playwright install chromium`).

```bash
video/reiniciar-servidor.sh --build   # compila web/, recrea la base y levanta el backend en :3001
node video/grabar.cjs                 # graba las escenas y monta video/cira-demo-s24ultra.mp4 (~6 min)
```

En Windows, en lugar del `.sh`: `cd web && npm run build`, luego en `server/` `npm run reset` y
`set CIRA_RETRASO_ALERTAS_SEG=10 && node src/index.js`. Cada grabación debe empezar con la base recién sembrada,
porque las escenas crean y cierran la urgencia.

Opciones de desarrollo:

- `--escenas=3,4` graba solo esas escenas y deja los clips sueltos (`--tmp=<carpeta>` para conservarlos).
- `MAPA_PROVISIONAL=1` usa un fondo liso en el mapa cuando no hay red (solo para probar pines y popups).
- `DEBUG_VIDEO=1` muestra cuánto tarda cada gesto.

## Estructura

- `grabar.cjs`: orquesta las escenas y el montaje.
- `escenas/NN-nombre.cjs`: una escena por archivo, en orden.
- `lib/camara.cjs`: teléfonos S24 Ultra, grabación por screencast, gestos (toque, escribir, deslizar, pellizco, arrastre) y rótulos.
- `lib/tarjetas.cjs`: tarjetas de apertura y cierre.
- `lib/montaje.cjs`: une los clips con transiciones y mezcla el audio (normalizado a −16 LUFS).
- `lib/musica.py` y `lib/sfx.py`: música y efectos.
