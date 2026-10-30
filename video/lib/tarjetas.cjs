// Tarjetas a pantalla completa (apertura, cambios de tema y cierre). Reutilizan la hoja
// de estilos de la app (tipografías y tokens) y se animan solo con opacity/transform.
const CSS = `
.vt{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:0 38px;text-align:center;color:#fff;overflow:hidden;
  background:radial-gradient(120% 70% at 50% 0%,#4b8ef0 0%,#2d62c0 55%,#1a3f8f 100%);font-family:"Open Sans",Inter,system-ui,sans-serif}
.vt.oscura{background:radial-gradient(120% 70% at 50% 0%,#233a66 0%,#111c36 60%,#0a1124 100%)}
.vt .halo{position:absolute;width:760px;height:760px;border-radius:50%;left:50%;top:50%;margin:-380px 0 0 -380px;
  background:radial-gradient(circle,rgba(255,255,255,.16),transparent 62%);animation:vt-halo 6s ease-in-out infinite alternate}
.vt img{width:120px;height:120px;border-radius:30px;box-shadow:0 14px 40px rgba(0,0,0,.35);margin-bottom:34px;
  animation:vt-sube .8s cubic-bezier(.2,.8,.2,1) both}
.vt h1{font-size:40px;line-height:1.12;font-weight:800;margin:0 0 16px;letter-spacing:-.4px;animation:vt-sube .8s .15s cubic-bezier(.2,.8,.2,1) both}
.vt p{font-size:19px;line-height:1.45;font-weight:500;margin:0;opacity:.88;animation:vt-sube .8s .3s cubic-bezier(.2,.8,.2,1) both}
.vt .num{font-size:15px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.75;margin-bottom:18px;animation:vt-sube .7s cubic-bezier(.2,.8,.2,1) both}
.vt .pie{position:absolute;left:0;right:0;bottom:70px;font-size:14px;font-weight:600;letter-spacing:.04em;opacity:.7;animation:vt-sube .8s .6s cubic-bezier(.2,.8,.2,1) both}
.vt .equipo{margin-top:30px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;animation:vt-sube .8s .5s cubic-bezier(.2,.8,.2,1) both}
.vt .equipo span{padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.16);font-size:15px;font-weight:600}
@keyframes vt-sube{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@keyframes vt-halo{from{transform:scale(.9)}to{transform:scale(1.15)}}
`;

// opts: { numero?, titulo, sub?, pie?, equipo?: string[], oscura?, logo?: boolean, ms }
async function tarjeta(tel, o) {
  await tel.ir("/login");
  await tel.page.evaluate(([css, o]) => {
    const st = document.createElement("style"); st.textContent = css; document.head.append(st);
    const d = document.createElement("div");
    d.className = "vt" + (o.oscura ? " oscura" : "");
    d.innerHTML = `<div class="halo"></div>` +
      (o.logo ? `<img src="/icon-512.png" alt="">` : "") +
      (o.numero ? `<div class="num">${o.numero}</div>` : "") +
      `<h1>${o.titulo}</h1>` + (o.sub ? `<p>${o.sub}</p>` : "") +
      (o.equipo ? `<div class="equipo">${o.equipo.map((n) => `<span>${n}</span>`).join("")}</div>` : "") +
      (o.pie ? `<div class="pie">${o.pie}</div>` : "");
    document.documentElement.append(d);
  }, [CSS, o]);
  await tel.clipIniciar(o.nombre);
  await tel.espera(o.ms ?? 3000);
  return tel.clipTerminar();
}

module.exports = { tarjeta };
