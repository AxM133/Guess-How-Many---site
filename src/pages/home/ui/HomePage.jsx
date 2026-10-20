import { useContest, useNow } from '@/entities/contest'
import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'
import { AuroraBackground } from '@/shared/ui'
import { GuessSection } from '../section/guess'
import { HeroSection } from '../section/hero'
import { HowItWorksSection } from '../section/how-it-works'

export function HomePage() {
  const { contest, error, refresh, serverNow } = useContest()
  const now = useNow(serverNow, contest?.status === 'running')

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AuroraBackground />
      <Header
        actions={
          <a href="#rules" className="text-sm font-semibold text-white/60 transition hover:text-white">
            Правила
          </a>
        }
      />
      <main>
        <HeroSection contest={contest} error={error} now={now} refresh={refresh} />
        <GuessSection contest={contest} onSubmitted={refresh} />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  )
}
