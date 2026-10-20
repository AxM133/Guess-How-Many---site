import { AnimatePresence, motion } from 'motion/react'
import { plural, splitDuration } from '@/shared/lib'

function Digit({ value }) {
  return (
    <span className="relative inline-flex h-[1.15em] w-[0.72em] justify-center overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: '-90%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '90%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="absolute"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Unit({ value, labels, size }) {
  const digits = String(value).padStart(2, '0').split('')
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`glass relative flex items-center justify-center overflow-hidden rounded-2xl font-display font-bold tabular-nums ${
          size === 'sm' ? 'px-2.5 py-1.5 text-2xl' : 'px-2 py-2 text-[1.75rem] sm:px-4 sm:py-3 sm:text-6xl'
        }`}
      >
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/10" />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent" />
        {digits.map((d, i) => (
          <Digit key={i} value={d} />
        ))}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 sm:text-[11px] sm:tracking-[0.18em]">
        {plural(value, labels)}
      </span>
    </div>
  )
}

const LABELS = {
  days: ['день', 'дня', 'дней'],
  hours: ['час', 'часа', 'часов'],
  minutes: ['минута', 'минуты', 'минут'],
  seconds: ['секунда', 'секунды', 'секунд'],
}

export function Countdown({ startsAt, endsAt, now, size = 'lg' }) {
  const parts = splitDuration(endsAt - now)
  const total = Math.max(1, endsAt - startsAt)
  const progress = Math.min(1, Math.max(0, (now - startsAt) / total))
  const units = parts.days > 0 ? ['days', 'hours', 'minutes', 'seconds'] : ['hours', 'minutes', 'seconds']

  return (
    <div className="w-full">
      <div className={`flex items-start ${size === 'sm' ? 'gap-2' : 'gap-1.5 sm:gap-3'}`}>
        {units.map((u, i) => (
          <div key={u} className="flex items-start gap-1.5 sm:gap-3">
            {i > 0 && (
              <span
                className={`animate-pulse font-display font-bold text-alif/60 ${
                  size === 'sm' ? 'pt-1.5 text-2xl' : 'pt-2 text-2xl sm:pt-3 sm:text-5xl'
                }`}
              >
                :
              </span>
            )}
            <Unit value={parts[u]} labels={LABELS[u]} size={size} />
          </div>
        ))}
      </div>
      {size !== 'sm' && (
        <div className="mt-5 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
            animate={{ width: `${progress * 100}%` }}
            transition={{ ease: 'linear', duration: 0.3 }}
          />
        </div>
      )}
    </div>
  )
}
