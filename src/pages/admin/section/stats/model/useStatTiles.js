import { useMemo } from 'react'
import { computeGuessStats } from '@/entities/guess'
import { formatMoney } from '@/shared/lib'

// Плитки сводки: [подпись, значение]
export function useStatTiles(guesses) {
  return useMemo(() => {
    const s = computeGuessStats(guesses)
    if (!s) return [['Ответов', '0']]
    return [
      ['Ответов', formatMoney(s.count)],
      ['Среднее', formatMoney(s.average)],
      ['Медиана', formatMoney(s.median)],
      ['Мин – макс', `${formatMoney(s.min)} – ${formatMoney(s.max)}`],
    ]
  }, [guesses])
}
