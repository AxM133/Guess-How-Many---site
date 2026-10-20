import { useMemo } from 'react'

// Поиск по имени, телефону или сумме; place — место в исходном (отсортированном) списке
export function useFilteredGuesses(guesses, query) {
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
