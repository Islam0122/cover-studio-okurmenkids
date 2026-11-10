import type { ReactNode } from 'react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Braces,
  Copy,
  Italic,
  Lock,
  MousePointer2,
  CaseUpper,
  Trash2,
} from 'lucide-react'
import { selectSelectedElement, useEditorStore, type ElementPatch } from '../../store/editorStore'
import type { CoverElement, ImageElement, Palette, ShapeElement, TechElement, TechLabels, TextAlign, TextElement } from '../../types/template'
import { TechPicker } from '../forms/TechPicker'
import { FIELD_KEYS } from '../../utils/document'
import { FIELD_LABELS } from '../../utils/fieldLabels'
import { ColorField } from '../ui/ColorField'
import { Label, NumberField, SelectField, SliderField, TextAreaField, TextField } from '../ui/Field'
import { Section } from '../ui/Section'
import { Segmented } from '../ui/Segmented'
import { IconButton } from '../ui/Button'
import { ImageUpload } from '../forms/ImageUpload'
import { BRAND_LOGOS } from '../../templates/brand'
import { FONT_OPTIONS, WEIGHT_OPTIONS } from '../forms/fonts'
import { cn } from '../ui/cn'

const SLOT_LABELS = { logo: 'Логотип', seal: 'Печать', signature: 'Подпись', image: 'Изображение' } as const

const THEME_FONTS = [
  { value: '$heading', label: 'Тема · заголовки' },
  { value: '$body', label: 'Тема · основной' },
  ...FONT_OPTIONS,
]

export function PropertiesPanel() {
  const el = useEditorStore(selectSelectedElement)
  const palette = useEditorStore((s) => s.doc?.palette)
  const update = useEditorStore((s) => s.updateElement)
  const { duplicateElement, removeElement, moveLayer } = useEditorStore()

  if (!el || !palette) return <EmptyState />
  const set = (patch: ElementPatch) => update(el.id, patch)

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-line px-3 py-2.5">
        <input
          value={el.name}
          onChange={(e) => update(el.id, { name: e.target.value }, `name:${el.id}`)}
          className="h-8 min-w-0 flex-1 rounded-md bg-transparent px-1.5 text-[13px] font-bold text-ink hover:bg-canvas focus:bg-canvas focus:outline-none"
          aria-label="Название слоя"
        />
        <IconButton size="sm" label="На передний план" onClick={() => moveLayer(el.id, 'top')}>
          <ArrowUpToLine className="size-3.5" />
        </IconButton>
        <IconButton size="sm" label="На задний план" onClick={() => moveLayer(el.id, 'bottom')}>
          <ArrowDownToLine className="size-3.5" />
        </IconButton>
        <IconButton size="sm" label="Дублировать (Ctrl+D)" onClick={() => duplicateElement(el.id)}>
          <Copy className="size-3.5" />
        </IconButton>
        <IconButton size="sm" label="Удалить (Delete)" onClick={() => removeElement(el.id)} className="hover:!bg-danger/5 hover:!text-danger">
          <Trash2 className="size-3.5" />
        </IconButton>
      </div>

      {el.locked && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800">
          <Lock className="size-3.5" /> Элемент заблокирован на холсте
          <button type="button" className="ml-auto font-bold underline-offset-2 hover:underline" onClick={() => set({ locked: false })}>
            Открыть
          </button>
        </div>
      )}

      {el.type === 'text' && <TextProps el={el} set={set} />}
      {el.type === 'shape' && <ShapeProps el={el} set={set} palette={palette} />}
      {el.type === 'image' && <ImageProps el={el} set={set} />}
      {el.type === 'tech' && <TechProps el={el} set={set} palette={palette} />}

      <Section title="Положение и размер">
        <Geometry el={el} set={set} />
      </Section>
      {el.type === 'text' && (
        <Section title="Цвет">
          <ColorField value={el.color} palette={palette} onChange={(color) => set({ color })} />
        </Section>
      )}
    </div>
  )
}

function Geometry({ el, set }: { el: CoverElement; set: (p: ElementPatch) => void }) {
  const isLine = el.type === 'shape' && el.shape === 'line'
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="X" value={el.x} onChange={(x) => set({ x })} />
        <NumberField label="Y" value={el.y} onChange={(y) => set({ y })} />
        <NumberField label="Ш" value={el.width} min={4} onChange={(width) => set({ width })} />
        <NumberField
          label="В"
          value={el.height}
          min={isLine ? 0 : 4}
          disabled={el.type === 'text' || isLine}
          onChange={(height) => set({ height })}
        />
        <NumberField label="∠" value={el.rotation} min={-360} max={360} suffix="°" onChange={(rotation) => set({ rotation })} />
        <NumberField label="α" value={Math.round(el.opacity * 100)} min={0} max={100} suffix="%" onChange={(v) => set({ opacity: v / 100 })} />
      </div>
      {el.type === 'text' && <p className="text-[11px] text-ink-faint">Высота текста подстраивается под содержимое.</p>}
    </>
  )
}

