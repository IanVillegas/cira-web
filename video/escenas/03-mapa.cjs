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
  await t.arrastrar(120, 600, 170, -60, 900);
  await t.espera(300);
  await t.tap(t.page.locator(".maplibregl-marker").filter({ hasText: "BC" }).first(), 1300);
  await t.momento("", "Hay plomeros disponibles cerca", "Pero es una emergencia: mejor avisarles a todos", 2600);
  await t.clipTerminar();
};
