# Cover Studio — Narration script (English)

Voice-over as rendered in the video. Timestamps are positions in `cover-studio-presentation.mp4`.

## 0:00 — Introduction

**[0:05]** This is Cover Studio, built for OkurmenKids: a modern platform for designing document covers, certificates, reports and title slides.

**[0:14]** Everything runs in the browser. You pick a template, fill in your details, fine-tune the design, and download a print-ready A4 file.

**[0:22]** In the next few minutes, we'll walk through the real application, and then look at how it's built.

## 0:28 — The problem it solves

*Section card: 01 · The problem it solves — Professional documents without manual design*

**[0:31]** Schools, universities and training centers produce a lot of documents: coursework title pages, project covers, certificates and reports.

**[0:40]** Making each one by hand in a graphics editor is slow, and the results are rarely consistent.

**[0:46]** Cover Studio solves this with parametric templates. You enter the content once — the topic, the author, the supervisor and the institution — and the layout is composed for you.

**[0:57]** The interface itself is in Russian, and some templates are in Kyrgyz, so we'll add English captions as we go.

## 1:04 — Template gallery

*Section card: 02 · Template gallery — Categories · search · orientation*

**[1:08]** The template gallery contains twelve templates across six categories: university, school, IT projects, certificates, reports and presentations.

**[1:18]** Every thumbnail is rendered live by the same engine the editor uses, so what you see here is exactly what you get.

**[1:25]** Search matches template names, descriptions and tags. Let's search for certificates.

**[1:30]** Category chips narrow the list, and each one shows how many templates it contains.

**[1:35]** There's also an orientation filter, for portrait or landscape A4 sheets.

**[1:41]** Let's open the OkurmenKids certificate in the editor.

## 1:45 — Document editor

*Section card: 03 · The document editor — Configuration · Fabric.js canvas · properties*

**[1:48]** The editor uses a three-column layout.

**[1:50]** On the left is the configuration panel, with tabs for the document data, the template, and the style.

**[1:57]** In the center is a Fabric.js canvas, drawn in exact A4 proportions, with zoom controls and a fit-to-screen button.

**[2:05]** On the right are the properties of the selected element, and the layers list.

**[2:09]** When I change the topic in the form, every text block that uses that field updates instantly.

**[2:15]** Elements on the canvas can be selected, dragged into place, and resized with their handles.

**[2:21]** The properties panel gives precise control over position, size, rotation and opacity.

**[2:28]** For text, I can change the font family, the size, the weight and the color.

## 2:37 — Design capabilities

*Section card: 04 · Design capabilities — Layers · shapes · history · themes · brand kit*

**[2:40]** The layers tab lists every element on the page. Each layer can be reordered, hidden, or locked.

**[2:47]** The toolbar above the canvas adds new elements: text, rectangles, ellipses, lines, images and technology logos.

**[2:55]** Shapes have their own fill, stroke and corner radius settings.

**[3:00]** Every action goes into the history, so undo and redo work with the buttons or with Ctrl+Z.

**[3:08]** In the style tab, color presets recolor the whole document at once, because templates reference theme colors instead of fixed values.

**[3:16]** The background can be a solid color, a gradient with an adjustable angle, or a photo.

**[3:22]** The OkurmenKids logo is built in, and a signature can be drawn right on the screen with a mouse, a finger or a stylus.

**[3:34]** When a stamp or a signature scan is uploaded, the paper background is removed automatically, and the logo, stamp and signature can be saved to a brand kit for every new project.

## 3:45 — Export to PNG and PDF

*Section card: 05 · Export — PDF · PNG · A4 · up to 384 DPI*

**[3:49]** When the design is ready, the download dialog offers two formats: PDF for printing, and PNG for sharing.

**[3:56]** The sheet can be A4 portrait or A4 landscape, and there are three resolutions: 192, 300 and 384 DPI.

**[4:06]** The dialog shows the exact output size in pixels, and because export uses the same renderer as the canvas, the file matches the screen.

**[4:15]** The PDF is generated right in the browser with jsPDF, which is loaded only when it's needed.

## 4:23 — Projects and autosave

*Section card: 06 · Projects & autosave — LocalStorage persistence*

**[4:26]** There's no save button. The editor autosaves every change, and the status in the top bar confirms it.

**[4:33]** All projects appear on the My Projects page, sorted by when they were last edited, and each one can be duplicated or deleted.

**[4:41]** They're stored in the browser's local storage, so they survive a page reload. Uploaded images are compressed and stored once, and projects reference them by ID.

**[4:51]** Clicking a project reopens it exactly where you left off.

## 4:55 — Technology stack

*Section card: 07 · Technology & architecture — How Cover Studio is built*

**[4:58]** Under the hood, Cover Studio is built with React 19, TypeScript and Vite, and styled with Tailwind CSS 4.

**[5:06]** State lives in Zustand stores, the canvas is powered by Fabric.js 7, PDFs come from jsPDF, and routing uses React Router.

## 5:17 — Architecture

**[5:17]** Template definitions are functions of the page size, so switching orientation rebuilds the layout instead of stretching it.

**[5:25]** Text stores field placeholders, while colors and fonts are theme tokens. That's why the form and the color presets can update everything at once.

**[5:34]** The editor store holds the open document, the selection, the undo history, zoom and preview mode. The project store persists projects to local storage.

**[5:44]** A single Fabric renderer draws the editor canvas, the gallery thumbnails and the exported files. It only recreates objects whose content changed, so the selection is never lost.

**[5:56]** Finally, two small utilities handle PNG export and lazy-loaded PDF export.

## 6:02 — Deployment

*Section card: 08 · Deployment — Vercel · Netlify · static hosting*

**[6:05]** Cover Studio is a static single-page app, so deployment is simple.

**[6:10]** For Vercel, a rewrite rule in vercel.json sends every route to index.html. For Netlify, the same rule lives in the _redirects file.

**[6:21]** For hosts without rewrites, such as GitHub Pages, a separate static build switches to hash-based routing with relative paths.

## 6:29 — Conclusion

**[6:30]** That's Cover Studio: a template-driven document designer with a real canvas editor, print-quality export and autosaved projects, all running in the browser.

**[6:40]** Technically, it shows how one renderer, parametric templates and theme tokens keep a complex editor consistent and predictable.

**[6:49]** The source code is on GitHub, at github.com/Islam0122/cover-studio-okurmenkids. Thanks for watching!
