// Records every clip of the presentation from the real running app (and slides.html) with the
// Chrome DevTools screencast, timed against the narration timeline produced by tts.py.
// Usage: node record.cjs <build_dir> [appUrl]
// Output: <build>/clips/<id>/NNNNN.jpg + frames.json, <build>/clips.json, <build>/exports/*
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const BUILD = path.resolve(process.argv[2] || 'build')
const APP = process.argv[3] || 'http://localhost:4173'
const HERE = __dirname
const SLIDES = 'file://' + path.join(HERE, 'slides.html')
const timeline = JSON.parse(fs.readFileSync(path.join(BUILD, 'timeline.json'), 'utf8'))
const script = JSON.parse(fs.readFileSync(path.join(HERE, 'script.json'), 'utf8'))
const LOGO = path.join(HERE, '..', '..', 'src', 'assets', 'brand', 'okurmen-kids-logo.png')
const STAMP = path.join(HERE, 'assets', 'demo-stamp.png')
const CARD_SECONDS = 3.0

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)

let page, cdp
let mx = 800, my = 450
const ov = (fn, ...args) => page.evaluate(([f, a]) => window.__ov && window.__ov[f](...a), [fn, args]).catch(() => {})

async function moveTo(x, y, ms = 450) {
  const sx = mx, sy = my, t0 = Date.now()
  for (;;) {
    const k = Math.min(1, (Date.now() - t0) / ms)
    await page.mouse.move(sx + (x - sx) * ease(k), sy + (y - sy) * ease(k))
    if (k >= 1) break
    await sleep(12)
  }
  mx = x; my = y
}
async function center(loc) {
  await loc.scrollIntoViewIfNeeded()
  const b = await loc.boundingBox()
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, b }
}
async function clickAt(x, y, ms = 450) {
  await moveTo(x, y, ms); await sleep(90)
  await page.mouse.down(); await sleep(60); await page.mouse.up(); await sleep(110)
}
async function click(loc, ms = 450) { const c = await center(loc); await clickAt(c.x, c.y, ms) }
async function hover(loc, ms = 450) { const c = await center(loc); await moveTo(c.x, c.y, ms) }
async function drag(x1, y1, x2, y2, ms = 750) {
  await moveTo(x1, y1, 400); await sleep(90); await page.mouse.down(); await sleep(90)
  await moveTo(x2, y2, ms); await sleep(90); await page.mouse.up(); await sleep(110)
}
async function typeInto(loc, text, delay = 65) {
  await click(loc)
  await page.keyboard.press('Control+A')
  await page.keyboard.type(text, { delay })
}
async function slider(loc, frac) {
  const { b } = await center(loc)
  const y = b.y + b.height / 2
  await drag(b.x + 6 + (b.width - 12) * 0.5, y, b.x + 6 + (b.width - 12) * frac, y, 700)
}
async function smoothScroll(loc, block = 'center') {
  await loc.evaluate((e, bl) => e.scrollIntoView({ behavior: 'smooth', block: bl }), block)
  await sleep(900)
}

