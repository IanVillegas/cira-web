// Producción del video de CIRA (formato Samsung Galaxy S24 Ultra, 1440x3120).
//   node video/grabar.cjs                 -> graba todas las escenas y monta video/cira-demo-s24ultra.mp4
//   node video/grabar.cjs --escenas=2,3   -> solo esas escenas (desarrollo; deja los clips en el tmp)
// Requiere la app en BASE_URL (por defecto http://localhost:3001) con la base recién sembrada
// (`npm run reset` en server/ y arrancar con CIRA_RETRASO_ALERTAS_SEG=10), playwright y ffmpeg.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Camara } = require("./lib/camara.cjs");
const { montar } = require("./lib/montaje.cjs");

const BASE = process.env.BASE_URL || "http://localhost:3001";
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const SOLO = arg("escenas")?.split(",").map(Number);
const TMP = arg("tmp") || fs.mkdtempSync(path.join(os.tmpdir(), "cira-video-"));
const SALIDA = path.resolve(arg("salida") || path.join(__dirname, "cira-demo-s24ultra.mp4"));

// Perfil con el que se inicia sesión en el video: Ian Villegas (teléfono 6104-4195).
const PERFIL = { telefono: "61044195", pin: "1234" };

const escenas = fs.readdirSync(path.join(__dirname, "escenas")).filter((f) => f.endsWith(".cjs")).sort()
  .map((f) => ({ n: Number(f.slice(0, 2)), nombre: f.slice(3, -4), fn: require(path.join(__dirname, "escenas", f)) }));

(async () => {
  const camara = await new Camara({ base: BASE, tmp: TMP }).iniciar();
  const ctx = { camara, perfil: PERFIL, tel: {}, ids: { ian: "u-1", marisol: "u-2", bayron: "u-3", eduardo: "u-4", jose: "u-5", jixi: "u-6" } };
  // Teléfono de cada persona; Ian inicia sesión en cámara en la escena 1 (si no se graba, ya trae sesión).
  const conSesion = !SOLO || SOLO.includes(1);
  // Cada persona con su tema para distinguir los teléfonos: Ian en oscuro, Bayron en claro.
  ctx.tel.ian = await camara.telefono(conSesion ? null : ctx.ids.ian, { tema: "dark" });
  ctx.tel.bayron = await camara.telefono(ctx.ids.bayron, { tema: "light" });
  ctx.tel.nuevo = (id) => camara.telefono(id);

  for (const e of escenas) {
    if (SOLO && !SOLO.includes(e.n)) continue;
    console.log(`\n▶ Escena ${e.n}: ${e.nombre}`);
    try { await e.fn(ctx); } catch (err) {
      console.error(`✖ Escena ${e.n} falló:`, err.message);
      for (const [k, t] of Object.entries(ctx.tel)) if (t.page) await t.captura(`error-${e.n}-${k}`).catch(() => {});
      throw err;
    }
  }
  await camara.cerrar();
  console.log("\nClips:", camara.clips.map((c) => `${c.nombre} ${c.duracion.toFixed(1)}s`).join(" · "));
  if (SOLO) { console.log(`Clips en ${TMP}`); return; }
  const r = montar(camara.clips, SALIDA, { tmp: TMP });
  console.log(`\nListo: ${SALIDA} (${r.total.toFixed(1)} s)`);
  if (!arg("tmp")) fs.rmSync(TMP, { recursive: true, force: true }); // con --tmp se conservan los clips
})().catch((e) => { console.error(e); process.exit(1); });
