// Escena 10: por qué la gente vuelve. Bayron queda "De confianza" y Ian lo recontrata cada mes.
module.exports = async ({ tel }) => {
  const t = tel.ian;
  await t.ir("/de-confianza");
  await t.clipIniciar("10-confianza");
  await t.rol("Ian · cliente", "#60a5fa");
  await t.rotulo("9", "La próxima vez, recontratas a quien ya conoces", "Tus trabajadores de confianza, a un toque");
  await t.espera(1000);
  const tarjeta = t.page.locator(".ca-card").filter({ hasText: "Bayron Camacho" }).last();
  await t.tap(tarjeta.getByRole("button", { name: "Recontratar" }), 1300);
  await t.quitarRotulo();
  await t.page.evaluate(() => document.querySelectorAll("*").forEach((e) => { if (e.scrollTop > 0) e.scrollTop = 0; }));
  await t.espera(300);
  await t.tap(t.page.getByRole("button", { name: "Mensual" }).first(), 900);
  await t.momento("", "Incluso como servicio recurrente", "Lo acepta una vez y CIRA agenda las siguientes visitas", 2600);
  await t.captura("e10-a");
  await t.clipTerminar();
};
