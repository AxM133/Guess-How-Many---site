import { WinnerSummary } from '@/entities/guess'
import { PublishResultsButton } from '@/features/publish-results'
import { ActualAmountForm } from '@/features/set-actual-amount'
import { Card } from '@/shared/ui'

export function ResultPanel({ state, run }) {
  const finished = state.status === 'finished'
  const leader = state.actualAmount != null ? state.guesses[0] : null

  return (
    <Card title="Итоги">
      <p className="mb-2 text-sm text-white/55">
        Сколько оказалось в коробке? Сумма видна только вам, пока вы не опубликуете итоги.
      </p>
      <ActualAmountForm key={state.round} savedAmount={state.actualAmount} run={run} />
      {leader && (
        <div className="mt-5">
          <WinnerSummary guess={leader} />
        </div>
      )}
      <div className="mt-5">
        <PublishResultsButton revealed={state.revealed} canPublish={finished && state.actualAmount != null} run={run} />
        {!finished && <p className="mt-2 text-xs text-white/40">Опубликовать можно после окончания конкурса.</p>}
      </div>
    </Card>
  )
}
