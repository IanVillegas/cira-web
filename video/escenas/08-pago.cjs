// Escena 8: Ian paga con tarjeta, deja propina y califica a Bayron.
module.exports = async ({ tel }) => {
  const t = tel.ian;
  if (!t.page.url().includes("/publicaciones")) await t.ir("/publicaciones");
  await t.page.getByRole("button", { name: "Pagar con tarjeta" }).first().waitFor({ timeout: 20000 });
  await t.espera(500);
  await t.clipIniciar("08-pago");
  await t.rol("Ian · cliente", "#60a5fa");
  await t.rotulo("7", "Pagas desde la app y dejas propina", "La propina va completa para Bayron", true);
  await t.boton("Pagar con tarjeta", 1300);
  await t.tap(t.page.getByRole("button", { name: /^₡\s?1\s?000$/ }).first(), 1100);
  await t.captura("e8-a");
  await t.tap(t.page.getByRole("button", { name: /^Pagar ₡/ }).first(), 1700);
  await t.quitarRotulo();
  await t.captura("e8-b");
  await t.espera(900);
  await t.boton("Calificar ahora", 1000);
  await t.rotulo("", "Y lo calificas: así se construye la confianza", "Su reputación lo ayuda a conseguir más trabajo", true);
  await t.tap('[aria-label="5 estrellas"]', 1100);
  await t.boton("Enviar calificación", 1600);
  await t.quitarRotulo();
  await t.captura("e8-c");
  await t.clipTerminar();
};