function TextProps({ el, set }: { el: TextElement; set: (p: ElementPatch) => void }) {
  const insert = (key: string) => set({ content: `${el.content}{{${key}}}` })
  return (
    <Section title="Текст">
      <TextAreaField
        label="Содержимое"
        hint={<span className="inline-flex items-center gap-1"><Braces className="size-3" />поля в {'{{ }}'}</span>}
        rows={3}
        value={el.content}
        onChange={(content) => set({ content })}
      />
      <SelectField
        label="Вставить поле"
        value=""
        onChange={(k) => k && insert(k)}
        options={[{ value: '', label: 'Выберите поле…' }, ...FIELD_KEYS.map((k) => ({ value: k, label: FIELD_LABELS[k] }))]}
      />
      <SelectField label="Шрифт" value={el.fontFamily} options={THEME_FONTS} onChange={(fontFamily) => set({ fontFamily })} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Размер</Label>
          <NumberField label="pt" value={el.fontSize} min={4} max={400} onChange={(fontSize) => set({ fontSize })} />
        </div>
        <SelectField
          label="Насыщенность"
          value={String(el.fontWeight)}
          options={WEIGHT_OPTIONS}
          onChange={(v) => set({ fontWeight: Number(v) })}
        />
      </div>
      <div>
        <Label>Выравнивание</Label>
        <div className="flex gap-2">
          <Segmented<TextAlign>
            className="flex-1"
            size="sm"
            value={el.align}
            onChange={(align) => set({ align })}
            options={[
              { value: 'left', label: <AlignLeft className="size-3.5" />, title: 'По левому краю' },
              { value: 'center', label: <AlignCenter className="size-3.5" />, title: 'По центру' },
              { value: 'right', label: <AlignRight className="size-3.5" />, title: 'По правому краю' },
              { value: 'justify', label: <AlignJustify className="size-3.5" />, title: 'По ширине' },
            ]}
          />
          <ToggleBtn active={el.italic} label="Курсив" onClick={() => set({ italic: !el.italic })}>
            <Italic className="size-3.5" />
          </ToggleBtn>
          <ToggleBtn active={el.uppercase} label="Заглавные" onClick={() => set({ uppercase: !el.uppercase })}>
            <CaseUpper className="size-3.5" />
          </ToggleBtn>
        </div>
      </div>
      <SliderField label="Межстрочный интервал" value={el.lineHeight} min={0.8} max={2.4} step={0.05} format={(v) => v.toFixed(2)} onChange={(lineHeight) => set({ lineHeight })} />
      <SliderField label="Межбуквенный интервал" value={el.letterSpacing} min={-100} max={600} step={10} onChange={(letterSpacing) => set({ letterSpacing })} />
    </Section>
  )
}

