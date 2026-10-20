// Что известно об итогах: лидер появляется, как только админ ввёл реальную сумму
// (сервер уже отсортировал ответы по точности). Публиковать можно только после финиша.
export function getResultsState(state) {
  const finished = state.status === 'finished'
  const hasAmount = state.actualAmount != null
  return {
    finished,
    leader: hasAmount ? (state.guesses[0] ?? null) : null,
    canPublish: finished && hasAmount,
  }
}
