import type { Background, Category, CategoryId, LayoutContext, TemplateDefinition } from '../types/template'
import { image, shape, techRow, text } from '../utils/document'
import { ABSTRACT_ART, BEST_STUDENT_ART, TECH_ART } from './art'
import { OKURMEN_KIDS_LOGO } from './brand'

export const CATEGORIES: Category[] = [
  { id: 'university', label: 'Университет', description: 'Курсовые, рефераты, дипломы' },
  { id: 'school', label: 'Школа', description: 'Проекты и доклады учеников' },
  { id: 'it', label: 'IT-проекты', description: 'Документация и портфолио' },
  { id: 'certificate', label: 'Сертификаты', description: 'Курсы, грамоты, дипломы' },
  { id: 'report', label: 'Отчёты', description: 'Годовые и рабочие отчёты' },
  { id: 'presentation', label: 'Презентации', description: 'Титульные слайды' },
]

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id

const solid = (color: string): Background => ({
  type: 'solid',
  color,
  color2: '$accent',
  angle: 135,
  image: null,
  imageOpacity: 1,
})

/* ------------------------------------------------------------------ */

const universityClassic: TemplateDefinition = {
  id: 'university-classic',
  name: 'Классический титул',
  description: 'Строгий титульный лист по академическим стандартам',
  category: 'university',
  orientation: 'portrait',
  tags: ['курсовая', 'реферат', 'гост', 'титульный лист'],
  palette: { primary: '#0F1B3D', accent: '#3B5BFD', text: '#111827', muted: '#4B5563', surface: '#FFFFFF' },
  fonts: { heading: 'PT Serif', body: 'PT Serif' },
  background: () => solid('$surface'),
  defaults: {
    institution: 'Кыргызский национальный университет им. Ж. Баласагына',
    department: 'Факультет информационных технологий\nКафедра программной инженерии',
    workType: 'Курсовая работа',
    title: 'Разработка веб-приложения для управления учебным процессом',
    subject: 'по дисциплине «Технологии программирования»',
    studentName: 'Асанов Бакыт Эркинович',
    studentGroup: 'Группа ПИ-1-22',
    teacherName: 'Мамбетова Гульнара Асановна',
    teacherTitle: 'к.т.н., доцент',
  },
  layout: ({ width: W, height: H }) => {
    const m = W * 0.1
    const info = W * 0.54
    return [
      text('Учреждение', '{{institution}}', { x: m, y: H * 0.06, width: W - 2 * m, height: 48 }, {
        fontSize: 15, fontWeight: 700, align: 'center', uppercase: true, lineHeight: 1.35,
      }),
      text('Факультет', '{{department}}', { x: m, y: H * 0.06 + 60, width: W - 2 * m, height: 44 }, {
        fontSize: 14, align: 'center', color: '$muted', lineHeight: 1.4,
      }),
      shape('Разделитель', 'line', { x: m, y: H * 0.06 + 122, width: W - 2 * m, height: 0 }, { stroke: '$primary', strokeWidth: 1.5 }),
      image('Логотип', { x: W / 2 - 48, y: H * 0.2, width: 96, height: 96 }, { slot: 'logo' }),
      text('Тип работы', '{{workType}}', { x: m, y: H * 0.355, width: W - 2 * m, height: 24 }, {
        fontSize: 17, fontWeight: 700, align: 'center', uppercase: true, letterSpacing: 300, color: '$primary',
      }),
      text('Тема', '{{title}}', { x: m, y: H * 0.39, width: W - 2 * m, height: 120 }, {
        fontFamily: '$heading', fontSize: 30, fontWeight: 700, align: 'center', lineHeight: 1.25,
      }),
      text('Дисциплина', '{{subject}}', { x: m, y: H * 0.53, width: W - 2 * m, height: 24 }, {
        fontSize: 16, italic: true, align: 'center', color: '$muted',
      }),
      text('Подпись студента', '{{studentLabel}}', { x: info, y: H * 0.68, width: W - info - m, height: 20 }, {
        fontSize: 14, fontWeight: 700,
      }),
      text('Студент', '{{studentName}}\n{{studentGroup}}', { x: info, y: H * 0.68 + 24, width: W - info - m, height: 44 }, {
        fontSize: 14, lineHeight: 1.4,
      }),
      text('Подпись преподавателя', '{{teacherLabel}}', { x: info, y: H * 0.78, width: W - info - m, height: 20 }, {
        fontSize: 14, fontWeight: 700,
      }),
      text('Преподаватель', '{{teacherName}}\n{{teacherTitle}}', { x: info, y: H * 0.78 + 24, width: W - info - m, height: 44 }, {
        fontSize: 14, lineHeight: 1.4,
      }),
      text('Город и год', '{{city}} — {{year}}', { x: m, y: H * 0.92, width: W - 2 * m, height: 20 }, {
        fontSize: 15, align: 'center',
      }),
    ]
  },
}

