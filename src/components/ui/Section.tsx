import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from './cn'

export function Section({
  title,
  icon,
  children,
  defaultOpen = true,
  action,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  action?: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="border-b border-line last:border-b-0">
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left text-[13px] font-bold text-ink"
          aria-expanded={open}
        >
          {icon && <span className="text-ink-faint">{icon}</span>}
          {title}
          <ChevronDown className={cn('ml-auto size-4 text-ink-faint transition-transform duration-200', !open && '-rotate-90')} />
        </button>
        {action}
      </div>
      {open && <div className="space-y-3 px-4 pb-4">{children}</div>}
    </section>
  )
}
