// Подпись + иконка слева + подсказка снизу; само поле передаётся children
export function Field({ icon: Icon, label, hint, children }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-semibold text-white/70">{label}</span>}
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/35" />}
        {children}
      </span>
      {hint && <span className="mt-1.5 block text-xs text-white/40">{hint}</span>}
    </label>
  )
}