const universityBand: TemplateDefinition = {
  id: 'university-band',
  name: 'Академ',
  description: 'Современный титул с цветной боковой панелью',
  category: 'university',
  orientation: 'portrait',
  tags: ['курсовая', 'дипломная', 'современный'],
  palette: { primary: '#0F1B3D', accent: '#4F7CFF', text: '#0F1B3D', muted: '#64748B', surface: '#FFFFFF' },
  fonts: { heading: 'Montserrat', body: 'Inter' },
  background: () => solid('$surface'),
  defaults: {
    institution: 'Американский университет в Центральной Азии',
    department: 'Программа «Прикладная математика и информатика»',
    workType: 'Дипломная работа',
    title: 'Машинное обучение в прогнозировании спроса',
    subject: 'Выпускная квалификационная работа бакалавра',
    studentName: 'Токтогулова Айжан',
    studentGroup: 'АМИ-2022',
    teacherName: 'Исаев Нурлан Кубатович',
    teacherTitle: 'PhD, доцент',
  },
  layout: ({ width: W, height: H }) => {
    const band = W * 0.32
    const pad = W * 0.05
    const right = band + W * 0.07
    const rw = W - right - W * 0.08
    return [
      shape('Боковая панель', 'rect', { x: 0, y: 0, width: band, height: H }, { fill: '$primary' }),
      shape('Акцентная полоса', 'rect', { x: band, y: 0, width: 8, height: H }, { fill: '$accent' }),
      image('Логотип', { x: pad, y: H * 0.06, width: 84, height: 84 }, { slot: 'logo' }),
      text('Учреждение', '{{institution}}', { x: pad, y: H * 0.06 + 104, width: band - 2 * pad, height: 80 }, {
        fontFamily: '$heading', fontSize: 15, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.35,
      }),
      text('Факультет', '{{department}}', { x: pad, y: H * 0.06 + 200, width: band - 2 * pad, height: 60 }, {
        fontSize: 12, color: '#C7D2FE', lineHeight: 1.45,
      }),
      text('Город и год', '{{city}}\n{{year}}', { x: pad, y: H * 0.86, width: band - 2 * pad, height: 50 }, {
        fontFamily: '$heading', fontSize: 16, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3,
      }),
      text('Тип работы', '{{workType}}', { x: right, y: H * 0.2, width: rw, height: 22 }, {
        fontSize: 13, fontWeight: 700, uppercase: true, letterSpacing: 250, color: '$accent',
      }),
      text('Тема', '{{title}}', { x: right, y: H * 0.2 + 36, width: rw, height: 200 }, {
        fontFamily: '$heading', fontSize: 38, fontWeight: 800, lineHeight: 1.12,
      }),
      shape('Линия', 'rect', { x: right, y: H * 0.5, width: 64, height: 5 }, { fill: '$accent', radius: 3 }),
      text('Описание', '{{subject}}', { x: right, y: H * 0.5 + 24, width: rw, height: 44 }, {
        fontSize: 15, color: '$muted', lineHeight: 1.45,
      }),
      text('Подпись студента', '{{studentLabel}}', { x: right, y: H * 0.7, width: rw, height: 18 }, {
        fontSize: 11, fontWeight: 600, uppercase: true, letterSpacing: 150, color: '$muted',
      }),
      text('Студент', '{{studentName}}\n{{studentGroup}}', { x: right, y: H * 0.7 + 22, width: rw, height: 44 }, {
        fontSize: 16, fontWeight: 600, lineHeight: 1.4,
      }),
      text('Подпись преподавателя', '{{teacherLabel}}', { x: right, y: H * 0.8, width: rw, height: 18 }, {
        fontSize: 11, fontWeight: 600, uppercase: true, letterSpacing: 150, color: '$muted',
      }),
      text('Преподаватель', '{{teacherName}}\n{{teacherTitle}}', { x: right, y: H * 0.8 + 22, width: rw, height: 44 }, {
        fontSize: 16, fontWeight: 600, lineHeight: 1.4,
      }),
    ]
  },
}

const school21: TemplateDefinition = {
  id: 'school-classic-ky',
  name: 'Окуучунун иши',
  description: 'Школьная обложка в рамке с подписями на кыргызском',
  category: 'school',
  orientation: 'portrait',
  tags: ['мектеп', 'школа', 'кыргызча', 'доклад'],
  palette: { primary: '#12306B', accent: '#C9952B', text: '#111827', muted: '#4B5563', surface: '#FFFFFF' },
  fonts: { heading: 'Rubik', body: 'Rubik' },
  background: () => solid('$surface'),
  defaults: {
    institution: 'Бишкек шаарындагы №21 мектеп-гимназиясы',
    department: '',
    workType: 'Окуучунун иши',
    title: 'Кыргызстандын табияты жана экологиясы',
    subject: 'Предмет: География',
    studentLabel: 'Аткарган:',
    studentName: 'Асанов Бакыт',
    studentGroup: '9 «А» класс',
    teacherLabel: 'Текшерген:',
    teacherName: 'Мамбетова Г. А.',
    teacherTitle: 'География мугалими',
  },
  layout: ({ width: W, height: H }) => {
    const f = Math.min(W, H) * 0.04
    const m = W * 0.13
    const info = W * 0.5
    return [
      shape('Рамка', 'rect', { x: f, y: f, width: W - 2 * f, height: H - 2 * f }, {
        fill: 'transparent', stroke: '$primary', strokeWidth: 4,
      }),
      shape('Внутренняя рамка', 'rect', { x: f + 10, y: f + 10, width: W - 2 * f - 20, height: H - 2 * f - 20 }, {
        fill: 'transparent', stroke: '$accent', strokeWidth: 1.5,
      }),
      image('Логотип', { x: W / 2 - 40, y: H * 0.075, width: 80, height: 80 }, { slot: 'logo' }),
      text('Учреждение', '{{institution}}', { x: m, y: H * 0.075 + 96, width: W - 2 * m, height: 50 }, {
        fontSize: 18, fontWeight: 500, align: 'center', color: '$primary', lineHeight: 1.35,
      }),
      shape('Орнамент', 'rect', { x: W / 2 - 50, y: H * 0.3, width: 100, height: 4 }, { fill: '$accent', radius: 2 }),
      text('Тип работы', '{{workType}}', { x: m, y: H * 0.34, width: W - 2 * m, height: 60 }, {
        fontFamily: '$heading', fontSize: 46, fontWeight: 800, align: 'center', uppercase: true, color: '$primary', letterSpacing: 40,
      }),
      text('Тема', '{{title}}', { x: m, y: H * 0.43, width: W - 2 * m, height: 80 }, {
        fontSize: 24, fontWeight: 500, align: 'center', lineHeight: 1.3,
      }),
      text('Предмет', '{{subject}}', { x: m, y: H * 0.54, width: W - 2 * m, height: 24 }, {
        fontSize: 17, align: 'center', color: '$muted',
      }),
      text('Подпись ученика', '{{studentLabel}}', { x: info, y: H * 0.69, width: W - info - m + 20, height: 22 }, {
        fontSize: 16, fontWeight: 700, color: '$primary',
      }),
      text('Ученик', '{{studentName}}\n{{studentGroup}}', { x: info, y: H * 0.69 + 26, width: W - info - m + 20, height: 48 }, {
        fontSize: 16, lineHeight: 1.4,
      }),
      text('Подпись учителя', '{{teacherLabel}}', { x: info, y: H * 0.78, width: W - info - m + 20, height: 22 }, {
        fontSize: 16, fontWeight: 700, color: '$primary',
      }),
      text('Учитель', '{{teacherName}}\n{{teacherTitle}}', { x: info, y: H * 0.78 + 26, width: W - info - m + 20, height: 48 }, {
        fontSize: 16, lineHeight: 1.4,
      }),
      text('Город и год', '{{city}} – {{year}}', { x: m, y: H * 0.9, width: W - 2 * m, height: 22 }, {
        fontSize: 17, fontWeight: 500, align: 'center', color: '$primary',
      }),
    ]
  },
}

