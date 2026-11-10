import { ImageIcon, Paintbrush, RotateCcw, Type } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { getTemplate } from '../../templates'
import type { BackgroundType, PaletteKey } from '../../types/template'
import { ColorField, PALETTE_LABELS } from '../ui/ColorField'
import { SelectField, SliderField } from '../ui/Field'
import { Section } from '../ui/Section'
import { Segmented } from '../ui/Segmented'
import { ImageUpload } from './ImageUpload'
import { FONT_OPTIONS } from './fonts'
import { layoutContext } from '../../utils/document'

const PRESETS: Array<{ name: string; primary: string; accent: string }> = [
  { name: 'Navy', primary: '#0F1B3D', accent: '#3B5BFD' },
  { name: 'Emerald', primary: '#0B3B2E', accent: '#10B981' },
  { name: 'Burgundy', primary: '#4A1024', accent: '#D9466F' },
  { name: 'Graphite', primary: '#1F2937', accent: '#F59E0B' },
  { name: 'Violet', primary: '#2E1065', accent: '#8B5CF6' },
  { name: 'Ocean', primary: '#0C4A6E', accent: '#06B6D4' },
]

export function StyleForm() {
  const doc = useEditorStore((s) => s.doc)
  const { setPaletteColor, setFonts, setBackground, commit } = useEditorStore()
  if (!doc) return null
  const template = getTemplate(doc.templateId)
  const bg = doc.background

  const resetStyle = () =>
    commit({ ...doc, palette: { ...template.palette }, fonts: { ...template.fonts }, background: template.background(layoutContext(doc.orientation)) })

  return (
    <>
      <Section
        title="Цвета темы"
        icon={<Paintbrush className="size-4" />}
        action={
          <button type="button" onClick={resetStyle} className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-faint hover:text-brand" title="Вернуть стиль шаблона">
            <RotateCcw className="size-3" /> Сброс
          </button>
        }
      >
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              title={p.name}
              onClick={() => commit({ ...doc, palette: { ...doc.palette, primary: p.primary, accent: p.accent } })}
              className="flex h-7 overflow-hidden rounded-lg ring-1 ring-black/10 transition-transform hover:scale-105"
            >
              <span className="w-5" style={{ background: p.primary }} />
              <span className="w-3" style={{ background: p.accent }} />
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {(Object.keys(doc.palette) as PaletteKey[]).map((key) => (
            <ColorField key={key} label={PALETTE_LABELS[key]} value={doc.palette[key]} onChange={(v) => setPaletteColor(key, v)} />
          ))}
        </div>
      </Section>

      <Section title="Типографика" icon={<Type className="size-4" />}>
        <SelectField label="Шрифт заголовков" value={doc.fonts.heading} options={FONT_OPTIONS} onChange={(v) => setFonts({ heading: v })} />
        <SelectField label="Основной шрифт" value={doc.fonts.body} options={FONT_OPTIONS} onChange={(v) => setFonts({ body: v })} />
        <p className="rounded-lg bg-canvas px-3 py-2 text-[11px] leading-relaxed text-ink-muted">
          Элементы с шрифтом «Заголовки» или «Основной» меняются вместе с темой. Отдельный шрифт можно задать в свойствах элемента.
        </p>
      </Section>

      <Section title="Фон" icon={<ImageIcon className="size-4" />}>
        <Segmented<BackgroundType>
          value={bg.type}
          onChange={(type) => setBackground({ type })}
          options={[
            { value: 'solid', label: 'Цвет' },
            { value: 'gradient', label: 'Градиент' },
            { value: 'image', label: 'Фото' },
          ]}
        />
        <ColorField label={bg.type === 'gradient' ? 'Начальный цвет' : 'Цвет фона'} value={bg.color} palette={doc.palette} onChange={(color) => setBackground({ color })} />
        {bg.type === 'gradient' && (
          <>
            <ColorField label="Конечный цвет" value={bg.color2} palette={doc.palette} onChange={(color2) => setBackground({ color2 })} />
            <SliderField label="Угол" value={bg.angle} min={0} max={360} format={(v) => `${v}°`} onChange={(angle) => setBackground({ angle })} />
          </>
        )}
        {bg.type === 'image' && (
          <>
            <ImageUpload label="Фоновое изображение" value={bg.image} onChange={(image) => setBackground({ image })} maxSide={2400} />
            <SliderField
              label="Непрозрачность фото"
              value={Math.round(bg.imageOpacity * 100)}
              min={5}
              max={100}
              format={(v) => `${v}%`}
              onChange={(v) => setBackground({ imageOpacity: v / 100 })}
            />
          </>
        )}
      </Section>
    </>
  )
}
