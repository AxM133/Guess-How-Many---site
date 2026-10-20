import { motion } from 'motion/react'
import { Eye, Gift, Hourglass, Send } from 'lucide-react'
import { fadeUp } from '@/shared/lib'

const STEPS = [
  { icon: Eye, title: 'Присмотритесь', text: 'Коробка стоит у входа в alif academy. Можно рассмотреть со всех сторон — но не открывать 😉' },
  { icon: Send, title: 'Отправьте догадку', text: 'Назовите сумму в сомони. Один ответ с одного номера телефона.' },
  { icon: Hourglass, title: 'Ждите отсчёт', text: 'Когда таймер дойдёт до нуля, администрация вскроет коробку и пересчитает деньги.' },
  { icon: Gift, title: 'Забирайте всё', text: 'Тот, чей ответ ближе всех к реальной сумме, получает всё содержимое коробки.' },
]

export function HowItWorks() {
  return (
    <section id="rules" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-20 sm:px-8">
      <motion.h2 {...fadeUp} className="font-display text-3xl font-bold sm:text-5xl">
        Как это работает
      </motion.h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="glass group relative overflow-hidden rounded-3xl p-6"
          >
            <span className="absolute top-4 right-5 font-display text-6xl font-black text-white/[0.04] transition group-hover:text-alif/10">
              {i + 1}
            </span>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-alif/10 ring-1 ring-alif/20">
              <s.icon className="size-6 text-alif" />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{s.text}</p>
          </motion.div>
        ))}
      </div>
      <motion.p {...fadeUp} className="mt-8 max-w-3xl text-sm text-white/40">
        Если несколько человек ошиблись одинаково, побеждает тот, кто ответил раньше. Номер телефона нужен только для
        связи с победителем и не публикуется.
      </motion.p>
    </section>
  )
}