const schoolProject: TemplateDefinition = {
  id: 'school-project',
  name: 'Школьный проект',
  description: 'Яркая обложка для проектов и исследований',
  category: 'school',
  orientation: 'portrait',
  tags: ['проект', 'исследование', 'яркий'],
  palette: { primary: '#2952E3', accent: '#FFB020', text: '#111827', muted: '#6B7280', surface: '#FFFFFF' },
  fonts: { heading: 'Unbounded', body: 'Manrope' },
  background: () => solid('#F4F7FF'),
  defaults: {
    institution: 'Школа-лицей №5',
    workType: 'Исследовательский проект',
    title: 'Как растения находят свет?',
    subject: 'Биология · 7 класс',
    studentLabel: 'Автор проекта',
    studentName: 'Жумабекова Алина',
    studentGroup: '7 «Б» класс',
    teacherLabel: 'Руководитель',
    teacherName: 'Осмонова Б. Т.',
    teacherTitle: 'учитель биологии',
  },
  layout: ({ width: W, height: H }) => {
    const m = W * 0.09
    const cw = W - 2 * m
    return [
      shape('Круг большой', 'ellipse', { x: W * 0.55, y: -H * 0.08, width: W * 0.62, height: W * 0.62 }, { fill: '$primary' }),
      shape('Круг акцент', 'ellipse', { x: W * 0.5, y: H * 0.2, width: W * 0.18, height: W * 0.18 }, { fill: '$accent' }),
      shape('Точка', 'ellipse', { x: W * 0.12, y: H * 0.3, width: 22, height: 22 }, { fill: '$accent' }),
      image('Логотип', { x: m, y: H * 0.06, width: 64, height: 64 }, { slot: 'logo' }),
      text('Учреждение', '{{institution}}', { x: m, y: H * 0.06 + 76, width: W * 0.42, height: 40 }, {
        fontSize: 14, fontWeight: 700, color: '$primary',
      }),
      text('Тип работы', '{{workType}}', { x: m, y: H * 0.4, width: cw, height: 22 }, {
        fontSize: 14, fontWeight: 800, uppercase: true, letterSpacing: 200, color: '$primary',
      }),
      text('Тема', '{{title}}', { x: m, y: H * 0.4 + 34, width: cw, height: 160 }, {
        fontFamily: '$heading', fontSize: 40, fontWeight: 700, lineHeight: 1.15,
      }),
      text('Предмет', '{{subject}}', { x: m, y: H * 0.6, width: cw, height: 24 }, {
        fontSize: 17, fontWeight: 600, color: '$muted',
      }),
      shape('Карточка', 'rect', { x: m, y: H * 0.72, width: cw, height: H * 0.16 }, { fill: '#FFFFFF', radius: 24 }),
      text('Подпись автора', '{{studentLabel}}', { x: m + 28, y: H * 0.72 + 26, width: cw / 2 - 40, height: 18 }, {
        fontSize: 11, fontWeight: 700, uppercase: true, letterSpacing: 150, color: '$muted',
      }),
      text('Автор', '{{studentName}}\n{{studentGroup}}', { x: m + 28, y: H * 0.72 + 50, width: cw / 2 - 40, height: 50 }, {
        fontSize: 17, fontWeight: 700, lineHeight: 1.35,
      }),
      text('Подпись руководителя', '{{teacherLabel}}', { x: m + cw / 2 + 10, y: H * 0.72 + 26, width: cw / 2 - 40, height: 18 }, {
        fontSize: 11, fontWeight: 700, uppercase: true, letterSpacing: 150, color: '$muted',
      }),
      text('Руководитель', '{{teacherName}}\n{{teacherTitle}}', { x: m + cw / 2 + 10, y: H * 0.72 + 50, width: cw / 2 - 40, height: 50 }, {
        fontSize: 17, fontWeight: 700, lineHeight: 1.35,
      }),
      text('Город и год', '{{city}}, {{year}}', { x: m, y: H * 0.93, width: cw, height: 20 }, {
        fontSize: 14, fontWeight: 600, color: '$muted',
      }),
    ]
  },
}

