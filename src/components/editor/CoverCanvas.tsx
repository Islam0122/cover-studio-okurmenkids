import { useEffect, useLayoutEffect, useRef } from 'react'
import { Canvas, FabricObject, Textbox, type TPointerEventInfo } from 'fabric'
import { useEditorStore } from '../../store/editorStore'
import type { CoverDocument, CoverElement } from '../../types/template'
import { pageSize, resolveColor, resolveFont, resolveImageSrc, resolveText, singleBinding } from '../../utils/document'
import { createBackgroundObjects, createElementObject, ensureFonts, type RenderMode } from '../../utils/renderer'

// Selection chrome, shared by every object on the editor canvas.
Object.assign(FabricObject.ownDefaults, {
  borderColor: '#3B5BFD',
  borderScaleFactor: 1.5,
  cornerColor: '#FFFFFF',
  cornerStrokeColor: '#3B5BFD',
  cornerStyle: 'circle',
  cornerSize: 10,
  transparentCorners: false,
  padding: 0,
})

const EDITOR_IMAGE_SCALE = 2.5

interface Entry {
  hash: string
  obj: FabricObject
}

const ids = new WeakMap<FabricObject, string>()

function elementHash(el: CoverElement, doc: CoverDocument, mode: RenderMode): string {
  let extra = ''
  if (el.type === 'text') extra = `${resolveText(el.content, doc.fields)}|${resolveColor(el.color, doc.palette)}|${resolveFont(el.fontFamily, doc)}`
  else if (el.type === 'shape') extra = `${resolveColor(el.fill, doc.palette)}|${resolveColor(el.stroke, doc.palette)}`
  else if (el.type === 'tech') extra = `${(doc.fields.tech ?? []).join(',')}|${resolveColor(el.labelColor, doc.palette)}|${resolveFont(el.fontFamily, doc)}`
  else {
    const src = resolveImageSrc(el, doc.fields) ?? ''
    extra = `${src.length}:${src.slice(0, 40)}:${src.slice(-40)}`
  }
  // the element's own src can be a large data URL; hash it by fingerprint instead
  const { ...rest } = el as CoverElement & { src?: string | null }
  if ('src' in rest) rest.src = null
  return `${mode}|${JSON.stringify(rest)}|${extra}`
}

function backgroundHash(doc: CoverDocument): string {
  const bg = doc.background
  const img = bg.image ? `${bg.image.length}:${bg.image.slice(-40)}` : ''
  return `${doc.orientation}|${bg.type}|${resolveColor(bg.color, doc.palette)}|${resolveColor(bg.color2, doc.palette)}|${bg.angle}|${bg.imageOpacity}|${img}`
}

