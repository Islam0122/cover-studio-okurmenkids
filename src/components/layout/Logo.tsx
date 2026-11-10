import { Link } from 'react-router'

export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0F1B3D" />
      <rect x="9" y="7" width="14" height="18" rx="2.5" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M12.5 12h7M12.5 16h4.5" stroke="#7C93FF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Cover Studio — на главную">
      <LogoMark />
      <span className="text-[15px] font-extrabold tracking-tight text-ink">
        Cover<span className="text-brand">Studio</span>
      </span>
    </Link>
  )
}
