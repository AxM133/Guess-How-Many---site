import { useEffect } from 'react'

// Какой блок показать под заголовком:
//  result    — итоги опубликованы
//  countdown — идёт приём ответов
//  waiting   — конкурс ещё не начался
//  counting  — время вышло, админ пересчитывает деньги
// Когда отсчёт дошёл до нуля, сразу запрашиваем свежее состояние с сервера.
export function useHeroStatus(contest, now, refresh) {
  const expired = contest.status === 'running' && now >= contest.endsAt
  useEffect(() => {
    if (expired) refresh()
  }, [expired, refresh])

  if (contest.result) return 'result'
  if (contest.status === 'running' && !expired) return 'countdown'
  return contest.status === 'idle' ? 'waiting' : 'counting'
}

export const showParticipation = (contest) => Boolean(contest && !contest.result)
