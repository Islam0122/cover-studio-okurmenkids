import { useState } from 'react'
import { NavLink } from 'react-router'
import { Menu, Plus, X } from 'lucide-react'
import { Logo } from './Logo'
import { ButtonLink } from '../ui/Button'
import { cn } from '../ui/cn'
import { useProjectStore } from '../../store/projectStore'

const links = [
  { to: '/templates', label: 'Шаблоны' },
  { to: '/projects', label: 'Мои проекты' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const count = useProjectStore((s) => s.projects.length)
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors',
                  isActive ? 'bg-white text-ink shadow-card ring-1 ring-line' : 'text-ink-muted hover:text-ink',
                )
              }
            >
              {l.label}
              {l.to === '/projects' && count > 0 && (
                <span className="rounded-full bg-brand-soft px-1.5 text-[11px] font-bold text-brand tabular-nums">{count}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden md:block">
          <ButtonLink to="/templates" size="sm" icon={<Plus className="size-4" />} className="h-9 px-3.5">
            Создать обложку
          </ButtonLink>
        </div>
        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink">
              {l.label}
            </NavLink>
          ))}
          <ButtonLink to="/templates" className="mt-2 w-full" icon={<Plus className="size-4" />}>
            Создать обложку
          </ButtonLink>
        </div>
      )}
    </header>
  )
}
