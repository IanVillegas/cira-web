// Escena 5: Bayron (plomero, Plan Plus) recibe la alerta antes que nadie, la acepta y sale en camino.
module.exports = async ({ tel }) => {
  const t = tel.bayron;
  await t.ir("/explorar");
  await t.page.waitForSelector(".ca-cuenta", { timeout: 30000 });
  await t.clipIniciar("05-alerta");
  await t.rol("Bayron · plomero Plus", "#fbbf24");
  await t.espera(600);
  await t.momento("5", "Bayron recibe la alerta antes que nadie", "Es Plus, está cerca y tiene la cédula verificada", 2800);
  await t.tap(".ca-cuenta", 1600);
  await t.captura("e5-a");
  await t.momento("", "La acepta y sale de inmediato", "Gana un bono del 10 % por atender la urgencia", 2400);
  await t.boton("Estoy en camino", 1500);
  await t.clipTerminar();
};
