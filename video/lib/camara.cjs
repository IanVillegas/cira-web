// Cámara: abre "teléfonos" Samsung Galaxy S24 Ultra (1440x3120 px, viewport CSS
// 411x891 a 3.5x), graba clips con screencast de Chrome y los codifica con ffmpeg.
// Los rótulos y el círculo del dedo se dibujan dentro de la página, así quedan
// animados y grabados junto con la app.
const { chromium } = require("playwright");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ANCHO = 1440, ALTO = 3120, DSF = 3.5;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TOKEN_KEY = "cira.token";

// Se inyecta en cada página: círculo del dedo + rótulos (tipo subtítulo) + insignia de rol.
const OVERLAY_CSS = `
  .v-dedo{position:fixed;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;
    background:rgba(255,255,255,.35);border:2px solid rgba(255,255,255,.95);box-shadow:0 2px 14px rgba(0,0,0,.35);
    z-index:2147483647;pointer-events:none;opacity:0;transform:scale(1.25);transition:opacity .14s,transform .14s}
  .v-dedo.on{opacity:1;transform:scale(.85)}
  .v-rotulo{position:fixed;left:16px;right:16px;bottom:104px;z-index:2147483646;pointer-events:none;display:flex;gap:12px;
    align-items:center;padding:13px 16px;border-radius:20px;background:rgba(15,23,42,.9);color:#fff;
    font:600 16px/1.3 "Open Sans",Inter,system-ui,sans-serif;letter-spacing:.1px;box-shadow:0 8px 28px rgba(0,0,0,.28);
    opacity:0;transform:translateY(16px);transition:opacity .35s cubic-bezier(.2,.8,.2,1),transform .35s cubic-bezier(.2,.8,.2,1)}
  .v-rotulo.on{opacity:1;transform:none}
  .v-rotulo b{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#3b7be0;font-size:14px}
  .v-rotulo small{display:block;font-weight:500;font-size:13px;opacity:.78;margin-top:2px}
  .v-rotulo.arriba{bottom:auto;top:78px}
  .v-rol{position:fixed;left:50%;top:6px;z-index:2147483646;pointer-events:none;transform:translate(-50%,-30px);opacity:0;
    padding:3px 12px;border-radius:999px;background:rgba(15,23,42,.9);color:#fff;font:700 11px/1.5 "Open Sans",system-ui,sans-serif;
    letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;
    transition:opacity .3s cubic-bezier(.2,.8,.2,1),transform .3s cubic-bezier(.2,.8,.2,1)}
  .v-rol.on{opacity:1;transform:translate(-50%,0)}
  .v-rol i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:7px;background:var(--c,#34d399)}
`;

