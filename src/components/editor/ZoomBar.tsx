import { Maximize, Minus, Plus } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { IconButton } from '../ui/Button'

export function ZoomBar() {
  const zoom = useEditorStore((s) => s.zoom)
  const autoFit = useEditorStore((s) => s.autoFit)
  const { zoomBy, setZoom, fitToScreen } = useEditorStore()
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-line bg-white/95 p-1 shadow-lift backdrop-blur">
      <IconButton size="sm" label="Уменьшить" onClick={() => zoomBy(1 / 1.2)}>
        <Minus className="size-3.5" />
      </IconButton>
      <button
        type="button"
        onClick={() => setZoom(1)}
        title="Масштаб 100%"
        className="h-7 w-14 rounded-md text-[12px] font-bold text-ink-soft tabular-nums hover:bg-canvas"
      >
        {Math.round(zoom * 100)}%
      </button>
      <IconButton size="sm" label="Увеличить" onClick={() => zoomBy(1.2)}>
        <Plus className="size-3.5" />
      </IconButton>
      <div className="mx-0.5 h-5 w-px bg-line" />
      <IconButton size="sm" label="Вписать в экран" active={autoFit} onClick={fitToScreen}>
        <Maximize className="size-3.5" />
      </IconButton>
    </div>
  )
}
