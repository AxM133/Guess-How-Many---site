import { ResetRoundButton } from '@/features/reset-round'

export function NewRoundPanel({ run }) {
  return (
    <section className="rounded-3xl border border-rose-400/20 p-6">
      <h2 className="font-display text-lg font-bold text-rose-200">Новый раунд</h2>
      <p className="mt-1 mb-4 text-sm text-white/50">
        Сбрасывает таймер, сумму и итоги. Ответы текущего раунда остаются в базе, но перестают показываться.
      </p>
      <ResetRoundButton run={run} />
    </section>
  )
}
