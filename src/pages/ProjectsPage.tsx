import { FolderOpen, Plus } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { ProjectGrid } from '../components/projects/ProjectGrid'
import { useProjectStore } from '../store/projectStore'

export default function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects)
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Мои проекты</h1>
          <p className="mt-2 text-[15px] text-ink-muted">Сохраняются автоматически в этом браузере.</p>
        </div>
        <ButtonLink to="/templates" icon={<Plus className="size-4" />}>
          Новый проект
        </ButtonLink>
      </div>
      {sorted.length ? (
        <ProjectGrid projects={sorted} />
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-white px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <FolderOpen className="size-6" />
          </div>
          <p className="mt-4 text-[16px] font-bold">Пока нет проектов</p>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">Выберите шаблон — проект появится здесь и будет сохраняться при каждом изменении.</p>
          <ButtonLink to="/templates" className="mt-6" icon={<Plus className="size-4" />}>
            Создать обложку
          </ButtonLink>
        </div>
      )}
    </div>
  )
}