export function CoverCanvas() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const entries = useRef(new Map<string, Entry>())
  const background = useRef<{ hash: string; objs: FabricObject[] }>({ hash: '', objs: [] })
  const generation = useRef(0)
  const syncing = useRef(false)

  const doc = useEditorStore((s) => s.doc)
  const selectedId = useEditorStore((s) => s.selectedId)
  const zoom = useEditorStore((s) => s.zoom)
  const preview = useEditorStore((s) => s.preview)
  const autoFit = useEditorStore((s) => s.autoFit)
  const fitRequest = useEditorStore((s) => s.fitRequest)
  const orientation = doc?.orientation ?? 'portrait'
  const page = pageSize(orientation)

  /* ---------- create the Fabric canvas once ---------- */
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    // created imperatively: Fabric wraps the element in its own container,
    // which must not collide with React's reconciliation (or StrictMode remounts)
    const el = document.createElement('canvas')
    el.setAttribute('aria-label', 'Холст обложки')
    host.appendChild(el)
    const canvas = new Canvas(el, {
      preserveObjectStacking: true,
      selection: false,
      controlsAboveOverlay: true,
      renderOnAddRemove: false,
      stopContextMenu: true,
      fireRightClick: false,
    })
    fabricRef.current = canvas
    const store = useEditorStore.getState

    const idOf = (o?: FabricObject) => (o ? (ids.get(o) ?? null) : null)
    const onSelect = () => {
      if (syncing.current) return
      store().select(idOf(canvas.getActiveObject()))
    }
    canvas.on('selection:created', onSelect)
    canvas.on('selection:updated', onSelect)
    canvas.on('selection:cleared', onSelect)

    canvas.on('object:modified', (e) => {
      const obj = e.target
      const id = idOf(obj)
      const el = store().doc?.elements.find((x) => x.id === id)
      if (!obj || !id || !el) return
      const sx = obj.scaleX ?? 1
      const sy = obj.scaleY ?? 1
      const width = Math.max(4, (obj.width ?? el.width) * sx)
      const angle = Math.round((obj.angle ?? 0) * 100) / 100
      const left = obj.left ?? 0
      const top = obj.top ?? 0
      if (el.type === 'text') {
        const scaledH = (obj.height ?? 0) * sy
        const fontSize = Math.abs(sy - 1) > 0.001 ? Math.max(4, Math.round(el.fontSize * sy * 10) / 10) : el.fontSize
        store().updateElement(id, { x: left - width / 2, y: top - scaledH / 2, width, height: scaledH, rotation: angle, fontSize }, `mod:${id}:${Date.now()}`)
      } else if (el.type === 'shape' && el.shape === 'line') {
        store().updateElement(id, { x: left - width / 2, y: top - el.height / 2, width, rotation: angle }, `mod:${id}:${Date.now()}`)
      } else {
        const height = Math.max(4, (obj.height ?? el.height) * sy)
        store().updateElement(id, { x: left - width / 2, y: top - height / 2, width, height, rotation: angle }, `mod:${id}:${Date.now()}`)
      }
    })

    canvas.on('text:editing:exited', (e) => {
      const tb = e.target as Textbox
      const id = idOf(tb)
      const state = store()
      const el = state.doc?.elements.find((x) => x.id === id)
      if (!state.doc || !id || !el || el.type !== 'text') return
      const typed = tb.text ?? ''
      const before = resolveText(el.content, state.doc.fields)
      const shown = el.uppercase ? before.toLocaleUpperCase('ru') : before
      if (typed === shown || (!before.trim() && typed.includes('['))) return
      const binding = singleBinding(el.content)
      if (binding) state.setField(binding, typed)
      else state.updateElement(id, { content: typed })
    })

    // double click on empty canvas area clears selection; on text enters editing (Fabric default)
    canvas.on('mouse:dblclick', (e: TPointerEventInfo) => {
      if (!e.target) store().select(null)
    })

    return () => {
      generation.current++
      entries.current.clear()
      background.current = { hash: '', objs: [] }
      fabricRef.current = null
      void Promise.resolve(canvas.dispose()).finally(() => el.remove())
    }
  }, [])

  /* ---------- sync document → canvas objects ---------- */
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !doc) return
    const gen = ++generation.current
    const mode: RenderMode = preview ? 'export' : 'edit'
    const opts = { mode, imageScale: EDITOR_IMAGE_SCALE }

    ;(async () => {
      await ensureFonts(doc)
      if (gen !== generation.current) return

      const bgHash = backgroundHash(doc)
      const bgPromise =
        bgHash === background.current.hash ? Promise.resolve(background.current.objs) : createBackgroundObjects(doc, opts)

      const next = new Map<string, Entry>()
      const built = await Promise.all(
        doc.elements.map(async (el) => {
          const hash = elementHash(el, doc, mode)
          const prev = entries.current.get(el.id)
          if (prev && prev.hash === hash) return { id: el.id, entry: prev }
          const obj = await createElementObject(el, doc, opts)
          return { id: el.id, entry: obj ? { hash, obj } : null }
        }),
      )
      const bgObjs = await bgPromise
      if (gen !== generation.current || fabricRef.current !== canvas) return

      const ordered: FabricObject[] = [...bgObjs]
      for (const { id, entry } of built) {
        if (!entry) continue
        ids.set(entry.obj, id)
        next.set(id, entry)
        ordered.push(entry.obj)
      }

      const active = canvas.getActiveObject()
      const editing = active instanceof Textbox && active.isEditing
      syncing.current = true
      try {
        const current = canvas.getObjects()
        const same = current.length === ordered.length && current.every((o, i) => o === ordered[i])
        if (!same) {
          const keep = new Set(ordered)
          if (active && !keep.has(active) && !editing) canvas.discardActiveObject()
          canvas.remove(...current.filter((o) => !keep.has(o)))
          ordered.forEach((o, i) => {
            if (!current.includes(o)) canvas.insertAt(i, o)
            else canvas.moveObjectTo(o, i)
          })
        }
        background.current = { hash: bgHash, objs: bgObjs }
        entries.current = next

        const sel = useEditorStore.getState().selectedId
        const target = sel ? next.get(sel)?.obj : undefined
        if (!editing) {
          if (target && canvas.getActiveObject() !== target) canvas.setActiveObject(target)
          else if (!target && canvas.getActiveObject()) canvas.discardActiveObject()
        }
      } finally {
        syncing.current = false
      }
      canvas.requestRenderAll()
    })()
  }, [doc, preview])

  /* ---------- store selection → canvas ---------- */
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const target = selectedId ? entries.current.get(selectedId)?.obj : undefined
    const active = canvas.getActiveObject()
    if (active === target) return
    if (active instanceof Textbox && active.isEditing) active.exitEditing()
    syncing.current = true
    if (target) canvas.setActiveObject(target)
    else canvas.discardActiveObject()
    syncing.current = false
    canvas.requestRenderAll()
  }, [selectedId])

  /* ---------- zoom & dimensions ---------- */
  useLayoutEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.setDimensions({ width: Math.round(page.width * zoom), height: Math.round(page.height * zoom) })
    canvas.setZoom(zoom)
    canvas.calcOffset()
    canvas.requestRenderAll()
  }, [zoom, page.width, page.height])

  /* ---------- fit to viewport ---------- */
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const fit = () => {
      const small = window.innerWidth < 640
      const padX = small ? 24 : 72
      const padY = small ? 88 : 132
      const z = Math.min((viewport.clientWidth - padX) / page.width, (viewport.clientHeight - padY) / page.height)
      useEditorStore.setState({ zoom: Math.max(0.1, Math.floor(z * 100) / 100) })
    }
    if (autoFit) fit()
    const ro = new ResizeObserver(() => {
      if (useEditorStore.getState().autoFit) fit()
    })
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [autoFit, fitRequest, page.width, page.height])

  /* ---------- ctrl + wheel zoom ---------- */
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      useEditorStore.getState().zoomBy(e.deltaY < 0 ? 1.08 : 1 / 1.08)
    }
    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div
      ref={viewportRef}
      className="canvas-dots scroll-thin relative h-full w-full overflow-auto"
      onPointerDown={(e) => {
        // clicks on the grey area around the page deselect
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.stage) useEditorStore.getState().select(null)
      }}
    >
      <div data-stage="1" className="flex min-h-full min-w-full items-center justify-center px-3 pt-16 pb-6 sm:px-9 sm:pt-20 sm:pb-12" style={{ width: 'max-content' }}>
        <div
          className="relative shrink-0 bg-white shadow-page transition-[box-shadow] duration-300"
          style={{ width: Math.round(page.width * zoom), height: Math.round(page.height * zoom) }}
        >
          <div ref={hostRef} className="absolute inset-0" />
        </div>
      </div>
    </div>
  )
}
