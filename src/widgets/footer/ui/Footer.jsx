import { DONATION_URL } from '@/shared/config'
import { AlifMark } from '@/shared/ui'

// Общий подвал сайта и админки
export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="flex items-center gap-3 font-display text-xl font-bold">
          <AlifMark className="h-9 w-auto shrink-0" />
          Знания должны быть доступны всем!
        </p>
        <a
          href={DONATION_URL}
          target="_blank"
          rel="noreferrer"
          className="w-fit rounded-full bg-alif/15 px-5 py-2 font-semibold text-alif-soft ring-1 ring-alif/30 transition hover:bg-alif/25"
        >
          alif.academy/donation
        </a>
      </div>
    </footer>
  )
}