function overlayScript(cssTexto) {
  const montar = () => {
    if (window.__v) return;
    const st = document.createElement("style"); st.textContent = cssTexto;
    const dedo = document.createElement("div"); dedo.className = "v-dedo";
    const rot = document.createElement("div"); rot.className = "v-rotulo";
    const rol = document.createElement("div"); rol.className = "v-rol";
    document.documentElement.append(st, dedo, rot, rol);
    window.__v = {
      rotulo(n, texto, sub, arriba) {
        rot.className = "v-rotulo" + (arriba ? " arriba" : "");
        rot.innerHTML = (n ? `<b>${n}</b>` : "") + `<div>${texto}${sub ? `<small>${sub}</small>` : ""}</div>`;
        requestAnimationFrame(() => requestAnimationFrame(() => rot.classList.add("on")));
      },
      quitarRotulo() { rot.classList.remove("on"); },
      rol(texto, color) {
        if (!texto) return rol.classList.remove("on");
        rol.style.setProperty("--c", color || "#34d399");
        rol.innerHTML = `<i></i>${texto}`;
        rol.classList.add("on");
      },
    };
    const abajo = (e) => { dedo.style.left = e.clientX + "px"; dedo.style.top = e.clientY + "px"; dedo.classList.add("on"); };
    const arribaF = () => dedo.classList.remove("on");
    addEventListener("pointerdown", abajo, true);
    addEventListener("pointerup", arribaF, true);
    addEventListener("pointercancel", arribaF, true);
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", montar); else montar();
}

class Telefono {
  constructor(camara, ctx, page, cdp) {
    Object.assign(this, { camara, ctx, page, cdp, frames: [], n: 0, grabando: false, taps: [], t0: 0 });
    cdp.on("Page.screencastFrame", (f) => {
      if (this.grabando) {
        const file = path.join(this.dir, `f${String(this.n++).padStart(6, "0")}.jpg`);
        this.escrituras.push(fs.promises.writeFile(file, Buffer.from(f.data, "base64")));
        this.frames.push({ file, t: f.metadata.timestamp });
      }
      cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    });
  }

  async ir(ruta) {
    await this.page.goto(this.camara.base + ruta);
    await this.page.waitForLoadState("networkidle").catch(() => {});
    await this.page.evaluate(() => document.fonts.ready);
  }

  // ── Clips ───────────────────────────────────────────────────────────
  async clipIniciar(nombre) {
    this.nombre = nombre;
    this.dir = path.join(this.camara.tmp, nombre);
    fs.mkdirSync(this.dir, { recursive: true });
    this.frames = []; this.n = 0; this.taps = []; this.escrituras = [];
    this.grabando = true;
    await this.cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: ANCHO, maxHeight: ALTO, everyNthFrame: 1 });
    this.t0 = Date.now();
    // fuerza un primer frame
    await this.page.evaluate(() => { document.documentElement.style.outline = "0.01px solid transparent"; });
    await sleep(120);
  }

  async clipTerminar() {
    await sleep(150);
    const fin = Date.now() / 1000;
    await this.cdp.send("Page.stopScreencast");
    this.grabando = false;
    await Promise.all(this.escrituras);
    const { frames, dir, nombre } = this;
    if (!frames.length) throw new Error(`Clip ${nombre} sin frames`);
    const lista = path.join(dir, "frames.txt");
    const lineas = [];
    frames.forEach((f, i) => {
      const dur = (i + 1 < frames.length ? frames[i + 1].t : fin) - f.t;
      lineas.push(`file '${f.file}'`, `duration ${Math.max(dur, 0.001).toFixed(4)}`);
    });
    lineas.push(`file '${frames.at(-1).file}'`);
    fs.writeFileSync(lista, lineas.join("\n"));
    const salida = path.join(this.camara.tmp, `${nombre}.mp4`);
    const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista,
      "-vf", `fps=30,scale=${ANCHO}:${ALTO}:force_original_aspect_ratio=decrease,pad=${ANCHO}:${ALTO}:(ow-iw)/2:(oh-ih)/2:color=white,format=yuv420p`,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-r", "30", salida], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`ffmpeg falló en ${nombre}`);
    const dur = Math.max(0.5, fin - frames[0].t);
    fs.rmSync(dir, { recursive: true, force: true });
    const clip = { nombre, archivo: salida, duracion: dur, taps: this.taps.slice() };
    this.camara.clips.push(clip);
    return clip;
  }

  // ── Gestos ──────────────────────────────────────────────────────────
  async tap(loc, pausa = 750) {
    const el = typeof loc === "string" ? this.page.locator(loc).first() : loc;
    const t0 = Date.now();
    let box = await el.boundingBox();
    if (!box) { await el.waitFor({ state: "visible", timeout: 20000 }).catch(() => {}); box = await el.boundingBox(); }
    if (Date.now() - t0 > 1200 && process.env.DEBUG_VIDEO) console.log(`  (lento ${Date.now() - t0} ms) ${loc}`);
    if (!box) throw new Error(`No se ve el elemento a tocar: ${loc}`);
    // Si queda bajo la barra flotante o fuera de pantalla, desplaza con suavidad hasta el centro.
    const alto = this.page.viewportSize().height;
    const centro = box.y + box.height / 2;
    // Nada que desplazar si está en una hoja, en el mapa o en algo fijo (barra de pestañas, botón flotante).
    const dentroDeHoja = await el.evaluate((n) => {
      if (n.closest("[role=dialog], .ca-sheet, .ca-tabbar, .ca-fab, .maplibregl-popup, .maplibregl-marker")) return true;
      for (let a = n; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).position === "fixed") return true;
      return false;
    });
    if (!dentroDeHoja && (centro > alto - 130 || centro < 0)) {
      await this.deslizar(centro - alto * 0.5, 700);
      box = await el.boundingBox();
    }
    if (!box) throw new Error(`No se ve el elemento a tocar: ${loc}`);
    this.taps.push((Date.now() - this.t0) / 1000);
    await this.page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    // Mientras graba, Chrome ya tarda ~0.3 s en cada toque: se descuenta de la pausa.
    await sleep(Math.max(250, pausa - 300));
  }
  texto(t, o = {}) { return this.tap(this.page.getByText(t, { exact: o.exacto ?? true }).first(), o.pausa); }
  boton(nombre, pausa) { return this.tap(this.page.getByRole("button", { name: nombre }).first(), pausa); }
  async escribir(txt, retraso = 90) { await this.page.keyboard.type(txt, { delay: retraso }); await sleep(250); }
  // Toca el campo y escribe. Si el toque no le dio el foco (p. ej. una hoja aún cerrándose),
  // se lo da directamente: si no, los espacios desplazarían la página.
  async rellenar(loc, txt, retraso = 55) {
    const el = typeof loc === "string" ? this.page.locator(loc).first() : loc;
    await this.tap(el, 350);
    if (!(await el.evaluate((n) => n === document.activeElement).catch(() => false))) await el.focus();
    await this.escribir(txt, retraso);
  }

  // Desplaza el contenedor con scroll interno de la app con una curva suave.
  async deslizar(dy, ms = 900) {
    await this.page.evaluate(({ dist, dur }) => new Promise((resolve) => {
      const cands = [...document.querySelectorAll("*")].filter((e) => e.scrollHeight > e.clientHeight + 10 && /auto|scroll/.test(getComputedStyle(e).overflowY));
      const el = cands.sort((a, b) => b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth)[0] ?? document.scrollingElement;
      const from = el.scrollTop, t0 = performance.now();
      const paso = (t) => { const k = Math.min((t - t0) / dur, 1); el.scrollTop = from + dist * (1 - Math.pow(1 - k, 3)); k < 1 ? requestAnimationFrame(paso) : resolve(); };
      requestAnimationFrame(paso);
    }), { dist: dy, dur: ms });
    await sleep(450);
  }

  // Arrastre con un dedo (para mover el mapa). El círculo del dedo se anima dentro de la
  // página en paralelo para no frenar el gesto con una llamada por paso.
  async arrastrar(x, y, dx, dy, ms = 700) {
    const pasos = 14;
    const punto = (k) => [{ x: x + dx * k, y: y + dy * k, id: 1, radiusX: 8, radiusY: 8, force: 1 }];
    this.taps.push((Date.now() - this.t0) / 1000);
    await this.page.evaluate(([x, y, dx, dy, ms]) => {
      const d = document.querySelector(".v-dedo"); if (!d) return;
      const t0 = performance.now();
      d.classList.add("on");
      const paso = (t) => {
        const k = Math.min((t - t0) / ms, 1), e = 1 - Math.pow(1 - k, 2);
        d.style.left = x + dx * e + "px"; d.style.top = y + dy * e + "px";
        if (k < 1) requestAnimationFrame(paso); else d.classList.remove("on");
      };
      requestAnimationFrame(paso);
    }, [x, y, dx, dy, ms]);
    await this.cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: punto(0) });
    // Se envían sin esperar cada respuesta (CDP las procesa en orden) para mantener el ritmo.
    const envios = [];
    for (let i = 1; i <= pasos; i++) {
      const k = i / pasos;
      envios.push(this.cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: punto(1 - Math.pow(1 - k, 2)) }));
      await sleep(ms / pasos);
    }
    envios.push(this.cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }));
    await Promise.all(envios);
    await sleep(400);
  }

  // Pellizco con dos dedos (escala < 1 aleja, > 1 acerca).
  async pellizcar(x, y, escala, velocidad = 500) {
    await this.cdp.send("Input.synthesizePinchGesture", { x, y, scaleFactor: escala, relativeSpeed: velocidad, gestureSourceType: "touch" });
    await sleep(600);
  }

  // Desliza en horizontal el carrusel que está bajo el título indicado.
  async deslizarH(titulo, dx, ms = 1000) {
    await this.page.evaluate(({ titulo, dist, dur }) => new Promise((resolve) => {
      const hs = [...document.querySelectorAll("*")].filter((e) => e.scrollWidth > e.clientWidth + 10 && /auto|scroll/.test(getComputedStyle(e).overflowX));
      // El carrusel cuyo ancestro más cercano tiene un elemento con el texto exacto del título.
      const profundidad = (e) => {
        let a = e.parentElement;
        for (let i = 1; i <= 6 && a; i++, a = a.parentElement)
          if ([...a.querySelectorAll("h1,h2,h3,h4,p,span")].some((n) => n.textContent.trim() === titulo && !e.contains(n))) return i;
        return 99;
      };
      const el = hs.map((e) => [e, profundidad(e)]).sort((x, y) => x[1] - y[1])[0]?.[0];
      if (!el) return resolve();
      const from = el.scrollLeft, t0 = performance.now();
      const paso = (t) => { const k = Math.min((t - t0) / dur, 1); const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; el.scrollLeft = from + dist * e; k < 1 ? requestAnimationFrame(paso) : resolve(); };
      requestAnimationFrame(paso);
    }), { titulo, dist: dx, dur: ms });
    await sleep(400);
  }

  // ── Rótulos ─────────────────────────────────────────────────────────
  async rotulo(n, texto, sub = "", arriba = false) { await this.page.evaluate(([a, b, c, d]) => window.__v?.rotulo(a, b, c, d), [n, texto, sub, arriba]); }
  async quitarRotulo() { await this.page.evaluate(() => window.__v?.quitarRotulo()); await sleep(350); }
  // Rótulo que aparece, se lee y se retira para dejar ver la app.
  async momento(n, texto, sub = "", ms = 2600, arriba = false) { await this.rotulo(n, texto, sub, arriba); await sleep(ms); await this.quitarRotulo(); }
  async rol(texto, color) { await this.page.evaluate(([a, b]) => window.__v?.rol(a, b), [texto, color]); }
  espera(ms) { return sleep(ms); }
  async captura(nombre) { await this.page.screenshot({ path: path.join(this.camara.tmp, `${nombre}.png`) }); }
}

