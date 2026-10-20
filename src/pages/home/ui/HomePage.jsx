import { motion } from 'motion/react'
import { useContest, useNow } from '@/entities/contest'
import { SubmitGuessForm } from '@/features/submit-guess'
import { Hero } from '@/widgets/hero'
import { HowItWorks } from '@/widgets/how-it-works'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'
import { fadeUp } from '@/shared/lib'
import { AuroraBackground } from '@/shared/ui'

export function HomePage() {
  const { contest, error, refresh, serverNow } = useContest()
  const now = useNow(serverNow, contest?.status === 'running')

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AuroraBackground />
      <SiteHeader />
      <main>
        <Hero contest={contest} error={error} now={now} refresh={refresh} />

        {!contest?.result && (
          <section id="guess" className="mx-auto max-w-3xl scroll-mt-8 px-4 py-16 sm:px-8">
            <motion.div {...fadeUp}>
              {contest ? (
                <SubmitGuessForm contest={contest} onSubmitted={refresh} />
              ) : (
                <div className="h-96 animate-pulse rounded-[2rem] bg-white/5" />
              )}
            </motion.div>
          </section>
        )}

        <HowItWorks />
      </main>
      <SiteFooter />
    </div>
  )
}
