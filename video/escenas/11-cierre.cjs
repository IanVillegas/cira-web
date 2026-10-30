const { tarjeta } = require("../lib/tarjetas.cjs");

// Escena 11: cierre con el mensaje central y el equipo.
module.exports = async ({ tel }) => {
  await tarjeta(tel.ian, {
    nombre: "11-cierre", logo: true, titulo: "Contrata con confianza.",
    sub: "Necesidad → contacto → trabajo → pago → reputación.<br>Todo en una sola app.",
    equipo: ["Ian", "Marisol", "Bayron", "Eduardo", "José", "Jixi"],
    pie: "CIRA · Aplicaciones Informáticas Globales · UNA", ms: 4800,
  });
};