// ---- screencast recorder -------------------------------------------------------------
const clips = []
class Clip {
  constructor(id, kind, scene) {
    this.id = id; this.kind = kind; this.scene = scene
    this.dir = path.join(BUILD, 'clips', id)
    fs.rmSync(this.dir, { recursive: true, force: true }); fs.mkdirSync(this.dir, { recursive: true })
    this.frames = []
    this.starts = []
  }
  async start() {
    this.handler = async (f) => {
      const n = String(this.frames.length).padStart(5, '0') + '.jpg'
      fs.writeFileSync(path.join(this.dir, n), Buffer.from(f.data, 'base64'))
      this.frames.push({ file: n, t: f.metadata.timestamp })
      cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {})
    }
    cdp.on('Page.screencastFrame', this.handler)
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
    this.t0 = Date.now() / 1000
  }
  /** Wait until narration line i of this scene starts (never earlier). */
  async cue(i) {
    // planned start, shifted by however late the previous sentence started
    const prev = i > 0 ? this.starts[i - 1] - this.scene.lines[i - 1].start : 0
    const planned = this.scene.lines[i].start + prev
    const wait = this.t0 + planned - Date.now() / 1000
    if (wait > 0) await sleep(wait * 1000)
    else if (wait < -0.3) console.log(`    ${this.id} cue ${i}: ${(-wait).toFixed(1)}s late`)
    this.starts[i] = Math.max(planned, Date.now() / 1000 - this.t0)
  }
  async at(sec) { const wait = this.t0 + sec - Date.now() / 1000; if (wait > 0) await sleep(wait * 1000) }
  async stop(minDuration) {
    if (this.scene && this.starts.length) {
      const n = this.starts.length - 1, L = this.scene.lines[n]
      minDuration = Math.max(minDuration, this.starts[n] + (L.end - L.start) + 0.9)
    }
    await this.at(minDuration)
    await sleep(250)
    const t1 = Date.now() / 1000
    await cdp.send('Page.stopScreencast')
    cdp.off('Page.screencastFrame', this.handler)
    const frames = this.frames.map((f) => ({ file: f.file, t: Math.max(0, f.t - this.t0) }))
    const duration = Math.max(minDuration, t1 - this.t0)
    fs.writeFileSync(path.join(this.dir, 'frames.json'), JSON.stringify({ duration, frames }))
    const late = this.scene ? duration - this.scene.duration : 0
    if (this.scene) while (this.starts.length < this.scene.lines.length) this.starts.push(this.scene.lines[this.starts.length].start)
    console.log(`  ${this.id}: ${frames.length} frames, ${duration.toFixed(1)}s${late > 0.5 ? ` (actions ran ${late.toFixed(1)}s past narration)` : ''}`)
    clips.push({ id: this.id, kind: this.kind, duration, scene: this.scene ? this.scene.id : null, lineStarts: this.scene ? this.starts.map((x) => +x.toFixed(3)) : [] })
  }
}
const sceneTl = (id) => timeline.scenes.find((s) => s.id === id)
const sceneDef = (id) => script.scenes.find((s) => s.id === id)

async function card(id) {
  const c = sceneDef(id).card
  if (!c) return
  const q = new URLSearchParams({ s: 'card', num: c.num, title: c.title, sub: c.sub })
  await page.goto(`${SLIDES}?${q}`); await sleep(400)
  const clip = new Clip('card-' + id, 'card', null); await clip.start()
  await clip.at(0.15); await page.evaluate(() => window.step(0))
  await clip.at(0.7); await page.evaluate(() => window.step(1))
  await clip.stop(CARD_SECONDS)
}

async function slideScene(id, slide, stepsAtLines) {
  const tl = sceneTl(id)
  await page.goto(`${SLIDES}?s=${slide}`); await sleep(500)
  const clip = new Clip(id, 'scene', tl); await clip.start()
  for (let i = 0; i < tl.lines.length; i++) {
    await clip.cue(i)
    if (stepsAtLines[i] !== undefined) await page.evaluate((n) => window.step(n), stepsAtLines[i])
  }
  await clip.stop(tl.duration)
}

// ---- app scenes ---------------------------------------------------------------------
const S = {}
let projectUrl = null

S.opener = async () => {
  await page.goto(`${SLIDES}?s=opener`); await sleep(400)
  const clip = new Clip('opener', 'card', null); await clip.start()
  await clip.at(0.2); await page.evaluate(() => window.step(0))
  await clip.at(1.3); await page.evaluate(() => window.step(1))
  await clip.stop(4.2)
}

S.intro = async () => {
  const tl = sceneTl('intro')
  await page.goto(APP + '/'); await sleep(3000)
  await page.mouse.move(980, 620); mx = 980; my = 620
  const clip = new Clip('intro', 'scene', tl); await clip.start()
  await clip.cue(0)
  await ov('caption', 'Cover Studio · OkurmenKids', 'A document & cover design platform')
  await ov('zoom', 1.18, 420, 330, 7000)
  await moveTo(760, 560, 2500)
  await clip.cue(1)
  await ov('zoom', 1, 0, 0, 1400); await sleep(1200)
  await ov('caption', 'Workflow', 'Template → your details → design → print-ready A4 file')
  await hover(page.getByRole('link', { name: 'Создать обложку' }).first(), 1200)
  await clip.cue(2)
  await ov('hideCaption')
  await smoothScroll(page.locator('#templates'), 'start')
  await moveTo(900, 640, 1500)
  await clip.stop(tl.duration)
}