const itTerminal: TemplateDefinition = {
  id: 'it-terminal',
  name: 'Терминал',
  description: 'Тёмная обложка для документации и pet-проектов',
  category: 'it',
  orientation: 'portrait',
  tags: ['код', 'документация', 'dark', 'разработка'],
  palette: { primary: '#7C93FF', accent: '#22D3A6', text: '#E6EAF5', muted: '#8A93AD', surface: '#121831' },
  fonts: { heading: 'Montserrat', body: 'JetBrains Mono' },
  background: () => solid('#0B1020'),
  defaults: {
    institution: 'IT Academy',
    department: 'Backend-разработка',
    workType: 'Техническая документация',
    title: 'Online Booking API',
    subtitle: 'REST API для онлайн-бронирования билетов и мест',
    subject: 'Python · Django · DRF · PostgreSQL · Redis',
    studentLabel: 'author:',
    studentName: 'Азамат Исаков',
    studentGroup: 'github.com/username',
    teacherLabel: 'mentor:',
    teacherName: 'Code Review Team',
    teacherTitle: 'v1.0.0',
  },
  layout: ({ width: W, height: H }) => {
    const m = W * 0.08
    const cw = W - 2 * m
    return [
      shape('Сетка: линия 1', 'line', { x: 0, y: H * 0.25, width: W, height: 0 }, { stroke: '#1B2342', strokeWidth: 1 }),
      shape('Сетка: линия 2', 'line', { x: 0, y: H * 0.75, width: W, height: 0 }, { stroke: '#1B2342', strokeWidth: 1 }),
      shape('Свечение', 'ellipse', { x: W * 0.45, y: -H * 0.1, width: W * 0.8, height: W * 0.8 }, { fill: '$primary', opacity: 0.12 }),
      image('Логотип', { x: m, y: H * 0.06, width: 56, height: 56 }, { slot: 'logo' }),
      text('Учреждение', '{{institution}}\n{{department}}', { x: m + 72, y: H * 0.06 + 6, width: cw - 72, height: 44 }, {
        fontSize: 13, color: '$muted', lineHeight: 1.5,
      }),
      shape('Окно', 'rect', { x: m, y: H * 0.27, width: cw, height: H * 0.42 }, {
        fill: '$surface', stroke: '#26305A', strokeWidth: 1.5, radius: 18,
      }),
      shape('Кнопка 1', 'ellipse', { x: m + 22, y: H * 0.27 + 20, width: 13, height: 13 }, { fill: '#FF5F57' }),
      shape('Кнопка 2', 'ellipse', { x: m + 44, y: H * 0.27 + 20, width: 13, height: 13 }, { fill: '#FEBC2E' }),
      shape('Кнопка 3', 'ellipse', { x: m + 66, y: H * 0.27 + 20, width: 13, height: 13 }, { fill: '#28C840' }),
      text('Команда', '$ cat README.md', { x: m + 30, y: H * 0.27 + 62, width: cw - 60, height: 20 }, {
        fontSize: 14, color: '$accent',
      }),
      text('Тип работы', '# {{workType}}', { x: m + 30, y: H * 0.27 + 96, width: cw - 60, height: 20 }, {
        fontSize: 14, color: '$muted',
      }),
      text('Тема', '{{title}}', { x: m + 30, y: H * 0.27 + 130, width: cw - 60, height: 140 }, {
        fontFamily: '$heading', fontSize: 42, fontWeight: 800, lineHeight: 1.1,
      }),
      text('Описание', '{{subtitle}}', { x: m + 30, y: H * 0.56, width: cw - 60, height: 40 }, {
        fontSize: 14, color: '$muted', lineHeight: 1.5,
      }),
      text('Стек', '// stack: {{subject}}', { x: m + 30, y: H * 0.635, width: cw - 60, height: 20 }, {
        fontSize: 13, color: '$primary',
      }),
      text('Автор', '{{studentLabel}} {{studentName}}\nrepo: {{studentGroup}}', { x: m, y: H * 0.77, width: cw, height: 44 }, {
        fontSize: 14, lineHeight: 1.6,
      }),
      text('Ментор', '{{teacherLabel}} {{teacherName}}\nrelease: {{teacherTitle}}', { x: m, y: H * 0.77 + 60, width: cw, height: 44 }, {
        fontSize: 14, lineHeight: 1.6, color: '$muted',
      }),
      text('Город и год', '{{city}} · {{year}}', { x: m, y: H * 0.93, width: cw, height: 20 }, {
        fontSize: 13, color: '$muted',
      }),
      shape('Статус', 'rect', { x: W - m - 120, y: H * 0.93 - 4, width: 120, height: 26 }, { fill: '$accent', radius: 13, opacity: 0.15 }),
      text('Статус текст', '● build passing', { x: W - m - 120, y: H * 0.93 + 1, width: 120, height: 16 }, {
        fontSize: 11, color: '$accent', align: 'center',
      }),
    ]
  },
}

const itGradient: TemplateDefinition = {
  id: 'it-gradient',
  name: 'Стартап',
  description: 'Градиентная обложка для питчей и хакатонов',
  category: 'it',
  orientation: 'portrait',
  tags: ['хакатон', 'стартап', 'градиент', 'питч'],
  palette: { primary: '#3B2BD9', accent: '#E0457B', text: '#FFFFFF', muted: '#DCD8FF', surface: '#FFFFFF' },
  fonts: { heading: 'Unbounded', body: 'Manrope' },
  background: () => ({ type: 'gradient', color: '$primary', color2: '$accent', angle: 150, image: null, imageOpacity: 1 }),
  defaults: {
    institution: 'Startup Club',
    workType: 'Хакатон · Питч проекта',
    title: 'Stockly AI',
    subtitle: 'Умный учёт остатков и сайт магазина за один вечер',
    subject: 'React · FastAPI · PostgreSQL · OpenAI',
    studentLabel: 'Команда',
    studentName: 'Team Nomad',
    studentGroup: '5 участников',
    teacherLabel: 'Трек',
    teacherName: 'Retail Tech',
    teacherTitle: 'Финал',
  },
  layout: ({ width: W, height: H }) => {
    const m = W * 0.09
    const cw = W - 2 * m
    return [
      shape('Кольцо', 'ellipse', { x: W * 0.4, y: H * 0.05, width: W * 0.75, height: W * 0.75 }, {
        fill: 'transparent', stroke: '#FFFFFF', strokeWidth: 1.5, opacity: 0.25,
      }),
      shape('Кольцо 2', 'ellipse', { x: W * 0.52, y: H * 0.13, width: W * 0.5, height: W * 0.5 }, {
        fill: '#FFFFFF', opacity: 0.08,
      }),
      image('Логотип', { x: m, y: H * 0.06, width: 56, height: 56 }, { slot: 'logo' }),
      text('Учреждение', '{{institution}}', { x: m + 70, y: H * 0.06 + 16, width: cw - 70, height: 24 }, {
        fontFamily: '$heading', fontSize: 16, fontWeight: 700,
      }),
      text('Тип работы', '{{workType}}', { x: m, y: H * 0.42, width: cw, height: 22 }, {
        fontSize: 14, fontWeight: 700, uppercase: true, letterSpacing: 200, color: '$muted',
      }),
      text('Тема', '{{title}}', { x: m, y: H * 0.42 + 34, width: cw, height: 140 }, {
        fontFamily: '$heading', fontSize: 58, fontWeight: 800, lineHeight: 1.05,
      }),
      text('Описание', '{{subtitle}}', { x: m, y: H * 0.58, width: cw * 0.85, height: 60 }, {
        fontSize: 19, lineHeight: 1.45, color: '$muted',
      }),
      shape('Стеклянная карточка', 'rect', { x: m, y: H * 0.73, width: cw, height: H * 0.17 }, {
        fill: '#FFFFFF', opacity: 0.14, radius: 26,
      }),
      text('Подпись команды', '{{studentLabel}}', { x: m + 28, y: H * 0.73 + 26, width: cw / 3 - 30, height: 18 }, {
        fontSize: 11, fontWeight: 700, uppercase: true, letterSpacing: 150, color: '$muted',
      }),
      text('Команда', '{{studentName}}\n{{studentGroup}}', { x: m + 28, y: H * 0.73 + 50, width: cw / 3 - 30, height: 50 }, {
        fontSize: 16, fontWeight: 700, lineHeight: 1.4,
      }),
      text('Подпись трека', '{{teacherLabel}}', { x: m + cw / 3 + 14, y: H * 0.73 + 26, width: cw / 3 - 30, height: 18 }, {
        fontSize: 11, fontWeight: 700, uppercase: true, letterSpacing: 150, color: '$muted',
      }),
      text('Трек', '{{teacherName}}\n{{teacherTitle}}', { x: m + cw / 3 + 14, y: H * 0.73 + 50, width: cw / 3 - 30, height: 50 }, {
        fontSize: 16, fontWeight: 700, lineHeight: 1.4,
      }),
      text('Стек', '{{subject}}', { x: m + (2 * cw) / 3, y: H * 0.73 + 26, width: cw / 3 - 28, height: 80 }, {
        fontSize: 13, fontWeight: 600, lineHeight: 1.5, color: '$muted',
      }),
      text('Город и год', '{{city}} · {{year}}', { x: m, y: H * 0.94, width: cw, height: 20 }, {
        fontSize: 13, fontWeight: 600, color: '$muted',
      }),
    ]
  },
}

