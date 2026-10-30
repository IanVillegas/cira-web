// Escena 7: Bayron llega, repara la fuga y marca el trabajo como terminado.
module.exports = async ({ tel }) => {
  const t = tel.bayron;
  if (!t.page.url().includes("/mis-trabajos")) await t.ir("/mis-trabajos");
  await t.clipIniciar("07-terminar");
  await t.rol("Bayron · plomero Plus", "#fbbf24");
  await t.rotulo("", "Llega, repara la fuga y la marca como terminada", "");
  await t.boton("Ya llegué", 1500);
  await t.boton("Marcar como terminado", 1700);
  await t.quitarRotulo();
  await t.captura("e7-a");
  await t.clipTerminar();
};
