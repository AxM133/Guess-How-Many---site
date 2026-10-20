import { SITE_URL } from '@/shared/config'
import { AlifLogo, AlifMark } from '@/shared/ui'

// Общая шапка сайта и админки.
// Без title — логотип alif academy со ссылкой на сайт; с title — знак + заголовок + подзаголовок.
// actions — кнопки/ссылки справа. sticky — прилипает к верху при прокрутке (для админки).
export function Header({ title, subtitle, actions, sticky = false }) {
  return (
    <header className={sticky ? 'sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl' : ''}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5">
        {title ? (
          <div className="flex min-w-0 items-center gap-3">
            <AlifMark className="h-9 w-auto shrink-0" />
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold">{title}</h1>
              {subtitle && <p className="truncate text-xs text-white/45">{subtitle}</p>}
            </div>
          </div>
        ) : (
          <AlifLogo href={SITE_URL} />
        )}
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
