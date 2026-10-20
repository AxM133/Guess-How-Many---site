import { Countdown } from '@/entities/contest'
import { TimerControls } from '@/features/manage-timer'
import { formatDateTime } from '@/shared/lib'
import { Card } from '@/shared/ui'
import { getTimerStatus } from '../model/timerStatus'

export function TimerSection({ state, now, run }) {
  const { running, finished, badge } = getTimerStatus(state)

  return (
    <Card
      title="Таймер конкурса"
      action={<span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>}
    >
      {running && (
        <div className="mb-6">
          <Countdown startsAt={state.startsAt} endsAt={state.endsAt} now={now} size="sm" />
          <p className="mt-3 text-sm text-white/50">
            Старт {formatDateTime(state.startsAt)} · финиш {formatDateTime(state.endsAt)}
          </p>
        </div>
      )}
      {finished && <p className="mb-5 text-sm text-white/55">Конкурс закончился {formatDateTime(state.endsAt)}.</p>}
      <TimerControls running={running} run={run} />
    </Card>
  )
}
