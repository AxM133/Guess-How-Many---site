// Запоминаем свой ответ на устройстве, чтобы после перезагрузки показать «Ответ принят».
// Привязка к startsAt: новый конкурс — новая попытка.
const KEY = 'ghm-my-guess'

export function readMyGuess(startsAt) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return saved?.startsAt === startsAt ? saved : null
  } catch {
    return null
  }
}

export function saveMyGuess(guess) {
  try {
    localStorage.setItem(KEY, JSON.stringify(guess))
  } catch {
    /* приватный режим — просто не запомним */
  }
  return guess
}
