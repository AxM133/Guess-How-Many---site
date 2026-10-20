export function Card({ title, action, className = '', children }) {
  return (
    <section className={`glass rounded-3xl p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
