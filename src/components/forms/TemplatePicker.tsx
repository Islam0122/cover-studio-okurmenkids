import { useCallback } from 'react'
import { Check } from 'lucide-react'
import { CATEGORIES, TEMPLATES } from '../../templates'
import { documentFromTemplate } from '../../templates/build'
import type { TemplateDefinition } from '../../types/template'
import { useEditorStore } from '../../store/editorStore'
import { CoverThumb } from '../templates/CoverThumb'
import { toast } from '../ui/Toast'
import { cn } from '../ui/cn'

function PickerItem({ t, active, onPick }: { t: TemplateDefinition; active: boolean; onPick: () => void }) {
  const getDoc = useCallback(() => documentFromTemplate(t), [t])
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-xl border p-2 text-center transition-all',
        active ? 'border-brand bg-brand-soft/50 ring-2 ring-brand/20' : 'border-line bg-white hover:border-line-strong',
      )}
      aria-pressed={active}
    >
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-canvas p-2">
        <CoverThumb cacheKey={`tpl:${t.id}`} getDoc={getDoc} orientation={t.orientation} alt={t.name} className={t.orientation === 'landscape' ? 'w-full' : 'h-full'} />
      </div>
      <span className="line-clamp-1 text-[11px] font-semibold text-ink-soft">{t.name}</span>
      {active && (
        <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-white">
          <Check className="size-3" />
        </span>
      )}
    </button>
  )
}

export function TemplatePicker() {
  const templateId = useEditorStore((s) => s.doc?.templateId)
  const switchTemplate = useEditorStore((s) => s.switchTemplate)
  const pick = (t: TemplateDefinition) => {
    if (t.id === templateId) return
    switchTemplate(t.id)
    toast.info(`Шаблон «${t.name}»`, 'Ваши данные сохранены. Ctrl+Z — вернуть прежний.')
  }
  return (
    <div className="space-y-4">
      {CATEGORIES.map((c) => {
        const list = TEMPLATES.filter((t) => t.category === c.id)
        if (!list.length) return null
        return (
          <div key={c.id}>
            <p className="mb-2 text-[11px] font-bold tracking-wide text-ink-faint uppercase">{c.label}</p>
            <div className="grid grid-cols-2 gap-2">
              {list.map((t) => (
                <PickerItem key={t.id} t={t} active={t.id === templateId} onPick={() => pick(t)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