S.overview = async () => {
  const tl = sceneTl('overview')
  await page.goto(APP + '/'); await sleep(2500); await page.mouse.move(mx, my)
  const clip = new Clip('overview', 'scene', tl); await clip.start()
  await clip.cue(0)
  await ov('caption', 'Who it is for', 'Schools · universities · training centers')
  await smoothScroll(page.getByText('Живой предпросмотр', { exact: true }), 'center')
  await clip.cue(1)
  await ov('caption', 'The problem', 'Laying out every document by hand is slow and inconsistent')
  await moveTo(400, 470, 900); await moveTo(1250, 470, 2600)
  await clip.cue(2)
  await ov('caption', 'The solution', 'Enter the content once — the template composes the layout')
  const steps = page.getByRole('heading', { name: 'Как это работает' })
  await smoothScroll(steps, 'center')
  const box = await page.locator('section', { has: steps }).locator('> div').boundingBox()
  if (box) await ov('highlight', box.x - 8, box.y - 8, box.width + 16, box.height + 16)
  await moveTo(box ? box.x + 150 : 300, box ? box.y + box.height / 2 : 500, 900)
  await moveTo(box ? box.x + box.width - 150 : 1200, box ? box.y + box.height / 2 : 500, 3000)
  await clip.cue(3)
  await ov('hideHighlight')
  await ov('caption', 'Note', 'UI language: Russian · some templates are in Kyrgyz')
  await clip.stop(tl.duration)
}

S.gallery = async () => {
  const tl = sceneTl('gallery')
  await page.goto(APP + '/templates'); await sleep(3500); await page.mouse.move(mx, my)
  const clip = new Clip('gallery', 'scene', tl); await clip.start()
  await clip.cue(0)
  await ov('caption', 'Template gallery', '12 templates · 6 categories')
  await moveTo(230, 323, 600); await moveTo(1080, 323, 2000)
  await page.evaluate(() => scrollBy({ top: 420, behavior: 'smooth' })); await sleep(1500)
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'smooth' })); await sleep(900)
  await clip.cue(1)
  await ov('caption', 'Live thumbnails', 'Drawn by the same Fabric.js renderer as the editor')
  const card = page.getByText('Академ', { exact: true }).first()
  const c = await center(card)
  await moveTo(c.x, c.y - 150, 800)
  await ov('cursor', false); await ov('zoom', 1.7, c.x, c.y - 150, 1100); await sleep(2300)
  await ov('zoom', 1, 0, 0, 900); await sleep(900); await ov('cursor', true)
  await clip.cue(2)
  await ov('caption', 'Search', 'Names, descriptions and tags · «сертификат» = certificate')
  await typeInto(page.getByLabel('Поиск шаблонов'), 'сертификат', 110)
  await clip.cue(3)
  await ov('caption', 'Categories', 'Chips narrow the list · each shows its template count')
  await click(page.getByLabel('Поиск шаблонов')); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace')
  await click(page.getByRole('button', { name: /^Школа/ })); await sleep(600)
  await click(page.getByRole('button', { name: /^IT-проекты/ })); await sleep(600)
  await click(page.getByRole('button', { name: /^Сертификаты/ })); await sleep(400)
  await clip.cue(4)
  await ov('caption', 'Orientation', 'All · Portrait (книжная) · Landscape (альбомная)')
  await click(page.getByRole('button', { name: /^Все шаблоны/ }), 350); await sleep(250)
  await click(page.getByRole('radio', { name: 'Книжная' })); await sleep(1000)
  await click(page.getByRole('radio', { name: 'Альбомная' })); await sleep(1000)
  await click(page.getByRole('radio', { name: 'Все', exact: true })); await sleep(200)
  await clip.cue(5)
  await ov('caption', 'Open in editor', 'OkurmenKids certificate')
  await click(page.getByRole('button', { name: /^Сертификаты/ })); await sleep(500)
  await click(page.getByText('Окурмэн Kids', { exact: true }).first(), 700)
  await page.waitForURL(/\/editor\//); await sleep(1800)
  projectUrl = page.url()
  await clip.stop(tl.duration)
}

// editor coordinates (CSS px, 1600x900 viewport, landscape A4 fitted at 83%)
const P = { logo: [657, 261], heading: [657, 381], topic: [656, 548], empty: [1290, 150] }

