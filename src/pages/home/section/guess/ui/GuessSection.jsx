import { motion } from 'motion/react'
import { SubmitGuessForm } from '@/features/submit-guess'
import { fadeUp } from '@/shared/lib'
import { isGuessSectionLoading, isGuessSectionVisible } from '../model/visibility'

export function GuessSection({ contest, onSubmitted }) {
  if (!isGuessSectionVisible(contest)) return null
  return (
    <section id="guess" className="mx-auto max-w-3xl scroll-mt-8 px-4 py-16 sm:px-8">
      <motion.div {...fadeUp}>
        {isGuessSectionLoading(contest) ? (
          <div className="h-96 animate-pulse rounded-[2rem] bg-white/5" />
        ) : (
          <SubmitGuessForm contest={contest} onSubmitted={onSubmitted} />
        )}
      </motion.div>
    </section>
  )
}
