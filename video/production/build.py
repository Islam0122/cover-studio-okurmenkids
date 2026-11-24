"""Assemble the final video from the recorded clips.

Usage: python3 build.py <build_dir> <out_dir>

1. Encodes each recorded clip (screencast JPEG frames + timestamps) to a 1920x1080 / 30 fps intermediate.
2. Joins the clips with crossfades.
3. Places every narration sentence at the time it was cued during recording (record.cjs),
   generates an original ambient music bed (numpy synthesis, no samples) and ducks it under the voice.
4. Writes English/Russian SRT subtitles and chapters from the same timings, and muxes the MP4
   with soft subtitle tracks and chapter markers.
"""
import json, os, subprocess, sys, wave
import numpy as np

build, out = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
FPS, XF, SR = 30, 0.5, 24000
clips = json.load(open(f"{build}/clips.json"))
timeline = {s["id"]: s for s in json.load(open(f"{build}/timeline.json"))["scenes"]}
script = {s["id"]: s for s in json.load(open(f"{HERE}/script.json"))["scenes"]}
os.makedirs(f"{build}/enc", exist_ok=True)
os.makedirs(out, exist_ok=True)


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


# ---- 1. encode clips ----------------------------------------------------------------
for c in clips:
    d = f"{build}/clips/{c['id']}"
    meta = json.load(open(f"{d}/frames.json"))
    frames, dur = meta["frames"], meta["duration"]
    c["duration"] = dur
    target = f"{build}/enc/{c['id']}.mp4"
    if os.path.exists(target) and os.path.getmtime(target) > os.path.getmtime(f"{d}/frames.json"):
        continue
    lines = ["ffconcat version 1.0"]
    for i, f in enumerate(frames):
        start = 0 if i == 0 else f["t"]
        end = frames[i + 1]["t"] if i + 1 < len(frames) else dur
        lines += [f"file '{f['file']}'", f"duration {max(0.001, end - start):.4f}"]
    lines.append(f"file '{frames[-1]['file']}'")
    open(f"{d}/list.ffconcat", "w").write("\n".join(lines) + "\n")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", f"{d}/list.ffconcat",
         "-vf", f"fps={FPS},scale=1920:1080:flags=lanczos,format=yuv420p,settb=AVTB",
         "-t", f"{dur:.3f}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", "-an", target])
    print("encoded", c["id"], round(dur, 1))

# ---- 2. timeline offsets (crossfades overlap neighbouring clips) ----------------------
t = 0.0
for i, c in enumerate(clips):
    c["offset"] = t
    t += c["duration"] - XF
total = t + XF
print("total length", round(total, 1), "s")

# ---- 3. audio -----------------------------------------------------------------------

def read_any(path):
    import soundfile as sf  # installed with kokoro
    data, sr = sf.read(path, dtype="float32")
    assert sr == SR
    return data if data.ndim == 1 else data.mean(axis=1)

N = int((total + 1) * SR)
voice = np.zeros(N, np.float32)
cues = []  # global subtitle cues
for c in clips:
    if not c.get("scene"):
        continue
    tl = timeline[c["scene"]]
    for i, line in enumerate(tl["lines"]):
        start = c["offset"] + c["lineStarts"][i]
        s = read_any(f"{build}/{line['file']}")
        a = int(start * SR)
        voice[a:a + len(s)] += s[: max(0, N - a)]
        cues.append({"start": start, "end": start + len(s) / SR, "en": line["en"], "ru": line["ru"], "scene": c["scene"]})