function ToggleBtn({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition-colors',
        active ? 'bg-ink text-white ring-ink' : 'bg-white text-ink-muted ring-line hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function ShapeProps({ el, set, palette }: { el: ShapeElement; set: (p: ElementPatch) => void; palette: Palette }) {
  if (el.shape === 'line') {
    return (
      <Section title="Линия">
        <ColorField label="Цвет" value={el.stroke} palette={palette} onChange={(stroke) => set({ stroke })} />
        <SliderField label="Толщина" value={el.strokeWidth} min={1} max={24} step={0.5} format={(v) => `${v}px`} onChange={(strokeWidth) => set({ strokeWidth })} />
      </Section>
    )
  }
  return (
    <Section title={el.shape === 'ellipse' ? 'Эллипс' : 'Прямоугольник'}>
      <ColorField label="Заливка" value={el.fill} palette={palette} allowTransparent onChange={(fill) => set({ fill })} />
      <ColorField label="Обводка" value={el.stroke} palette={palette} allowTransparent onChange={(stroke) => set({ stroke })} />
      <SliderField label="Толщина обводки" value={el.strokeWidth} min={0} max={24} step={0.5} format={(v) => `${v}px`} onChange={(strokeWidth) => set({ strokeWidth })} />
      {el.shape === 'rect' && (
        <SliderField label="Скругление" value={el.radius} min={0} max={Math.round(Math.min(el.width, el.height) / 2)} onChange={(radius) => set({ radius })} format={(v) => `${v}px`} />
      )}
    </Section>
  )
}

function ImageProps({ el, set }: { el: ImageElement; set: (p: ElementPatch) => void }) {
  const fields = useEditorStore((s) => s.doc?.fields)
  const setField = useEditorStore((s) => s.setField)
  const src = el.slot ? (fields?.[el.slot] ?? null) : (el.src ?? null)
  return (
    <Section title="Изображение">
      <ImageUpload
        label={el.slot ? `${SLOT_LABELS[el.slot]} (общее для проекта)` : 'Файл'}
        value={src}
        maxSide={el.slot && el.slot !== 'image' ? 1000 : 1800}
        presets={el.slot === 'logo' ? BRAND_LOGOS : undefined}
        knockout={el.slot === 'seal' || el.slot === 'signature'}
        onChange={(v) => (el.slot ? setField(el.slot, v) : set({ src: v }))}
        compact
      />
      <div>
        <Label>Заполнение</Label>
        <Segmented
          value={el.fit}
          onChange={(fit) => set({ fit })}
          options={[
            { value: 'contain', label: 'Вписать' },
            { value: 'cover', label: 'Заполнить' },
          ]}
        />
      </div>
      <SliderField label="Скругление" value={el.radius} min={0} max={Math.round(Math.min(el.width, el.height) / 2)} format={(v) => `${v}px`} onChange={(radius) => set({ radius })} />
    </Section>
  )
}

function TechProps({ el, set, palette }: { el: TechElement; set: (p: ElementPatch) => void; palette: Palette }) {
  return (
    <>
      <Section title="Технологии">
        <TechPicker />
      </Section>
      <Section title="Оформление логотипов">
        <SliderField label="Размер логотипа" value={el.iconSize} min={16} max={200} format={(v) => `${v}px`} onChange={(iconSize) => set({ iconSize })} />
        <SliderField label="Расстояние" value={el.gap} min={0} max={160} format={(v) => `${v}px`} onChange={(gap) => set({ gap })} />
        <div>
          <Label>Подписи</Label>
          <Segmented<TechLabels>
            value={el.labels}
            onChange={(labels) => set({ labels })}
            options={[
              { value: 'top', label: 'Сверху' },
              { value: 'bottom', label: 'Снизу' },
              { value: 'none', label: 'Без' },
            ]}
          />
        </div>
        {el.labels !== 'none' && (
          <>
            <SliderField label="Размер подписи" value={el.labelSize} min={8} max={40} format={(v) => `${v}px`} onChange={(labelSize) => set({ labelSize })} />
            <SelectField label="Шрифт подписи" value={el.fontFamily} options={THEME_FONTS} onChange={(fontFamily) => set({ fontFamily })} />
            <ColorField label="Цвет подписи" value={el.labelColor} palette={palette} onChange={(labelColor) => set({ labelColor })} />
          </>
        )}
        <div>
          <Label>Выравнивание</Label>
          <Segmented
            size="sm"
            value={el.align}
            onChange={(align) => set({ align })}
            options={[
              { value: 'left', label: <AlignLeft className="size-3.5" />, title: 'Слева' },
              { value: 'center', label: <AlignCenter className="size-3.5" />, title: 'По центру' },
              { value: 'right', label: <AlignRight className="size-3.5" />, title: 'Справа' },
            ]}
          />
        </div>
      </Section>
    </>
  )
}

function EmptyState() {
  const doc = useEditorStore((s) => s.doc)
  const name = useEditorStore((s) => s.name)
  const setName = useEditorStore((s) => s.setName)
  return (
    <div className="p-4">
      <TextField label="Название проекта" value={name} onChange={setName} />
      <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-line-strong px-4 py-8 text-center">
        <span className="flex size-10 items-center justify-center rounded-xl bg-canvas text-ink-faint">
          <MousePointer2 className="size-5" />
        </span>
        <p className="mt-3 text-[13px] font-bold">Ничего не выбрано</p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
          Нажмите на элемент на холсте или в списке слоёв, чтобы изменить его положение, шрифт и цвет.
        </p>
      </div>
      {doc && (
        <dl className="mt-5 space-y-2 text-[12px]">
          <Row label="Формат" value={`A4 · ${doc.orientation === 'portrait' ? 'книжная' : 'альбомная'}`} />
          <Row label="Элементов" value={String(doc.elements.length)} />
        </dl>
      )}
      <div className="mt-5 rounded-xl bg-canvas p-3 text-[11.5px] leading-relaxed text-ink-muted">
        <p className="mb-1.5 font-bold text-ink-soft">Горячие клавиши</p>
        <ul className="space-y-1">
          {[
            ['Ctrl+Z / Ctrl+Shift+Z', 'отменить / повторить'],
            ['Delete', 'удалить элемент'],
            ['Ctrl+D', 'дублировать'],
            ['Стрелки (+Shift)', 'сдвиг на 1 / 10 px'],
            ['Двойной клик', 'редактировать текст'],
            ['Ctrl + колесо', 'масштаб'],
          ].map(([k, v]) => (
            <li key={k} className="grid grid-cols-[auto_1fr] gap-3">
              <kbd className="font-mono text-[10.5px] text-ink-soft">{k}</kbd>
              <span className="text-right">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  )
}
