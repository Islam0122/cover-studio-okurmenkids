# YouTube description — Cover Studio

**Title:** Cover Studio — Design Documents in Minutes | React 19 + Fabric.js document editor (OkurmenKids)

**Description (paste below):**

```
Cover Studio is a browser-based platform for designing A4 document covers, certificates, reports and title slides, built for OkurmenKids. Pick a template, fill in your details once, fine-tune the design on a real canvas editor, and download a print-ready PDF or PNG — no account, everything runs in the browser.

This video walks through the real application and then explains how it is built.

▶ Source code: https://github.com/Islam0122/cover-studio-okurmenkids

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
• Document model with field placeholders ({{studentName}}) and theme tokens ($primary, $heading)
• Zustand stores for the editor (document, selection, history, zoom, preview) and projects (persisted)
• One Fabric.js renderer for the canvas, gallery thumbnails and exported files
• PNG export and lazy-loaded jsPDF export

DEPLOYMENT
Static single-page app: Vercel (vercel.json rewrite), Netlify (public/_redirects), or any static host via `npm run build:static` (hash routing).

CHAPTERS
0:00 Introduction
0:28 The problem it solves
1:04 Template gallery
1:45 Document editor
2:37 Design capabilities
3:45 Export to PNG and PDF
4:23 Projects and autosave
4:55 Technology stack
5:17 Architecture
6:02 Deployment
6:29 Conclusion

Developed by Islam Duishobaev
Narration: neural text-to-speech. Music: original, generated for this video.

#React #TypeScript #FabricJS #WebDevelopment #Frontend #Portfolio
```

**Tags:** Cover Studio, OkurmenKids, React 19, TypeScript, Vite, Tailwind CSS, Zustand, Fabric.js, jsPDF, document editor, certificate generator, cover page generator, canvas editor, frontend portfolio

**Subtitles:** upload `subtitles-en.srt` (English) and `subtitles-ru.srt` (Russian) in YouTube Studio → Subtitles. The MP4 also carries both as soft tracks.

**Thumbnail:** `thumbnail.png` (1280×720).

**Chapters** are taken from the description automatically (the first one starts at 0:00, as YouTube requires).
