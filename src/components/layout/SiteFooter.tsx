import { Link } from 'react-router'
import { LogoMark } from './Logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-[13px] text-ink-muted sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-6" />
          <span className="font-semibold text-ink">Cover Studio</span>
          <span>· {new Date().getFullYear()}</span>
        </div>
        <p className="sm:ml-4">Проекты хранятся только в вашем браузере.</p>
        <nav className="flex gap-5 sm:ml-auto">
          <Link to="/templates" className="hover:text-ink">Шаблоны</Link>
          <Link to="/projects" className="hover:text-ink">Мои проекты</Link>
        </nav>
      </div>
    </footer>
  )
}
