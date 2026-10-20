const TOKEN_KEY = 'ghm-admin-token'

// Токен админа. Хранится в localStorage, подставляется в запросы к /api/admin
export const adminSession = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}