S.editor = async () => {
  const tl = sceneTl('editor')
  await openProject()
  const clip = new Clip('editor', 'scene', tl); await clip.start()
  await clip.cue(0)
  await ov('caption', 'Document editor', 'Three-column layout')
  await moveTo(806, 494, 1200)
  await clip.cue(1)
  await ov('highlight', 4, 60, 292, 836)
  await ov('caption', 'Left · Configuration', 'Data · Template · Style')
  await click(page.getByRole('tab', { name: 'Шаблон' })); await sleep(1300)
  await click(page.getByRole('tab', { name: 'Стиль' })); await sleep(1000)
  await click(page.getByRole('tab', { name: 'Данные' }))
  await clip.cue(2)
  await ov('highlight', 304, 60, 1004, 836)
  await ov('caption', 'Center · Fabric.js canvas', 'Exact A4 proportions · zoom · fit to screen')
  await click(page.getByRole('button', { name: 'Увеличить' })); await sleep(600)
  await click(page.getByRole('button', { name: 'Увеличить' }), 300); await sleep(900)
  await click(page.getByRole('button', { name: 'Вписать в экран' })); await sleep(600)
  await clip.cue(3)
  await ov('highlight', 1316, 60, 280, 836)
  await ov('caption', 'Right · Properties & layers', 'Precise control of the selected element')
  await hover(page.getByRole('tab', { name: 'Свойства' })); await sleep(400)
  await hover(page.getByRole('tab', { name: /Слои/ }))
  await clip.cue(4)
  await ov('hideHighlight')
  await ov('caption', 'Data → canvas', 'Topic: «Программатика» → «Веб-разработка» (Web development)')
  await typeInto(page.getByLabel('Тема', { exact: true }), 'Веб-разработка', 80)
  await ov('cursor', false); await ov('zoom', 1.75, P.topic[0], P.topic[1], 900); await sleep(1900)
  await ov('zoom', 1, 0, 0, 800); await sleep(800); await ov('cursor', true)
  await clip.cue(5)
  await ov('caption', 'Canvas', 'Select · drag · resize with handles')
  await clickAt(...P.logo, 600); await sleep(200)
  await drag(...P.logo, 470, 300, 850); await sleep(200)
  await drag(470, 300, ...P.logo, 800); await sleep(200)
  await drag(P.logo[0] + 50, P.logo[1] + 50, P.logo[0] + 64, P.logo[1] + 64, 550)
  await clip.cue(6)
  await ov('caption', 'Properties', 'Position · size · rotation · opacity')
  await click(page.getByRole('tab', { name: 'Свойства' }), 400)
  await typeInto(page.getByLabel('∠'), '-10', 100); await page.keyboard.press('Enter'); await sleep(800)
  await typeInto(page.getByLabel('α'), '55', 100); await page.keyboard.press('Enter'); await sleep(800)
  await typeInto(page.getByLabel('∠'), '0', 80); await page.keyboard.press('Enter'); await sleep(150)
  await typeInto(page.getByLabel('α'), '100', 80); await page.keyboard.press('Enter'); await sleep(150)
  await clip.cue(7)
  await ov('caption', 'Text', 'Font family · size · weight · color')
  await clickAt(...P.heading, 600); await sleep(300)
  const font = page.getByLabel('Шрифт', { exact: true })
  await hover(font); await font.selectOption({ label: 'Playfair Display' }); await sleep(700)
  await typeInto(page.getByLabel('pt', { exact: true }), '80', 100); await page.keyboard.press('Enter'); await sleep(400)
  const weight = page.getByLabel('Насыщенность', { exact: true })
  await hover(weight); await weight.selectOption({ label: 'Bold' }).catch(() => {}); await sleep(400)
  await typeInto(page.getByLabel('HEX', { exact: true }), '#3B5BFD', 80); await page.keyboard.press('Enter'); await sleep(300)
  await ov('cursor', false); await ov('zoom', 1.5, P.heading[0], P.heading[1], 900); await sleep(1700)
  await ov('zoom', 1, 0, 0, 800); await sleep(700); await ov('cursor', true)
  await clip.stop(tl.duration)
}

const layerCount = async () => {
  const t = await page.getByRole('tab', { name: /Слои/ }).innerText()
  return Number((t.match(/\d+/) || ['0'])[0])
}

