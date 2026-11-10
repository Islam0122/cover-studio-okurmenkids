import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from './cn'

const control =
  'w-full rounded-lg border border-line bg-white text-[13px] text-ink placeholder:text-ink-faint transition-colors duration-150 hover:border-line-strong focus:border-brand focus:ring-3 focus:ring-brand/12 focus:outline-none disabled:bg-canvas disabled:text-ink-faint'

export function Label({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: ReactNode }) {
  return (
    <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="shrink-0 text-xs font-semibold whitespace-nowrap text-ink-soft">
        {children}
      </label>
      {hint && <span className="min-w-0 truncate text-[11px] text-ink-faint">{hint}</span>}
    </div>
  )
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: ReactNode
  hint?: ReactNode
  onChange: (value: string) => void
}

export function TextField({ label, hint, onChange, className, ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} hint={hint}>
          {label}
        </Label>
      )}
      <input id={id} className={cn(control, 'h-9 px-3')} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  )
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: ReactNode
  hint?: ReactNode
  onChange: (value: string) => void
}

export function TextAreaField({ label, hint, onChange, className, rows = 2, ...rest }: TextAreaFieldProps) {
  const id = useId()
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} hint={hint}>
          {label}
        </Label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={cn(control, 'resize-y px-3 py-2 leading-relaxed')}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  )
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: ReactNode
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}

export function SelectField({ label, options, onChange, className, ...rest }: SelectFieldProps) {
  const id = useId()
  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <select id={id} className={cn(control, 'h-9 appearance-none pr-8 pl-3')} onChange={(e) => onChange(e.target.value)} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-faint" />
      </div>
    </div>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  disabled?: boolean
}

/** Compact numeric input with a prefix label (X, Y, W …). */
export function NumberField({ label, value, onChange, min, max, step = 1, suffix, disabled }: NumberFieldProps) {
  const id = useId()
  const display = Number.isFinite(value) ? Math.round(value * 100) / 100 : 0
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2 text-[12px] transition-colors focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/12 hover:border-line-strong',
        disabled && 'bg-canvas opacity-60',
      )}
    >
      <span className="w-auto shrink-0 font-semibold text-ink-faint">{label}</span>
      <input
        id={id}
        type="number"
        className="num-input w-full min-w-0 bg-transparent text-right font-medium text-ink tabular-nums focus:outline-none"
        value={display}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (Number.isNaN(v)) return
          onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v)))
        }}
      />
      {suffix && <span className="shrink-0 text-ink-faint">{suffix}</span>}
    </label>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  format?: (v: number) => string
  onChange: (v: number) => void
}

export function SliderField({ label, value, min, max, step = 1, format, onChange }: SliderFieldProps) {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id} hint={<span className="font-medium text-ink-soft tabular-nums">{format ? format(value) : value}</span>}>
        {label}
      </Label>
      <input
        id={id}
        type="range"
        className="range w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}
