import { Loader2 } from 'lucide-react'
import { LoginForm, useAdminAuth } from '@/features/admin-auth'
import { AdminHeader } from '@/widgets/admin-header'
import { ContestStats } from '@/widgets/contest-stats'
import { GuessesTable } from '@/widgets/guesses-table'
import { NewRoundPanel } from '@/widgets/new-round-panel'
import { ResultPanel } from '@/widgets/result-panel'
import { TimerPanel } from '@/widgets/timer-panel'
import { useToast } from '@/shared/lib'
import { Toast } from '@/shared/ui'
import { useAdminDashboard } from '../model/useAdminDashboard'

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
      <AdminHeader round={state.round} participants={state.participants} onRefresh={() => run(load)} onLogout={onLogout} />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-8">
        <ContestStats guesses={state.guesses} />
        <div className="grid gap-5 lg:grid-cols-2">
          <TimerPanel key={state.round} state={state} now={now} run={run} />
          <ResultPanel state={state} run={run} />
        </div>
        <GuessesTable state={state} run={run} />
        <NewRoundPanel run={run} />
      </main>
      <Toast toast={toast} />
    </div>
  )
}

export default function AdminPage() {
  const { authed, login, logout } = useAdminAuth()
  if (authed) return <Dashboard onLogout={logout} />
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#1e1a5c,#07061a_70%)] p-4">
      <LoginForm onLogin={login} />
    </div>
  )
}
