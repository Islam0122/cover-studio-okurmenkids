import { useCallback } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Download, Eye, FileImage, History, Layers, MousePointerClick, Palette, Sparkles, Type } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { TemplateGallery } from '../components/templates/TemplateGallery'
import { CoverThumb } from '../components/templates/CoverThumb'
import { ProjectGrid } from '../components/projects/ProjectGrid'
import { useProjectStore } from '../store/projectStore'
import { getTemplate, TEMPLATES } from '../templates'
import { documentFromTemplate } from '../templates/build'

function HeroCover({ id, className, style }: { id: string; className: string; style?: React.CSSProperties }) {
  const t = getTemplate(id)
  const getDoc = useCallback(() => documentFromTemplate(t), [t])
  return (
    <div className={className} style={style}>
      <CoverThumb cacheKey={`tpl:${t.id}`} getDoc={getDoc} orientation={t.orientation} alt={t.name} className="w-full shadow-page" />
    </div>
  )
}

const features = [
  { icon: Eye, title: 'Живой предпросмотр', text: 'Каждое изменение сразу видно на листе — без перезагрузок и ожидания.' },
  { icon: Layers, title: 'Редактор со слоями', text: 'Перемещайте, масштабируйте и поворачивайте любой элемент прямо на холсте.' },
  { icon: Download, title: 'PDF и PNG до 384 DPI', text: 'Экспорт в формате A4 книжной или альбомной ориентации, готовый к печати.' },
  { icon: History, title: 'Автосохранение', text: 'Проекты хранятся в браузере. Отмена и повтор — Ctrl+Z / Ctrl+Shift+Z.' },
]

const steps = [
  { icon: MousePointerClick, title: 'Выберите шаблон', text: 'Университет, школа, IT-проект, сертификат, отчёт или слайд.' },
  { icon: Type, title: 'Заполните данные', text: 'Тема, автор, руководитель и учреждение подставятся во все поля.' },
  { icon: Palette, title: 'Настройте стиль', text: 'Цвета темы, шрифты, фон, логотип и собственные элементы.' },
  { icon: FileImage, title: 'Скачайте файл', text: 'PDF для печати или PNG для отправки — в один клик.' },
]

export default function HomePage() {
  const projects = useProjectStore((s) => s.projects)
  const recent = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4)
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_20%,rgba(59,91,253,0.10),transparent_70%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[12px] font-semibold text-ink-soft shadow-card">
              <Sparkles className="size-3.5 text-brand" />
              {TEMPLATES.length} профессиональных шаблонов · бесплатно
            </span>
            <h1 className="mt-5 text-[40px] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance text-ink sm:text-[56px]">
              Создавай красивые обложки <span className="text-brand">за несколько минут</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-muted">
              Титульные листы, сертификаты, отчёты и слайды в формате A4. Заполните поля — Cover Studio сам выстроит
              композицию, а вы скачаете готовый PDF или PNG.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/templates" size="lg" icon={<ArrowRight className="order-last size-4" />}>
                Создать обложку
              </ButtonLink>
              <a href="#templates" className="inline-flex h-12 items-center rounded-xl px-5 text-[15px] font-semibold text-ink-soft hover:bg-ink/5 hover:text-ink">
                Смотреть шаблоны
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                ['A4', 'книжная и альбомная'],
                ['300+', 'DPI для печати'],
                ['0 ₽', 'без регистрации'],
              ].map(([v, l]) => (
                <div key={v}>
                  <dt className="text-xl font-extrabold text-ink">{v}</dt>
                  <dd className="mt-0.5 text-[12px] leading-snug text-ink-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[500px]" aria-hidden="true">
            <HeroCover id="university-band" className="absolute top-6 left-[2%] w-[44%] -rotate-6 animate-fade-up [animation-delay:120ms]" />
            <HeroCover id="it-gradient" className="absolute top-0 right-[4%] w-[44%] rotate-[5deg] animate-fade-up [animation-delay:220ms]" />
            <HeroCover id="certificate-tech" className="absolute bottom-2 left-1/2 z-10 w-[82%] -translate-x-1/2 animate-fade-up [animation-delay:320ms]" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-px bg-line px-0 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white px-6 py-8">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-[15px] font-bold">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent projects */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Продолжить работу</h2>
              <p className="mt-1 text-sm text-ink-muted">Ваши последние проекты</p>
            </div>
            <Link to="/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-ink">
              Все проекты <ArrowRight className="size-4" />
            </Link>
          </div>
          <ProjectGrid projects={recent} />
        </section>
      )}

      {/* Gallery */}
      <section id="templates" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Галерея шаблонов</h2>
            <p className="mt-1.5 text-sm text-ink-muted">Выберите основу — всё остальное можно изменить в редакторе.</p>
          </div>
          <Link to="/templates" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-ink">
            Открыть каталог <ArrowRight className="size-4" />
          </Link>
        </div>
        <TemplateGallery limit={8} />
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-10">
          <h2 className="text-2xl font-extrabold tracking-tight">Как это работает</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title}>
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white">{i + 1}</span>
                  <s.icon className="size-5 text-ink-faint" />
                </div>
                <h3 className="mt-4 text-[15px] font-bold">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(124,147,255,0.35),transparent_70%)]" />
          <h2 className="relative text-3xl font-extrabold tracking-tight text-balance text-white sm:text-4xl">Первая обложка — через пару минут</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-[15px] text-white/70">Без регистрации и водяных знаков. Просто выберите шаблон.</p>
          <ButtonLink to="/templates" variant="secondary" size="lg" className="relative mt-8" icon={<ArrowRight className="order-last size-4" />}>
            Создать обложку
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
