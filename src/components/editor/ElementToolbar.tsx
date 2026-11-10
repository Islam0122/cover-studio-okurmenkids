import { useRef } from 'react'
import { Boxes, Circle, ImagePlus, Minus, Square, Type } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { readImageFile } from '../../utils/files'
import { putAsset } from '../../store/assetStore'
import { toast } from '../ui/Toast'

export function ElementToolbar() {
  const addElement = useEditorStore((s) => s.addElement)
  const fileRef = useRef<HTMLInputElement>(null)
  const items = [
    { label: 'Текст', icon: Type, onClick: () => addElement('text') },
    { label: 'Прямоугольник', icon: Square, onClick: () => addElement('shape', 'rect') },
    { label: 'Эллипс', icon: Circle, onClick: () => addElement('shape', 'ellipse') },
    { label: 'Линия', icon: Minus, onClick: () => addElement('shape', 'line') },
    { label: 'Изображение', icon: ImagePlus, onClick: () => fileRef.current?.click() },
    { label: 'Технологии', icon: Boxes, onClick: () => addElement('tech') },
  ]
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-line bg-white/95 p-1 shadow-lift backdrop-blur">
      <span className="px-2 text-[11px] font-bold text-ink-faint uppercase max-sm:hidden">Добавить</span>
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          title={it.label}
          aria-label={`Добавить: ${it.label}`}
          onClick={it.onClick}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-semibold text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
        >
          <it.icon className="size-4" />
          <span className="hidden xl:inline">{it.label}</span>
        </button>
      ))}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          try {
            addElement('image', undefined, putAsset(await readImageFile(file)))
          } catch (err) {
            toast.error('Не удалось добавить изображение', err instanceof Error ? err.message : undefined)
          }
        }}
      />
    </div>
  )
}
