import { useMemo } from 'react'
import { computeGuessStats } from '@/entities/guess'
import { formatMoney } from '@/shared/lib'

export function ContestStats({ guesses }) {
  const tiles = useMemo(() => {
    const s = computeGuessStats(guesses)
    if (!s) return [['Ответов', '0']]
    return [
      ['Ответов', formatMoney(s.count)],
      ['Среднее', formatMoney(s.average)],
      ['Медиана', formatMoney(s.median)],
      ['Мин – макс', `${formatMoney(s.min)} – ${formatMoney(s.max)}`],
    ]
  }, [guesses])

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map(([label, value]) => (
        <div key={label} className="glass rounded-2xl px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">{label}</p>
          <p className="mt-1 truncate font-display text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  )
}
