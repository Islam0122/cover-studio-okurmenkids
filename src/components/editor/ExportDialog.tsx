import { useState } from 'react'
import { Download, FileImage, FileText, Loader2 } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { exportDimensions, exportPng, QUALITY_PRESETS, type ExportQuality } from '../../utils/exportImage'
import { exportPdf } from '../../utils/exportPdf'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Segmented } from '../ui/Segmented'
import { toast } from '../ui/Toast'
import { cn } from '../ui/cn'
import type { Orientation } from '../../types/template'

type Format = 'pdf' | 'png'

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const doc = useEditorStore((s) => s.doc)
  const name = useEditorStore((s) => s.name)
  const setOrientation = useEditorStore((s) => s.setOrientation)
  const [format, setFormat] = useState<Format>('pdf')
  const [quality, setQuality] = useState<ExportQuality>('high')
  const [busy, setBusy] = useState(false)
  if (!doc) return null
  const dims = exportDimensions(doc, quality)

  const run = async () => {
    setBusy(true)
    try {
      // let the spinner paint before the heavy render
      await new Promise((r) => setTimeout(r, 30))
      const latest = useEditorStore.getState().doc ?? doc
      if (format === 'pdf') await exportPdf(latest, name, quality)
      else await exportPng(latest, name, quality)
      toast.success(format === 'pdf' ? 'PDF скачан' : 'PNG скачан', `${dims.width} × ${dims.height} px · ${QUALITY_PRESETS[quality].dpi} DPI`)
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Экспорт не удался', err instanceof Error ? err.message : 'Попробуйте снизить качество')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      title="Скачать обложку"
      description="Файл формата A4 в высоком разрешении"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button variant="brand" onClick={run} disabled={busy} icon={busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}>
            {busy ? 'Готовим файл…' : `Скачать ${format.toUpperCase()}`}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: 'pdf', title: 'PDF', text: 'Для печати и отправки', icon: FileText },
              { value: 'png', title: 'PNG', text: 'Картинка без потерь', icon: FileImage },
            ] as const
          ).map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setFormat(o.value)}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                format === o.value ? 'border-brand bg-brand-soft/50 ring-2 ring-brand/15' : 'border-line hover:border-line-strong',
              )}
              aria-pressed={format === o.value}
            >
              <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', format === o.value ? 'bg-brand text-white' : 'bg-canvas text-ink-muted')}>
                <o.icon className="size-4.5" />
              </span>
              <span>
                <span className="block text-[14px] font-bold">{o.title}</span>
                <span className="block text-[12px] text-ink-muted">{o.text}</span>
              </span>
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-ink-soft">Ориентация</p>
          <Segmented<Orientation>
            value={doc.orientation}
            onChange={setOrientation}
            options={[
              { value: 'portrait', label: 'A4 книжная' },
              { value: 'landscape', label: 'A4 альбомная' },
            ]}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-ink-soft">Качество</p>
          <Segmented<ExportQuality>
            value={quality}
            onChange={setQuality}
            options={(Object.keys(QUALITY_PRESETS) as ExportQuality[]).map((q) => ({
              value: q,
              label: `${QUALITY_PRESETS[q].label} · ${QUALITY_PRESETS[q].dpi}`,
            }))}
          />
          <p className="mt-2 text-[12px] text-ink-muted">
            {dims.width} × {dims.height} px · {doc.orientation === 'portrait' ? '210 × 297' : '297 × 210'} мм
          </p>
        </div>
      </div>
    </Modal>
  )
}
