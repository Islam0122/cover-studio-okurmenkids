import { create } from 'zustand'
import type {
  Background,
  CoverDocument,
  CoverElement,
  ElementType,
  Fields,
  Fonts,
  ImageElement,
  Orientation,
  PaletteKey,
  ShapeElement,
  ShapeKind,
  TechElement,
  TextElement,
} from '../types/template'
import { applyTemplate, changeOrientation } from '../templates/build'
import { getTemplate } from '../templates'
import { image, pageSize, shape, techRow, text, uid } from '../utils/document'

export type ElementPatch = Partial<TextElement> | Partial<ImageElement> | Partial<ShapeElement> | Partial<TechElement>

const HISTORY_LIMIT = 80
const COALESCE_MS = 700

interface EditorState {
  projectId: string | null
  name: string
  doc: CoverDocument | null
  selectedId: string | null
  past: CoverDocument[]
  future: CoverDocument[]
  zoom: number
  autoFit: boolean
  preview: boolean
  /** Bumped when the canvas should re-fit the viewport. */
  fitRequest: number

  open: (projectId: string, name: string, doc: CoverDocument) => void
  close: () => void
  setName: (name: string) => void

  /** Every document change goes through here so undo/redo stays consistent. */
  commit: (next: CoverDocument, coalesceKey?: string) => void
  undo: () => void
  redo: () => void

  setField: <K extends keyof Fields>(key: K, value: Fields[K]) => void
  setPaletteColor: (key: PaletteKey, value: string) => void
  setFonts: (fonts: Partial<Fonts>) => void
  setBackground: (patch: Partial<Background>) => void
  setOrientation: (o: Orientation) => void
  switchTemplate: (templateId: string) => void

  select: (id: string | null) => void
  updateElement: (id: string, patch: ElementPatch, coalesceKey?: string) => void
  addElement: (type: ElementType, variant?: ShapeKind, src?: string) => void
  removeElement: (id: string) => void
  duplicateElement: (id: string) => void
  moveLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void
  nudge: (id: string, dx: number, dy: number) => void

  setZoom: (zoom: number) => void
  zoomBy: (factor: number) => void
  fitToScreen: () => void
  togglePreview: (value?: boolean) => void
}

let lastCommit = { key: '', at: 0 }

