import { WinnerSummary } from '@/entities/guess'
import { PublishResultsButton } from '@/features/publish-results'
import { ActualAmountForm } from '@/features/set-actual-amount'
import { Card } from '@/shared/ui'
import { getResultsState } from '../model/resultsState'

export function ResultsSection({ state, run }) {
  const { finished, leader, canPublish } = getResultsState(state)

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
        <PublishResultsButton revealed={state.revealed} canPublish={canPublish} run={run} />
        {!finished && <p className="mt-2 text-xs text-white/40">Опубликовать можно после окончания конкурса.</p>}
      </div>
    </Card>
  )
}
