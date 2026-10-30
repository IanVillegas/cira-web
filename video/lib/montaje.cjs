// Une los clips con transiciones (xfade), mezcla música + efectos y exporta el MP4 final.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const TR = 0.4; // duración de cada transición (s)

function ejecutar(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) throw new Error(`${cmd} falló (${r.status})`);
}

function montar(clips, salida, { tmp, musica = true, fondoMusica = null }) {
  const n = clips.length;
  // inicio de cada clip en la línea de tiempo final
  const inicios = [];
  let acum = 0;
  clips.forEach((c, i) => { inicios.push(acum); acum += c.duracion - (i < n - 1 ? TR : 0); });
  const total = acum;

  // ── video ──
  const entradas = clips.flatMap((c) => ["-i", c.archivo]);
  let filtro = "";
  let previo = "[0:v]";
  for (let i = 1; i < n; i++) {
    const off = inicios[i].toFixed(3);
    const etiqueta = i === n - 1 ? "[vout]" : `[x${i}]`;
    filtro += `${previo}[${i}:v]xfade=transition=fade:duration=${TR}:offset=${off}${etiqueta};`;
    previo = etiqueta;
  }
  filtro = n > 1 ? filtro.slice(0, -1) : "[0:v]null[vout]";
  const sinAudio = path.join(tmp, "video-sin-audio.mp4");
  ejecutar("ffmpeg", ["-v", "error", "-stats", "-y", ...entradas, "-filter_complex", filtro, "-map", "[vout]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", sinAudio]);

  // ── audio ──
  const taps = clips.flatMap((c, i) => c.taps.map((t) => inicios[i] + t));
  const whooshes = inicios.slice(1);
  fs.writeFileSync(path.join(tmp, "eventos.json"), JSON.stringify({ taps, whooshes }));
  const here = __dirname;
  const wavSfx = path.join(tmp, "sfx.wav");
  const wavMus = path.join(tmp, "musica.wav");
  ejecutar("python3", [path.join(here, "sfx.py"), path.join(tmp, "eventos.json"), wavSfx, (total + 1).toFixed(2)]);
  if (fondoMusica) fs.copyFileSync(fondoMusica, wavMus);
  else ejecutar("python3", [path.join(here, "musica.py"), wavMus, (total + 0.5).toFixed(2)]);

  const audioFinal = path.join(tmp, "audio.m4a");
  ejecutar("ffmpeg", ["-v", "error", "-y", "-i", wavMus, "-i", wavSfx, "-filter_complex",
    `[0:a]volume=${musica ? 0.85 : 0}[m];[1:a]volume=0.9[s];[m][s]amix=inputs=2:duration=first:normalize=0,` +
    `loudnorm=I=-16:TP=-1.5:LRA=9,afade=t=out:st=${(total - 2.5).toFixed(2)}:d=2.5[a]`,
    "-map", "[a]", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", audioFinal]);

  ejecutar("ffmpeg", ["-v", "error", "-y", "-i", sinAudio, "-i", audioFinal, "-c:v", "copy", "-c:a", "copy",
    "-t", total.toFixed(2), "-movflags", "+faststart", salida]);
  return { total, inicios };
}

module.exports = { montar, TR };
