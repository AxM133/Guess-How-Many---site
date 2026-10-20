import { useState } from 'react'
import { Play, Square } from 'lucide-react'
import { adminApi } from '@/shared/api'

const HOUR = 3_600_000
const PRESETS = [
  { label: '1 час', ms: HOUR },
  { label: '12 часов', ms: 12 * HOUR },
  { label: '1 день', ms: 24 * HOUR },
  { label: '2 дня', ms: 48 * HOUR },
  { label: '3 дня', ms: 72 * HOUR },
  { label: 'Неделя', ms: 168 * HOUR },
]

// значение для <input type="datetime-local"> в местном времени
function toLocalInput(ts) {
  const d = new Date(ts - new Date(ts).getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 16)
}

// Запуск, продление и досрочная остановка конкурса.
// run(fn, successMessage) — выполняет действие и обновляет данные админки.
export function TimerControls({ running, run }) {
  const [custom, setCustom] = useState(() => toLocalInput(Date.now() + 24 * HOUR))
  const success = running ? 'Время обновлено' : 'Конкурс запущен!'

  return (
    <>
      <p className="mb-2 text-sm font-semibold text-white/60">
        {running ? 'Изменить время окончания (от текущего момента)' : 'Запустить на'}
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className="btn btn-ghost px-4 py-2 text-sm"
            onClick={() => run(() => adminApi.start(Date.now() + p.ms), success)}
          >
            <Play className="size-3.5" /> {p.label}
          </button>
        ))}
      </div>

      <p className="mt-5 mb-2 text-sm font-semibold text-white/60">Или до точной даты</p>
      <div className="flex flex-wrap gap-2">
        <input
          type="datetime-local"
          className="field w-auto flex-1 py-2.5"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button className="btn btn-primary py-2.5" onClick={() => run(() => adminApi.start(new Date(custom).getTime()), success)}>
          {running ? 'Сохранить' : 'Запустить'}
        </button>
      </div>

      {running && (
        <button
          className="btn btn-danger mt-6 w-full"
          onClick={() =>
            confirm('Остановить конкурс прямо сейчас? Приём ответов закроется.') && run(adminApi.stop, 'Конкурс остановлен')
          }
        >
          <Square className="size-4" /> Завершить сейчас
        </button>
      )}
    </>
  )
}
