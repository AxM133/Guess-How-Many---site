import { SITE_URL } from '@/shared/config'
import { AlifLogo } from '@/shared/ui'

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
      <AlifLogo href={SITE_URL} />
      <a href="#rules" className="text-sm font-semibold text-white/60 transition hover:text-white">
        Правила
      </a>
    </header>
  )
}
