import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Check, Download, Eye, EyeOff, Loader2, Redo2, Undo2 } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { LogoMark } from '../layout/Logo'
import { Button, IconButton } from '../ui/Button'
import { ExportDialog } from './ExportDialog'

export function EditorTopbar({ saving }: { saving: boolean }) {
  const name = useEditorStore((s) => s.name)
  const setName = useEditorStore((s) => s.setName)
  const canUndo = useEditorStore((s) => s.past.length > 0)
  const canRedo = useEditorStore((s) => s.future.length > 0)
  const preview = useEditorStore((s) => s.preview)
  const { undo, redo, togglePreview } = useEditorStore()
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-2 sm:gap-3 sm:px-3">
      <Link to="/projects" className="flex items-center gap-1 rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink" title="К проектам">
        <ArrowLeft className="size-4" />
        <LogoMark className="hidden size-7 sm:block" />
      </Link>
      <div className="h-6 w-px bg-line max-sm:hidden" />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 w-full max-w-72 min-w-0 rounded-lg px-2 text-[14px] font-bold text-ink hover:bg-canvas focus:bg-canvas focus:ring-2 focus:ring-brand/15 focus:outline-none"
          aria-label="Название проекта"
        />
        <span className="hidden shrink-0 items-center gap-1 text-[12px] font-medium text-ink-faint md:inline-flex">
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          {saving ? 'Сохранение…' : 'Сохранено'}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <IconButton label="Отменить (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
          <Undo2 className="size-4" />
        </IconButton>
        <IconButton label="Повторить (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
          <Redo2 className="size-4" />
        </IconButton>
      </div>
      <div className="h-6 w-px bg-line max-sm:hidden" />
      <Button variant={preview ? 'primary' : 'secondary'} size="sm" className="h-9 max-sm:px-2.5" onClick={() => togglePreview()} icon={preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}>
        <span className="max-sm:hidden">{preview ? 'Редактор' : 'Просмотр'}</span>
      </Button>
      <Button variant="brand" size="sm" className="h-9 max-sm:px-2.5" onClick={() => setExportOpen(true)} icon={<Download className="size-4" />}>
        <span className="max-sm:hidden">Скачать</span>
      </Button>
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </header>
  )
}
