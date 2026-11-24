"""Generate the written deliverables from the final timings (build/timing.json, written by build.py).

Usage: python3 docs.py <build_dir> <out_dir>
Writes script-en.md, script-ru.md, storyboard.md and youtube-description.md.
"""
import json, os, sys

build, out = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
script = json.load(open(f"{HERE}/script.json"))
scenes = {s["id"]: s for s in script["scenes"]}
timing = json.load(open(f"{build}/timing.json"))
clips = {c["id"]: c for c in timing["clips"]}
REPO = "https://github.com/Islam0122/cover-studio-okurmenkids"


def mmss(t):
    t = int(round(t))
    return f"{t // 60}:{t % 60:02d}"


def scene_span(sid):
    """Start (including its section card) and end of a scene in the final video."""
    first = clips.get("card-" + sid) or clips[sid]
    if sid == "intro":
        first = clips["opener"]
    c = clips[sid]
    return first["offset"], c["offset"] + c["duration"]


# What is on screen for each narration line (mirrors record.cjs; captions are the lower-thirds shown in the video)
SHOTS = {
    "intro": [
        "Home page hero; slow camera push-in on the headline. Lower-third: “Cover Studio · OkurmenKids — A document & cover design platform”.",
        "Camera eases out; cursor hovers “Создать обложку” (Create a cover). Lower-third: “Template → your details → design → print-ready A4 file”.",
        "Smooth scroll down to the template gallery on the home page.",
    ],
    "overview": [
        "Scroll to the feature strip (live preview, layered editor, PDF/PNG up to 384 DPI, autosave). Lower-third: “Schools · universities · training centers”.",
        "Cursor sweeps across the four features. Lower-third: “Laying out every document by hand is slow and inconsistent”.",
        "Scroll to “Как это работает” (How it works); the four steps are highlighted. Lower-third: “Enter the content once — the template composes the layout”.",
        "Lower-third: “UI language: Russian · some templates are in Kyrgyz”.",
    ],
    "gallery": [
        "/templates page. Cursor runs along the six category chips with counts; page scrolls through the grid and back.",
        "Zoom into the “Академ” thumbnail. Lower-third: “Drawn by the same Fabric.js renderer as the editor”.",
        "Typing «сертификат» into the search field — the grid filters live.",
        "Search cleared; chips Школа → IT-проекты → Сертификаты are clicked.",
        "Orientation filter: All → Книжная (portrait) → Альбомная (landscape) → All.",
        "Certificates chip, then the “Окурмэн Kids” card is opened — the editor loads.",
    ],
    "editor": [
        "Editor overview. Lower-third: “Document editor — Three-column layout”.",
        "Left panel highlighted; tabs Данные → Шаблон → Стиль → Данные (Data, Template, Style).",
        "Canvas highlighted; zoom in twice, then “fit to screen”.",
        "Right panel highlighted; cursor on the Свойства (Properties) and Слои (Layers) tabs.",
        "The Тема (Topic) field is changed to «Веб-разработка»; zoom on the certificate line updating live.",
        "Logo selected on the canvas, dragged away and back, then resized with its corner handle.",
        "Properties panel: rotation set to −10°, opacity to 55 %, then both restored.",
        "Heading selected: font → Playfair Display, size 80 pt, weight Bold, colour #3B5BFD; zoom on the result.",
    ],
    "design": [
        "Layers tab highlighted; the “Описание” layer is hidden and shown again, the “Заголовок” layer locked and unlocked.",
        "Toolbar highlighted; a rectangle and an ellipse are added and dragged into place; an image (OkurmenKids logo) is inserted via the file picker.",
        "Rectangle selected: fill set to #3B5BFD, corner radius slider dragged.",
        "Undo button pressed until the added elements are gone, then Redo, then Ctrl+Z.",
        "Style tab: theme presets Emerald → Burgundy → Ocean → Violet recolour the whole certificate.",
        "Background switched to Градиент (gradient), angle slider dragged, then “Сброс” restores the template style.",
        "Data tab, brand section: built-in “Окурмэн Kids” logo preset; “Расписаться на экране” — a signature is drawn and saved onto the certificate.",
        "A scanned stamp image is uploaded to the Печать slot — the paper background is removed automatically; zoom on the stamp; brand-kit toggle clicked.",
    ],
    "export": [
        "“Скачать” opens the download dialog; PNG and PDF options are toggled.",
        "A4 книжная (portrait) → the layout rebuilds behind the dialog → A4 альбомная; quality 192 → 384 → 300 DPI.",
        "Zoom on the pixel size line (e.g. 3508 × 2480 px · 297 × 210 mm); PNG is downloaded — toast “PNG скачан”.",
        "Dialog reopened, PDF selected and downloaded — toast “PDF скачан”.",
    ],
    "projects": [
        "Project renamed to «Сертификат — Веб-разработка» in the top bar; zoom on the status changing “Сохранение…” → “Сохранено”.",
        "Back to “Мои проекты” (My Projects): three project cards; the card menu shows Open / Duplicate / Delete.",
        "Page reload — projects are still there. A panel lists the real localStorage keys and the size of cover-studio:projects.",
        "The renamed project is clicked and reopens in the editor.",
    ],
    "stack": [
        "Slide “Built on a modern front-end stack”: React 19, TypeScript, Vite, Tailwind CSS 4 tiles appear.",
        "Zustand, Fabric.js 7, jsPDF and React Router tiles appear.",
    ],
    "architecture": [
        "Architecture slide slides in: “Template definitions — templates/” box + real excerpt of src/templates/index.ts (layout(W, H)).",
        "“Fields & theme tokens — types/template.ts” box highlights ({{studentName}}, $primary, $heading).",
        "“Editor state & project state” box + real excerpt of the EditorState interface.",
        "“Single Fabric.js renderer — utils/renderer.ts” box: editor canvas · gallery thumbnails · export.",
        "“PNG & PDF export — exportImage.ts · exportPdf.ts” box.",
    ],
    "deploy": [
        "Slide “A static single-page app”.",
        "Vercel card (vercel.json rewrite) and Netlify card (public/_redirects) appear.",
        "Static hosts card (npm run build:static, hash routing) + note: no production URL is published in the repository.",
    ],
    "outro": [
        "Summary slide with six bullet points.",
        "Remaining bullets: parametric templates and theme tokens; one renderer for canvas, thumbnails and export.",
        "GitHub URL card and “Developed by Islam Duishobaev”; fade to black.",
    ],
}

