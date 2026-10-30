// Escena 2: Explorar (trabajos y trabajadores cercanos) y el perfil de confianza de un plomero.
module.exports = async ({ tel }) => {
  const t = tel.ian;
  if (!t.page.url().includes("/explorar")) await t.ir("/explorar");
  await t.clipIniciar("02-explorar");
  await t.rol("Ian · cliente", "#60a5fa");
  await t.momento("2", "Explora trabajos y personas cerca de ti", "Ordenados por cercanía y disponibilidad", 2000);
  await t.deslizarH("Trabajadores", 330, 1000);
  await t.espera(400);
  await t.texto("Bayron Camacho", { pausa: 1200 });
  await t.captura("e2-hoja");
  await t.boton("Ver perfil", 1200);
  await t.momento("", "Cada perfil muestra reputación y verificación", "Calificaciones, cédula verificada y quién lo recomienda", 2600);
  await t.deslizar(460, 1200);
  await t.espera(900);
  await t.captura("e2-perfil");
  await t.clipTerminar();
};
