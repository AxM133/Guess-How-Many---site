import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Banknote, CheckCircle2, Loader2, Send, User } from 'lucide-react'
import { dropNotes } from '@/entities/donation-box'
import { contestApi } from '@/shared/api'
import { formatMoney } from '@/shared/lib'
import { Field } from '@/shared/ui'
import { celebrate } from '../lib/celebrate'
import { readMyGuess, saveMyGuess } from '../lib/myGuess'
import { useVerification } from '../model/useVerification'
import { PhoneVerification } from './PhoneVerification'

export function SubmitGuessForm({ contest, onSubmitted }) {
  const running = contest?.status === 'running'
  const [mine, setMine] = useState(() => (contest ? readMyGuess(contest.startsAt) : null))
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  // Имя из Telegram подставляем, только если человек ещё ничего не ввёл
  const prefillName = useCallback((tgName) => {
    setError(null)
    if (tgName) setName((cur) => (cur.trim() ? cur : tgName))
  }, [])
  const verification = useVerification({ onVerified: prefillName })
  const [amount, setAmount] = useState('')
  const [sending, setSending] = useState(false)

  // Если админ запустил новый конкурс — сбрасываем «уже ответил»
  const [seenStart, setSeenStart] = useState(contest?.startsAt)
  if (contest?.startsAt !== seenStart) {
    setSeenStart(contest?.startsAt)
    setMine(contest ? readMyGuess(contest.startsAt) : null)
  }

  const digits = amount.replace(/\D/g, '')

  async function submit(e) {
    e.preventDefault()
    setError(null)
    if (name.trim().length < 2) return setError('Как вас зовут?')
    if (!digits) return setError('Сколько, по-вашему, денег в коробке?')
    if (verification.status !== 'verified') return setError('Подтвердите номер телефона через Telegram')

    setSending(true)
    try {
      await contestApi.submitGuess({ token: verification.token, name: name.trim(), amount: Number(digits) })
      setMine(saveMyGuess({ startsAt: contest.startsAt, name: name.trim(), amount: Number(digits) }))
      verification.reset() // подтверждение одноразовое и уже потрачено
      celebrate()
      dropNotes(4)
      onSubmitted?.()
    } catch (err) {
      setError(err.message)
      if (err.code === 'VERIFY_AGAIN') verification.reset()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
      <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <AnimatePresence mode="wait">
        {mine ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative py-6 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
              className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-emerald-400/15 ring-1 ring-emerald-300/30"
            >
              <CheckCircle2 className="size-10 text-emerald-300" />
            </motion.div>
            <h3 className="font-display text-2xl font-bold sm:text-3xl">Ответ принят, {mine.name}!</h3>
            <p className="mt-3 text-white/60">Ваша догадка</p>
            <p className="text-shine mt-1 font-display text-5xl font-black sm:text-6xl">
              {formatMoney(mine.amount)} <span className="text-2xl">сомони</span>
            </p>
            <p className="mx-auto mt-5 max-w-sm text-sm text-white/50">
              Дождитесь окончания отсчёта — результаты появятся на этой странице. Победителю позвонят по
              подтверждённому номеру.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={submit}
            className="relative grid gap-5"
          >
            <div>
              <h3 className="font-display text-2xl font-bold sm:text-3xl">Ваша догадка</h3>
              <p className="mt-2 text-white/55">
                {running
                  ? 'Один ответ с одного номера — подумайте хорошенько.'
                  : contest?.status === 'finished'
                    ? 'Приём ответов закрыт.'
                    : 'Конкурс скоро начнётся — форма откроется вместе с отсчётом.'}
              </p>
            </div>

            <Field icon={Banknote} label="Сколько денег в коробке?" hint="Сумма в сомони, целым числом">
              <input
                className="field py-5 pr-24 pl-12 font-display text-3xl font-bold tracking-wide"
                inputMode="numeric"
                placeholder="0"
                value={digits ? formatMoney(Number(digits)) : ''}
                onChange={(e) => {
                  setError(null)
                  setAmount(e.target.value.replace(/\D/g, '').slice(0, 8))
                }}
                disabled={!running || sending}
              />
              <span className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 font-semibold text-white/40">
                сомони
              </span>
            </Field>

            <Field icon={User} label="Имя" hint="Так вас объявят, если вы победите">
              <input
                className="field pl-12"
                placeholder="Как к вам обращаться"
                autoComplete="name"
                maxLength={60}
                value={name}
                onChange={(e) => {
                  setError(null)
                  setName(e.target.value)
                }}
                disabled={!running || sending}
              />
            </Field>

            <PhoneVerification verification={verification} disabled={!running || sending} />

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-400/20"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="btn btn-primary py-4 text-lg" disabled={!running || sending}>
              {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              Отправить ответ
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
