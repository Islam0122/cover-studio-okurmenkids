# Video production pipeline

Everything in `video/` is generated from the real running app by the scripts in this folder.

| File | Role |
| --- | --- |
| `script.json` | Single source of truth: scenes, English narration (+ TTS spelling), Russian translation, section cards |
| `tts.py` | Kokoro neural TTS → one WAV per sentence + `timeline.json` |
| `overlay.js` | Injected into recorded pages: visible cursor, click ripples, lower-third captions, highlight boxes, camera zoom |
| `record.cjs` | Drives the real app with Playwright and records each clip with the Chrome DevTools screencast, cued to the narration |
| `slides.html` | Section cards and the stack / architecture / deployment / summary slides |
| `build.py` | Encodes clips, crossfades, places narration, synthesises and ducks the music, writes SRT + chapters, muxes the MP4 |
| `docs.py` | Writes `script-en.md`, `script-ru.md`, `storyboard.md`, `youtube-description.md` from the final timings |
| `screenshots.cjs`, `thumbnail.html` | Clean screenshots and the 1280×720 thumbnail |
| `assets/demo-stamp.png` | Synthetic “scanned stamp” used to demo background removal (not a real seal) |

## Rebuild

Requirements: Node 22 + Playwright Chromium, Python 3 with `numpy`, `soundfile`, `kokoro-onnx`, `Pillow`, and ffmpeg.
The Kokoro model files come from https://github.com/thewh1teagle/kokoro-onnx/releases (`kokoro-v1.0.onnx`, `voices-v1.0.bin`).

```bash
npm ci && npm run build && npx vite preview --port 4173 &   # from the repository root
cd video/production
python3 tts.py ../../.video-build kokoro-v1.0.onnx voices-v1.0.bin
node record.cjs ../../.video-build                     # START=<scene> resumes from a scene
python3 build.py ../../.video-build ..
python3 docs.py ../../.video-build ..
node screenshots.cjs ../../.video-build/shots          # then render thumbnail.html with shot.png next to it
```
