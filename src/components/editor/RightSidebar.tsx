import { useState } from 'react'
import { Layers, SlidersHorizontal } from 'lucide-react'
import { PanelTabs } from './PanelTabs'
import { PropertiesPanel } from './PropertiesPanel'
import { LayersPanel } from './LayersPanel'
import { useEditorStore } from '../../store/editorStore'

type Tab = 'props' | 'layers'

export function RightSidebar() {
  const [tab, setTab] = useState<Tab>('props')
  const count = useEditorStore((s) => s.doc?.elements.length ?? 0)
  return (
    <div className="flex h-full flex-col">
      <PanelTabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'props', label: 'Свойства', icon: <SlidersHorizontal className="size-3.5" /> },
          {
            value: 'layers',
            label: 'Слои',
            icon: <Layers className="size-3.5" />,
            badge: <span className="rounded-full bg-canvas px-1.5 text-[10px] font-bold text-ink-faint tabular-nums">{count}</span>,
          },
        ]}
      />
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">{tab === 'props' ? <PropertiesPanel /> : <LayersPanel />}</div>
    </div>
  )
}
