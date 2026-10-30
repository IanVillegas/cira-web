"""Sintetiza la pista de música del video (original, sin derechos de autor).

Ambiental luminosa a 92 BPM: pad con acordes, bajo suave, arpegio tipo pluck con eco,
un pulso muy ligero y un crescendo hacia el cierre. Escribe un WAV estéreo de 44.1 kHz.
Uso: python3 musica.py salida.wav duracion_segundos
"""
import sys
import wave

import numpy as np

SR = 44100
salida = sys.argv[1]
dur = float(sys.argv[2])
N = int(dur * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

BPM = 92
beat = 60 / BPM
bar = 4 * beat


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# C – G – Am – F (en C mayor), un compás cada uno
prog = [
    {"bajo": 36, "acorde": [60, 64, 67, 71]},  # Cmaj7
    {"bajo": 43, "acorde": [59, 62, 67, 74]},  # G
    {"bajo": 45, "acorde": [60, 64, 69, 72]},  # Am
    {"bajo": 41, "acorde": [60, 65, 69, 72]},  # F
]


def pad(freq, a=1.2):
    # suma de armónicos suaves con ligero desafinado (efecto coro)
    x = np.zeros_like(t)
    for det in (-0.004, 0.0, 0.004):
        f = freq * (1 + det)
        for k, amp in ((1, 1.0), (2, 0.35), (3, 0.14)):
            x += amp * np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28))
    return x


mezcla = np.zeros(N)
bajo = np.zeros(N)
arp = np.zeros(N)
hat = np.zeros(N)

n_bars = int(np.ceil(dur / bar))
for b in range(n_bars):
    p = prog[b % 4]
    i0 = int(b * bar * SR)
    i1 = min(N, int((b + 1) * bar * SR + 0.9 * SR))  # cola para solapar con el siguiente
    seg = np.arange(i1 - i0) / SR
    # envolvente del compás: ataque lento y cola larga
    env = np.minimum(seg / 0.9, 1) * np.exp(-np.maximum(seg - bar, 0) * 2.2)
    for m in p["acorde"]:
        f = hz(m)
        for det in (-0.003, 0.003):
            mezcla[i0:i1] += env * 0.07 * np.sin(2 * np.pi * f * (1 + det) * seg)
        mezcla[i0:i1] += env * 0.025 * np.sin(2 * np.pi * f * 2 * seg)
    fb = hz(p["bajo"])
    bajo[i0:i1] += env * 0.16 * np.sin(2 * np.pi * fb * seg) + env * 0.04 * np.sin(2 * np.pi * fb * 2 * seg)

    # arpegio en corcheas (8 por compás), patrón ascendente-descendente
    notas = p["acorde"]
    patron = [0, 1, 2, 3, 2, 1, 2, 3]
    for s in range(8):
        ts = b * bar + s * beat / 2
        if ts >= dur:
            break
        f = hz(notas[patron[s]] + 12)
        j0 = int(ts * SR)
        j1 = min(N, j0 + int(1.4 * SR))
        x = np.arange(j1 - j0) / SR
        pluck = np.exp(-x * 5.5) * (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(2 * np.pi * f * 2 * x) * np.exp(-x * 4))
        acento = 1.0 if s % 4 == 0 else 0.7
        arp[j0:j1] += 0.09 * acento * pluck

    # hi-hat suave en los contratiempos
    for s in range(4):
        ts = b * bar + s * beat + beat / 2
        if ts >= dur:
            break
        j0 = int(ts * SR)
        j1 = min(N, j0 + int(0.07 * SR))
        ruido = np.diff(rng.standard_normal(j1 - j0 + 1))
        hat[j0:j1] += 0.018 * ruido * np.exp(-np.arange(j1 - j0) / SR * 70)

# eco estéreo (corchea con puntillo y corchea) sobre el arpegio
def eco(x, retardo, fb, mix):
    d = int(retardo * SR)
    y = x.copy()
    for k in range(1, 5):
        if k * d < N:
            y[k * d:] += x[: N - k * d] * (fb ** k)
    return x * (1 - mix) + y * mix

arp_l = eco(arp, beat * 0.75, 0.5, 0.55)
arp_r = eco(arp, beat * 0.5, 0.5, 0.55)

# crescendo suave hacia el final y fundidos de entrada/salida
sube = 0.75 + 0.35 * np.clip((t - dur * 0.55) / (dur * 0.4), 0, 1)
fade = np.clip(t / 2.5, 0, 1) * np.clip((dur - t) / 3.0, 0, 1)

izq = (mezcla + bajo + arp_l + hat) * sube * fade
der = (mezcla * 0.97 + bajo + arp_r + hat * 0.8) * sube * fade
est = np.stack([izq, der], axis=1)
est = est / (np.abs(est).max() + 1e-9) * 0.8

pcm = (est * 32767).astype("<i2")
with wave.open(salida, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{salida}: {dur:.1f} s")