S.design = async () => {
  const tl = sceneTl('design')
  await openProject(); await clickAt(...P.empty, 300)
  const clip = new Clip('design', 'scene', tl); await clip.start()
  const base = await layerCount()
  await clip.cue(0)
  await ov('caption', 'Layers', 'Every element · reorder · hide · lock')
  await click(page.getByRole('tab', { name: /Слои/ }))
  await ov('highlight', 1316, 104, 280, 520)
  const row = (name) => page.locator('ul li', { has: page.getByText(name, { exact: true }) }).first()
  const r1 = await center(row('Описание'))
  await moveTo(1440, r1.y, 500); await sleep(200)
  await click(row('Описание').getByRole('button', { name: 'Скрыть', exact: true }), 300); await sleep(900)
  await click(row('Описание').getByRole('button', { name: 'Показать', exact: true }), 250); await sleep(500)
  await click(row('Заголовок').getByRole('button', { name: 'Заблокировать', exact: true }), 400); await sleep(700)
  await click(row('Заголовок').getByRole('button', { name: 'Разблокировать', exact: true }), 250); await sleep(300)
  await ov('hideHighlight')
  await clip.cue(1)
  await ov('caption', 'Toolbar', 'Add text · rectangles · ellipses · lines · images · tech logos')
  await ov('highlight', 466, 68, 680, 42)
  await click(page.getByRole('button', { name: 'Добавить: Прямоугольник' })); await sleep(350)
  await drag(806, 494, 560, 640, 700)
  await click(page.getByRole('button', { name: 'Добавить: Эллипс' })); await sleep(350)
  await drag(806, 494, 1120, 470, 700)
  const chooser = page.waitForEvent('filechooser')
  await click(page.getByRole('button', { name: 'Добавить: Изображение' }))
  await (await chooser).setFiles(LOGO); await sleep(900)
  await ov('hideHighlight')
  await clip.cue(2)
  await ov('caption', 'Shapes', 'Fill · stroke · corner radius')
  await clickAt(560, 640, 500); await sleep(150)
  await click(page.getByRole('tab', { name: 'Свойства' }), 400)
  await typeInto(page.getByLabel('Заливка: HEX'), '#3B5BFD', 70); await page.keyboard.press('Enter'); await sleep(250)
  await slider(page.getByRole('slider', { name: 'Скругление' }), 0.95); await sleep(300)
  await clip.cue(3)
  await ov('caption', 'History', 'Undo · Redo — Ctrl+Z / Ctrl+Shift+Z')
  const undo = page.getByRole('button', { name: 'Отменить (Ctrl+Z)' })
  await hover(undo, 700)
  for (let i = 0; i < 40 && (await layerCount()) > base; i++) { await click(undo, 100); await sleep(170) }
  await sleep(250)
  await click(page.getByRole('button', { name: 'Повторить (Ctrl+Shift+Z)' }), 350); await sleep(700)
  await clickAt(...P.empty, 500); await page.keyboard.press('Control+Z'); await sleep(300)
  await clip.cue(4)
  await ov('caption', 'Theme presets', 'Templates use theme colors — one click recolors everything')
  await click(page.getByRole('tab', { name: 'Стиль' }))
  for (const name of ['Emerald', 'Burgundy', 'Ocean', 'Violet']) { await click(page.locator(`button[title="${name}"]`), 400); await sleep(650) }
  await clip.cue(5)
  await ov('caption', 'Background', 'Solid color · gradient with angle · photo')
  await click(page.getByRole('radio', { name: 'Градиент' })); await sleep(800)
  await slider(page.getByRole('slider', { name: 'Угол' }), 0.15); await sleep(500)
  await click(page.locator('button[title="Вернуть стиль шаблона"]')); await sleep(300)
  await clip.cue(6)
  await ov('caption', 'Brand assets', 'Built-in OkurmenKids logo · signature drawn on screen')
  await click(page.getByRole('tab', { name: 'Данные' }))
  await smoothScroll(page.getByRole('button', { name: 'Логотип, печать и подпись' }), 'start')
  await hover(page.getByRole('button', { name: 'Окурмэн Kids', exact: true }), 500); await sleep(300)
  await click(page.getByRole('button', { name: 'Расписаться на экране' })); await sleep(500)
  const pad = await center(page.getByLabel('Поле для подписи'))
  const { b } = pad
  const pts = []
  for (let i = 0; i <= 60; i++) {
    const k = i / 60
    pts.push([b.x + b.width * (0.18 + 0.62 * k), b.y + b.height * (0.55 - 0.18 * Math.sin(k * Math.PI * 5) * (1 - k * 0.4))])
  }
  await moveTo(pts[0][0], pts[0][1], 500); await page.mouse.down()
  for (const [x, y] of pts) { await page.mouse.move(x, y); mx = x; my = y; await sleep(8) }
  await page.mouse.up(); await sleep(100)
  await drag(b.x + b.width * 0.22, b.y + b.height * 0.68, b.x + b.width * 0.78, b.y + b.height * 0.64, 400)
  await click(page.getByRole('button', { name: 'Сохранить подпись' })); await sleep(700)
  await clip.cue(7)
  await ov('caption', 'Brand kit', 'Stamp upload: paper background removed automatically')
  const sealChooser = page.waitForEvent('filechooser')
  await click(page.getByRole('button', { name: /Фон бумаги удаляется автоматически/ }))
  await (await sealChooser).setFiles(STAMP); await sleep(1300)
  await ov('cursor', false); await ov('zoom', 1.8, 740, 720, 1000); await sleep(2600)
  await ov('zoom', 1, 0, 0, 900); await sleep(900); await ov('cursor', true)
  await click(page.locator('[title="Подставлять во все новые проекты"]').first()); await sleep(800)
  await clip.stop(tl.duration)
}

