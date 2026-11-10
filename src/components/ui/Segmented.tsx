import type { ReactNode } from 'react'
import { cn } from './cn'

interface Option<T extends string> {
  value: T
  label: ReactNode
  title?: string
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
  className,
}: {
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div role="radiogroup" className={cn('flex rounded-lg bg-canvas p-0.5 ring-1 ring-line ring-inset', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md font-semibold transition-all duration-150',
            size === 'sm' ? 'h-7 text-[12px]' : 'h-8 text-[13px]',
            o.value === value ? 'bg-white text-ink shadow-card ring-1 ring-line' : 'text-ink-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
