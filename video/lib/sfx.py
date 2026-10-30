"""Efecto de sonido sutil: un 'tic' al tocar la pantalla.
Uso: python3 sfx.py eventos.json salida.wav duracion_segundos
eventos.json: {"taps": [segundos...]}
"""
import json
import sys
import wave

import numpy as np

SR = 44100
eventos = json.load(open(sys.argv[1]))
salida = sys.argv[2]
dur = float(sys.argv[3])
N = int(dur * SR)
rng = np.random.default_rng(3)
izq = np.zeros(N)
der = np.zeros(N)


def poner(x, t0, pan=0.0, g=1.0):
    i = int(t0 * SR)
    if i < 0 or i >= N:
        return
    j = min(N, i + len(x))
    izq[i:j] += x[: j - i] * g * (1 - max(pan, 0))
    der[i:j] += x[: j - i] * g * (1 + min(pan, 0))


# tic: seno corto con caída rápida + un poco de "clic" de ruido
x = np.arange(int(0.09 * SR)) / SR
tic = np.sin(2 * np.pi * 1250 * x) * np.exp(-x * 55) * 0.5
tic += np.sin(2 * np.pi * 2500 * x) * np.exp(-x * 90) * 0.18
tic += np.diff(rng.standard_normal(len(x) + 1)) * np.exp(-x * 160) * 0.05
for k, t0 in enumerate(eventos.get("taps", [])):
    poner(tic * (0.9 + 0.1 * np.sin(k)), t0, pan=0.1 * np.sin(k * 1.7), g=0.55)

est = np.stack([izq, der], axis=1)
est = np.clip(est, -1, 1)
with wave.open(salida, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((est * 32767).astype("<i2").tobytes())
print(f"{salida}: {len(eventos.get('taps', []))} toques")
