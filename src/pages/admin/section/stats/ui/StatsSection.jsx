import { useStatTiles } from '../model/useStatTiles'

export function StatsSection({ guesses }) {
  const tiles = useStatTiles(guesses)
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map(([label, value]) => (
        <div key={label} className="glass rounded-2xl px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">{label}</p>
          <p className="mt-1 truncate font-display text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  )
}
