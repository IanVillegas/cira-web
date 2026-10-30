// Escena 4: Ian publica una urgencia de plomería y paga con su tarjeta registrada.
module.exports = async ({ tel }) => {
  const t = tel.ian;
  if (!t.page.url().includes("/mapa")) await t.ir("/explorar");
  await t.clipIniciar("04-urgencia");
  await t.rol("Ian · cliente", "#60a5fa");
  if (t.page.url().includes("/mapa")) await t.tap(t.page.locator(".ca-tabbar button", { hasText: "Explorar" }).first(), 700);
  await t.texto("Mis publicaciones", { pausa: 700 });
  await t.boton("Crear publicación", 800);
  await t.rotulo("4", "Publica una urgencia en segundos", "CIRA avisa primero a los más cercanos");
  await t.rellenar(t.page.getByPlaceholder("Ej: Reparación de fuga"), "Fuga de agua en el baño", 32);
  await t.tap(t.page.getByPlaceholder("Selecciona una categoría"), 650);
  await t.tap(t.page.locator("button[aria-pressed]", { hasText: "Plomería" }).first(), 1000);
  await t.rellenar(t.page.getByPlaceholder("Describe el problema o necesidad con detalle..."), "Se rompió un tubo y sale mucha agua.", 24);
  await t.quitarRotulo();
  await t.tap(t.page.getByRole("switch", { name: "Es urgente" }), 900);
  await t.captura("e4-a");
  await t.tap(t.page.getByRole("button", { name: "Casa Alajuela" }).first(), 500);
  await t.tap(t.page.getByRole("button", { name: "Tarjeta", exact: true }).first(), 450);
  await t.rellenar(t.page.getByPlaceholder("20000"), "25000", 80);
  await t.deslizar(260, 800);
  await t.captura("e4-b");
  await t.momento("", "Pagas con tarjeta, todo transparente", "Tarifa de urgencia del 15 % y comisión de CIRA, a la vista", 2700);
  await t.boton("Publicar urgencia", 1600);
  await t.captura("e4-c");
  await t.clipTerminar();
};
