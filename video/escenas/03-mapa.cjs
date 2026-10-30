// Escena 3: el mapa. Ian busca un plomero: ve los pines cercanos, filtra por Plomería y abre el de Bayron.
module.exports = async ({ tel }) => {
  const t = tel.ian;
  if (!t.page.url().includes("/usuarios/")) await t.ir("/explorar");
  await t.clipIniciar("03-mapa");
  await t.rol("Ian · cliente", "#60a5fa");
  await t.tap(t.page.locator(".ca-tabbar button", { hasText: "Mapa" }).first(), 600);
  await t.page.waitForSelector(".maplibregl-marker", { timeout: 20000 });
  await t.page.waitForLoadState("networkidle").catch(() => {});
  await t.espera(300);
  await t.rotulo("3", "Todo en el mapa, en tiempo real", "Pines por categoría, urgencia y disponibilidad");
  await t.pellizcar(205, 470, 0.55, 450);
  await t.espera(1300);
  await t.quitarRotulo();
  await t.texto("Todos los servicios", { pausa: 600 });
  await t.texto("Plomería", { pausa: 1100 });

  // El pin de Bayron solo se dibuja si está a la vista: se aleja hasta que aparece y se lleva al centro.
  const pin = t.page.locator(".maplibregl-marker").filter({ hasText: "BC" });
  for (let i = 0; i < 3 && !(await pin.count()); i++) {
    await t.pellizcar(205, 470, 0.6, 450);
    await t.espera(800);
  }
  const box = await pin.first().boundingBox();
  if (box) {
    const dx = 205 - (box.x + box.width / 2), dy = 400 - (box.y + box.height / 2);
    if (Math.abs(dx) + Math.abs(dy) > 60) await t.arrastrar(205 - dx * 0.35, 520 - dy * 0.35, dx, dy, 900);
  }
  await t.espera(300);
  await t.tap(pin.first(), 1300);
  await t.momento("", "Hay plomeros disponibles cerca", "Pero es una emergencia: mejor avisarles a todos", 2600);
  await t.clipTerminar();
};
