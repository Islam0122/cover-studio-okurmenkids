import type {
  CoverDocument,
  CoverElement,
  Fields,
  FieldKey,
  ImageElement,
  LayoutContext,
  Orientation,
  PageSize,
  Palette,
  ShapeElement,
  TechElement,
  TextElement,
} from '../types/template'

/** A4 at 96 DPI. Everything in a document is laid out in these units. */
export const A4: PageSize = { width: 794, height: 1123 }

export function pageSize(orientation: Orientation): PageSize {
  return orientation === 'portrait' ? A4 : { width: A4.height, height: A4.width }
}

export function layoutContext(orientation: Orientation): LayoutContext {
  return { ...pageSize(orientation), orientation }
}

export function uid(prefix = 'el'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`
}

export const FIELD_KEYS: FieldKey[] = [
  'institution',
  'department',
  'workType',
  'title',
  'subtitle',
  'subject',
  'studentLabel',
  'studentName',
  'studentGroup',
  'teacherLabel',
  'teacherName',
  'teacherTitle',
  'city',
  'year',
]

export const EMPTY_FIELDS: Fields = {
  institution: '',
  department: '',
  workType: '',
  title: '',
  subtitle: '',
  subject: '',
  studentLabel: 'Выполнил(а):',
  studentName: '',
  studentGroup: '',
  teacherLabel: 'Проверил(а):',
  teacherName: '',
  teacherTitle: '',
  city: 'Бишкек',
  year: String(new Date().getFullYear()),
  logo: null,
  image: null,
  seal: null,
  signature: null,
  tech: [],
}

/* ---------------- element factories (used by templates and the editor) ---------------- */

type Box = Pick<CoverElement, 'x' | 'y' | 'width' | 'height'>

const base = (name: string, box: Box) => ({
  id: uid(),
  name,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  ...box,
})

export function text(
  name: string,
  content: string,
  box: Box,
  style: Partial<Omit<TextElement, 'type' | 'content'>> = {},
): TextElement {
  return {
    ...base(name, box),
    type: 'text',
    content,
    fontFamily: '$body',
    fontSize: 16,
    fontWeight: 400,
    italic: false,
    uppercase: false,
    color: '$text',
    align: 'left',
    lineHeight: 1.25,
    letterSpacing: 0,
    ...style,
  }
}

export function shape(
  name: string,
  kind: ShapeElement['shape'],
  box: Box,
  style: Partial<Omit<ShapeElement, 'type' | 'shape'>> = {},
): ShapeElement {
  return {
    ...base(name, box),
    type: 'shape',
    shape: kind,
    fill: kind === 'line' ? 'transparent' : '$primary',
    stroke: kind === 'line' ? '$primary' : 'transparent',
    strokeWidth: kind === 'line' ? 2 : 0,
    radius: 0,
    ...style,
  }
}

export function image(
  name: string,
  box: Box,
  style: Partial<Omit<ImageElement, 'type'>> = {},
): ImageElement {
  return {
    ...base(name, box),
    type: 'image',
    fit: 'contain',
    radius: 0,
    ...style,
  }
}

export function techRow(name: string, box: Box, style: Partial<Omit<TechElement, 'type'>> = {}): TechElement {
  return {
    ...base(name, box),
    type: 'tech',
    iconSize: 64,
    gap: 40,
    labels: 'top',
    labelSize: 14,
    labelColor: '$text',
    fontFamily: '$body',
    align: 'center',
    ...style,
  }
}

/* ---------------- resolution of tokens and placeholders ---------------- */

const PLACEHOLDER = /\{\{(\w+)\}\}/g

export function resolveText(content: string, fields: Fields): string {
  return content.replace(PLACEHOLDER, (_, key: string) => {
    const value = (fields as unknown as Record<string, unknown>)[key]
    return typeof value === 'string' ? value : ''
  })
}

/** If the whole content is a single placeholder, return the field it is bound to. */
export function singleBinding(content: string): FieldKey | null {
  const match = /^\{\{(\w+)\}\}$/.exec(content.trim())
  if (!match) return null
  return (FIELD_KEYS as string[]).includes(match[1]) ? (match[1] as FieldKey) : null
}

export function resolveColor(value: string, palette: Palette): string {
  if (value.startsWith('$')) {
    const key = value.slice(1) as keyof Palette
    return palette[key] ?? '#000000'
  }
  return value
}

export function resolveFont(value: string, doc: Pick<CoverDocument, 'fonts'>): string {
  if (value === '$heading') return doc.fonts.heading
  if (value === '$body') return doc.fonts.body
  return value
}

export function resolveImageSrc(el: ImageElement, fields: Fields): string | null {
  if (el.slot) return fields[el.slot]
  return el.src ?? null
}

/** Adds alpha to a hex color. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return hex
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export function cloneDocument(doc: CoverDocument): CoverDocument {
  return structuredClone(doc)
}

/** Scales user-added elements when the page orientation changes. */
export function remapElement(el: CoverElement, from: PageSize, to: PageSize): CoverElement {
  const sx = to.width / from.width
  const sy = to.height / from.height
  const s = Math.min(sx, sy)
  const cx = (el.x + el.width / 2) * sx
  const cy = (el.y + el.height / 2) * sy
  const width = el.width * s
  const height = el.height * s
  const next = { ...el, x: cx - width / 2, y: cy - height / 2, width, height }
  if (next.type === 'text') next.fontSize = Math.round(next.fontSize * s)
  return next
}
