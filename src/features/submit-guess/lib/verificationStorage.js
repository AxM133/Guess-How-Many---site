// Текущее подтверждение номера. Хранится в localStorage: на телефоне человек уходит в Telegram,
// и браузер может перезагрузить вкладку — подтверждение не должно потеряться.
const KEY = 'ghm-verification'

export function loadVerification() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    // подтверждённое живёт час, ожидающее — до expiresAt
    return saved && Date.now() < saved.expiresAt + 60 * 60_000 ? saved : null
  } catch {
    return null
  }
}

export function saveVerification(v) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* приватный режим — переживём без сохранения */
  }
}

export function clearVerification() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