def music_bed(n, sr):
    """Original ambient bed: soft pads, a gentle arpeggio and sub bass, with a synthetic reverb."""
    rng = np.random.default_rng(3)
    t = np.arange(n) / sr
    bpm, bar = 84, 4 * 60 / 84
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    # D major: Dmaj9 – Bm9 – Gmaj7(#11) – Asus2, two bars each
    chords = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 64], [43, 50, 54, 59, 61], [45, 52, 57, 59, 64]]
    out = np.zeros(n, np.float32)
    seg = 2 * bar
    nseg = int(np.ceil(n / sr / seg)) + 1
    for k in range(nseg):
        ch = chords[k % 4]
        a, b = int(k * seg * sr), min(n, int((k + 1) * seg * sr + 1.6 * sr))
        if a >= n:
            break
        tt = t[a:b] - k * seg
        env = np.minimum(1, tt / 1.4) * np.clip((seg + 1.6 - tt) / 1.6, 0, 1)
        pad = np.zeros(b - a, np.float32)
        for m in ch[1:]:
            for det in (-0.07, 0.0, 0.07):
                f = hz(m + 12) * 2 ** (det / 12)
                pad += (np.sin(2 * np.pi * f * tt) + 0.22 * np.sin(4 * np.pi * f * tt) + 0.06 * np.sin(6 * np.pi * f * tt)).astype(np.float32)
        out[a:b] += 0.016 * env * pad
        bass = np.sin(2 * np.pi * hz(ch[0] - 12) * tt) * env
        out[a:b] += 0.09 * bass.astype(np.float32)
        # arpeggio: eighth notes over the chord, upper octave
        step = 60 / bpm / 2
        notes = ch[1:] + ch[2:4][::-1]
        for j in range(int(seg / step)):
            s0 = a + int(j * step * sr)
            L = int(1.2 * sr)
            if s0 >= n:
                break
            nt = np.arange(min(L, n - s0)) / sr
            f = hz(notes[j % len(notes)] + 24)
            vel = 0.55 + 0.45 * ((j % 4) == 0)
            out[s0:s0 + len(nt)] += (0.03 * vel * np.sin(2 * np.pi * f * nt) * np.exp(-nt * 5.5)).astype(np.float32)
    # synthetic stereo-less reverb: exponentially decaying noise IR, FFT convolution
    ir_len = int(2.6 * sr)
    ir = rng.standard_normal(ir_len).astype(np.float32) * np.exp(-np.arange(ir_len) / sr * 2.6).astype(np.float32)
    ir /= np.sqrt((ir ** 2).sum())
    L = 1 << int(np.ceil(np.log2(n + ir_len)))
    wet = np.fft.irfft(np.fft.rfft(out, L) * np.fft.rfft(ir, L), L)[:n].astype(np.float32)
    mix = 0.65 * out + 0.55 * wet
    return mix / (np.abs(mix).max() + 1e-9)

music = music_bed(N, SR) * 0.07
# duck under the voice: smoothed voice envelope (fast attack, slow release)
env = np.abs(voice)
win = int(0.03 * SR)
env = np.convolve(env, np.ones(win) / win, mode="same")
duck = np.zeros_like(env)
g, att, rel = 0.0, 1 - np.exp(-1 / (0.05 * SR)), 1 - np.exp(-1 / (0.6 * SR))
for i in range(0, N, 64):  # block-wise envelope follower (fast enough in numpy)
    target = min(1.0, env[i] / 0.02)
    g += (target - g) * (1 - (1 - (att if target > g else rel)) ** 64)
    duck[i:i + 64] = g
