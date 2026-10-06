"""Original soundtrack for the ACC Drive Insight reel, synthesised with numpy.

120 BPM, A minor. Cuts in the reel land on the beat grid, so the scene start
times below double as the arrangement map.
"""
import pathlib
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
DUR = 24.5
N = int(SR * DUR)
rng = np.random.default_rng(7)

# Scene start times — must match reel.js
CUTS = [0, 2.0, 3.0, 5.0, 7.0, 9.0, 10.5, 11.5, 13.0, 14.0, 16.0, 17.5, 18.5, 21.0, 23.5]

L = np.zeros(N)
R = np.zeros(N)
send = np.zeros((2, N))  # reverb bus
bass_bus = np.zeros(N)
pad_bus = np.zeros((2, N))


def place(buf, sig, t0, gain=1.0):
    i0 = int(round(t0 * SR))
    if i0 >= len(buf) or i0 + len(sig) <= 0:
        return
    s0 = max(0, -i0)
    i0 = max(0, i0)
    n = min(len(sig) - s0, len(buf) - i0)
    buf[i0:i0 + n] += sig[s0:s0 + n] * gain


def add(sig, t0, gain=1.0, pan=0.0, verb=0.0):
    a = (pan + 1) * np.pi / 4
    place(L, sig, t0, gain * np.cos(a))
    place(R, sig, t0, gain * np.sin(a))
    if verb:
        place(send[0], sig, t0, gain * verb * np.cos(a))
        place(send[1], sig, t0, gain * verb * np.sin(a))


def tt(d):
    return np.arange(int(d * SR)) / SR


