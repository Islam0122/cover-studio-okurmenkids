import { useSearchParams } from 'react-router'
import { TemplateGallery } from '../components/templates/TemplateGallery'
import { CATEGORIES } from '../templates'
import type { CategoryId } from '../types/template'

export default function TemplatesPage() {
  const [params] = useSearchParams()
  const c = params.get('category')
  const initial = CATEGORIES.some((x) => x.id === c) ? (c as CategoryId) : 'all'
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Шаблоны</h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          Выберите шаблон, чтобы открыть его в редакторе. Данные, которые вы введёте, сохранятся при смене шаблона.
        </p>
      </div>
      <TemplateGallery initialCategory={initial} />
    </div>
  )
}
