import { motion } from 'motion/react'
import { ArrowDown, Users } from 'lucide-react'
import { ContestStatusBadge } from '@/entities/contest'
import { formatMoney, plural } from '@/shared/lib'
import { BoxShowcase } from './BoxShowcase'
import { HeroStatus } from './HeroStatus'

export function Hero({ contest, error, now, refresh }) {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-4 px-4 pb-16 sm:px-8 lg:min-h-[calc(100vh-88px)] lg:grid-cols-[1.05fr_1fr] lg:gap-8">
      <div className="relative order-2 lg:order-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {contest && <ContestStatusBadge contest={contest} />}
          <h1 className="mt-6 font-display text-[1.85rem] leading-[1.1] font-black sm:text-5xl xl:text-6xl">
            Угадай, сколько <span className="text-shine">денег</span> в коробке
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/65 sm:text-xl">
            Назовите сумму точнее всех — и заберите <b className="text-white">всё, что внутри</b>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-9"
        >
          {contest ? (
            <HeroStatus contest={contest} now={now} refresh={refresh} />
          ) : (
            <div className="h-28 w-full max-w-md animate-pulse rounded-2xl bg-white/5" />
          )}
          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </motion.div>

        {contest && !contest.result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a href="#guess" className="btn btn-primary px-7 py-4 text-lg">
              Сделать ставку <ArrowDown className="size-5" />
            </a>
            <span className="flex items-center gap-2 text-white/60">
              <Users className="size-5 text-alif" />
              <b className="text-white">{formatMoney(contest.participants)}</b>
              {plural(contest.participants, ['участник', 'участника', 'участников'])}
            </span>
          </motion.div>
        )}
      </div>

      <BoxShowcase className="order-1 lg:order-2" />
    </section>
  )
}
