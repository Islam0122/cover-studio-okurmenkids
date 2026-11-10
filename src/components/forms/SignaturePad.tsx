import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Eraser, Undo2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { cn } from '../ui/cn'
import { putAsset } from '../../store/assetStore'
import { encode } from '../../utils/files'

interface Point {
  x: number
  y: number
  w: number
}
type Stroke = { color: string; points: Point[] }

const INKS = [
  { name: 'Синие чернила', color: '#1E3A8A' },
  { name: 'Фиолетовые чернила', color: '#3B2A8C' },
  { name: 'Чёрные чернила', color: '#111827' },
]
const CSS_W = 560
const CSS_H = 220
const MIN_W = 1.2
const MAX_W = 3.6

/** Draws strokes with speed-dependent width, smoothed through segment midpoints. */
function paint(ctx: CanvasRenderingContext2D, strokes: Stroke[], scale: number) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const s of strokes) {
    const pts = s.points
    ctx.strokeStyle = s.color
    ctx.fillStyle = s.color
    if (pts.length === 1) {
      ctx.beginPath()
      ctx.arc(pts[0].x * scale, pts[0].y * scale, (pts[0].w * scale) / 2, 0, Math.PI * 2)
      ctx.fill()
      continue
    }
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 2] ?? pts[i - 1]
      const p1 = pts[i - 1]
      const p2 = pts[i]
      const m0 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }
      const m1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
      ctx.beginPath()
      ctx.lineWidth = ((p1.w + p2.w) / 2) * scale
      ctx.moveTo(m0.x * scale, m0.y * scale)
      ctx.quadraticCurveTo(p1.x * scale, p1.y * scale, m1.x * scale, m1.y * scale)
      ctx.stroke()
    }
  }
}

/** Renders the signature at high resolution, trimmed to the ink, on a transparent background. */
function exportSignature(strokes: Stroke[]): string | null {
  const scale = 4
  const canvas = document.createElement('canvas')
  canvas.width = CSS_W * scale
  canvas.height = CSS_H * scale
  const ctx = canvas.getContext('2d')!
  paint(ctx, strokes, scale)
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let x0 = width
  let y0 = height
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) return null
  const pad = 6 * scale
  const out = document.createElement('canvas')
  out.width = x1 - x0 + 1 + pad * 2
  out.height = y1 - y0 + 1 + pad * 2
  out.getContext('2d')!.drawImage(canvas, x0 - pad, y0 - pad, out.width, out.height, 0, 0, out.width, out.height)
  return encode(out, true)
}

export function SignaturePad({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [ink, setInk] = useState(INKS[0].color)
  const drawing = useRef<{ stroke: Stroke; last: { x: number; y: number; t: number } } | null>(null)

  const redraw = useCallback((list: Stroke[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    paint(ctx, list, dpr * (canvas.width / dpr / CSS_W))
  }, [])

  useEffect(() => {
    if (!open) return
    setStrokes([])
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = CSS_W * dpr
    canvas.height = CSS_H * dpr
    redraw([])
  }, [open, redraw])

  const toLocal = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * CSS_W, y: ((e.clientY - r.top) / r.height) * CSS_H }
  }

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = toLocal(e)
    const stroke: Stroke = { color: ink, points: [{ ...p, w: (MIN_W + MAX_W) / 2 }] }
    drawing.current = { stroke, last: { ...p, t: performance.now() } }
    const next = [...strokes, stroke]
    setStrokes(next)
    redraw(next)
  }
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drawing.current
    if (!d) return
    const p = toLocal(e)
    const now = performance.now()
    const dist = Math.hypot(p.x - d.last.x, p.y - d.last.y)
    if (dist < 0.8) return
    const speed = dist / Math.max(1, now - d.last.t)
    const prevW = d.stroke.points[d.stroke.points.length - 1].w
    const target = e.pressure && e.pointerType === 'pen' ? MIN_W + (MAX_W - MIN_W) * e.pressure : Math.max(MIN_W, MAX_W - speed * 1.6)
    d.stroke.points.push({ ...p, w: prevW * 0.7 + target * 0.3 })
    d.last = { ...p, t: now }
    redraw(strokes)
  }
  const onUp = () => {
    drawing.current = null
    setStrokes((s) => [...s])
  }

  const empty = strokes.length === 0
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Подпись"
      description="Распишитесь мышью, пальцем или стилусом"
      width={620}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="brand"
            disabled={empty}
            icon={<Check className="size-4" />}
            onClick={() => {
              const url = exportSignature(strokes)
              if (url) onSave(putAsset(url))
              onClose()
            }}
          >
            Сохранить подпись
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl border border-line bg-white">
          <canvas
            ref={canvasRef}
            className="block w-full cursor-crosshair touch-none"
            style={{ aspectRatio: `${CSS_W} / ${CSS_H}` }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            aria-label="Поле для подписи"
          />
          <div className="pointer-events-none absolute inset-x-8 bottom-12 border-b border-dashed border-line-strong" />
          {empty && (
            <span className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[12px] text-ink-faint">Подпишитесь над линией</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {INKS.map((i) => (
            <button
              key={i.color}
              type="button"
              title={i.name}
              aria-label={i.name}
              aria-pressed={ink === i.color}
              onClick={() => setInk(i.color)}
              className={cn('size-7 rounded-full ring-offset-2 transition-transform hover:scale-110', ink === i.color && 'ring-2 ring-brand')}
              style={{ background: i.color }}
            />
          ))}
          <div className="ml-auto flex gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={empty}
              icon={<Undo2 className="size-3.5" />}
              onClick={() => {
                const next = strokes.slice(0, -1)
                setStrokes(next)
                redraw(next)
              }}
            >
              Шаг назад
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={empty}
              icon={<Eraser className="size-3.5" />}
              onClick={() => {
                setStrokes([])
                redraw([])
              }}
            >
              Очистить
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
