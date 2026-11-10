import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from './cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'brand' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink-soft shadow-card',
  brand: 'bg-brand text-white hover:bg-brand-ink shadow-card',
  secondary: 'bg-white text-ink border border-line hover:border-line-strong hover:bg-canvas shadow-card',
  ghost: 'text-ink-soft hover:bg-ink/5 hover:text-ink',
  danger: 'bg-white text-danger border border-line hover:bg-danger/5 hover:border-danger/30',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 select-none',
    'disabled:opacity-50 active:scale-[0.98]',
    variants[variant],
    sizes[size],
    className,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

export function Button({ variant, size, icon, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  variant,
  size,
  icon,
  className,
  children,
}: {
  to: string
  variant?: Variant
  size?: Size
  icon?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {icon}
      {children}
    </Link>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
  size?: 'sm' | 'md'
}

export function IconButton({ label, active, size = 'md', className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors duration-150 disabled:opacity-35',
        size === 'sm' ? 'size-7' : 'size-9',
        active ? 'bg-brand-soft text-brand' : 'text-ink-muted hover:bg-ink/5 hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
