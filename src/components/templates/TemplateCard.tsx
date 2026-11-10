import { useCallback } from 'react'
import { ArrowRight } from 'lucide-react'
import type { TemplateDefinition } from '../../types/template'
import { documentFromTemplate } from '../../templates/build'
import { categoryLabel } from '../../templates'
import { CoverThumb } from './CoverThumb'

export function TemplateCard({ template, onUse }: { template: TemplateDefinition; onUse: (id: string) => void }) {
  const getDoc = useCallback(() => documentFromTemplate(template), [template])
  const landscape = template.orientation === 'landscape'
  return (
    <button
      type="button"
      onClick={() => onUse(template.id)}
      className="group flex flex-col rounded-2xl border border-line bg-white p-3 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
    >
      <div className="relative flex aspect-[4/4.2] items-center justify-center overflow-hidden rounded-xl bg-canvas p-5">
        <CoverThumb
          cacheKey={`tpl:${template.id}`}
          getDoc={getDoc}
          orientation={template.orientation}
          alt={`Шаблон «${template.name}»`}
          className={landscape ? 'w-full' : 'h-full'}
        />
        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[13px] font-semibold text-white shadow-lift">
            Использовать <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
      <div className="px-1 pt-3 pb-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[14px] font-bold text-ink">{template.name}</h3>
          <span className="shrink-0 text-[11px] font-semibold text-ink-faint">{landscape ? 'A4 ↔' : 'A4 ↕'}</span>
        </div>
        <p className="mt-0.5 text-[12px] font-medium text-ink-muted">{categoryLabel(template.category)}</p>
      </div>
    </button>
  )
}
