import { RotateCcw } from 'lucide-react'
import { adminApi } from '@/shared/api'

export function ResetRoundButton({ run }) {
  return (
    <button
      className="btn btn-danger"
      onClick={() =>
        confirm('Начать новый раунд? Текущие ответы и итоги будут скрыты.') && run(adminApi.reset, 'Новый раунд создан')
      }
    >
      <RotateCcw className="size-4" /> Начать новый раунд
    </button>
  )
}
