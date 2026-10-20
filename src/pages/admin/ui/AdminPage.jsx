import { Loader2 } from 'lucide-react'
import { LoginForm, useAdminAuth } from '@/features/admin-auth'
import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'
import { formatMoney, plural, useToast } from '@/shared/lib'
import { Toast } from '@/shared/ui'
import { useAdminDashboard } from '../model/useAdminDashboard'
import { GuessesSection } from '../section/guesses'
import { NewRoundSection } from '../section/new-round'
import { ResultsSection } from '../section/results'
import { StatsSection } from '../section/stats'
import { TelegramSection } from '../section/telegram'
import { TimerSection } from '../section/timer'
import { HeaderActions } from './HeaderActions'

function Dashboard({ onLogout }) {
  const [toast, notify] = useToast()
  const { state, now, load, run } = useAdminDashboard({ onUnauthorized: onLogout, notify })

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-alif" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1a1752,#07061a_60%)]">
      <Header
        sticky
        title="Угадай сумму · админка"
        subtitle={`Раунд ${state.round} · ${formatMoney(state.participants)} ${plural(state.participants, ['участник', 'участника', 'участников'])}`}
        actions={<HeaderActions onRefresh={() => run(load)} onLogout={onLogout} />}
      />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-8">
        <StatsSection guesses={state.guesses} />
        <div className="grid gap-5 lg:grid-cols-2">
          <TimerSection key={state.round} state={state} now={now} run={run} />
          <ResultsSection state={state} run={run} />
        </div>
        <GuessesSection state={state} run={run} />
        <TelegramSection run={run} />
        <NewRoundSection state={state} run={run} />
      </main>
      <Footer />
      <Toast toast={toast} />
    </div>
  )
}

export default function AdminPage() {
  const { authed, login, logout } = useAdminAuth()
  if (authed) return <Dashboard onLogout={logout} />
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,#1e1a5c,#07061a_70%)]">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <LoginForm onLogin={login} />
      </main>
      <Footer />
    </div>
  )
}
