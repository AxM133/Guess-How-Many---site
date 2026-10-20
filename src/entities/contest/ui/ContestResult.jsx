import { useEffect, useState } from 'react'
import { animate, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { Medal, Trophy } from 'lucide-react'
import { formatMoney } from '@/shared/lib'

function CountUp({ to }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const controls = animate(0, to, { duration: 2.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setValue(Math.round(v)) })
    return () => controls.stop()
  }, [to])
  return formatMoney(value)
}

export function ContestResult({ result }) {
  useEffect(() => {
    const t = setTimeout(() => confetti({ particleCount: 200, spread: 100, origin: { y: 0.4 } }), 2300)
    return () => clearTimeout(t)
  }, [])

  const [winner, ...rest] = result.winners

  return (
    <div className="w-full">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-alif">В коробке было</p>
      <p className="text-shine mt-2 font-display text-6xl leading-none font-black sm:text-8xl">
        <CountUp to={result.amount} />
      </p>
      <p className="mt-2 font-display text-2xl font-bold text-white/70">сомони</p>

      {winner ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4 }}
          className="mt-8 max-w-md space-y-3"
        >
          <div className="glass flex items-center gap-4 rounded-2xl p-5 ring-1 ring-amber-300/30">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-amber-300/15">
              <Trophy className="size-7 text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-200/80">Победитель</p>
              <p className="truncate font-display text-xl font-bold">{winner.name}</p>
              <p className="text-sm text-white/55">
                {winner.phone} · ответ {formatMoney(winner.amount)} ·{' '}
                {winner.diff === 0 ? 'точно в цель!' : `ошибка ${formatMoney(winner.diff)}`}
              </p>
            </div>
          </div>
          {rest.map((w, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 text-sm">
              <Medal className={`size-5 ${i === 0 ? 'text-slate-300' : 'text-orange-300'}`} />
              <span className="truncate font-semibold">{w.name}</span>
              <span className="ml-auto shrink-0 text-white/50">
                {formatMoney(w.amount)} (±{formatMoney(w.diff)})
              </span>
            </div>
          ))}
        </motion.div>
      ) : (
        <p className="mt-6 text-white/50">В этот раз никто не участвовал.</p>
      )}
    </div>
  )
}