def onepole_lp(x, fc):
    """One-pole low-pass with a (possibly time-varying) cutoff."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    prev = 0.0
    for i in range(len(x)):
        prev = (1 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y


def fade(sig, ms=8):
    n = min(len(sig), int(ms / 1000 * SR))
    sig[-n:] *= np.linspace(1, 0, n)
    return sig


# ---------- instruments ----------
def kick():
    t = tt(0.5)
    f = 46 + 130 * np.exp(-t * 32)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.0)
    click = rng.standard_normal(len(t)) * np.exp(-t * 900) * 0.35
    return fade(np.tanh((s + click) * 1.8))


def hat(open_=False):
    t = tt(0.35 if open_ else 0.07)
    x = np.diff(rng.standard_normal(len(t) + 2), 2)
    return fade(x * np.exp(-t * (11 if open_ else 75)) * 0.16)


def clap():
    t = tt(0.3)
    x = np.diff(rng.standard_normal(len(t) + 1))
    x = np.convolve(x, np.ones(5) / 5, "same")
    env = np.zeros(len(t))
    for o in (0, 0.012, 0.024):
        env += (t >= o) * np.exp(-np.clip(t - o, 0, None) * 110)
    env += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) * 16) * 0.7
    return fade(x * env * 0.5)


def tone(freq, d, harm=8, roll=2.0, attack=0.005, decay=None, release=0.03, detune=0.0):
    t = tt(d)
    s = np.zeros(len(t))
    for k in range(1, harm + 1):
        s += np.sin(2 * np.pi * freq * (1 + detune) * k * t + k * 0.7) / k * np.exp(-(k - 1) / roll)
    env = np.minimum(1, t / attack)
    if decay:
        env = env * np.exp(-t * decay)
    rn = int(release * SR)
    env[-rn:] *= np.linspace(1, 0, rn)
    return s * env


def whoosh(d=0.5, kind="rise"):
    t = tt(d)
    x = rng.standard_normal(len(t))
    u = t / d
    if kind == "rise":
        fc, env = 250 * 24 ** u, u ** 2.2
    elif kind == "fall":
        fc, env = 6000 * (1 / 24) ** u, (1 - u) ** 1.6
    else:  # pass-by
        fc, env = 400 + 5000 * np.exp(-((u - 0.45) / 0.18) ** 2), np.exp(-((u - 0.45) / 0.22) ** 2)
    y = onepole_lp(x, fc)
    y = y - onepole_lp(y, 120)
    return fade(y * env / (np.abs(y).max() + 1e-9))


def engine(rpm, gate=None, cyl=8):
    """rpm: per-sample array. Fundamental = firing frequency, scaled down an octave."""
    f = rpm / 60 * cyl / 4
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.zeros(len(rpm))
    for k in range(1, 14):
        s += np.sin(k * ph + rng.uniform(0, 6)) / k ** 0.75
    s *= 1 + 0.35 * np.sin(ph / 2)  # cylinder imbalance burble
    s = np.tanh(s * 1.6)
    s = s - onepole_lp(s, 60)
    s = onepole_lp(s, 2600 + rpm * 0.4)
    if gate is not None:
        s *= gate
    return s / (np.abs(s).max() + 1e-9)


def ping(freq, d=1.2, decay=5.0):
    t = tt(d)
    s = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 6)
    return fade(s * np.exp(-t * decay) * np.minimum(1, t / 0.002))


def blip(freq, d=0.09):
    t = tt(d)
    f = freq * (1 + 0.5 * np.exp(-t * 60))
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38))


def click():
    t = tt(0.03)
    return fade(np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t * 300) * 0.6)


def boom(d=2.2):
    t = tt(d)
    f = 34 + 60 * np.exp(-t * 9)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    n = onepole_lp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 7) * 0.9
    return fade(np.tanh((s + n) * 1.5))


NOTE = {"A1": 55.0, "C2": 65.41, "F1": 43.65, "G1": 49.0}
CHORDS = {  # pad voicings (Hz)
    "Am": [220.0, 261.63, 329.63, 440.0],
    "F": [174.61, 220.0, 261.63, 349.23],
    "C": [196.0, 261.63, 329.63, 392.0],
    "G": [196.0, 246.94, 293.66, 392.0],
}
PROG = [("Am", "A1"), ("F", "F1"), ("C", "C2"), ("G", "G1")]


def in_groove(t):
    return 2.0 <= t < 9.0 or 10.5 <= t < 21.0


# ---------- arrangement ----------
kick_s, clap_s, hat_c, hat_o = kick(), clap(), hat(), hat(True)
kick_times = []
for i in range(int(DUR / BEAT * 4)):
    t = i * BEAT / 4
    if not in_groove(t):
        continue
    sixteenth = i % 4
    if sixteenth == 0:
        add(kick_s, t, 0.8)
        kick_times.append(t)
        if round((t - 2.0) / BEAT) % 2 == 1:
            add(clap_s, t, 0.55, pan=0.05, verb=0.35)
    elif sixteenth == 2:
        add(hat_o if t >= 14.0 else hat_c, t, 0.55 if t >= 14.0 else 0.7, pan=0.25)
    else:
        add(hat_c, t, 0.28 + 0.1 * (sixteenth == 1), pan=-0.2)

# sidechain envelope
duck = np.ones(N)
for kt in kick_times:
    i0 = int(kt * SR)
    n = min(int(0.4 * SR), N - i0)
    duck[i0:i0 + n] = np.minimum(duck[i0:i0 + n], 1 - 0.75 * np.exp(-np.arange(n) / SR * 9))

# bass: pumping off-beat 8ths + sub on the beat
for i in range(int(DUR / (BEAT / 2))):
    t = i * BEAT / 2
    if not in_groove(t):
        continue
    bar = int((t - 2.0) // 2.0) % 4
    root = NOTE[PROG[bar][1]]
    if i % 2 == 1:
        place(bass_bus, tone(root * 2, 0.22, harm=7, roll=2.2, decay=5), t, 0.32)
    place(bass_bus, tone(root, 0.24, harm=2, roll=0.6, decay=3), t, 0.45)

# pad
def pad_chord(name, t0, d, gain):
    for j, f in enumerate(CHORDS[name]):
        for det, pan in ((-0.0025, -0.6), (0.0025, 0.6)):
            v = tone(f, d, harm=9, roll=2.6, attack=0.35, release=0.4, detune=det)
            a = (pan + 1) * np.pi / 4
            place(pad_bus[0], v, t0, gain * np.cos(a))
            place(pad_bus[1], v, t0, gain * np.sin(a))

pad_chord("Am", 0.0, 2.1, 0.035)
for k in range(10):
    t0 = 2.0 + k * 2.0
    if t0 >= 21.0:
        break
    pad_chord(PROG[k % 4][0], t0, 2.05, 0.05 if not 9.0 <= t0 < 10.5 else 0.03)
pad_chord("Am", 21.0, 2.6, 0.085)
pad_chord("F", 23.5, 1.0, 0.04)

# ---------- sound design ----------
# 01 gauge: launch with real upshifts (same maths as the needle on screen)
t = tt(2.0)
v = 287 * np.where(np.clip((t - 0.55) / 1.0, 0, 1) < 0.5,
                   4 * np.clip((t - 0.55) / 1.0, 0, 1) ** 3,
                   1 - (-2 * np.clip((t - 0.55) / 1.0, 0, 1) + 2) ** 3 / 2)
rpm = 6200 + (v % 52) / 52 * 2100
rpm = np.where(t < 0.42, 1100 + 300 * np.sin(t * 9) ** 2, rpm)
rpm = np.where((t >= 0.42) & (t < 0.55), 1100 + (t - 0.42) / 0.13 * 5100, rpm)
rpm = onepole_lp(rpm, 40)
gain = np.clip(t / 0.3, 0, 1) * np.where(t > 1.8, np.clip((2.0 - t) / 0.2, 0, 1), 1)
add(engine(rpm) * gain * (0.3 + 0.7 * np.clip((rpm - 1000) / 7000, 0, 1)), 0.0, 1.25, verb=0.15)
for i in range(61):
    add(click(), 0.14 + i * 0.008, 0.07, pan=np.sin(i) * 0.5)
add(whoosh(0.7, "rise"), 1.3, 0.35)

# 02 streak: drop + pass-by
add(boom(1.2), 2.0, 0.45)
add(whoosh(0.9, "pass"), 2.0, 0.6, verb=0.2)
t = tt(1.0)
dop = 1.22 - 0.42 / (1 + np.exp(-(t - 0.3) * 16))
add(engine(8000 * dop) * np.exp(-((t - 0.3) / 0.28) ** 2), 2.0, 0.45, pan=0.0)

# whoosh into every later cut
for c in CUTS[2:]:
    if c in (10.5, 21.0, 23.5):
        continue
    add(whoosh(0.35, "rise"), c - 0.35, 0.18, pan=rng.uniform(-0.4, 0.4))
    add(whoosh(0.3, "fall"), c, 0.12)

# 03 title: letters landing
for i in range(9):
    add(blip(220, 0.06), 3.06 + i * 0.032 + 0.08, 0.05)
add(boom(0.8), 3.0, 0.22)

# 06 shift: rev, limiter, upshift
t = tt(1.7)
rpm = np.where(t < 1.05, 4300 + (8450 - 4300) * np.clip((t - 0.05) / 1.0, 0, 1) ** 3, 8450)
rpm = np.where(t >= 1.22, 6150 + (6900 - 6150) * np.clip((t - 1.22) / 0.48, 0, 1), rpm)
rpm = onepole_lp(rpm, 30)
gate = np.ones(len(t))
lim = (t >= 1.05) & (t < 1.22)
gate[lim] = (np.floor(t[lim] * 24) % 2 == 0) * 1.0
gate = onepole_lp(gate, 200)
fade_out = np.clip((1.7 - t) / 0.3, 0, 1)
add(engine(rpm, gate) * fade_out, 9.0, 1.35, verb=0.2)
add(boom(0.5), 10.22, 0.25)
add(click(), 10.22, 0.5)
for k in range(8):
    add(hat_c, 9.0 + 0.75 + k * BEAT / 4, 0.12 + k * 0.03)

# 07 flag: crash
t = tt(1.6)
crash = np.diff(rng.standard_normal(len(t) + 1)) * np.exp(-t * 3.2)
add(fade(onepole_lp(crash, 9000)), 10.5, 0.22, verb=0.4)

# 10 dashboard: counter ticks (decelerating like the number)
k = 0
for i in range(40):
    p = i / 40
    tt_ = 14.15 + (-np.log2(1 - p * 0.999) / 10) * 1.0
    if tt_ < 15.2:
        add(click(), tt_, 0.18, pan=0.2)

# 11 aero: wind bed
t = tt(1.5)
wind = onepole_lp(rng.standard_normal(len(t)), 500 + 1500 * np.sin(np.pi * t / 1.5))
add(fade(wind * np.sin(np.pi * t / 1.5) / (np.abs(wind).max() + 1e-9)), 16.0, 0.25)

# 12 radar: sonar ping
add(ping(1180, 1.0, 4.5), 17.52, 0.18, verb=0.6)
add(ping(1180, 0.6, 6.0), 17.82, 0.07, pan=0.4, verb=0.6)

# 13 cards: pops, toggles, button
for i, dt in enumerate((0.12, 0.55, 0.71, 0.87)):
    add(blip(880 * (1.0 + 0.12 * i)), 18.5 + dt, 0.16, pan=-0.1 + 0.1 * i)
for i in range(3):
    add(click(), 18.5 + 1.15 + i * 0.13, 0.32)
    add(blip(1400, 0.05), 18.5 + 1.2 + i * 0.13, 0.06)
add(click(), 20.5, 0.6)
add(blip(660, 0.15), 20.52, 0.18)
add(whoosh(1.0, "rise"), 20.0, 0.38)

# 14 end card: impact
add(boom(2.4), 21.0, 0.75, verb=0.3)
add(whoosh(0.8, "fall"), 21.0, 0.3, verb=0.2)
add(blip(330, 0.2), 21.3, 0.1)

# 15 outro: bell
add(ping(1760, 1.2, 3.5), 23.5, 0.12, verb=0.7)
add(ping(2637, 1.0, 4.0), 23.52, 0.05, pan=0.3, verb=0.7)

# ---------- mix ----------
L += bass_bus * duck
R += bass_bus * duck
L += pad_bus[0] * (0.55 + 0.45 * duck)
R += pad_bus[1] * (0.55 + 0.45 * duck)
place(send[0], pad_bus[0], 0, 0.5)
place(send[1], pad_bus[1], 0, 0.5)

# convolution reverb with a synthetic decaying-noise impulse response
ir_t = tt(1.8)
for ch, out in ((0, L), (1, R)):
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.45)
    ir = onepole_lp(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum())
    m = 1 << int(np.ceil(np.log2(N + len(ir))))
    wet = np.fft.irfft(np.fft.rfft(send[ch], m) * np.fft.rfft(ir, m), m)[:N]
    out += wet * 0.55

mix = np.stack([L, R])
mix /= np.abs(mix).max()
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
mix *= 10 ** (-1 / 20) / np.abs(mix).max()
fi, fo = int(0.01 * SR), int(0.35 * SR)
mix[:, :fi] *= np.linspace(0, 1, fi)
mix[:, -fo:] *= np.linspace(1, 0, fo)

out = pathlib.Path(__file__).resolve().parent / "audio"
out.mkdir(exist_ok=True)
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(str(out / "soundtrack.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out / "soundtrack.wav", f"{DUR}s")