/** Course-certificate layout: white panel with the text, dark illustrated panel on the right. */
function courseCertificateLayout({ width: W, height: H }: LayoutContext) {
  const panel = W * 0.68
  const cx = panel / 2
  const tw = panel * 0.8
  return [
    shape('Тёмная панель', 'rect', { x: panel, y: 0, width: W - panel, height: H }, { fill: '#14113F' }),
    image('Иллюстрация', { x: panel, y: 0, width: W - panel, height: H * 0.62 }, { slot: 'image', fit: 'cover' }),
    shape('Рамка', 'rect', { x: 0, y: 0, width: W, height: H }, { fill: 'transparent', stroke: '$primary', strokeWidth: 10 }),
    image('Логотип', { x: cx - 60, y: H * 0.07, width: 120, height: 120 }, { slot: 'logo' }),
    text('Заголовок', '{{workType}}', { x: cx - tw / 2, y: H * 0.27, width: tw, height: 90 }, {
      fontFamily: '$heading', fontSize: 84, fontWeight: 800, align: 'center', uppercase: true, color: '$primary', lineHeight: 1,
    }),
    text('Имя', '{{studentName}}', { x: cx - tw / 2, y: H * 0.45, width: tw, height: 50 }, {
      fontSize: 42, fontWeight: 800, align: 'center', uppercase: true, letterSpacing: 30,
    }),
    shape('Линия под именем', 'line', { x: cx - tw / 2 + 20, y: H * 0.45 + 60, width: tw - 40, height: 0 }, {
      stroke: '$muted', strokeWidth: 1.5, opacity: 0.6,
    }),
    text('Курс', '«{{title}}»', { x: cx - tw / 2, y: H * 0.565, width: tw, height: 34 }, {
      fontSize: 26, fontWeight: 700, align: 'center', uppercase: true, color: '$accent',
    }),
    text('Описание', '{{subtitle}}', { x: cx - tw / 2, y: H * 0.565 + 40, width: tw, height: 24 }, {
      fontSize: 16, fontWeight: 500, align: 'center', uppercase: true, color: '$muted',
    }),
    techRow('Технологии', { x: cx - tw / 2, y: H * 0.64, width: tw, height: 96 }, {
      iconSize: 58, gap: 44, labels: 'top', labelSize: 14, labelColor: '$text',
    }),
    text('Должность и ФИО', '{{teacherTitle}}:\n{{teacherName}}', { x: panel * 0.12, y: H * 0.83, width: panel * 0.34, height: 46 }, {
      fontSize: 15, fontWeight: 700, uppercase: true, color: '$muted', lineHeight: 1.35,
    }),
    shape('Линия подписи', 'line', { x: panel * 0.47, y: H * 0.83 + 40, width: panel * 0.25, height: 0 }, {
      stroke: '$muted', strokeWidth: 1, opacity: 0.5,
    }),
    image('Подпись', { x: panel * 0.42, y: H * 0.83 - 62, width: panel * 0.27, height: 120 }, { slot: 'signature' }),
    image('Печать', { x: panel * 0.6, y: H * 0.755, width: 158, height: 158 }, { slot: 'seal', opacity: 0.88, rotation: -8 }),
    text('Город и год', '{{city}} {{year}}', { x: panel, y: H * 0.86, width: W - panel, height: 26 }, {
      fontSize: 20, fontWeight: 600, align: 'center', color: '#FFFFFF',
    }),
  ]
}

const certificateTech: TemplateDefinition = {
  id: 'certificate-tech',
  name: 'Сертификат курса',
  description: 'Сертификат об окончании курса с иллюстрацией',
  category: 'certificate',
  orientation: 'landscape',
  tags: ['курс', 'программирование', 'сертификат', 'иллюстрация', 'печать'],
  palette: { primary: '#1B1756', accent: '#E8892B', text: '#0E0E1A', muted: '#3A3A55', surface: '#FFFFFF' },
  fonts: { heading: 'Montserrat', body: 'Montserrat' },
  background: () => solid('$surface'),
  defaults: {
    institution: 'IT Academy',
    workType: 'Сертификат',
    title: 'Программирование',
    subtitle: 'курсун ийгиликтүү бүтүргөндүгү тууралуу күбөлүк берилет',
    subject: 'HTML · CSS · JavaScript · Python · Django',
    studentName: 'Сыдыкова Айпери',
    teacherTitle: 'Директор',
    teacherName: 'Асанов Бакыт',
    image: TECH_ART,
    tech: ['html5', 'css3', 'javascript', 'python', 'django'],
  },
  layout: courseCertificateLayout,
}

