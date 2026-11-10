import { useState } from 'react'
import { LayoutTemplate, Palette, PenLine } from 'lucide-react'
import { PanelTabs } from './PanelTabs'
import { TemplatePicker } from '../forms/TemplatePicker'
import { ContentForm } from '../forms/ContentForm'
import { StyleForm } from '../forms/StyleForm'
import { useEditorStore } from '../../store/editorStore'
import { Segmented } from '../ui/Segmented'
import type { Orientation } from '../../types/template'

type Tab = 'content' | 'template' | 'style'

export function LeftSidebar() {
  const [tab, setTab] = useState<Tab>('content')
  const orientation = useEditorStore((s) => s.doc?.orientation ?? 'portrait')
  const setOrientation = useEditorStore((s) => s.setOrientation)
  return (
    <div className="flex h-full flex-col">
      <PanelTabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'content', label: 'Данные', icon: <PenLine className="size-3.5" /> },
          { value: 'template', label: 'Шаблон', icon: <LayoutTemplate className="size-3.5" /> },
          { value: 'style', label: 'Стиль', icon: <Palette className="size-3.5" /> },
        ]}
      />
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        {tab === 'content' && <ContentForm />}
        {tab === 'template' && (
          <div className="space-y-5 p-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-ink-soft">Ориентация листа A4</p>
              <Segmented<Orientation>
                value={orientation}
                onChange={setOrientation}
                options={[
                  { value: 'portrait', label: 'Книжная' },
                  { value: 'landscape', label: 'Альбомная' },
                ]}
              />
              <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">Макет перестроится под новый формат; текст, цвета и ваши элементы сохранятся.</p>
            </div>
            <TemplatePicker />
          </div>
        )}
        {tab === 'style' && <StyleForm />}
      </div>
    </div>
  )
}
