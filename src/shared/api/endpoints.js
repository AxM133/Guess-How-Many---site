import { request, requestBlob } from './client'

const post = (body = {}) => ({ method: 'POST', body })
const admin = (options = {}) => ({ ...options, admin: true })

export const contestApi = {
  get: () => request('/contest'),
  /** guess: { token (подтверждение номера), name, amount } */
  submitGuess: (guess) => request('/guesses', post(guess)),
}

export const verifyApi = {
  start: () => request('/verify/start', post()),
  status: (token) => request('/verify/status', post({ token })),
  /** только локально, когда бот не настроен */
  confirmDev: (token, phone) => request('/verify/dev', post({ token, phone })),
}

export const adminApi = {
  /** → { token } или { challenge }, если включён код из Telegram */
  login: (password) => request('/admin/login', post({ password })),
  loginCode: (challenge, code) => request('/admin/login/code', post({ challenge, code })),
  telegram: () => request('/admin/telegram', admin()),
  connectWebhook: () => request('/admin/telegram/webhook', admin(post())),
  state: () => request('/admin/state', admin()),
  start: (endsAt) => request('/admin/contest/start', admin(post({ endsAt }))),
  stop: () => request('/admin/contest/stop', admin(post())),
  setAmount: (amount) => request('/admin/contest/amount', admin(post({ amount }))),
  reveal: (revealed) => request('/admin/contest/reveal', admin(post({ revealed }))),
  reset: () => request('/admin/contest/reset', admin(post())),
  removeGuess: (id) => request(`/admin/guesses/${id}`, admin({ method: 'DELETE' })),
  exportCsv: () => requestBlob('/admin/export.csv', admin()),
}
