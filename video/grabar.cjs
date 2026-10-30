// Graba un recorrido de CIRA en formato Samsung Galaxy S24 Ultra (1440x3120 px,
// viewport CSS 411x891 a 3.5x) y lo codifica a MP4 con ffmpeg.
// Uso: con la app en http://localhost:3001  ->  node video/grabar.cjs [salida.mp4]
const { chromium } = require("playwright");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BASE = process.env.BASE_URL || "http://localhost:3001";
const PERFIL = "61044195"; // teléfono con el que se inicia sesión en el video
const PIN = "1234";
const W = 1440, H = 3120, DSF = 3.5;
const OUT = path.resolve(process.argv[2] || path.join(__dirname, "cira-demo-s24ultra.mp4"));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cira-video-"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: Math.round(W / DSF), height: Math.round(H / DSF) },
    deviceScaleFactor: DSF,
    isMobile: true,
    hasTouch: true,
    locale: "es-CR",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36",
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);

  // ── Captura de frames (screencast) con marca de tiempo ──────────────
  const frames = [];
  let n = 0;
  cdp.on("Page.screencastFrame", (f) => {
    const file = path.join(tmp, `f${String(n++).padStart(6, "0")}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, "base64"));
    frames.push({ file, t: f.metadata.timestamp });
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });

  // Punto que indica dónde toca el dedo
  await page.addInitScript(() => {
    addEventListener("DOMContentLoaded", () => {
      const d = document.createElement("div");
      d.style.cssText =
        "position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;" +
        "background:rgba(60,60,60,.28);border:2px solid rgba(255,255,255,.85);z-index:2147483647;" +
        "pointer-events:none;opacity:0;transition:opacity .15s, transform .15s";
      document.body.appendChild(d);
      addEventListener("pointerdown", (e) => {
        d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px";
        d.style.opacity = "1"; d.style.transform = "scale(.8)";
      }, true);
      const soltar = () => { d.style.opacity = "0"; d.style.transform = "scale(1.1)"; };
      addEventListener("pointerup", soltar, true);
      addEventListener("pointercancel", soltar, true);
    });
  });

  const tap = async (locator) => {
    const box = await locator.boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await sleep(900);
  };
  // Desplaza el contenedor interno con una curva suave (el gesto táctil
  // sintético de CDP no mueve el overflow interno de la app).
  const swipe = async (dy) => {
    await page.evaluate(
      (dist) =>
        new Promise((resolve) => {
          const el = [...document.querySelectorAll("*")].find(
            (e) => e.scrollHeight > e.clientHeight + 10 && /auto|scroll/.test(getComputedStyle(e).overflowY),
          );
          if (!el) return resolve();
          const from = el.scrollTop, t0 = performance.now(), dur = 800;
          const paso = (t) => {
            const k = Math.min((t - t0) / dur, 1);
            el.scrollTop = from + dist * (1 - Math.pow(1 - k, 3));
            k < 1 ? requestAnimationFrame(paso) : resolve();
          };
          requestAnimationFrame(paso);
        }),
      dy,
    );
    await sleep(500);
  };

  // Precalentar fuentes (iconos) para que no parpadeen las ligaduras al grabar
  const calentar = await ctx.newPage();
  await calentar.goto(`${BASE}/login`);
  await calentar.evaluate(() => sessionStorage.setItem("cira.session", "true"));
  await calentar.goto(`${BASE}/explorar`);
  await calentar.waitForFunction(() =>
    [...document.fonts].some((f) => f.family.includes("Material Symbols") && f.status === "loaded"),
  );
  await calentar.close();

  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await sleep(1500);

  // 1. Inicio de sesión con el perfil del video
  await tap(page.locator("input").first());
  await page.keyboard.type(PERFIL, { delay: 140 });
  await sleep(500);
  await tap(page.getByRole("button", { name: "Continuar" }));
  await sleep(600);
  await page.keyboard.type(PIN, { delay: 260 });
  await sleep(600);
  await tap(page.getByRole("button", { name: "Ingresar" }));
  await sleep(1800);

  // 2. Explorar trabajos
  await swipe(500); await swipe(500); await swipe(-1000);
  await sleep(500);

  // 3. Trabajadores disponibles
  await tap(page.getByText("Trabajadores", { exact: true }).first());
  await sleep(800);
  await swipe(400); await swipe(-400);

  // 4. Mensajes
  await tap(page.getByText("CHAT", { exact: true }));
  await sleep(1000);
  await tap(page.getByText("María Rojas").first());
  await sleep(1800);
  await swipe(250);

  // 5. Perfil
  await page.goto(`${BASE}/perfil`);
  await sleep(1500);
  await swipe(350); await swipe(-350);
  await sleep(600);
  await page.goto(`${BASE}/perfil/editar`);
  await sleep(1800);
  await swipe(400);
  await sleep(1500);

  await cdp.send("Page.stopScreencast");
  await browser.close();

  // ── Codificar: cada frame dura hasta la marca del siguiente ─────────
  const list = path.join(tmp, "frames.txt");
  const lines = [];
  frames.forEach((f, i) => {
    const dur = i + 1 < frames.length ? frames[i + 1].t - f.t : 0.5;
    lines.push(`file '${f.file}'`, `duration ${Math.max(dur, 0.001).toFixed(4)}`);
  });
  lines.push(`file '${frames.at(-1).file}'`);
  fs.writeFileSync(list, lines.join("\n"));

  const r = spawnSync("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0", "-i", list,
    "-vf", `fps=30,scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=white,format=yuv420p`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-movflags", "+faststart", OUT,
  ], { stdio: "inherit" });
  fs.rmSync(tmp, { recursive: true, force: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(`\nListo: ${OUT} (${frames.length} frames)`);
})();
