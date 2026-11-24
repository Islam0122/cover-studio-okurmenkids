"""Narration: one Kokoro TTS clip per sentence -> audio/<scene>-<i>.wav, per-scene WAV, timeline.json.
record.cjs may start a sentence later than planned (when the on-screen action needs longer); build.py
then places each sentence WAV at its recorded start.
Usage: python3 tts.py <build_dir> <kokoro.onnx> <voices.bin>"""
import json, sys, os
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
build, model, voices = sys.argv[1:4]
os.makedirs(f"{build}/audio", exist_ok=True)
script = json.load(open(f"{HERE}/script.json"))
k = Kokoro(model, voices)
LEAD, GAP, TAIL = 0.6, 0.4, 0.9   # silence before first line, between lines, after last line
timeline = {"scenes": []}
for scene in script["scenes"]:
    parts, lines, t, sr = [], [], LEAD, 24000
    parts.append(np.zeros(int(LEAD * sr), dtype=np.float32))
    for i, line in enumerate(scene["lines"]):
        samples, sr = k.create(line.get("tts", line["en"]), voice=script["voice"], speed=1.0, lang="en-us")
        # trim leading/trailing near-silence so gaps are consistent
        idx = np.where(np.abs(samples) > 0.01)[0]
        samples = samples[max(0, idx[0] - 600): idx[-1] + 1200]
        dur = len(samples) / sr
        sf.write(f"{build}/audio/{scene['id']}-{i}.wav", samples, sr)
        lines.append({"start": round(t, 3), "end": round(t + dur, 3), "file": f"audio/{scene['id']}-{i}.wav", "en": line["en"], "ru": line["ru"]})
        parts.append(samples.astype(np.float32))
        t += dur
        gap = GAP if i < len(scene["lines"]) - 1 else TAIL
        parts.append(np.zeros(int(gap * sr), dtype=np.float32)); t += gap
    audio = np.concatenate(parts)
    sf.write(f"{build}/audio/{scene['id']}.wav", audio, sr)
    timeline["scenes"].append({"id": scene["id"], "duration": round(len(audio) / sr, 3), "lines": lines})
    print(scene["id"], round(len(audio) / sr, 1))
json.dump(timeline, open(f"{build}/timeline.json", "w"), indent=1, ensure_ascii=False)
print("total narration", round(sum(s["duration"] for s in timeline["scenes"]), 1))
