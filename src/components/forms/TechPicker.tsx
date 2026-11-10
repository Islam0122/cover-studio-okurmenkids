import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { getTech, TECH_CATALOG } from '../../templates/tech'
import { cn } from '../ui/cn'

const NONE: string[] = []

/** Pick and order the technology logos shown on the cover. */
export function TechPicker() {
  const tech = useEditorStore((s) => s.doc?.fields.tech ?? NONE)
  const setField = useEditorStore((s) => s.setField)
  const set = (next: string[]) => setField('tech', next)
  const move = (i: number, d: -1 | 1) => {
    const next = [...tech]
    const j = i + d
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    set(next)
  }

  return (
    <div className="space-y-3">
      {tech.length > 0 ? (
        <ol className="space-y-1">
          {tech.map((id, i) => {
            const t = getTech(id)
            if (!t) return null
            return (
              <li key={id} className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white pr-1 pl-2">
                <span className="w-4 text-[11px] font-bold text-ink-faint tabular-nums">{i + 1}</span>
                <img src={t.src} alt="" className="size-5" />
                <span className="flex-1 truncate text-[12.5px] font-semibold">{t.name}</span>
                <button type="button" aria-label="Левее" title="Левее" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-ink-faint hover:bg-canvas hover:text-ink disabled:opacity-30">
                  <ChevronLeft className="size-3.5" />
                </button>
                <button type="button" aria-label="Правее" title="Правее" disabled={i === tech.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-ink-faint hover:bg-canvas hover:text-ink disabled:opacity-30">
                  <ChevronRight className="size-3.5" />
                </button>
                <button type="button" aria-label={`Убрать ${t.name}`} title="Убрать" onClick={() => set(tech.filter((x) => x !== id))} className="rounded p-1 text-ink-faint hover:bg-danger/5 hover:text-danger">
                  <X className="size-3.5" />
                </button>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="rounded-lg bg-canvas px-3 py-2 text-[12px] text-ink-muted">Нажмите на технологии ниже — их логотипы появятся на обложке.</p>
      )}
      <div className="grid grid-cols-5 gap-1.5">
        {TECH_CATALOG.map((t) => {
          const on = tech.includes(t.id)
          return (
            <button
              key={t.id}
              type="button"
              title={t.name}
              aria-pressed={on}
              aria-label={t.name}
              onClick={() => set(on ? tech.filter((x) => x !== t.id) : [...tech, t.id])}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-1 transition-all',
                on ? 'border-brand bg-brand-soft ring-1 ring-brand/30' : 'border-line bg-white hover:border-line-strong',
              )}
            >
              <img src={t.src} alt="" className="size-6" loading="lazy" />
              <span className="w-full truncate text-center text-[9.5px] font-semibold text-ink-muted">{t.name}</span>
            </button>
          )
        })}
      </div>
      <p className="text-[10.5px] text-ink-faint">Логотипы: Devicon (MIT). Товарные знаки принадлежат их владельцам.</p>
    </div>
  )
}
