// Фон страницы: градиент, «северное сияние» и сетка
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e1a5c_0%,#0b0a24_45%,#07061a_100%)]" />
      <div className="absolute top-[10%] -left-[10%] size-[45vmax] animate-blob rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="absolute -right-[10%] bottom-[5%] size-[40vmax] animate-blob rounded-full bg-violet-600/20 blur-[120px] [animation-delay:-9s]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />
    </div>
  )
}
