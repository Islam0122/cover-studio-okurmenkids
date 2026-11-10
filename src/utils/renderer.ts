import { Ellipse, FabricImage, FabricObject, Gradient, Rect, StaticCanvas, Textbox } from 'fabric'
import type { CoverDocument, CoverElement, ImageElement, ShapeElement, TechElement, TextElement } from '../types/template'
import { getTech } from '../templates/tech'
import { FIELD_LABELS } from './fieldLabels'
import { resolveAsset } from '../store/assetStore'
import { pageSize, resolveColor, resolveFont, resolveImageSrc, resolveText } from './document'

export type RenderMode = 'edit' | 'export'

export interface RenderOptions {
  mode: RenderMode
  /** Pixel density used for rasterised images (match the export multiplier). */
  imageScale: number
}

// Fabric 7 defaults to centred origins; we position everything by centre, which
// also makes rotation pivot around the middle of the element.
FabricObject.ownDefaults.originX = 'center'
FabricObject.ownDefaults.originY = 'center'

/* ------------------------------------------------------------------ fonts */

const fontLoads = new Map<string, Promise<unknown>>()

function loadFont(family: string, weight: number, italic: boolean): Promise<unknown> {
  const key = `${family}|${weight}|${italic}`
  let p = fontLoads.get(key)
  if (!p) {
    const spec = `${italic ? 'italic ' : ''}${weight} 32px "${family}"`
    p = document.fonts.load(spec, 'АаБбЯяAaZz0123').catch(() => undefined)
    fontLoads.set(key, p)
  }
  return p
}

/** Resolves once every font face the document uses is ready for canvas measurement. */
export async function ensureFonts(doc: CoverDocument): Promise<void> {
  const jobs: Promise<unknown>[] = []
  for (const el of doc.elements) {
    if (el.type === 'text') jobs.push(loadFont(resolveFont(el.fontFamily, doc), el.fontWeight, el.italic))
    else if (el.type === 'tech') jobs.push(loadFont(resolveFont(el.fontFamily, doc), 700, false))
  }
  await Promise.all(jobs)
}

/* ------------------------------------------------------------------ images */

const imageCache = new Map<string, Promise<HTMLImageElement>>()
const rasterCache = new Map<string, Promise<HTMLCanvasElement>>()
const RASTER_CACHE_LIMIT = 24
/** Export-resolution rasters are large; keep them out of the cache so memory is freed after a download. */
const MAX_CACHED_SCALE = 2.5

function loadImage(ref: string): Promise<HTMLImageElement> {
  const src = resolveAsset(ref)
  if (!src) return Promise.reject(new Error('Изображение не найдено в хранилище'))
  let p = imageCache.get(src)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Не удалось загрузить изображение'))
      img.src = src
    })
    imageCache.set(src, p)
    p.catch(() => imageCache.delete(src))
  }
  return p
}

function roundedPath(ctx: CanvasRenderingContext2D, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, rr)
}

/** Draws an image into a canvas of the element's size, applying fit and corner radius. */
function rasterise(src: string, w: number, h: number, fit: ImageElement['fit'], radius: number, scale: number) {
  const key = `${src.length}:${src.slice(-48)}:${src.slice(0, 64)}|${Math.round(w)}x${Math.round(h)}|${fit}|${radius}|${scale}`
  let p = rasterCache.get(key)
  if (!p) {
    p = loadImage(src).then((img) => {
      const cw = Math.max(1, Math.round(w * scale))
      const ch = Math.max(1, Math.round(h * scale))
      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingQuality = 'high'
      roundedPath(ctx, cw, ch, radius * scale)
      ctx.clip()
      const iw = img.naturalWidth || img.width || cw
      const ih = img.naturalHeight || img.height || ch
      const ratio = fit === 'cover' ? Math.max(cw / iw, ch / ih) : Math.min(cw / iw, ch / ih)
      const dw = iw * ratio
      const dh = ih * ratio
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
      return canvas
    })
    if (scale > MAX_CACHED_SCALE) return p
    rasterCache.set(key, p)
    p.catch(() => rasterCache.delete(key))
    if (rasterCache.size > RASTER_CACHE_LIMIT) {
      const first = rasterCache.keys().next().value
      if (first) rasterCache.delete(first)
    }
  }
  return p
}