const certificateOkurmen: TemplateDefinition = {
  id: 'certificate-okurmen',
  name: 'Окурмэн Kids',
  description: 'Фирменный сертификат учебного центра Окурмэн Kids',
  category: 'certificate',
  orientation: 'landscape',
  tags: ['окурмэн', 'okurmen', 'kids', 'курс', 'программатика', 'сертификат'],
  palette: { primary: '#211C6B', accent: '#E89A2C', text: '#0E0E1A', muted: '#3A3A55', surface: '#FFFFFF' },
  fonts: { heading: 'Montserrat', body: 'Montserrat' },
  background: () => solid('$surface'),
  defaults: {
    institution: 'Окурмэн Kids',
    workType: 'Сертификат',
    title: 'Программатика',
    subtitle: 'курсун бүтүргөндүгү тууралуу күбөлүк берилет',
    subject: 'HTML · CSS · JavaScript · Python · Django',
    studentName: 'Фамилия Имя',
    teacherTitle: 'Директор',
    teacherName: 'Мунарбек Мавлянов',
    logo: OKURMEN_KIDS_LOGO,
    image: TECH_ART,
    tech: ['html5', 'javascript', 'css3', 'python', 'django'],
  },
  layout: courseCertificateLayout,
}

const certificateBestStudent: TemplateDefinition = {
  id: 'certificate-best-student',
  name: 'Best Student of the Month',
  description: 'Окурмэн Kids: сертификат «Айдын мыкты окуучусу» с кубком и лентами',
  category: 'certificate',
  orientation: 'landscape',
  tags: ['окурмэн', 'okurmen', 'kids', 'best student', 'лучший ученик', 'мыкты окуучу', 'награда', 'месяц'],
  palette: { primary: '#3E0F73', accent: '#E9AE3A', text: '#2A0F55', muted: '#4A2A78', surface: '#FFFFFF' },
  fonts: { heading: 'Playfair Display', body: 'Montserrat' },
  background: () => ({ type: 'image', color: '#FFFFFF', color2: '$accent', angle: 135, image: BEST_STUDENT_ART, imageOpacity: 1 }),
  defaults: {
    institution: 'Окурмэн Kids',
    workType: 'Best Student',
    subtitle: 'of the month',
    title: 'October 2026',
    subject: 'Айдын мыкты окуучусу',
    studentName: '',
    department:
      'Октябрь айында көрсөткөн мыкты жетишкендиктери, активдүү катышуусу,\nкөңүл буруусу жана тырышчаактыгы үчүн\nбул сертификат менен сыйланат.',
    teacherTitle: 'Директор',
    teacherName: 'Мавлянов М. М.',
    year: '2026',
    logo: OKURMEN_KIDS_LOGO,
  },
  layout: ({ width: W }) => {
    const cx = W / 2
    const col = (w: number) => ({ x: cx - w / 2, width: w })
    return [
      image('Логотип', { x: cx - 50, y: 34, width: 100, height: 100 }, { slot: 'logo' }),
      text('Заголовок', '{{workType}}', { ...col(760), y: 134, height: 76 }, {
        fontFamily: '$heading', fontSize: 70, fontWeight: 800, align: 'center', uppercase: true, color: '$primary', lineHeight: 1,
      }),
      text('Подзаголовок', '{{subtitle}}', { ...col(360), y: 218, height: 26 }, {
        fontSize: 21, fontWeight: 800, align: 'center', uppercase: true, letterSpacing: 300, color: '$primary',
      }),
      text('Месяц', '{{title}}', { ...col(320), y: 353, height: 30 }, {
        fontSize: 27, fontWeight: 700, align: 'center', uppercase: true, color: '#FFFFFF',
      }),
      text('Номинация', '{{subject}}', { ...col(400), y: 397, height: 32 }, {
        fontSize: 26, fontWeight: 800, align: 'center', color: '$text',
      }),
      text('Имя', '{{studentName}}', { ...col(560), y: 445, height: 46 }, {
        fontFamily: '$heading', fontSize: 38, fontWeight: 700, italic: true, align: 'center', color: '$primary',
      }),
      shape('Линия для имени', 'line', { ...col(520), y: 488, height: 0 }, {
        stroke: '$muted', strokeWidth: 1.2, opacity: 0.45,
      }),
      text('Описание', '{{department}}', { ...col(760), y: 507, height: 62 }, {
        fontSize: 15, fontWeight: 600, align: 'center', color: '$text', lineHeight: 1.3,
      }),
      text('Девиз', 'Сен — {{institution}} академиясынын\nүлгүлүү жана активдүү окуучусуң!', { ...col(500), y: 584, height: 46 }, {
        fontSize: 18, fontWeight: 800, align: 'center', color: '$text', lineHeight: 1.2,
      }),
      text('Должность', '{{teacherTitle}}', { x: W * 0.285, y: 660, width: 200, height: 20 }, {
        fontSize: 15, fontWeight: 600, color: '$text',
      }),
      text('Директор', '{{teacherName}}', { x: W * 0.285, y: 682, width: 200, height: 26 }, {
        fontSize: 20, fontWeight: 800, color: '$text',
      }),
      image('Подпись', { x: W * 0.285 + 20, y: 636, width: 130, height: 64 }, { slot: 'signature' }),
      text('Дата', '31-октябрь, {{year}}-жыл', { x: cx + 168, y: 667, width: 240, height: 24 }, {
        fontSize: 18, fontWeight: 600, color: '$text',
      }),
    ]
  },
}

