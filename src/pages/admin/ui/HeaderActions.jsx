import { Eye, LogOut, RefreshCw } from 'lucide-react'

// Кнопки справа в общей шапке, когда она показана в админке
export function HeaderActions({ onRefresh, onLogout }) {
  return (
    <>
      <a href="/" target="_blank" className="btn btn-ghost px-3 py-2 text-sm">
        <Eye className="size-4" /> <span className="hidden sm:inline">Сайт</span>
      </a>
      <button className="btn btn-ghost px-3 py-2 text-sm" onClick={onRefresh} title="Обновить">
        <RefreshCw className="size-4" />
      </button>
      <button className="btn btn-ghost px-3 py-2 text-sm" onClick={onLogout}>
        <LogOut className="size-4" /> <span className="hidden sm:inline">Выйти</span>
      </button>
    </>
  )
}
