// Сводка по ответам для админки
export function computeGuessStats(guesses) {
  if (!guesses.length) return null
  const sorted = guesses.map((g) => g.amount).sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return {
    count: sorted.length,
    average: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
    median: sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2),
    min: sorted[0],
    max: sorted.at(-1),
  }
}

export const PLACE_MEDALS = ['🥇', '🥈', '🥉']