const certificateClassic: TemplateDefinition = {
  id: 'certificate-classic',
  name: 'Диплом с отличием',
  description: 'Торжественный диплом в золотой рамке',
  category: 'certificate',
  orientation: 'landscape',
  tags: ['диплом', 'грамота', 'награда', 'олимпиада'],
  palette: { primary: '#1E2A44', accent: '#B08D57', text: '#1E2A44', muted: '#6B6455', surface: '#FBF8F1' },
  fonts: { heading: 'Playfair Display', body: 'Lora' },
  background: () => solid('$surface'),
  defaults: {
    institution: 'Министерство образования и науки',
    workType: 'Диплом',
    subtitle: 'награждается',
    studentName: 'Касымова Элина Маратовна',
    title: 'за I место в республиканской олимпиаде по информатике',
    teacherTitle: 'Председатель жюри',
    teacherName: 'Абдыкадыров Т. С.',
    studentLabel: 'Директор',
    studentGroup: 'Байсалова Н. К.',
  },
  layout: ({ width: W, height: H }) => {
    const f = Math.min(W, H) * 0.045
    const cw = W * 0.7
    const cx = W / 2
    const corner = (name: string, x: number, y: number) =>
      shape(name, 'rect', { x: x - 9, y: y - 9, width: 18, height: 18 }, { fill: '$accent', rotation: 45 })
    return [
      shape('Рамка', 'rect', { x: f, y: f, width: W - 2 * f, height: H - 2 * f }, { fill: 'transparent', stroke: '$accent', strokeWidth: 3 }),
      shape('Внутренняя рамка', 'rect', { x: f + 14, y: f + 14, width: W - 2 * f - 28, height: H - 2 * f - 28 }, {
        fill: 'transparent', stroke: '$accent', strokeWidth: 1,
      }),
      corner('Угол 1', f, f),
      corner('Угол 2', W - f, f),
      corner('Угол 3', f, H - f),
      corner('Угол 4', W - f, H - f),
      image('Логотип', { x: cx - 36, y: H * 0.11, width: 72, height: 72 }, { slot: 'logo' }),
      text('Учреждение', '{{institution}}', { x: cx - cw / 2, y: H * 0.11 + 84, width: cw, height: 20 }, {
        fontSize: 14, align: 'center', uppercase: true, letterSpacing: 200, color: '$muted',
      }),
      text('Заголовок', '{{workType}}', { x: cx - cw / 2, y: H * 0.3, width: cw, height: 90 }, {
        fontFamily: '$heading', fontSize: 80, fontWeight: 700, align: 'center', uppercase: true, letterSpacing: 120, color: '$primary',
      }),
      text('Награждается', '{{subtitle}}', { x: cx - cw / 2, y: H * 0.45, width: cw, height: 24 }, {
        fontSize: 18, italic: true, align: 'center', color: '$muted',
      }),
      text('Имя', '{{studentName}}', { x: cx - cw / 2, y: H * 0.5, width: cw, height: 54 }, {
        fontFamily: '$heading', fontSize: 44, italic: true, align: 'center', color: '$accent',
      }),
      text('Формулировка', '{{title}}', { x: cx - cw * 0.4, y: H * 0.62, width: cw * 0.8, height: 50 }, {
        fontSize: 19, align: 'center', lineHeight: 1.4,
      }),
      shape('Печать', 'ellipse', { x: cx - 52, y: H * 0.74, width: 104, height: 104 }, {
        fill: 'transparent', stroke: '$accent', strokeWidth: 2,
      }),
      shape('Печать внутр.', 'ellipse', { x: cx - 42, y: H * 0.74 + 10, width: 84, height: 84 }, {
        fill: '$accent', opacity: 0.12,
      }),
      text('Год на печати', '{{year}}', { x: cx - 52, y: H * 0.74 + 38, width: 104, height: 28 }, {
        fontFamily: '$heading', fontSize: 22, fontWeight: 700, align: 'center', color: '$accent',
      }),
      shape('Подпись 1 линия', 'line', { x: W * 0.14, y: H * 0.84, width: W * 0.22, height: 0 }, { stroke: '$muted', strokeWidth: 1 }),
      text('Подпись 1', '{{teacherTitle}}\n{{teacherName}}', { x: W * 0.14, y: H * 0.84 + 8, width: W * 0.22, height: 40 }, {
        fontSize: 13, align: 'center', color: '$muted', lineHeight: 1.4,
      }),
      image('Подпись', { x: W * 0.15, y: H * 0.84 - 64, width: W * 0.2, height: 66 }, { slot: 'signature' }),
      image('Печать (файл)', { x: W * 0.29, y: H * 0.72, width: 128, height: 128 }, { slot: 'seal', opacity: 0.9, rotation: -8 }),
      shape('Подпись 2 линия', 'line', { x: W * 0.64, y: H * 0.84, width: W * 0.22, height: 0 }, { stroke: '$muted', strokeWidth: 1 }),
      text('Подпись 2', '{{studentLabel}}\n{{studentGroup}}', { x: W * 0.64, y: H * 0.84 + 8, width: W * 0.22, height: 40 }, {
        fontSize: 13, align: 'center', color: '$muted', lineHeight: 1.4,
      }),
    ]
  },
}

