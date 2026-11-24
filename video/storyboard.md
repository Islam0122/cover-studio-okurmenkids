# Cover Studio — Storyboard

Format: 1920×1080, 30 fps, H.264 + AAC, English narration (neural TTS), soft English and Russian subtitle tracks, chapter markers.
Final length: **6:57**. All app footage is a real recording of Cover Studio running locally (`npm run build && npm run preview`), driven by `production/record.cjs`.

Visual language: dark navy title cards with a blue accent (Cover Studio brand colour #3B5BFD), Inter typography, 0.5 s crossfades,
lower-third captions that translate the Russian UI, highlight boxes for panels, and smooth camera zooms on details.

| Time | Scene | Shot | On screen |
| --- | --- | --- | --- |
| 0:00 | Opener | Title card | Cover Studio logo and wordmark, tagline “A document & cover design platform — built for OkurmenKids”, stack pill. Music only. |
| 0:05 | Introduction | 1 | Home page hero; slow camera push-in on the headline. Lower-third: “Cover Studio · OkurmenKids — A document & cover design platform”. |
| 0:14 | Introduction | 2 | Camera eases out; cursor hovers “Создать обложку” (Create a cover). Lower-third: “Template → your details → design → print-ready A4 file”. |
| 0:22 | Introduction | 3 | Smooth scroll down to the template gallery on the home page. |
| 0:28 | The problem it solves | Section card | “01 The problem it solves” — Professional documents without manual design |
| 0:31 | The problem it solves | 1 | Scroll to the feature strip (live preview, layered editor, PDF/PNG up to 384 DPI, autosave). Lower-third: “Schools · universities · training centers”. |
| 0:40 | The problem it solves | 2 | Cursor sweeps across the four features. Lower-third: “Laying out every document by hand is slow and inconsistent”. |
| 0:46 | The problem it solves | 3 | Scroll to “Как это работает” (How it works); the four steps are highlighted. Lower-third: “Enter the content once — the template composes the layout”. |
| 0:57 | The problem it solves | 4 | Lower-third: “UI language: Russian · some templates are in Kyrgyz”. |
| 1:04 | Template gallery | Section card | “02 Template gallery” — Categories · search · orientation |
| 1:08 | Template gallery | 1 | /templates page. Cursor runs along the six category chips with counts; page scrolls through the grid and back. |
| 1:18 | Template gallery | 2 | Zoom into the “Академ” thumbnail. Lower-third: “Drawn by the same Fabric.js renderer as the editor”. |
| 1:25 | Template gallery | 3 | Typing «сертификат» into the search field — the grid filters live. |
| 1:30 | Template gallery | 4 | Search cleared; chips Школа → IT-проекты → Сертификаты are clicked. |
| 1:35 | Template gallery | 5 | Orientation filter: All → Книжная (portrait) → Альбомная (landscape) → All. |
| 1:41 | Template gallery | 6 | Certificates chip, then the “Окурмэн Kids” card is opened — the editor loads. |
| 1:45 | Document editor | Section card | “03 The document editor” — Configuration · Fabric.js canvas · properties |
| 1:48 | Document editor | 1 | Editor overview. Lower-third: “Document editor — Three-column layout”. |
| 1:50 | Document editor | 2 | Left panel highlighted; tabs Данные → Шаблон → Стиль → Данные (Data, Template, Style). |
| 1:57 | Document editor | 3 | Canvas highlighted; zoom in twice, then “fit to screen”. |
| 2:05 | Document editor | 4 | Right panel highlighted; cursor on the Свойства (Properties) and Слои (Layers) tabs. |
| 2:09 | Document editor | 5 | The Тема (Topic) field is changed to «Веб-разработка»; zoom on the certificate line updating live. |
| 2:15 | Document editor | 6 | Logo selected on the canvas, dragged away and back, then resized with its corner handle. |
| 2:21 | Document editor | 7 | Properties panel: rotation set to −10°, opacity to 55 %, then both restored. |
| 2:28 | Document editor | 8 | Heading selected: font → Playfair Display, size 80 pt, weight Bold, colour #3B5BFD; zoom on the result. |
| 2:37 | Design capabilities | Section card | “04 Design capabilities” — Layers · shapes · history · themes · brand kit |
| 2:40 | Design capabilities | 1 | Layers tab highlighted; the “Описание” layer is hidden and shown again, the “Заголовок” layer locked and unlocked. |
| 2:47 | Design capabilities | 2 | Toolbar highlighted; a rectangle and an ellipse are added and dragged into place; an image (OkurmenKids logo) is inserted via the file picker. |
| 2:55 | Design capabilities | 3 | Rectangle selected: fill set to #3B5BFD, corner radius slider dragged. |
| 3:00 | Design capabilities | 4 | Undo button pressed until the added elements are gone, then Redo, then Ctrl+Z. |
| 3:08 | Design capabilities | 5 | Style tab: theme presets Emerald → Burgundy → Ocean → Violet recolour the whole certificate. |
| 3:16 | Design capabilities | 6 | Background switched to Градиент (gradient), angle slider dragged, then “Сброс” restores the template style. |
| 3:22 | Design capabilities | 7 | Data tab, brand section: built-in “Окурмэн Kids” logo preset; “Расписаться на экране” — a signature is drawn and saved onto the certificate. |
| 3:34 | Design capabilities | 8 | A scanned stamp image is uploaded to the Печать slot — the paper background is removed automatically; zoom on the stamp; brand-kit toggle clicked. |
| 3:45 | Export to PNG and PDF | Section card | “05 Export” — PDF · PNG · A4 · up to 384 DPI |
| 3:49 | Export to PNG and PDF | 1 | “Скачать” opens the download dialog; PNG and PDF options are toggled. |
| 3:56 | Export to PNG and PDF | 2 | A4 книжная (portrait) → the layout rebuilds behind the dialog → A4 альбомная; quality 192 → 384 → 300 DPI. |
| 4:06 | Export to PNG and PDF | 3 | Zoom on the pixel size line (e.g. 3508 × 2480 px · 297 × 210 mm); PNG is downloaded — toast “PNG скачан”. |
| 4:15 | Export to PNG and PDF | 4 | Dialog reopened, PDF selected and downloaded — toast “PDF скачан”. |
| 4:23 | Projects and autosave | Section card | “06 Projects & autosave” — LocalStorage persistence |
| 4:26 | Projects and autosave | 1 | Project renamed to «Сертификат — Веб-разработка» in the top bar; zoom on the status changing “Сохранение…” → “Сохранено”. |
| 4:33 | Projects and autosave | 2 | Back to “Мои проекты” (My Projects): three project cards; the card menu shows Open / Duplicate / Delete. |
| 4:41 | Projects and autosave | 3 | Page reload — projects are still there. A panel lists the real localStorage keys and the size of cover-studio:projects. |
| 4:51 | Projects and autosave | 4 | The renamed project is clicked and reopens in the editor. |
| 4:55 | Technology stack | Section card | “07 Technology & architecture” — How Cover Studio is built |
| 4:58 | Technology stack | 1 | Slide “Built on a modern front-end stack”: React 19, TypeScript, Vite, Tailwind CSS 4 tiles appear. |
| 5:06 | Technology stack | 2 | Zustand, Fabric.js 7, jsPDF and React Router tiles appear. |
| 5:17 | Architecture | 1 | Architecture slide slides in: “Template definitions — templates/” box + real excerpt of src/templates/index.ts (layout(W, H)). |
| 5:25 | Architecture | 2 | “Fields & theme tokens — types/template.ts” box highlights ({{studentName}}, $primary, $heading). |
| 5:34 | Architecture | 3 | “Editor state & project state” box + real excerpt of the EditorState interface. |
| 5:44 | Architecture | 4 | “Single Fabric.js renderer — utils/renderer.ts” box: editor canvas · gallery thumbnails · export. |
| 5:56 | Architecture | 5 | “PNG & PDF export — exportImage.ts · exportPdf.ts” box. |
| 6:02 | Deployment | Section card | “08 Deployment” — Vercel · Netlify · static hosting |
| 6:05 | Deployment | 1 | Slide “A static single-page app”. |
| 6:10 | Deployment | 2 | Vercel card (vercel.json rewrite) and Netlify card (public/_redirects) appear. |
| 6:21 | Deployment | 3 | Static hosts card (npm run build:static, hash routing) + note: no production URL is published in the repository. |
| 6:30 | Conclusion | 1 | Summary slide with six bullet points. |
| 6:40 | Conclusion | 2 | Remaining bullets: parametric templates and theme tokens; one renderer for canvas, thumbnails and export. |
| 6:49 | Conclusion | 3 | GitHub URL card and “Developed by Islam Duishobaev”; fade to black. |

## Audio

- Narration: Kokoro neural TTS (voice `af_heart`), one clip per sentence, each placed at the moment its on-screen action starts.
- Music: original ambient bed synthesised for this video in `production/build.py` (pads, arpeggio, sub bass, reverb) — no third-party samples; ducked under the voice.
- Mastering: loudness-normalised to −14 LUFS (YouTube reference), true peak −1.5 dBTP.

## Demo assets

- `production/assets/demo-stamp.png` — a synthetic “scanned stamp” created for the video to demonstrate automatic paper-background removal. It is not a real organisation seal.
- The inserted image is the OkurmenKids logo from the repository (`src/assets/brand/okurmen-kids-logo.png`).
