const { tarjeta } = require("../lib/tarjetas.cjs");

// Escena 0: apertura con el planteamiento del problema.
module.exports = async ({ tel }) => {
  await tarjeta(tel.ian, {
    nombre: "00a-apertura", logo: true, titulo: "CIRA",
    sub: "Servicios del hogar de confianza,<br>a minutos de ti", pie: "Aplicaciones Informáticas Globales · UNA", ms: 2800,
  });
  await tarjeta(tel.ian, {
    nombre: "00b-problema", oscura: true, numero: "El problema",
    titulo: "Se rompe una tubería<br>y es sábado.", sub: "¿A quién llamas? ¿Y cómo sabes<br>que puedes confiar en esa persona?", ms: 3700,
  });
};
