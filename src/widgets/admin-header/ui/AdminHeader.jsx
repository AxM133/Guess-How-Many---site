import { Eye, LogOut, RefreshCw } from 'lucide-react'
import { formatMoney, plural } from '@/shared/lib'
import { AlifMark } from '@/shared/ui'

export function AdminHeader({ round, participants, onRefresh, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <AlifMark className="h-9 w-auto shrink-0" />
          <div>
            <h1 className="font-display text-lg font-bold">Угадай сумму · админка</h1>
            <p className="text-xs text-white/45">
              Раунд {round} · {formatMoney(participants)} {plural(participants, ['участник', 'участника', 'участников'])}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" className="btn btn-ghost px-3 py-2 text-sm">
            <Eye className="size-4" /> <span className="hidden sm:inline">Сайт</span>
          </a>
          <button className="btn btn-ghost px-3 py-2 text-sm" onClick={onRefresh} title="Обновить">
            <RefreshCw className="size-4" />
          </button>
          <button className="btn btn-ghost px-3 py-2 text-sm" onClick={onLogout}>
            <LogOut className="size-4" /> <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>
    </header>
  )
}
