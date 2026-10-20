import { motion } from 'motion/react'
import { fadeUp } from '@/shared/lib'
import { RULES_NOTE, STEPS } from '../model/steps'

export function HowItWorksSection() {
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
        {RULES_NOTE}
      </motion.p>
    </section>
  )
}
