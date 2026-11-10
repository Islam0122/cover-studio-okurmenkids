import { create } from 'zustand'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from './cn'

type Tone = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  tone: Tone
  title: string
  description?: string
}

interface ToastState {
  items: ToastItem[]
  push: (t: Omit<ToastItem, 'id'>) => void
  dismiss: (id: number) => void
}

let seq = 0
export const useToasts = create<ToastState>()((set, get) => ({
  items: [],
  push: (t) => {
    const id = ++seq
    set({ items: [...get().items.slice(-3), { ...t, id }] })
    setTimeout(() => get().dismiss(id), t.tone === 'error' ? 6000 : 3200)
  },
  dismiss: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
}))

export const toast = {
  success: (title: string, description?: string) => useToasts.getState().push({ tone: 'success', title, description }),
  error: (title: string, description?: string) => useToasts.getState().push({ tone: 'error', title, description }),
  info: (title: string, description?: string) => useToasts.getState().push({ tone: 'info', title, description }),
}

const icons = { success: CheckCircle2, error: AlertTriangle, info: Info }
const tones = { success: 'text-emerald-600', error: 'text-danger', info: 'text-brand' }

export function Toaster() {
  const { items, dismiss } = useToasts()
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {items.map((t) => {
        const Icon = icons[t.tone]
        return (
          <div key={t.id} className="pointer-events-auto flex animate-pop gap-3 rounded-xl border border-line bg-white p-3.5 shadow-lift">
            <Icon className={cn('mt-0.5 size-4.5 shrink-0', tones[t.tone])} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{t.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="text-ink-faint hover:text-ink" aria-label="Закрыть">
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
