// Escena 1: inicio de sesión de Ian Villegas con el perfil 61044195.
module.exports = async ({ tel, perfil }) => {
  const t = tel.ian;
  await t.ir("/login");
  await t.clipIniciar("01-login");
  await t.rol("Ian · cliente", "#60a5fa");
  await t.espera(500);
  await t.rotulo("1", "Entras con tu teléfono y tu PIN", "Sin contraseñas largas: así entra cualquiera");
  await t.rellenar("input", perfil.telefono, 85);
  await t.espera(300);
  await t.boton("Continuar", 700);
  await t.escribir(perfil.pin, 220);
  await t.espera(500);
  await t.boton("Ingresar", 2200);
  await t.clipTerminar();
};
