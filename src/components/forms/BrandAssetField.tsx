import { useState } from 'react'
import { BookmarkCheck, BookmarkPlus, PenTool } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { useBrandStore, type BrandSlot } from '../../store/brandStore'
import { BRAND_LOGOS } from '../../templates/brand'
import { ImageUpload } from './ImageUpload'
import { SignaturePad } from './SignaturePad'
import { toast } from '../ui/Toast'

const META: Record<BrandSlot, { label: string; hint: string }> = {
  logo: { label: 'Логотип', hint: 'PNG, JPG, SVG или WebP' },
  seal: { label: 'Печать', hint: 'Фон бумаги удаляется автоматически' },
  signature: { label: 'Подпись', hint: 'Скан подписи — фон удалится' },
}

/** Upload for a logo, stamp or signature, with "remember for new projects". */
export function BrandAssetField({ slot }: { slot: BrandSlot }) {
  const value = useEditorStore((s) => s.doc?.fields[slot] ?? null)
  const used = useEditorStore((s) => !!s.doc?.elements.some((e) => e.type === 'image' && e.slot === slot))
  const setField = useEditorStore((s) => s.setField)
  const kitValue = useBrandStore((s) => s.kit[slot])
  const setKit = useBrandStore((s) => s.setKit)
  const [pad, setPad] = useState(false)
  const inKit = !!value && kitValue === value
  const meta = META[slot]

  return (
    <div>
      <ImageUpload
        label={used ? meta.label : `${meta.label} · не в макете`}
        value={value}
        onChange={(v) => setField(slot, v)}
        maxSide={1000}
        hint={meta.hint}
        knockout={slot !== 'logo'}
        presets={slot === 'logo' ? BRAND_LOGOS : undefined}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {slot === 'signature' && (
          <button
            type="button"
            onClick={() => setPad(true)}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 text-[11.5px] font-semibold text-ink-soft hover:border-line-strong hover:text-ink"
          >
            <PenTool className="size-3.5" /> Расписаться на экране
          </button>
        )}
        {value && (
          <button
            type="button"
            onClick={() => {
              if (inKit) {
                setKit(slot, null)
                toast.info(`${meta.label} убран(а) из фирменного набора`)
              } else {
                setKit(slot, value)
                toast.success(`${meta.label} в фирменном наборе`, 'Будет подставляться во все новые проекты в этом браузере.')
              }
            }}
            className={
              inKit
                ? 'inline-flex h-7 items-center gap-1.5 rounded-full bg-brand-soft px-2.5 text-[11.5px] font-semibold text-brand'
                : 'inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 text-[11.5px] font-semibold text-ink-soft hover:border-line-strong hover:text-ink'
            }
            title={inKit ? 'Убрать из набора' : 'Подставлять во все новые проекты'}
          >
            {inKit ? <BookmarkCheck className="size-3.5" /> : <BookmarkPlus className="size-3.5" />}
            {inKit ? 'В фирменном наборе' : 'Запомнить для новых проектов'}
          </button>
        )}
        {kitValue && !value && (
          <button
            type="button"
            onClick={() => setField(slot, kitValue)}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-2.5 text-[11.5px] font-semibold text-brand"
          >
            <BookmarkCheck className="size-3.5" /> Взять из набора
          </button>
        )}
      </div>
      {slot === 'signature' && <SignaturePad open={pad} onClose={() => setPad(false)} onSave={(v) => setField('signature', v)} />}
    </div>
  )
}
