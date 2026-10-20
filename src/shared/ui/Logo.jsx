import { ALIF_LOGO, BRAND_COLOR } from '../config'

const { viewBox: v } = ALIF_LOGO

export function AlifMark({ className = 'h-8 w-auto', color = BRAND_COLOR }) {
  return (
    <svg viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} className={className} aria-hidden="true">
      <path d={ALIF_LOGO.ring} fill="none" stroke={color} strokeWidth={ALIF_LOGO.ringWidth} />
      <path d={ALIF_LOGO.caret} fill={color} />
    </svg>
  )
}

export function AlifLogo({ href, className = '' }) {
  const content = (
    <>
      <AlifMark className="h-8 w-auto" />
      <span className="text-lg tracking-tight">
        <b className="font-extrabold">alif</b> academy
      </span>
    </>
  )
  const cls = `flex items-center gap-2.5 ${className}`
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls} aria-label="alif academy">
      {content}
    </a>
  ) : (
    <span className={cls}>{content}</span>
  )
}