S.export = async () => {
  const tl = sceneTl('export')
  fs.mkdirSync(path.join(BUILD, 'exports'), { recursive: true })
  await openProject(); await clickAt(...P.empty, 300)
  const clip = new Clip('export', 'scene', tl); await clip.start()
  await clip.cue(0)
  await ov('caption', 'Export', 'PDF for printing · PNG for sharing')
  await click(page.getByRole('button', { name: 'Скачать', exact: true })); await sleep(700)
  await click(page.getByRole('button', { name: /Картинка без потерь/ })); await sleep(800)
  await click(page.getByRole('button', { name: /Для печати и отправки/ })); await sleep(500)
  await clip.cue(1)
  await ov('caption', 'Format & quality', 'A4 portrait / landscape · 192 · 300 · 384 DPI')
  await click(page.getByRole('radio', { name: 'A4 книжная' })); await sleep(1800)
  await click(page.getByRole('radio', { name: 'A4 альбомная' })); await sleep(1000)
  await click(page.getByRole('radio', { name: /192/ })); await sleep(700)
  await click(page.getByRole('radio', { name: /384/ })); await sleep(700)
  await click(page.getByRole('radio', { name: /300/ })); await sleep(500)
  await clip.cue(2)
  await ov('caption', 'Output size', 'Exact pixels · same renderer as the canvas')
  const dims = await center(page.getByText(/px · 297 × 210/))
  await ov('cursor', false); await ov('zoom', 2, dims.x, dims.y, 800); await sleep(1800)
  await ov('zoom', 1, 0, 0, 700); await sleep(700); await ov('cursor', true)
  await click(page.getByRole('button', { name: /Картинка без потерь/ })); await sleep(400)
  let dl = page.waitForEvent('download')
  await click(page.getByRole('button', { name: 'Скачать PNG' }))
  await (await dl).saveAs(path.join(BUILD, 'exports', 'cover-studio-export.png')); await sleep(1000)
  await clip.cue(3)
  await ov('caption', 'PDF', 'Generated in the browser with jsPDF (lazy-loaded)')
  await click(page.getByRole('button', { name: 'Скачать', exact: true })); await sleep(700)
  await click(page.getByRole('button', { name: /Для печати и отправки/ })); await sleep(500)
  dl = page.waitForEvent('download')
  await click(page.getByRole('button', { name: 'Скачать PDF' }))
  await (await dl).saveAs(path.join(BUILD, 'exports', 'cover-studio-export.pdf')); await sleep(1200)
  await clip.stop(tl.duration)
}

