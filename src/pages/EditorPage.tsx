import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { AlertTriangle, PenLine, SlidersHorizontal, X } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import { useEditorStore } from '../store/editorStore'
import { useAutosave } from '../hooks/useAutosave'
import { useEditorShortcuts } from '../hooks/useEditorShortcuts'
import { EditorTopbar } from '../components/editor/EditorTopbar'
import { LeftSidebar } from '../components/editor/LeftSidebar'
import { RightSidebar } from '../components/editor/RightSidebar'
import { CoverCanvas } from '../components/editor/CoverCanvas'
import { ElementToolbar } from '../components/editor/ElementToolbar'
import { ZoomBar } from '../components/editor/ZoomBar'
import { cn } from '../components/ui/cn'
import NotFoundPage from './NotFoundPage'

type MobilePanel = 'left' | 'right' | null

export default function EditorPage() {
  const { projectId } = useParams()
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId))
  const storageError = useProjectStore((s) => s.storageError)
  const clearStorageError = useProjectStore((s) => s.clearStorageError)
  const openId = useEditorStore((s) => s.projectId)
  const hasDoc = useEditorStore((s) => !!s.doc)
  const preview = useEditorStore((s) => s.preview)
  const [panel, setPanel] = useState<MobilePanel>(null)
  const saving = useAutosave()
  useEditorShortcuts()

  // open the project once per id; later store updates come from the editor itself
  const found = !!project
  useEffect(() => {
    if (!projectId) return
    const p = useProjectStore.getState().projects.find((x) => x.id === projectId)
    if (p) useEditorStore.getState().open(p.id, p.name, p.document)
    return () => useEditorStore.getState().close()
  }, [projectId, found])

  useEffect(() => {
    if (project) document.title = `${project.name} — Cover Studio`
    return () => {
      document.title = 'Cover Studio — красивые обложки за минуты'
    }
  }, [project])

  if (!project) return <NotFoundPage title="Проект не найден" text="Он мог быть удалён или создан в другом браузере." />
  if (openId !== project.id || !hasDoc) return <div className="h-full bg-canvas" />

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <EditorTopbar saving={saving} />
      {storageError && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[12.5px] font-medium text-amber-900">
          <AlertTriangle className="size-4 shrink-0" />
          <span className="flex-1">{storageError}</span>
          <button type="button" onClick={clearStorageError} className="rounded p-1 hover:bg-amber-100" aria-label="Скрыть">
            <X className="size-4" />
          </button>
        </div>
      )}
      <div className="relative flex min-h-0 flex-1">
        {!preview && (
          <aside
            className={cn(
              'z-30 flex-col border-line bg-white max-lg:fixed max-lg:inset-x-0 max-lg:bottom-14 max-lg:h-[68dvh] max-lg:rounded-t-2xl max-lg:border-t max-lg:shadow-lift lg:flex lg:w-[300px] lg:shrink-0 lg:border-r',
              panel === 'left' ? 'flex' : 'hidden',
            )}
          >
            <LeftSidebar />
          </aside>
        )}

        <main className="relative min-w-0 flex-1">
          <CoverCanvas />
          {!preview && (
            <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
              <div className="pointer-events-auto">
                <ElementToolbar />
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute right-3 bottom-3 flex justify-end max-lg:bottom-17">
            <div className="pointer-events-auto">
              <ZoomBar />
            </div>
          </div>
          {preview && (
            <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
              <span className="rounded-full bg-ink/85 px-3 py-1.5 text-[12px] font-semibold text-white shadow-lift">
                Режим просмотра · Esc — вернуться
              </span>
            </div>
          )}
        </main>

        {!preview && (
          <aside
            className={cn(
              'z-30 flex-col border-line bg-white max-lg:fixed max-lg:inset-x-0 max-lg:bottom-14 max-lg:h-[68dvh] max-lg:rounded-t-2xl max-lg:border-t max-lg:shadow-lift lg:flex lg:w-[288px] lg:shrink-0 lg:border-l',
              panel === 'right' ? 'flex' : 'hidden',
            )}
          >
            <RightSidebar />
          </aside>
        )}
      </div>

      {/* mobile panel switcher */}
      <nav className="z-40 flex h-14 shrink-0 items-center gap-2 border-t border-line bg-white px-3 lg:hidden">
        {(
          [
            { id: 'left', label: 'Данные и стиль', icon: PenLine },
            { id: 'right', label: 'Свойства и слои', icon: SlidersHorizontal },
          ] as const
        ).map((b) => (
          <button
            key={b.id}
            type="button"
            disabled={preview}
            onClick={() => setPanel((p) => (p === b.id ? null : b.id))}
            className={cn(
              'flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-40',
              panel === b.id ? 'bg-ink text-white' : 'bg-canvas text-ink-soft',
            )}
          >
            <b.icon className="size-4" />
            {b.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
