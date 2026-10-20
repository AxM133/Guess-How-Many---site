import { CircleAlert, CircleCheck, Loader2, Plug } from 'lucide-react'
import { Card } from '@/shared/ui'
import { useTelegramStatus } from '../model/useTelegramStatus'

export function TelegramSection({ run }) {
  const { info, checks, connect } = useTelegramStatus(run)

  return (
    <Card title="Telegram и защита">
      {!info ? (
        <Loader2 className="size-5 animate-spin text-white/40" />
      ) : info.error ? (
        <p className="text-sm text-rose-300">{info.error}</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-3">
          {checks.map((c) => (
            <li key={c.key} className="flex gap-3 rounded-2xl bg-white/[0.03] p-4">
              {c.ok ? (
                <CircleCheck className="size-5 shrink-0 text-emerald-300" />
              ) : (
                <CircleAlert className="size-5 shrink-0 text-amber-300" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{c.title}</p>
                <p className="mt-0.5 text-xs break-words text-white/50">{c.hint}</p>
                {c.action && (
                  <button className="btn btn-ghost mt-3 px-3 py-1.5 text-sm" onClick={connect}>
                    <Plug className="size-4" /> Подключить
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
