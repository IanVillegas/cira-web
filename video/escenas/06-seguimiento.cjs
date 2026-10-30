// Escena 6: Ian sigue a Bayron en vivo, como en una app de transporte.
module.exports = async ({ tel }) => {
  const t = tel.ian;
  if (!t.page.url().includes("/publicaciones")) await t.ir("/publicaciones");
  // La pantalla se actualiza sola cada 5 s: se espera fuera de cámara a que llegue "En camino".
  await t.page.getByText("Bayron Camacho").first().waitFor({ timeout: 20000 });
  await t.espera(800);
  await t.clipIniciar("06-seguimiento");
  await t.rol("Ian · cliente", "#60a5fa");
  await t.rotulo("6", "Sigues el trabajo en vivo", "Aceptado → En camino → Llegó → Terminado");
  await t.espera(3200);
  await t.quitarRotulo();
  await t.espera(600);
  await t.captura("e6-a");
  await t.clipTerminar();
};