export const useEditorStore = create<EditorState>()((set, get) => {
  const mutate = (recipe: (doc: CoverDocument) => CoverDocument, coalesceKey?: string) => {
    const doc = get().doc
    if (!doc) return
    get().commit(recipe(doc), coalesceKey)
  }

  const mapElement = (id: string, fn: (el: CoverElement) => CoverElement) => (doc: CoverDocument) => ({
    ...doc,
    elements: doc.elements.map((el) => (el.id === id ? fn(el) : el)),
  })

  return {
    projectId: null,
    name: '',
    doc: null,
    selectedId: null,
    past: [],
    future: [],
    zoom: 0.6,
    autoFit: true,
    preview: false,
    fitRequest: 0,

    open: (projectId, name, doc) => {
      lastCommit = { key: '', at: 0 }
      set({ projectId, name, doc, selectedId: null, past: [], future: [], preview: false, autoFit: true, fitRequest: get().fitRequest + 1 })
    },
    close: () => set({ projectId: null, doc: null, selectedId: null, past: [], future: [] }),
    setName: (name) => set({ name }),

    commit: (next, coalesceKey) => {
      const { doc, past } = get()
      if (!doc || next === doc) return
      const now = Date.now()
      const coalesce = !!coalesceKey && coalesceKey === lastCommit.key && now - lastCommit.at < COALESCE_MS
      lastCommit = { key: coalesceKey ?? '', at: now }
      const nextPast = coalesce ? past : [...past, doc].slice(-HISTORY_LIMIT)
      const selectedId = get().selectedId
      set({
        doc: next,
        past: nextPast,
        future: [],
        selectedId: selectedId && next.elements.some((e) => e.id === selectedId) ? selectedId : null,
      })
    },
    undo: () => {
      const { past, doc, future } = get()
      if (!doc || past.length === 0) return
      const prev = past[past.length - 1]
      lastCommit = { key: '', at: 0 }
      set({ doc: prev, past: past.slice(0, -1), future: [doc, ...future].slice(0, HISTORY_LIMIT) })
      if (prev.orientation !== doc.orientation) set({ fitRequest: get().fitRequest + 1 })
    },
    redo: () => {
      const { past, doc, future } = get()
      if (!doc || future.length === 0) return
      const next = future[0]
      lastCommit = { key: '', at: 0 }
      set({ doc: next, past: [...past, doc], future: future.slice(1) })
      if (next.orientation !== doc.orientation) set({ fitRequest: get().fitRequest + 1 })
    },

    setField: (key, value) => mutate((doc) => ({ ...doc, fields: { ...doc.fields, [key]: value } }), `field:${key}`),
    setPaletteColor: (key, value) =>
      mutate((doc) => ({ ...doc, palette: { ...doc.palette, [key]: value } }), `palette:${key}`),
    setFonts: (fonts) => mutate((doc) => ({ ...doc, fonts: { ...doc.fonts, ...fonts } })),
    setBackground: (patch) =>
      mutate((doc) => ({ ...doc, background: { ...doc.background, ...patch } }), `bg:${Object.keys(patch).join(',')}`),
    setOrientation: (o) => {
      mutate((doc) => changeOrientation(doc, o))
      set({ selectedId: null, fitRequest: get().fitRequest + 1 })
    },
    switchTemplate: (templateId) => {
      const prevOrientation = get().doc?.orientation
      mutate((doc) => applyTemplate(doc, getTemplate(templateId)))
      set({ selectedId: null })
      if (get().doc?.orientation !== prevOrientation) set({ fitRequest: get().fitRequest + 1 })
    },

    select: (id) => {
      if (get().selectedId !== id) set({ selectedId: id })
    },
    updateElement: (id, patch, coalesceKey) =>
      mutate(mapElement(id, (el) => ({ ...el, ...patch }) as CoverElement), coalesceKey ?? `el:${id}:${Object.keys(patch).join(',')}`),
    addElement: (type, variant = 'rect', src) => {
      const doc = get().doc
      if (!doc) return
      const { width: W, height: H } = pageSize(doc.orientation)
      let el: CoverElement
      if (type === 'text') {
        el = text('Текст', 'Новый текст', { x: W / 2 - 160, y: H / 2 - 20, width: 320, height: 40 }, {
          fontSize: 28, fontWeight: 600, align: 'center', fontFamily: '$heading',
        })
      } else if (type === 'tech') {
        el = techRow('Технологии', { x: W / 2 - 220, y: H / 2 - 50, width: 440, height: 100 }, { iconSize: 56, gap: 28 })
      } else if (type === 'image') {
        el = image('Изображение', { x: W / 2 - 120, y: H / 2 - 90, width: 240, height: 180 }, { src: src ?? null, fit: 'cover', radius: 12 })
      } else {
        const box =
          variant === 'line'
            ? { x: W / 2 - 150, y: H / 2, width: 300, height: 0 }
            : variant === 'ellipse'
              ? { x: W / 2 - 80, y: H / 2 - 80, width: 160, height: 160 }
              : { x: W / 2 - 120, y: H / 2 - 70, width: 240, height: 140 }
        const names: Record<ShapeKind, string> = { rect: 'Прямоугольник', ellipse: 'Эллипс', line: 'Линия' }
        el = shape(names[variant], variant, box, variant === 'rect' ? { fill: '$accent', radius: 12 } : variant === 'ellipse' ? { fill: '$accent' } : {})
      }
      el.custom = true
      get().commit({ ...doc, elements: [...doc.elements, el] })
      set({ selectedId: el.id })
    },
    removeElement: (id) => {
      mutate((doc) => ({ ...doc, elements: doc.elements.filter((e) => e.id !== id) }))
      if (get().selectedId === id) set({ selectedId: null })
    },
    duplicateElement: (id) => {
      const doc = get().doc
      const index = doc?.elements.findIndex((e) => e.id === id) ?? -1
      if (!doc || index < 0) return
      const src = doc.elements[index]
      const copy: CoverElement = { ...structuredClone(src), id: uid(), name: `${src.name} копия`, x: src.x + 16, y: src.y + 16, custom: true, locked: false }
      const elements = [...doc.elements]
      elements.splice(index + 1, 0, copy)
      get().commit({ ...doc, elements })
      set({ selectedId: copy.id })
    },
    moveLayer: (id, direction) =>
      mutate((doc) => {
        const elements = [...doc.elements]
        const i = elements.findIndex((e) => e.id === id)
        if (i < 0) return doc
        const [el] = elements.splice(i, 1)
        const target =
          direction === 'top' ? elements.length : direction === 'bottom' ? 0 : direction === 'up' ? Math.min(elements.length, i + 1) : Math.max(0, i - 1)
        elements.splice(target, 0, el)
        return { ...doc, elements }
      }),
    nudge: (id, dx, dy) =>
      mutate(mapElement(id, (el) => (el.locked ? el : { ...el, x: el.x + dx, y: el.y + dy })), `nudge:${id}`),

    setZoom: (zoom) => set({ zoom: Math.min(4, Math.max(0.1, zoom)), autoFit: false }),
    zoomBy: (factor) => get().setZoom(Math.round(get().zoom * factor * 100) / 100),
    fitToScreen: () => set({ autoFit: true, fitRequest: get().fitRequest + 1 }),
    togglePreview: (value) => {
      set({ preview: value ?? !get().preview, selectedId: null, fitRequest: get().fitRequest + 1 })
    },
  }
})

export const selectSelectedElement = (s: EditorState): CoverElement | null =>
  s.doc?.elements.find((e) => e.id === s.selectedId) ?? null
