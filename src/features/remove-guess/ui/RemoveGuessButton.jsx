import { Trash2 } from 'lucide-react'
import { adminApi } from '@/shared/api'
import { formatMoney } from '@/shared/lib'

export function RemoveGuessButton({ guess, run }) {
  return (
    <button
      title="Удалить ответ"
      className="rounded-lg p-2 text-white/30 transition hover:bg-rose-500/10 hover:text-rose-300"
      onClick={() =>
        confirm(`Удалить ответ «${guess.name}» (${formatMoney(guess.amount)})?`) &&
        run(() => adminApi.removeGuess(guess.id), 'Ответ удалён')
      }
    >
      <Trash2 className="size-4" />
    </button>
  )
}
