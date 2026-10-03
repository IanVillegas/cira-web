// Modo demo: compila la app web y levanta backend + app en UN solo puerto.
// Ignora VITE_API_URL del .env.local (la app usa el mismo origen que la sirve).
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "web");

console.log("Compilando la app web...");
const build = spawnSync("npm", ["run", "build"], {
  cwd: webDir,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, VITE_API_URL: "" },
});
if (build.status !== 0) {
  console.error("La compilación falló; revisa los errores de arriba.");
  process.exit(build.status ?? 1);
}

const port = process.env.PORT || 3001;
const ips = Object.values(os.networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4" && !i.internal)
  .map((i) => i.address);

console.log("\nAbre la app desde otro dispositivo de la MISMA red WiFi en:");
for (const ip of ips) console.log(`  http://${ip}:${port}`);
console.log("(Si Windows pregunta por el firewall, permite el acceso a Node.js en redes privadas.)\n");

await import("../src/index.js");
