import { useRef, useState } from 'react'
import { ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { readImageFile } from '../../utils/files'
import { putAsset, resolveAsset } from '../../store/assetStore'
import { toast } from '../ui/Toast'
import { cn } from '../ui/cn'
import type { BrandAsset } from '../../templates/brand'

export function ImageUpload({
  label,
  value,
  onChange,
  hint = 'PNG, JPG, SVG или WebP',
  maxSide,
  compact,
  presets,
  knockout,
}: {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  hint?: string
  maxSide?: number
  compact?: boolean
  presets?: BrandAsset[]
  /** Remove the paper background (stamps, signatures). */
  knockout?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)

  const handle = async (file?: File | null) => {
    if (!file) return
    setBusy(true)
    try {
      onChange(putAsset(await readImageFile(file, maxSide, { knockout })))
    } catch (err) {
      toast.error('Не удалось загрузить', err instanceof Error ? err.message : undefined)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink-soft">{label}</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-2">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[conic-gradient(#eef0f5_25%,#fff_0_50%,#eef0f5_0_75%,#fff_0)] bg-[length:12px_12px] ring-1 ring-line">
            <img src={resolveAsset(value) ?? undefined} alt="" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex flex-1 flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-semibold text-ink-soft hover:bg-canvas hover:text-ink"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Заменить
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold text-danger hover:bg-danger/5"
            >
              <Trash2 className="size-3.5" />
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            handle(e.dataTransfer.files?.[0])
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border border-dashed px-3 text-left transition-colors',
            compact ? 'py-2.5' : 'py-3.5',
            drag ? 'border-brand bg-brand-soft' : 'border-line-strong bg-white hover:border-brand/50 hover:bg-brand-soft/40',
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-ink">Загрузить или перетащить</span>
            <span className="block text-[11px] text-ink-faint">{hint}</span>
          </span>
        </button>
      )}
      {presets && presets.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-ink-faint">Готовые:</span>
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.src)}
              aria-pressed={value === p.src}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-full border pr-2.5 pl-1 text-[11.5px] font-semibold transition-colors',
                value === p.src ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-white text-ink-soft hover:border-line-strong',
              )}
            >
              <img src={p.src} alt="" className="size-5 rounded-full" />
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
