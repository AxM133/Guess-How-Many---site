import { request, requestBlob } from './client'

const post = (body = {}) => ({ method: 'POST', body })
const admin = (options = {}) => ({ ...options, admin: true })

export const contestApi = {
  get: () => request('/contest'),
  submitGuess: (guess) => request('/guesses', post(guess)),
}

export const adminApi = {
  login: (password) => request('/admin/login', post({ password })),
  state: () => request('/admin/state', admin()),
  start: (endsAt) => request('/admin/contest/start', admin(post({ endsAt }))),
  stop: () => request('/admin/contest/stop', admin(post())),
  setAmount: (amount) => request('/admin/contest/amount', admin(post({ amount }))),
  reveal: (revealed) => request('/admin/contest/reveal', admin(post({ revealed }))),
  reset: () => request('/admin/contest/reset', admin(post())),
  removeGuess: (id) => request(`/admin/guesses/${id}`, admin({ method: 'DELETE' })),
  exportCsv: () => requestBlob('/admin/export.csv', admin()),
}
