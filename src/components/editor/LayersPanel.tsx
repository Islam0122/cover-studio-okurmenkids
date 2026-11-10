import { Boxes, ChevronDown, ChevronUp, Circle, Eye, EyeOff, ImageIcon, Lock, Minus, Square, Type, Unlock } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { CoverElement } from '../../types/template'
import { cn } from '../ui/cn'

const NO_ELEMENTS: CoverElement[] = []

function ElementIcon({ el }: { el: CoverElement }) {
  const cls = 'size-3.5'
  if (el.type === 'text') return <Type className={cls} />
  if (el.type === 'image') return <ImageIcon className={cls} />
  if (el.type === 'tech') return <Boxes className={cls} />
  if (el.shape === 'ellipse') return <Circle className={cls} />
  if (el.shape === 'line') return <Minus className={cls} />
  return <Square className={cls} />
}

export function LayersPanel() {
  const elements = useEditorStore((s) => s.doc?.elements ?? NO_ELEMENTS)
  const selectedId = useEditorStore((s) => s.selectedId)
  const { select, updateElement, moveLayer } = useEditorStore()
  const list = [...elements].reverse()

  return (
    <div className="p-2">
      <p className="px-2 pt-2 pb-2 text-[11px] font-bold tracking-wide text-ink-faint uppercase">
        Слои · {elements.length}
      </p>
      <ul className="space-y-0.5">
        {list.map((el, i) => {
          const active = el.id === selectedId
          return (
            <li key={el.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => select(el.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && select(el.id)}
                className={cn(
                  'group flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2 text-[12.5px] transition-colors',
                  active ? 'bg-brand-soft text-ink' : 'text-ink-soft hover:bg-canvas',
                  !el.visible && 'opacity-50',
                )}
              >
                <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', active ? 'bg-white text-brand' : 'bg-canvas text-ink-faint')}>
                  <ElementIcon el={el} />
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{el.name}</span>
                <span className={cn('flex items-center gap-0.5', !active && 'opacity-0 group-hover:opacity-100 max-lg:opacity-100')}>
                  <LayerBtn label="Выше" disabled={i === 0} onClick={() => moveLayer(el.id, 'up')}>
                    <ChevronUp className="size-3.5" />
                  </LayerBtn>
                  <LayerBtn label="Ниже" disabled={i === list.length - 1} onClick={() => moveLayer(el.id, 'down')}>
                    <ChevronDown className="size-3.5" />
                  </LayerBtn>
                </span>
                <LayerBtn label={el.locked ? 'Разблокировать' : 'Заблокировать'} onClick={() => updateElement(el.id, { locked: !el.locked })} pinned={el.locked}>
                  {el.locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                </LayerBtn>
                <LayerBtn label={el.visible ? 'Скрыть' : 'Показать'} onClick={() => updateElement(el.id, { visible: !el.visible })} pinned={!el.visible}>
                  {el.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                </LayerBtn>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LayerBtn({
  label,
  onClick,
  children,
  disabled,
  pinned,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  pinned?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'flex size-6 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-white hover:text-ink disabled:opacity-30',
        pinned && 'text-ink-soft',
      )}
    >
      {children}
    </button>
  )
}
