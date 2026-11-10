import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { Copy, MoreHorizontal, PencilLine, Trash2 } from 'lucide-react'
import type { Project } from '../../types/template'
import { CoverThumb } from '../templates/CoverThumb'
import { useProjectStore } from '../../store/projectStore'
import { getTemplate } from '../../templates'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { toast } from '../ui/Toast'

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const { duplicateProject, deleteProject } = useProjectStore()
  const [menu, setMenu] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const getDoc = useCallback(() => project.document, [project.document])
  const landscape = project.document.orientation === 'landscape'

  return (
    <div className="group relative flex flex-col rounded-2xl border border-line bg-white p-3 shadow-card transition-all duration-200 hover:border-line-strong hover:shadow-lift">
      <button
        type="button"
        onClick={() => navigate(`/editor/${project.id}`)}
        className="flex aspect-[4/4.2] items-center justify-center rounded-xl bg-canvas p-5"
        aria-label={`Открыть «${project.name}»`}
      >
        <CoverThumb
          cacheKey={`prj:${project.id}:${project.updatedAt}`}
          getDoc={getDoc}
          orientation={project.document.orientation}
          alt={project.name}
          className={landscape ? 'w-full' : 'h-full'}
        />
      </button>
      <div className="flex items-start gap-2 px-1 pt-3 pb-1">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-bold text-ink">{project.name}</h3>
          <p className="mt-0.5 truncate text-[12px] text-ink-muted">
            {getTemplate(project.document.templateId).name} · {dateFmt.format(project.updatedAt)}
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            className="rounded-lg p-1.5 text-ink-faint hover:bg-ink/5 hover:text-ink"
            aria-label="Действия с проектом"
            aria-expanded={menu}
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 bottom-9 z-20 w-44 animate-pop rounded-xl border border-line bg-white p-1 shadow-lift">
                <MenuItem icon={<PencilLine className="size-4" />} onClick={() => navigate(`/editor/${project.id}`)}>
                  Открыть
                </MenuItem>
                <MenuItem
                  icon={<Copy className="size-4" />}
                  onClick={() => {
                    setMenu(false)
                    duplicateProject(project.id)
                    toast.success('Копия создана')
                  }}
                >
                  Дублировать
                </MenuItem>
                <MenuItem
                  danger
                  icon={<Trash2 className="size-4" />}
                  onClick={() => {
                    setMenu(false)
                    setConfirm(true)
                  }}
                >
                  Удалить
                </MenuItem>
              </div>
            </>
          )}
        </div>
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Удалить проект?"
        description={`«${project.name}» будет удалён из этого браузера без возможности восстановления.`}
        width={420}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Отмена
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="size-4" />}
              onClick={() => {
                deleteProject(project.id)
                setConfirm(false)
                toast.success('Проект удалён')
              }}
            >
              Удалить
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-ink-muted">Скачанные ранее PDF и PNG останутся у вас.</p>
      </Modal>
    </div>
  )
}

function MenuItem({ icon, children, onClick, danger }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold ${danger ? 'text-danger hover:bg-danger/5' : 'text-ink-soft hover:bg-canvas hover:text-ink'}`}
    >
      {icon}
      {children}
    </button>
  )
}
