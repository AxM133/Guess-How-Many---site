import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BadgeCheck, Loader2, Phone, RotateCcw, Send } from 'lucide-react'
import { formatPhone } from '@/shared/lib'
import { useQrCode } from '../lib/useQrCode'

const TELEGRAM_BLUE = 'bg-[#229ED9] hover:bg-[#1c8dc4] text-white shadow-lg shadow-sky-500/25'

function TelegramWaiting({ botUrl, onCancel }) {
  const qr = useQrCode(botUrl)
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center">
      <div className="flex-1">
        <p className="font-semibold">
          Откройте бота и нажмите <span className="text-alif-soft">«📱 Поделиться номером»</span>
        </p>
        <p className="mt-1 text-sm text-white/50">Номер подставится сюда автоматически.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a href={botUrl} target="_blank" rel="noreferrer" className={`btn ${TELEGRAM_BLUE}`}>
            <Send className="size-4" /> Открыть Telegram
          </a>
          <span className="flex items-center gap-2 text-sm text-white/50">
            <Loader2 className="size-4 animate-spin" /> Ждём подтверждение…
          </span>
        </div>
        <button type="button" onClick={onCancel} className="mt-3 text-sm text-white/40 underline-offset-4 hover:underline">
          Отменить
        </button>
      </div>
      {qr && (
        <div className="hidden shrink-0 flex-col items-center gap-2 md:flex">
          <img src={qr} alt="QR-код ссылки на бота" className="size-32 rounded-xl" />
          <span className="text-xs text-white/40">или наведите камеру телефона</span>
        </div>
      )}
    </div>
  )
}

function DevConfirm({ onConfirm }) {
  const [phone, setPhone] = useState('+992 ')
  return (
    <div>
      <p className="text-sm text-amber-200/80">
        Режим разработки: Telegram-бот не настроен, поэтому номер вводится вручную. На сайте в продакшене так нельзя.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          className="field py-2.5 tabular-nums"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
        />
        <button type="button" className="btn btn-ghost shrink-0 py-2.5" onClick={() => onConfirm(phone)}>
          Подтвердить
        </button>
      </div>
    </div>
  )
}

/** Блок «Телефон» в форме: подтверждение номера через Telegram вместо ручного ввода */
export function PhoneVerification({ verification, disabled }) {
  const { status, botUrl, dev, phone, error, start, reset, confirmDev } = verification

  async function begin() {
    const v = await start()
    // Пробуем сразу открыть бота; если браузер заблокирует — останется кнопка «Открыть Telegram»
    if (v?.botUrl) window.open(v.botUrl, '_blank', 'noopener')
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-white/70">Телефон</span>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={status + (dev ? '-dev' : '')}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {status === 'verified' ? (
              <div className="flex items-center gap-3">
                <BadgeCheck className="size-7 shrink-0 text-emerald-300" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold tabular-nums">{formatPhone(phone)}</p>
                  <p className="text-xs text-emerald-200/70">Номер подтверждён через Telegram</p>
                </div>
                <button type="button" onClick={reset} disabled={disabled} className="text-sm text-white/40 hover:text-white">
                  Сменить
                </button>
              </div>
            ) : status === 'pending' && dev ? (
              <DevConfirm onConfirm={confirmDev} />
            ) : status === 'pending' ? (
              <TelegramWaiting botUrl={botUrl} onCancel={reset} />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={begin}
                  disabled={disabled || status === 'starting'}
                  className={`btn ${TELEGRAM_BLUE}`}
                >
                  {status === 'starting' ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : status === 'expired' ? (
                    <RotateCcw className="size-4" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {status === 'expired' ? 'Подтвердить ещё раз' : 'Подтвердить номер через Telegram'}
                </button>
                <p className="flex items-start gap-2 text-xs text-white/45">
                  <Phone className="mt-0.5 size-3.5 shrink-0" />
                  {status === 'expired'
                    ? 'Время подтверждения истекло.'
                    : 'Бот попросит поделиться номером — вписывать ничего не нужно. Один номер — один ответ.'}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      </div>
    </div>
  )
}
