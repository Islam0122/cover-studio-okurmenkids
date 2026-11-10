export type Orientation = 'portrait' | 'landscape'

export type CategoryId = 'university' | 'school' | 'it' | 'certificate' | 'report' | 'presentation'

/** Color value: a hex string, or a palette token such as "$primary". */
export type ColorValue = string

export type PaletteKey = 'primary' | 'accent' | 'text' | 'muted' | 'surface'
export type Palette = Record<PaletteKey, string>

/** Font value: a family name, or "$heading" / "$body". */
export type FontValue = string
export interface Fonts {
  heading: string
  body: string
}

export type FieldKey =
  | 'institution'
  | 'department'
  | 'workType'
  | 'title'
  | 'subtitle'
  | 'subject'
  | 'studentLabel'
  | 'studentName'
  | 'studentGroup'
  | 'teacherLabel'
  | 'teacherName'
  | 'teacherTitle'
  | 'city'
  | 'year'

export type ImageSlot = 'logo' | 'image' | 'seal' | 'signature'

export interface Fields extends Record<FieldKey, string> {
  logo: string | null
  image: string | null
  /** Stamp or signature, uploaded by the user per project. */
  seal: string | null
  /** Hand-drawn or scanned signature. */
  signature: string | null
  /** Technology logos, by catalog id, in display order. */
  tech: string[]
}

interface ElementBase {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  /** True for elements the user added (kept when the template layout is rebuilt). */
  custom?: boolean
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export interface TextElement extends ElementBase {
  type: 'text'
  /** May contain {{fieldKey}} placeholders. */
  content: string
  fontFamily: FontValue
  fontSize: number
  fontWeight: number
  italic: boolean
  uppercase: boolean
  color: ColorValue
  align: TextAlign
  lineHeight: number
  letterSpacing: number
}

export type ImageFit = 'cover' | 'contain'

export interface ImageElement extends ElementBase {
  type: 'image'
  /** Bound to a form slot, or holds its own source. */
  slot?: ImageSlot
  src?: string | null
  fit: ImageFit
  radius: number
}

export type ShapeKind = 'rect' | 'ellipse' | 'line'

export interface ShapeElement extends ElementBase {
  type: 'shape'
  shape: ShapeKind
  fill: ColorValue
  stroke: ColorValue
  strokeWidth: number
  radius: number
}

export type TechLabels = 'top' | 'bottom' | 'none'

/** A row of technology logos taken from the project's tech list. */
export interface TechElement extends ElementBase {
  type: 'tech'
  iconSize: number
  gap: number
  labels: TechLabels
  labelSize: number
  labelColor: ColorValue
  fontFamily: FontValue
  align: 'left' | 'center' | 'right'
}

export type CoverElement = TextElement | ImageElement | ShapeElement | TechElement
export type ElementType = CoverElement['type']

export type BackgroundType = 'solid' | 'gradient' | 'image'

export interface Background {
  type: BackgroundType
  color: ColorValue
  color2: ColorValue
  angle: number
  image: string | null
  imageOpacity: number
}

export interface CoverDocument {
  templateId: string
  orientation: Orientation
  background: Background
  palette: Palette
  fonts: Fonts
  fields: Fields
  elements: CoverElement[]
}

export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  document: CoverDocument
}

export interface PageSize {
  width: number
  height: number
}

export interface LayoutContext extends PageSize {
  orientation: Orientation
}

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  category: CategoryId
  orientation: Orientation
  tags: string[]
  palette: Palette
  fonts: Fonts
  background: (ctx: LayoutContext) => Background
  /** Default content for the form fields when a new project starts from this template. */
  defaults: Partial<Fields>
  layout: (ctx: LayoutContext) => CoverElement[]
}

export interface Category {
  id: CategoryId
  label: string
  description: string
}
