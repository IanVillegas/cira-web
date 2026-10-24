// Borra la base local para que se vuelva a sembrar al arrancar, con las fechas de los
// trabajos de ejemplo relativas a hoy. Útil el día de la presentación.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let borrados = 0;
for (const nombre of ["cira.db", "cira.db-wal", "cira.db-shm"]) {
  const archivo = path.join(dir, nombre);
  if (fs.existsSync(archivo)) {
    fs.rmSync(archivo);
    borrados++;
  }
}
console.log(borrados ? "Base local borrada: se volverá a sembrar al arrancar el servidor." : "No había base local que borrar.");