if (process.env.DEBUG_VIDEO) {
  for (const m of ["tap", "texto", "boton", "escribir", "rellenar", "deslizar", "deslizarH", "arrastrar", "pellizcar", "rotulo", "quitarRotulo", "momento", "rol", "espera", "captura", "ir"]) {
    const orig = Telefono.prototype[m];
    Telefono.prototype[m] = async function (...a) {
      const t0 = Date.now(); const r = await orig.apply(this, a);
      if (this.grabando) console.log(`   ${m}(${String(a[0]).slice(0, 30)}) ${Date.now() - t0} ms`);
      return r;
    };
  }
}

class Camara {
  constructor({ base, tmp }) { this.base = base; this.tmp = tmp; this.clips = []; fs.mkdirSync(tmp, { recursive: true }); }
  async iniciar() { this.browser = await chromium.launch(); return this; }

  // usuarioId: id del usuario con sesión iniciada (el "token" de la demo); null = sin sesión.
  async telefono(usuarioId = null, locale = "es-CR") {
    const ctx = await this.browser.newContext({
      viewport: { width: Math.round(ANCHO / DSF), height: Math.round(ALTO / DSF) },
      deviceScaleFactor: DSF, isMobile: true, hasTouch: true, locale,
      geolocation: { latitude: 10.0163, longitude: -84.2113 }, permissions: ["geolocation"], // Alajuela Centro
      userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36",
    });
    await ctx.addInitScript(`(${overlayScript.toString()})(${JSON.stringify(OVERLAY_CSS)})`);
    // Solo desarrollo: sin red hacia OpenFreeMap, un estilo liso deja probar pines y popups.
    if (process.env.MAPA_PROVISIONAL) {
      await ctx.route("https://tiles.openfreemap.org/**", (r) => r.fulfill({ contentType: "application/json",
        body: JSON.stringify({ version: 8, sources: {}, layers: [{ id: "fondo", type: "background", paint: { "background-color": "#e9eef5" } }] }) }));
    }
    if (usuarioId) await ctx.addInitScript(([k, v]) => { try { sessionStorage.setItem(k, v); } catch {} }, [TOKEN_KEY, usuarioId]);
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    return new Telefono(this, ctx, page, cdp);
  }
  async cerrar() { await this.browser.close(); }
}

module.exports = { Camara, ANCHO, ALTO, DSF, sleep };
