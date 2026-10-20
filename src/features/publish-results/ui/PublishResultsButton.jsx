import { Eye, EyeOff } from 'lucide-react'
import { adminApi } from '@/shared/api'

export function PublishResultsButton({ revealed, canPublish, run }) {
  return revealed ? (
    <button key="hide" className="btn btn-ghost w-full" onClick={() => run(() => adminApi.reveal(false), 'Итоги скрыты')}>
      <EyeOff className="size-4" /> Скрыть итоги с сайта
    </button>
  ) : (
    <button
      key="publish"
      className="btn btn-primary w-full"
      disabled={!canPublish}
      onClick={() => run(() => adminApi.reveal(true), 'Итоги опубликованы на сайте 🎉')}
    >
      <Eye className="size-4" /> Опубликовать итоги
    </button>
  )
}