# ---- scripts ---------------------------------------------------------------------------
for lang, title, note in (
    ("en", "Narration script (English)", "Voice-over as rendered in the video. Timestamps are positions in `cover-studio-presentation.mp4`."),
    ("ru", "Сценарий озвучки (русский перевод)", "Перевод английской озвучки; используется для русских субтитров. Таймкоды — позиции в `cover-studio-presentation.mp4`."),
):
    md = [f"# Cover Studio — {title}", "", note, ""]
    cues = iter(timing["cues"])
    for s in script["scenes"]:
        a, b = scene_span(s["id"])
        md += [f"## {mmss(a)} — {s['chapter']}", ""]
        if s.get("card"):
            md += [f"*Section card: {s['card']['num']} · {s['card']['title']} — {s['card']['sub']}*", ""]
        for _ in s["lines"]:
            cue = next(cues)
            md += [f"**[{mmss(cue['start'])}]** {cue[lang]}", ""]
    open(f"{out}/script-{lang}.md", "w", encoding="utf-8").write("\n".join(md))

# ---- storyboard ------------------------------------------------------------------------
md = [
    "# Cover Studio — Storyboard",
    "",
    "Format: 1920×1080, 30 fps, H.264 + AAC, English narration (neural TTS), soft English and Russian subtitle tracks, chapter markers.",
    f"Final length: **{mmss(timing['duration'])}**. All app footage is a real recording of Cover Studio running locally (`npm run build && npm run preview`), driven by `production/record.cjs`.",
    "",
    "Visual language: dark navy title cards with a blue accent (Cover Studio brand colour #3B5BFD), Inter typography, 0.5 s crossfades,",
    "lower-third captions that translate the Russian UI, highlight boxes for panels, and smooth camera zooms on details.",
    "",
    "| Time | Scene | Shot | On screen |",
    "| --- | --- | --- | --- |",
]
o = clips["opener"]
md.append(f"| {mmss(o['offset'])} | Opener | Title card | Cover Studio logo and wordmark, tagline “A document & cover design platform — built for OkurmenKids”, stack pill. Music only. |")
cues = iter(timing["cues"])
for s in script["scenes"]:
    if s.get("card"):
        c = clips["card-" + s["id"]]
        md.append(f"| {mmss(c['offset'])} | {s['chapter']} | Section card | “{s['card']['num']} {s['card']['title']}” — {s['card']['sub']} |")
    for i, line in enumerate(s["lines"]):
        cue = next(cues)
        md.append(f"| {mmss(cue['start'])} | {s['chapter']} | {i + 1} | {SHOTS[s['id']][i]} |")