music *= 1 - 0.6 * duck
fade = int(2.5 * SR)
music[:fade] *= np.linspace(0, 1, fade)
end = int(total * SR)
music[end - fade:end] *= np.linspace(1, 0, fade)
music[end:] = 0
mix = voice + music
mix /= max(1.0, np.abs(mix).max() / 0.98)
pcm = (mix * 32767).astype(np.int16)
with wave.open(f"{build}/mix.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

# ---- 4. subtitles & chapters ---------------------------------------------------------
def chunks(text, limit):
    import re
    parts = re.split(r"(?<=[,.;:!?—])\s+", text)
    out, cur = [], ""
    for p in parts:
        if cur and len(cur) + 1 + len(p) > limit:
            out.append(cur); cur = p
        else:
            cur = (cur + " " + p).strip()
    out.append(cur)
    res = []
    for o in out:  # hard-split anything still too long at a space
        while len(o) > limit:
            cut = o.rfind(" ", 0, limit)
            res.append(o[:cut]); o = o[cut + 1:]
        res.append(o)
    return res

def wrap(s, width=44):
    if len(s) <= width:
        return s
    mid = len(s) // 2
    cut = min((i for i, ch in enumerate(s) if ch == " "), key=lambda i: abs(i - mid))
    return s[:cut] + "\n" + s[cut + 1:]

def ts(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"

for lang in ("en", "ru"):
    n, rows = 0, []
    for cue in cues:
        parts = chunks(cue[lang], 86)
        total_chars = sum(len(p) for p in parts)
        t0 = cue["start"]
        for p in parts:
            dt = (cue["end"] - cue["start"]) * len(p) / total_chars
            n += 1
            rows.append(f"{n}\n{ts(t0)} --> {ts(t0 + dt - 0.02)}\n{wrap(p)}\n")
            t0 += dt
    open(f"{out}/subtitles-{lang}.srt", "w", encoding="utf-8").write("\n".join(rows))

chapters, seen = [], set()
for c in clips:
    sid = c["id"].removeprefix("card-") if c["id"] != "opener" else "intro"
    if sid in seen:
        continue
    seen.add(sid)
    chapters.append({"start": 0.0 if c["id"] == "opener" else c["offset"], "title": script[sid]["chapter"]})
json.dump({"duration": total, "chapters": chapters, "cues": cues,
           "clips": [{k: c[k] for k in ("id", "offset", "duration")} for c in clips]},
          open(f"{build}/timing.json", "w"), indent=1, ensure_ascii=False)
meta = [";FFMETADATA1", "title=Cover Studio — OkurmenKids: product presentation", "artist=Islam Duishobaev"]
for i, ch in enumerate(chapters):
    endt = chapters[i + 1]["start"] if i + 1 < len(chapters) else total
    meta += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={int(ch['start'] * 1000)}", f"END={int(endt * 1000)}", f"title={ch['title']}"]
open(f"{build}/meta.txt", "w").write("\n".join(meta) + "\n")

# ---- 5. video: crossfade chain + final mux --------------------------------------------
# static gain to -14 LUFS (a one-pass loudnorm would pump up the music-only sections)
import re
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{build}/mix.wav", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
measured = float(re.findall(r"I:\s+(-?[0-9.]+) LUFS", r.stderr)[-1])
gain = -14.0 - measured
print(f"mix loudness {measured:.1f} LUFS -> gain {gain:+.1f} dB")

inputs, filt, prev = [], [], "0:v"
for c in clips:
    inputs += ["-i", f"{build}/enc/{c['id']}.mp4"]
for i, c in enumerate(clips[1:], start=1):
    trans = "slideleft" if (clips[i - 1]["id"], c["id"]) == ("stack", "architecture") else "fade"
    label = f"v{i}"
    filt.append(f"[{prev}][{i}:v]xfade=transition={trans}:duration={XF}:offset={c['offset']:.3f}[{label}]")
    prev = label
filt.append(f"[{prev}]fade=t=out:st={total - 1.2:.3f}:d=1.2,format=yuv420p[vout]")
k = len(clips)
cmd = ["ffmpeg", "-y", *inputs, "-i", f"{build}/mix.wav", "-i", f"{out}/subtitles-en.srt", "-i", f"{out}/subtitles-ru.srt",
       "-i", f"{build}/meta.txt", "-filter_complex", ";".join(filt),
       "-map", "[vout]", "-map", f"{k}:a", "-map", f"{k + 1}:s", "-map", f"{k + 2}:s", "-map_metadata", f"{k + 3}", "-map_chapters", f"{k + 3}",
       "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", str(FPS),
       "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:level=false,aresample=48000", "-c:a", "aac", "-b:a", "192k", "-ac", "2",
       "-c:s", "mov_text", "-metadata:s:s:0", "language=eng", "-metadata:s:s:0", "title=English",
       "-metadata:s:s:1", "language=rus", "-metadata:s:s:1", "title=Русский",
       "-t", f"{total:.3f}", "-movflags", "+faststart", f"{out}/cover-studio-presentation.mp4"]
print("rendering final video…")
run(cmd)
print("done:", f"{out}/cover-studio-presentation.mp4")
