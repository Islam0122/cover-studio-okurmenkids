import { useMemo, useState } from 'react'
import { LayoutGrid, Search, SearchX } from 'lucide-react'
import type { CategoryId, Orientation } from '../../types/template'
import { CATEGORIES, TEMPLATES } from '../../templates'
import { useCreateProject } from '../../hooks/useCreateProject'
import { TemplateCard } from './TemplateCard'
import { Segmented } from '../ui/Segmented'
import { cn } from '../ui/cn'

type OrientationFilter = 'all' | Orientation

export function TemplateGallery({ limit, initialCategory = 'all' }: { limit?: number; initialCategory?: CategoryId | 'all' }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>(initialCategory)
  const [orientation, setOrientation] = useState<OrientationFilter>('all')
  const create = useCreateProject()

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of TEMPLATES) map.set(t.category, (map.get(t.category) ?? 0) + 1)
    return map
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = TEMPLATES.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (orientation !== 'all' && t.orientation !== orientation) return false
      if (!q) return true
      const label = CATEGORIES.find((c) => c.id === t.category)?.label ?? ''
      return [t.name, t.description, label, ...t.tags].some((s) => s.toLowerCase().includes(q))
    })
    return limit ? list.slice(0, limit) : list
  }, [query, category, orientation, limit])

  const reset = () => {
    setQuery('')
    setCategory('all')
    setOrientation('all')
  }

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: курсовая, сертификат, отчёт…"
            className="h-11 w-full rounded-xl border border-line bg-white pr-4 pl-10 text-sm shadow-card placeholder:text-ink-faint focus:border-brand focus:ring-3 focus:ring-brand/12 focus:outline-none"
            aria-label="Поиск шаблонов"
          />
        </div>
        <Segmented<OrientationFilter>
          className="lg:w-72"
          value={orientation}
          onChange={setOrientation}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'portrait', label: 'Книжная' },
            { value: 'landscape', label: 'Альбомная' },
          ]}
        />
      </div>

      <div className="scroll-thin -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {[{ id: 'all' as const, label: 'Все шаблоны' }, ...CATEGORIES].map((c) => {
          const active = category === c.id
          const count = c.id === 'all' ? TEMPLATES.length : (counts.get(c.id) ?? 0)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-all duration-150',
                active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink',
              )}
            >
              {c.id === 'all' && <LayoutGrid className="size-3.5" />}
              {c.label}
              <span className={cn('text-[11px] tabular-nums', active ? 'text-white/60' : 'text-ink-faint')}>{count}</span>
            </button>
          )
        })}
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {results.map((t) => (
            <TemplateCard key={t.id} template={t} onUse={create} />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-white px-6 py-16 text-center">
          <SearchX className="size-8 text-ink-faint" />
          <p className="mt-3 text-[15px] font-bold">Ничего не найдено</p>
          <p className="mt-1 text-sm text-ink-muted">Попробуйте другой запрос или сбросьте фильтры.</p>
          <button type="button" onClick={reset} className="mt-4 text-sm font-semibold text-brand hover:text-brand-ink">
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  )
}