const reportMinimal: TemplateDefinition = {
  id: 'report-minimal',
  name: 'Годовой отчёт',
  description: 'Минималистичная обложка корпоративного отчёта',
  category: 'report',
  orientation: 'portrait',
  tags: ['отчёт', 'компания', 'минимализм', 'годовой'],
  palette: { primary: '#0F1B3D', accent: '#FF5A36', text: '#0F1B3D', muted: '#6B7280', surface: '#EEF1F6' },
  fonts: { heading: 'Inter', body: 'Inter' },
  background: () => solid('#FFFFFF'),
  defaults: {
    institution: 'Bilim Analytics',
    department: 'Отдел аналитики',
    workType: 'Годовой отчёт',
    title: 'Результаты тестирования учащихся',
    subtitle: 'Аналитика успеваемости, вовлечённости и динамики по всем филиалам',
    studentLabel: 'Подготовил',
    studentName: 'Отдел аналитики',
    teacherLabel: 'Утвердил',
    teacherName: 'Генеральный директор',
  },
  layout: ({ width: W, height: H }) => {
    const m = W * 0.09
    const cw = W - 2 * m
    const col = cw / 3
    return [
      text('Год (фон)', '{{year}}', { x: m - 12, y: H * 0.1, width: cw + 24, height: 260 }, {
        fontFamily: '$heading', fontSize: Math.min(W, H) * 0.32, fontWeight: 800, color: '$surface', lineHeight: 1, letterSpacing: -40,
      }),
      image('Логотип', { x: m, y: H * 0.05, width: 48, height: 48 }, { slot: 'logo' }),
      text('Учреждение', '{{institution}}', { x: m + 60, y: H * 0.05 + 13, width: cw - 60, height: 22 }, {
        fontSize: 16, fontWeight: 700,
      }),
      shape('Акцент', 'rect', { x: m, y: H * 0.46, width: 56, height: 8 }, { fill: '$accent' }),
      text('Тип работы', '{{workType}} {{year}}', { x: m, y: H * 0.46 + 28, width: cw, height: 22 }, {
        fontSize: 15, fontWeight: 700, uppercase: true, letterSpacing: 200, color: '$accent',
      }),
      text('Тема', '{{title}}', { x: m, y: H * 0.46 + 64, width: cw, height: 150 }, {
        fontFamily: '$heading', fontSize: 46, fontWeight: 800, lineHeight: 1.08, letterSpacing: -20,
      }),
      text('Описание', '{{subtitle}}', { x: m, y: H * 0.68, width: cw * 0.8, height: 50 }, {
        fontSize: 17, color: '$muted', lineHeight: 1.5,
      }),
      shape('Разделитель', 'line', { x: m, y: H * 0.84, width: cw, height: 0 }, { stroke: '$primary', strokeWidth: 1.5 }),
      text('Мета 1 подпись', '{{studentLabel}}', { x: m, y: H * 0.84 + 20, width: col - 16, height: 16 }, {
        fontSize: 11, fontWeight: 600, uppercase: true, letterSpacing: 150, color: '$muted',
      }),
      text('Мета 1', '{{studentName}}', { x: m, y: H * 0.84 + 42, width: col - 16, height: 40 }, {
        fontSize: 15, fontWeight: 600, lineHeight: 1.35,
      }),
      text('Мета 2 подпись', '{{teacherLabel}}', { x: m + col, y: H * 0.84 + 20, width: col - 16, height: 16 }, {
        fontSize: 11, fontWeight: 600, uppercase: true, letterSpacing: 150, color: '$muted',
      }),
      text('Мета 2', '{{teacherName}}', { x: m + col, y: H * 0.84 + 42, width: col - 16, height: 40 }, {
        fontSize: 15, fontWeight: 600, lineHeight: 1.35,
      }),
      text('Мета 3 подпись', 'Место и год', { x: m + 2 * col, y: H * 0.84 + 20, width: col - 16, height: 16 }, {
        fontSize: 11, fontWeight: 600, uppercase: true, letterSpacing: 150, color: '$muted',
      }),
      text('Мета 3', '{{city}}, {{year}}', { x: m + 2 * col, y: H * 0.84 + 42, width: col - 16, height: 40 }, {
        fontSize: 15, fontWeight: 600, lineHeight: 1.35,
      }),
    ]
  },
}

const presentationTitle: TemplateDefinition = {
  id: 'presentation-title',
  name: 'Титульный слайд',
  description: 'Слайд-обложка для защиты и выступлений',
  category: 'presentation',
  orientation: 'landscape',
  tags: ['слайд', 'защита', 'доклад', 'конференция'],
  palette: { primary: '#0F1B3D', accent: '#3B5BFD', text: '#0F1B3D', muted: '#64748B', surface: '#FFFFFF' },
  fonts: { heading: 'Manrope', body: 'Manrope' },
  background: () => solid('$surface'),
  defaults: {
    institution: 'Кыргызско-Турецкий университет «Манас»',
    workType: 'Защита проекта',
    title: 'Платформа онлайн-тестирования для школ',
    subtitle: 'Как аналитика помогает учителям видеть прогресс каждого ученика',
    studentLabel: 'Докладчик',
    studentName: 'Асанов Бакыт',
    studentGroup: 'Backend-разработчик',
    teacherLabel: 'Научный руководитель',
    teacherName: 'Исаева А. К.',
    image: ABSTRACT_ART,
  },
  layout: ({ width: W, height: H }) => {
    const m = W * 0.06
    const split = W * 0.56
    const cw = split - m - W * 0.04
    return [
      image('Изображение', { x: split, y: m * 0.8, width: W - split - m * 0.8, height: H - m * 1.6 }, {
        slot: 'image', fit: 'cover', radius: 28,
      }),
      image('Логотип', { x: m, y: H * 0.08, width: 52, height: 52 }, { slot: 'logo' }),
      text('Учреждение', '{{institution}}', { x: m + 64, y: H * 0.08 + 14, width: cw - 64, height: 24 }, {
        fontSize: 14, fontWeight: 700, color: '$muted',
      }),
      shape('Метка', 'rect', { x: m, y: H * 0.3, width: 190, height: 34 }, { fill: '$accent', opacity: 0.1, radius: 17 }),
      text('Тип работы', '{{workType}}', { x: m, y: H * 0.3 + 8, width: 190, height: 18 }, {
        fontSize: 13, fontWeight: 700, align: 'center', uppercase: true, letterSpacing: 120, color: '$accent',
      }),
      text('Тема', '{{title}}', { x: m, y: H * 0.3 + 56, width: cw, height: 160 }, {
        fontFamily: '$heading', fontSize: 44, fontWeight: 800, lineHeight: 1.1, letterSpacing: -10,
      }),
      text('Описание', '{{subtitle}}', { x: m, y: H * 0.6, width: cw, height: 50 }, {
        fontSize: 17, color: '$muted', lineHeight: 1.5,
      }),
      shape('Аватар', 'ellipse', { x: m, y: H * 0.8, width: 46, height: 46 }, { fill: '$primary' }),
      text('Докладчик', '{{studentName}}\n{{studentGroup}}', { x: m + 60, y: H * 0.8 + 1, width: cw * 0.5, height: 44 }, {
        fontSize: 15, fontWeight: 700, lineHeight: 1.35,
      }),
      text('Город и год', '{{city}} · {{year}}', { x: m + cw * 0.55, y: H * 0.8 + 12, width: cw * 0.45, height: 22 }, {
        fontSize: 14, fontWeight: 600, align: 'right', color: '$muted',
      }),
    ]
  },
}

export const TEMPLATES: TemplateDefinition[] = [
  universityClassic,
  universityBand,
  school21,
  schoolProject,
  itTerminal,
  itGradient,
  certificateTech,
  certificateOkurmen,
  certificateBestStudent,
  certificateClassic,
  reportMinimal,
  presentationTitle,
]

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
