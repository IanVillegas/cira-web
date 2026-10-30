// Escena 9: el modelo de negocio funcionando. Lo que CIRA ganó con lo que acabamos de ver.
module.exports = async ({ tel }) => {
  const t = tel.ian;
  if (!t.page.url().startsWith("http")) await t.ir("/publicaciones");
  await t.clipIniciar("09-ingresos");
  await t.rol("Ian · cliente", "#60a5fa");
  await t.tap(t.page.locator(".ca-tabbar button", { hasText: "Perfil" }).first(), 700);
  await t.boton("Cuenta", 700);
  await t.texto("Ingresos de CIRA (demo)", { pausa: 1300 });
  await t.momento("8", "CIRA gana solo cuando aporta valor", "Comisión con tarjeta, tarifa de urgencia y Plan Plus", 3000);
  await t.captura("e9-a");
  await t.clipTerminar();
};
