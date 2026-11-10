import type { ReactNode } from 'react'
import { cn } from '../ui/cn'

export function PanelTabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T
  onChange: (v: T) => void
  tabs: Array<{ value: T; label: string; icon: ReactNode; badge?: ReactNode }>
}) {
  return (
    <div className="flex shrink-0 gap-1 border-b border-line px-2" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'relative flex h-11 flex-1 items-center justify-center gap-1.5 text-[12.5px] font-semibold transition-colors',
            value === t.value ? 'text-ink' : 'text-ink-faint hover:text-ink-soft',
          )}
        >
          {t.icon}
          {t.label}
          {t.badge}
          {value === t.value && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink" />}
        </button>
      ))}
    </div>
  )
}