function placeholderCanvas(w: number, h: number, label: string, radius: number): HTMLCanvasElement {
  const s = 2
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w * s))
  canvas.height = Math.max(1, Math.round(h * s))
  const ctx = canvas.getContext('2d')!
  ctx.scale(s, s)
  ctx.beginPath()
  ctx.roundRect(1, 1, w - 2, h - 2, Math.min(Math.max(radius, 8), w / 2, h / 2))
  ctx.fillStyle = 'rgba(59, 91, 253, 0.06)'
  ctx.fill()
  ctx.setLineDash([6, 5])
  ctx.lineWidth = 1.5
  ctx.strokeStyle = 'rgba(59, 91, 253, 0.55)'
  ctx.stroke()
  const size = Math.max(9, Math.min(13, w / 7))
  ctx.font = `600 ${size}px Manrope, Inter, sans-serif`
  ctx.fillStyle = 'rgba(59, 91, 253, 0.85)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, w / 2, h / 2, w - 8)
  return canvas
}

/* ------------------------------------------------------------------ objects */

function common(el: CoverElement, mode: RenderMode) {
  return {
    left: el.x + el.width / 2,
    top: el.y + el.height / 2,
    angle: el.rotation,
    opacity: el.opacity,
    visible: el.visible,
    selectable: mode === 'edit' && !el.locked,
    evented: mode === 'edit' && !el.locked,
    hasControls: !el.locked,
    lockMovementX: el.locked,
    lockMovementY: el.locked,
    objectCaching: true,
  }
}

function emptyTextPreview(el: TextElement): string {
  return el.content.replace(/\{\{(\w+)\}\}/g, (_, key: string) => `[${FIELD_LABELS[key as keyof typeof FIELD_LABELS] ?? key}]`)
}

function createText(el: TextElement, doc: CoverDocument, mode: RenderMode): FabricObject | null {
  let value = resolveText(el.content, doc.fields)
  let ghost = false
  if (!value.trim()) {
    if (mode === 'export') return null
    value = emptyTextPreview(el)
    ghost = true
  }
  if (el.uppercase) value = value.toLocaleUpperCase('ru')
  const tb = new Textbox(value, {
    ...common(el, mode),
    width: el.width,
    fontFamily: resolveFont(el.fontFamily, doc),
    fontSize: el.fontSize,
    fontWeight: el.fontWeight,
    fontStyle: el.italic ? 'italic' : 'normal',
    fill: resolveColor(el.color, doc.palette),
    textAlign: el.align,
    lineHeight: el.lineHeight,
    charSpacing: el.letterSpacing,
    opacity: ghost ? el.opacity * 0.35 : el.opacity,
    editable: mode === 'edit',
    splitByGrapheme: false,
    lockScalingFlip: true,
  })
  // place by the box's top edge, whatever height the text wraps to
  tb.set({ top: el.y + tb.height / 2 })
  return tb
}

function createShape(el: ShapeElement, doc: CoverDocument, mode: RenderMode): FabricObject {
  const fill = resolveColor(el.fill, doc.palette)
  const stroke = resolveColor(el.stroke, doc.palette)
  if (el.shape === 'line') {
    const thickness = Math.max(1, el.strokeWidth)
    return new Rect({
      ...common(el, mode),
      top: el.y + el.height / 2,
      width: el.width,
      height: thickness,
      fill: stroke,
      strokeWidth: 0,
      lockScalingY: true,
      padding: 6,
    })
  }
  const style = {
    ...common(el, mode),
    fill: fill === 'transparent' ? 'rgba(0,0,0,0)' : fill,
    stroke: el.strokeWidth > 0 && stroke !== 'transparent' ? stroke : undefined,
    strokeWidth: el.strokeWidth > 0 && stroke !== 'transparent' ? el.strokeWidth : 0,
    strokeUniform: true,
  }
  if (el.shape === 'ellipse') {
    return new Ellipse({ ...style, rx: el.width / 2, ry: el.height / 2 })
  }
  return new Rect({ ...style, width: el.width, height: el.height, rx: el.radius, ry: el.radius })
}

