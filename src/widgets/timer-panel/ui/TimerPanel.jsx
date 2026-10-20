import { CONTEST_STATUS, Countdown } from '@/entities/contest'
import { TimerControls } from '@/features/manage-timer'
import { formatDateTime } from '@/shared/lib'
import { Card } from '@/shared/ui'

export function TimerPanel({ state, now, run }) {
  const running = state.status === 'running'
  const { adminLabel, pill } = CONTEST_STATUS[state.status]

  return (
    <Card title="Таймер конкурса" action={<span className={`rounded-full px-3 py-1 text-xs font-semibold ${pill}`}>{adminLabel}</span>}>
      {running && (
        <div className="mb-6">
          <Countdown startsAt={state.startsAt} endsAt={state.endsAt} now={now} size="sm" />
          <p className="mt-3 text-sm text-white/50">
            Старт {formatDateTime(state.startsAt)} · финиш {formatDateTime(state.endsAt)}
          </p>
        </div>
      )}
      {state.status === 'finished' && (
        <p className="mb-5 text-sm text-white/55">Конкурс закончился {formatDateTime(state.endsAt)}.</p>
      )}
      <TimerControls running={running} run={run} />
    </Card>
  )
}
