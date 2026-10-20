import { Hourglass } from 'lucide-react'
import { ContestResult, Countdown } from '@/entities/contest'
import { formatDateTime } from '@/shared/lib'
import { useHeroStatus } from '../model/useHeroStatus'

const MESSAGES = {
  waiting: 'Отсчёт запустится совсем скоро. Пока присмотритесь к коробке у входа в академию 👀',
  counting: 'Время вышло! Пересчитываем содержимое коробки — результаты появятся здесь.',
}

export function HeroStatus({ contest, now, refresh }) {
  const view = useHeroStatus(contest, now, refresh)

  if (view === 'result') return <ContestResult result={contest.result} />

  if (view === 'countdown') {
    return (
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/50">До конца приёма ответов</p>
        <Countdown startsAt={contest.startsAt} endsAt={contest.endsAt} now={now} />
        <p className="mt-3 text-sm text-white/40">Итоги — {formatDateTime(contest.endsAt)}</p>
      </div>
    )
  }

  return (
    <div className="glass flex max-w-md items-center gap-4 rounded-2xl p-5">
      <Hourglass className="size-8 shrink-0 animate-pulse text-alif" />
      <p className="text-white/70">{MESSAGES[view]}</p>
    </div>
  )
}
