import { formatMoney, plural } from '@/shared/lib'

// Что именно скроется при старте нового раунда — показываем перед кнопкой
export function describeReset(state) {
  const n = state.guesses.length
  if (!n) return `Раунд ${state.round} пока без ответов — можно начинать заново.`
  return `Сейчас раунд ${state.round}: ${formatMoney(n)} ${plural(n, ['ответ', 'ответа', 'ответов'])} будут скрыты.`
}