md += [
    "",
    "## Audio",
    "",
    "- Narration: Kokoro neural TTS (voice `af_heart`), one clip per sentence, each placed at the moment its on-screen action starts.",
    "- Music: original ambient bed synthesised for this video in `production/build.py` (pads, arpeggio, sub bass, reverb) — no third-party samples; ducked under the voice.",
    "- Mastering: loudness-normalised to −14 LUFS (YouTube reference), true peak −1.5 dBTP.",
    "",
    "## Demo assets",
    "",
    "- `production/assets/demo-stamp.png` — a synthetic “scanned stamp” created for the video to demonstrate automatic paper-background removal. It is not a real organisation seal.",
    "- The inserted image is the OkurmenKids logo from the repository (`src/assets/brand/okurmen-kids-logo.png`).",
]
open(f"{out}/storyboard.md", "w", encoding="utf-8").write("\n".join(md) + "\n")

# ---- YouTube description -----------------------------------------------------------------
chap = "\n".join(f"{mmss(c['start'])} {c['title']}" for c in timing["chapters"])
desc = f"""# YouTube description — Cover Studio

**Title:** Cover Studio — Design Documents in Minutes | React 19 + Fabric.js document editor (OkurmenKids)

**Description (paste below):**

```
Cover Studio is a browser-based platform for designing A4 document covers, certificates, reports and title slides, built for OkurmenKids. Pick a template, fill in your details once, fine-tune the design on a real canvas editor, and download a print-ready PDF or PNG — no account, everything runs in the browser.

This video walks through the real application and then explains how it is built.

▶ Source code: {REPO}

FEATURES
• 12 templates in 6 categories: university, school, IT projects, certificates, reports, presentations
• Search by name, description and tags; portrait / landscape filter
• Three-column editor: data · template · style panel, Fabric.js canvas in exact A4 proportions, properties and layers
• Select, drag, resize and rotate elements; edit position, size, rotation, opacity, font, size, weight and colour
• Add text, rectangles, ellipses, lines, images and technology logos
• Layers with order, visibility and lock; undo / redo (Ctrl+Z / Ctrl+Shift+Z)
• Theme colour presets, heading/body fonts, solid, gradient or photo backgrounds
• Built-in OkurmenKids logo, on-screen signature, stamp upload with automatic paper-background removal, reusable brand kit
• Export to PNG and PDF — A4 portrait or landscape, 192 / 300 / 384 DPI
• Projects autosave to LocalStorage and can be reopened, duplicated or deleted

TECH STACK
React 19 · TypeScript · Vite · Tailwind CSS 4 · Zustand · Fabric.js 7 · jsPDF · React Router · Lucide React

ARCHITECTURE
• Parametric template definitions — layout(W, H) is rebuilt on orientation change
• Document model with field placeholders ({{{{studentName}}}}) and theme tokens ($primary, $heading)
• Zustand stores for the editor (document, selection, history, zoom, preview) and projects (persisted)
• One Fabric.js renderer for the canvas, gallery thumbnails and exported files
• PNG export and lazy-loaded jsPDF export

DEPLOYMENT
Static single-page app: Vercel (vercel.json rewrite), Netlify (public/_redirects), or any static host via `npm run build:static` (hash routing).

CHAPTERS
{chap}

Developed by Islam Duishobaev
Narration: neural text-to-speech. Music: original, generated for this video.

#React #TypeScript #FabricJS #WebDevelopment #Frontend #Portfolio
```

**Tags:** Cover Studio, OkurmenKids, React 19, TypeScript, Vite, Tailwind CSS, Zustand, Fabric.js, jsPDF, document editor, certificate generator, cover page generator, canvas editor, frontend portfolio

**Subtitles:** upload `subtitles-en.srt` (English) and `subtitles-ru.srt` (Russian) in YouTube Studio → Subtitles. The MP4 also carries both as soft tracks.

**Thumbnail:** `thumbnail.png` (1280×720).

**Chapters** are taken from the description automatically (the first one starts at 0:00, as YouTube requires).
"""
open(f"{out}/youtube-description.md", "w", encoding="utf-8").write(desc)
print("docs written")
