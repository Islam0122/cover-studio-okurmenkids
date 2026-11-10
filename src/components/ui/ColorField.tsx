import { useEffect, useState } from 'react'
import type { Palette, PaletteKey } from '../../types/template'
import { resolveColor } from '../../utils/document'
import { cn } from './cn'

export const PALETTE_LABELS: Record<PaletteKey, string> = {
  primary: 'Основной',
  accent: 'Акцент',
  text: 'Текст',
  muted: 'Второстепенный',
  surface: 'Поверхность',
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

function toInputHex(color: string): string {
  if (HEX.test(color)) {
    if (color.length === 4) return '#' + color.slice(1).split('').map((c) => c + c).join('')
    return color
  }
  return '#000000'
}

/**
 * Color control: native picker, hex input and, when a palette is supplied,
 * chips that bind the value to a theme token so it follows palette edits.
 */
export function ColorField({
  label,
  value,
  onChange,
  palette,
  allowTransparent,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  palette?: Palette
  allowTransparent?: boolean
}) {
  const resolved = palette ? resolveColor(value, palette) : value
  const isToken = value.startsWith('$')
  const [draft, setDraft] = useState(resolved)
  useEffect(() => setDraft(resolved), [resolved])

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-soft">{label}</span>
          {isToken && palette && (
            <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-brand">
              {PALETTE_LABELS[value.slice(1) as PaletteKey]}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <label
          className={cn(
            'relative size-9 shrink-0 overflow-hidden rounded-lg border border-line shadow-card',
            resolved === 'transparent' && 'bg-[conic-gradient(#e6e9f0_25%,#fff_0_50%,#e6e9f0_0_75%,#fff_0)] bg-[length:10px_10px]',
          )}
          style={resolved !== 'transparent' ? { background: resolved } : undefined}
          title="Выбрать цвет"
        >
          <input
            type="color"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={toInputHex(resolved)}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        <input
          className="h-9 w-full min-w-0 rounded-lg border border-line bg-white px-2.5 font-mono text-[12px] uppercase text-ink focus:border-brand focus:ring-3 focus:ring-brand/12 focus:outline-none"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (HEX.test(e.target.value)) onChange(e.target.value)
          }}
          onBlur={() => setDraft(resolved)}
          spellCheck={false}
          aria-label={label ? `${label}: HEX` : 'HEX'}
        />
      </div>
      {(palette || allowTransparent) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {palette &&
            (Object.keys(palette) as PaletteKey[]).map((key) => (
              <button
                key={key}
                type="button"
                title={`Цвет темы: ${PALETTE_LABELS[key]}`}
                onClick={() => onChange(`$${key}`)}
                className={cn(
                  'size-6 rounded-md border border-black/10 transition-transform hover:scale-110',
                  value === `$${key}` && 'ring-2 ring-brand ring-offset-1',
                )}
                style={{ background: palette[key] }}
              />
            ))}
          {allowTransparent && (
            <button
              type="button"
              title="Прозрачный"
              onClick={() => onChange('transparent')}
              className={cn(
                'size-6 rounded-md border border-black/10 bg-[conic-gradient(#e6e9f0_25%,#fff_0_50%,#e6e9f0_0_75%,#fff_0)] bg-[length:8px_8px] transition-transform hover:scale-110',
                value === 'transparent' && 'ring-2 ring-brand ring-offset-1',
              )}
            />
          )}
        </div>
      )}
    </div>
  )
}