/** Off camera: create two more projects so the projects page has real content, then reopen ours. */
async function openProject() {
  if (!projectUrl) throw new Error('run gallery first')
  await page.goto(projectUrl); await sleep(2600); await page.mouse.move(mx, my)
}
async function seedProjects() {
  for (const name of ['Академ', 'Стартап']) {
    await page.goto(APP + '/templates'); await sleep(1500)
    await page.getByText(name, { exact: true }).first().click()
    await page.waitForURL(/\/editor\//); await sleep(1500)
  }
  await openProject()
}

S.projects = async () => {
  const tl = sceneTl('projects')
  await seedProjects()
  const clip = new Clip('projects', 'scene', tl); await clip.start()
  await clip.cue(0)
  await ov('caption', 'Autosave', 'No save button — every change is stored automatically')
  const nameInput = page.locator('header input[aria-label="Название проекта"]')
  await click(nameInput)
  await ov('cursor', false); await ov('zoom', 1.9, 330, 30, 900); await sleep(900)
  await page.keyboard.press('Control+A'); await page.keyboard.type('Сертификат — Веб-разработка', { delay: 80 })
  await sleep(1800); await ov('zoom', 1, 0, 0, 800); await sleep(800); await ov('cursor', true)
  await clip.cue(1)
  await ov('caption', 'My Projects', 'Sorted by last edit · open · duplicate · delete')
  await click(page.locator('a[title="К проектам"]')); await sleep(1500)
  await click(page.getByRole('button', { name: 'Действия с проектом' }).first()); await sleep(1800)
  await page.keyboard.press('Escape'); await clickAt(1500, 840, 500); await sleep(400)
  await clip.cue(2)
  await ov('caption', 'LocalStorage', 'Projects survive a page reload')
  await page.reload(); await sleep(1800)
  const info = await page.evaluate(() => {
    const raw = localStorage.getItem('cover-studio:projects') || '{}'
    const n = (JSON.parse(raw).state?.projects || []).length
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('cover-studio')).sort()
    return { n, kb: (raw.length / 1024).toFixed(1), keys }
  })
  await ov('caption', 'LocalStorage', 'Projects survive a page reload')
  await ov('info', `<b>localStorage</b> after reload<br>${info.keys.map((k) => '· ' + k).join('<br>')}<br><br><b>cover-studio:projects</b> → ${info.n} projects · ${info.kb} KB`)
  await moveTo(700, 480, 1200); await sleep(1800)
  await clip.cue(3)
  await ov('hideInfo')
  await ov('caption', 'Reopen', 'Continue exactly where you left off')
  await click(page.getByRole('button', { name: /^Открыть «Сертификат — Веб-разработка»/ }), 900)
  await page.waitForURL(/\/editor\//); await sleep(2200)
  await clip.stop(tl.duration)
}

S.stack = () => slideScene('stack', 'stack', [0, 1])
S.architecture = () => slideScene('architecture', 'architecture', [0, 1, 2, 3, 4])
S.deploy = () => slideScene('deploy', 'deploy', [0, 1, 2])
S.outro = () => slideScene('outro', 'outro', [0, 1, 2])

// ---- main ---------------------------------------------------------------------------
const ORDER = ['opener', 'intro', 'overview', 'gallery', 'editor', 'design', 'export', 'projects', 'stack', 'architecture', 'deploy', 'outro']

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.2, acceptDownloads: true, locale: 'ru-RU' })
  await context.addInitScript({ path: path.join(HERE, 'overlay.js') })
  page = await context.newPage()
  cdp = await context.newCDPSession(page)
  // START=<scene id> resumes: earlier clips are kept from the previous run's clips.json
  const start = process.env.START ? ORDER.indexOf(process.env.START) : 0
  const prevFile = path.join(BUILD, 'clips.json')
  const prev = start > 0 && fs.existsSync(prevFile) ? JSON.parse(fs.readFileSync(prevFile, 'utf8')) : []
  if (start > 0) {
    const keep = new Set(ORDER.slice(0, start).flatMap((id) => [id, 'card-' + id]))
    clips.push(...prev.filter((c) => keep.has(c.id)))
    if (start > ORDER.indexOf('gallery')) {
      await page.goto(APP + '/templates'); await sleep(2000)
      await page.getByText('Окурмэн Kids', { exact: true }).first().click()
      await page.waitForURL(/\/editor\//); await sleep(1500); projectUrl = page.url()
    }
  }
  for (const id of ORDER.slice(start)) {
    if (id !== 'opener') await card(id)
    console.log('recording', id)
    await S[id]()
    await ov('hideCaption'); await ov('hideHighlight'); await ov('hideInfo')
  }
  fs.writeFileSync(path.join(BUILD, 'clips.json'), JSON.stringify(clips, null, 1))
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