async function createImage(el: ImageElement, doc: CoverDocument, opts: RenderOptions): Promise<FabricObject | null> {
  const src = resolveImageSrc(el, doc.fields)
  let source: HTMLCanvasElement
  if (src) {
    try {
      source = await rasterise(src, el.width, el.height, el.fit, el.radius, opts.imageScale)
    } catch {
      if (opts.mode === 'export') return null
      source = placeholderCanvas(el.width, el.height, 'Ошибка загрузки', el.radius)
    }
  } else {
    if (opts.mode === 'export') return null
    const label = { logo: 'Логотип', seal: 'Печать', signature: 'Подпись', image: 'Изображение' }[el.slot ?? 'image']
    source = placeholderCanvas(el.width, el.height, label, el.radius)
  }
  return new FabricImage(source, {
    ...common(el, opts.mode),
    scaleX: el.width / source.width,
    scaleY: el.height / source.height,
  })
}

/* ------------------------------------------------------------------ technology row */

const iconCache = new Map<string, Promise<HTMLImageElement>>()

/**
 * Loads an SVG icon with explicit dimensions: Firefox refuses to draw an SVG
 * without width/height into a canvas, and Devicon files only carry a viewBox.
 */
function loadIcon(src: string): Promise<HTMLImageElement> {
  let p = iconCache.get(src)
  if (!p) {
    p = fetch(src)
      .then((r) => r.text())
      .then((svg) => {
        const sized = svg.replace(/<svg\b([^>]*)>/, (m, attrs: string) =>
          /\swidth=/.test(attrs) ? m : `<svg${attrs} width="512" height="512">`,
        )
        return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`)
      })
    iconCache.set(src, p)
    p.catch(() => iconCache.delete(src))
  }
  return p
}

async function createTech(el: TechElement, doc: CoverDocument, opts: RenderOptions): Promise<FabricObject | null> {
  const items = (doc.fields.tech ?? []).map(getTech).filter((t): t is NonNullable<typeof t> => !!t)
  if (!items.length) {
    if (opts.mode === 'export') return null
    const source = placeholderCanvas(el.width, el.height, 'Технологии: выберите в «Данные»', 8)
    return new FabricImage(source, { ...common(el, opts.mode), scaleX: el.width / source.width, scaleY: el.height / source.height })
  }
  const icons = await Promise.all(items.map((t) => loadIcon(t.src).catch(() => null)))
  const s = Math.min(4, opts.imageScale)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(el.width * s))
  canvas.height = Math.max(1, Math.round(el.height * s))
  const ctx = canvas.getContext('2d')!
  ctx.scale(s, s)

  const labelH = el.labels === 'none' ? 0 : el.labelSize * 1.5
  // shrink the row to fit the box if needed
  const n = items.length
  const natural = n * el.iconSize + (n - 1) * el.gap
  const k = Math.min(1, el.width / natural, el.height / (el.iconSize + labelH))
  const size = el.iconSize * k
  const gap = el.gap * k
  const lh = labelH * k
  const rowW = n * size + (n - 1) * gap
  const x0 = el.align === 'left' ? 0 : el.align === 'right' ? el.width - rowW : (el.width - rowW) / 2
  const y0 = (el.height - size - lh) / 2
  const font = resolveFont(el.fontFamily, doc)
  ctx.font = `700 ${el.labelSize * k}px "${font}", Montserrat, sans-serif`
  ctx.fillStyle = resolveColor(el.labelColor, doc.palette)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.imageSmoothingQuality = 'high'
  items.forEach((t, i) => {
    const x = x0 + i * (size + gap)
    const iconY = el.labels === 'top' ? y0 + lh : y0
    const img = icons[i]
    if (img) ctx.drawImage(img, x, iconY, size, size)
    if (el.labels !== 'none') {
      const ly = el.labels === 'top' ? y0 + lh / 2 - 2 * k : y0 + size + lh / 2 + 2 * k
      ctx.fillText(t.name, x + size / 2, ly, size + gap * 0.9)
    }
  })
  return new FabricImage(canvas, { ...common(el, opts.mode), scaleX: el.width / canvas.width, scaleY: el.height / canvas.height })
}

export async function createElementObject(
  el: CoverElement,
  doc: CoverDocument,
  opts: RenderOptions,
): Promise<FabricObject | null> {
  if (opts.mode === 'export' && !el.visible) return null
  switch (el.type) {
    case 'text':
      return createText(el, doc, opts.mode)
    case 'shape':
      return createShape(el, doc, opts.mode)
    case 'image':
      return createImage(el, doc, opts)
    case 'tech':
      return createTech(el, doc, opts)
  }
}

function gradientFor(angle: number, from: string, to: string) {
  const rad = (angle * Math.PI) / 180
  const dx = Math.sin(rad) / 2
  const dy = -Math.cos(rad) / 2
  return new Gradient({
    type: 'linear',
    gradientUnits: 'percentage',
    coords: { x1: 0.5 - dx, y1: 0.5 - dy, x2: 0.5 + dx, y2: 0.5 + dy },
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  })
}

export async function createBackgroundObjects(doc: CoverDocument, opts: RenderOptions): Promise<FabricObject[]> {
  const { width, height } = pageSize(doc.orientation)
  const bg = doc.background
  const color = resolveColor(bg.color, doc.palette)
  const base = {
    left: width / 2,
    top: height / 2,
    width,
    height,
    selectable: false,
    evented: false,
    hoverCursor: 'default',
    strokeWidth: 0,
  }
  const rect = new Rect({
    ...base,
    fill: bg.type === 'gradient' ? gradientFor(bg.angle, color, resolveColor(bg.color2, doc.palette)) : color,
  })
  const objects: FabricObject[] = [rect]
  if (bg.type === 'image' && bg.image) {
    try {
      const canvas = await rasterise(bg.image, width, height, 'cover', 0, opts.imageScale)
      objects.push(
        new FabricImage(canvas, {
          left: width / 2,
          top: height / 2,
          scaleX: width / canvas.width,
          scaleY: height / canvas.height,
          opacity: bg.imageOpacity,
          selectable: false,
          evented: false,
        }),
      )
    } catch {
      /* ignore broken background image */
    }
  }
  return objects
}

/* ------------------------------------------------------------------ export */

export async function renderToDataUrl(
  doc: CoverDocument,
  { multiplier, format = 'png', quality = 0.95 }: { multiplier: number; format?: 'png' | 'jpeg'; quality?: number },
): Promise<string> {
  await ensureFonts(doc)
  const { width, height } = pageSize(doc.orientation)
  const el = document.createElement('canvas')
  const canvas = new StaticCanvas(el, { width, height, enableRetinaScaling: false, renderOnAddRemove: false })
  const opts: RenderOptions = { mode: 'export', imageScale: Math.min(4, Math.max(1, multiplier)) }
  try {
    const bg = await createBackgroundObjects(doc, opts)
    const objects = await Promise.all(doc.elements.map((e) => createElementObject(e, doc, opts)))
    canvas.add(...bg, ...objects.filter((o): o is FabricObject => !!o))
    canvas.renderAll()
    return canvas.toDataURL({ format, quality, multiplier })
  } finally {
    canvas.dispose()
  }
}

/** Fill colour behind the page for quick previews before the canvas is ready. */
export function previewFill(doc: CoverDocument): string {
  const c = resolveColor(doc.background.color, doc.palette)
  return doc.background.type === 'gradient'
    ? `linear-gradient(${doc.background.angle}deg, ${c}, ${resolveColor(doc.background.color2, doc.palette)})`
    : c
}

