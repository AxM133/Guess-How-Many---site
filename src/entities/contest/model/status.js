export const CONTEST_STATUS = {
  idle: { label: 'Скоро старт', adminLabel: 'Не запущен', dot: 'bg-white/50', pill: 'bg-white/10 text-white/70' },
  running: {
    label: 'Конкурс идёт',
    adminLabel: 'Идёт приём ответов',
    dot: 'bg-emerald-400',
    pill: 'bg-emerald-400/15 text-emerald-300',
  },
  finished: {
    label: 'Приём ответов закрыт',
    adminLabel: 'Завершён',
    dot: 'bg-amber-400',
    pill: 'bg-amber-400/15 text-amber-200',
  },
}
