import { ButtonLink } from '../components/ui/Button'

export default function NotFoundPage({ title = 'Страница не найдена', text = 'Возможно, ссылка устарела или была введена с ошибкой.' }: { title?: string; text?: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-bold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{text}</p>
      <div className="mt-6 flex gap-2">
        <ButtonLink to="/" variant="secondary">На главную</ButtonLink>
        <ButtonLink to="/templates">К шаблонам</ButtonLink>
      </div>
    </div>
  )
}
