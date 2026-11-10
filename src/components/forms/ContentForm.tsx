import { Boxes, Stamp, Building2, GraduationCap, ImageIcon, MapPin, Type, UserRound } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import type { FieldKey } from '../../types/template'
import { FIELD_LABELS } from '../../utils/fieldLabels'
import { Section } from '../ui/Section'
import { TextAreaField, TextField } from '../ui/Field'
import { ImageUpload } from './ImageUpload'
import { BrandAssetField } from './BrandAssetField'
import { TechPicker } from './TechPicker'

/** Which fields the current layout actually uses, so the form can flag unused ones. */
function useUsedFields(): Set<string> {
  const elements = useEditorStore((s) => s.doc?.elements)
  const used = new Set<string>()
  for (const el of elements ?? []) {
    if (el.type !== 'text') continue
    for (const m of el.content.matchAll(/\{\{(\w+)\}\}/g)) used.add(m[1])
  }
  return used
}

function Field({ k, multiline, placeholder, used, label }: { k: FieldKey; multiline?: boolean; placeholder?: string; used: Set<string>; label?: string }) {
  const value = useEditorStore((s) => s.doc?.fields[k] ?? '')
  const setField = useEditorStore((s) => s.setField)
  const hint = used.has(k) ? undefined : 'не в макете'
  const props = { label: label ?? FIELD_LABELS[k], hint, value, placeholder, onChange: (v: string) => setField(k, v) }
  return multiline ? <TextAreaField {...props} rows={2} /> : <TextField {...props} />
}

export function ContentForm() {
  const used = useUsedFields()
  const image = useEditorStore((s) => s.doc?.fields.image ?? null)
  const usesTech = useEditorStore((s) => !!s.doc?.elements.some((e) => e.type === 'tech'))
  const setField = useEditorStore((s) => s.setField)
  return (
    <>
      <Section title="Работа" icon={<Type className="size-4" />}>
        <Field k="workType" used={used} placeholder="Курсовая работа" />
        <Field k="title" multiline used={used} placeholder="Тема работы" />
        <Field k="subtitle" multiline used={used} placeholder="Короткое описание" />
        <Field k="subject" used={used} placeholder="Дисциплина или предмет" />
      </Section>
      <Section title="Автор" icon={<UserRound className="size-4" />}>
        <div className="grid grid-cols-[1fr_1.6fr] gap-2">
          <Field k="studentLabel" label="Подпись" used={used} />
          <Field k="studentName" label="ФИО" used={used} placeholder="Фамилия Имя" />
        </div>
        <Field k="studentGroup" used={used} placeholder="Группа, класс или роль" />
      </Section>
      <Section title="Руководитель" icon={<GraduationCap className="size-4" />}>
        <div className="grid grid-cols-[1fr_1.6fr] gap-2">
          <Field k="teacherLabel" label="Подпись" used={used} />
          <Field k="teacherName" label="ФИО" used={used} placeholder="ФИО" />
        </div>
        <Field k="teacherTitle" used={used} placeholder="Должность, степень" />
      </Section>
      <Section title="Учреждение" icon={<Building2 className="size-4" />}>
        <Field k="institution" multiline used={used} placeholder="Название учреждения" />
        <Field k="department" multiline used={used} placeholder="Факультет, кафедра, отдел" />
      </Section>
      <Section title="Технологии" icon={<Boxes className="size-4" />} defaultOpen={usesTech}>
        <TechPicker />
      </Section>
      <Section title="Логотип, печать и подпись" icon={<Stamp className="size-4" />}>
        <BrandAssetField slot="logo" />
        <BrandAssetField slot="seal" />
        <BrandAssetField slot="signature" />
      </Section>
      <Section title="Город и год" icon={<MapPin className="size-4" />}>
        <div className="grid grid-cols-2 gap-2">
          <Field k="city" used={used} />
          <Field k="year" used={used} />
        </div>
      </Section>
      <Section title="Изображение" icon={<ImageIcon className="size-4" />} defaultOpen={!!image}>
        <ImageUpload label="Иллюстрация или фото" value={image} onChange={(v) => setField('image', v)} hint="Используется в шаблонах с фото" />
      </Section>
    </>
  )
}
