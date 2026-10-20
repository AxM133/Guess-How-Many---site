import { adminSession } from './session'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code // машиночитаемая причина, например VERIFY_AGAIN
  }
}

function headers({ json, admin }) {
  const h = {}
  if (json) h['Content-Type'] = 'application/json'
  if (admin) h.Authorization = `Bearer ${adminSession.get()}`
  return h
}

async function send(path, { method = 'GET', body, admin = false } = {}) {
  try {
    return await fetch(`/api${path}`, {
      method,
      headers: headers({ json: body !== undefined, admin }),
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Нет связи с сервером', 0)
  }
}

export async function request(path, options) {
  const res = await send(path, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || 'Что-то пошло не так', res.status, data.code)
  return data
}

export async function requestBlob(path, options) {
  const res = await send(path, options)
  if (!res.ok) throw new ApiError('Не удалось загрузить файл', res.status)
  return res.blob()
}
