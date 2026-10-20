import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search } from 'lucide-react'
import { PLACE_MEDALS } from '@/entities/guess'
import { ExportGuessesButton } from '@/features/export-guesses'
import { RemoveGuessButton } from '@/features/remove-guess'
import { formatDateTime, formatMoney, formatPhone } from '@/shared/lib'
import { Card } from '@/shared/ui'

function useFilteredGuesses(guesses, query) {
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    const digits = q.replace(/\D/g, '')
    const list = guesses.map((g, i) => ({ ...g, place: i + 1 }))
    if (!q) return list
    return list.filter(
      (g) => g.name.toLowerCase().includes(q) || (digits && (g.phone.includes(digits) || String(g.amount).includes(digits))),
    )
  }, [guesses, query])
}

export function GuessesTable({ state, run }) {
  const [query, setQuery] = useState('')
  const ranked = state.actualAmount != null
  const rows = useFilteredGuesses(state.guesses, query)

  return (
    <Card
      title={`Ответы участников${ranked ? ' — по точности' : ''}`}
      action={<ExportGuessesButton round={state.round} run={run} />}
    >
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35" />
        <input
          className="field py-2.5 pl-11"
          placeholder="Поиск по имени, телефону или сумме"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-white/40">{query ? 'Ничего не найдено' : 'Пока никто не ответил'}</p>
      ) : (
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-white/40">
              <tr className="border-b border-white/10">
                <th className="py-3 pl-6 font-semibold">{ranked ? 'Место' : '#'}</th>
                <th className="py-3 font-semibold">Имя</th>
                <th className="py-3 font-semibold">Телефон</th>
                <th className="py-3 text-right font-semibold">Ответ</th>
                {ranked && <th className="py-3 text-right font-semibold">Разница</th>}
                <th className="py-3 pl-6 font-semibold">Время</th>
                <th className="py-3 pr-6" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((g) => (
                  <motion.tr
                    key={g.id}
                    layout
                    initial={{ opacity: 0, backgroundColor: 'rgba(34,211,238,0.15)' }}
                    animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                    exit={{ opacity: 0 }}
                    className={`border-b border-white/5 ${ranked && g.place <= 3 ? 'text-amber-100' : ''}`}
                  >
                    <td className="py-3 pl-6 font-semibold text-white/50">
                      {ranked && g.place <= 3 ? PLACE_MEDALS[g.place - 1] : g.place}
                    </td>
                    <td className="max-w-[200px] truncate py-3 font-semibold">{g.name}</td>
                    <td className="py-3 whitespace-nowrap tabular-nums text-white/70">{formatPhone(g.phone)}</td>
                    <td className="py-3 text-right font-display font-bold tabular-nums">{formatMoney(g.amount)}</td>
                    {ranked && <td className="py-3 text-right tabular-nums text-white/60">±{formatMoney(g.diff)}</td>}
                    <td className="py-3 pl-6 whitespace-nowrap text-white/50">{formatDateTime(g.created_at)}</td>
                    <td className="py-3 pr-6 text-right">
                      <RemoveGuessButton guess={g} run={run} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
