import { Trophy } from 'lucide-react'
import { formatMoney, formatPhone } from '@/shared/lib'

// Карточка лидера (ответ, ближайший к реальной сумме)
export function WinnerSummary({ guess }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-amber-300/10 p-4 ring-1 ring-amber-300/25">
      <Trophy className="size-6 shrink-0 text-amber-300" />
      <div className="min-w-0 text-sm">
        <p className="truncate font-bold">
          {guess.name} · {formatPhone(guess.phone)}
        </p>
        <p className="text-white/60">
          ответ {formatMoney(guess.amount)} · {guess.diff === 0 ? 'точно!' : `разница ${formatMoney(guess.diff)}`}
        </p>
      </div>
    </div>
  )
}
