import { Suspense } from 'react'
import { motion } from 'motion/react'
import { MousePointerClick } from 'lucide-react'
import { DonationBox3D } from '@/entities/donation-box'
import { EASE_OUT_EXPO } from '@/shared/lib'

const HEIGHT = 'h-[420px] sm:h-[560px] lg:h-[680px]'

export function BoxShowcase({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: EASE_OUT_EXPO }}
      className={`relative ${className}`}
    >
      <div className="absolute inset-[15%] rounded-full bg-cyan-400/20 blur-[90px]" />
      <Suspense fallback={<div className={HEIGHT} />}>
        <DonationBox3D className={`relative touch-pan-y ${HEIGHT}`} />
      </Suspense>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-8, -4, -8] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="glass pointer-events-none absolute top-[12%] right-[8%] flex size-16 items-center justify-center rounded-2xl font-display text-4xl font-black text-alif sm:size-20 sm:text-5xl"
      >
        ?
      </motion.div>
      <p className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-2 text-xs text-white/40">
        <MousePointerClick className="size-4" /> Покрутите коробку · нажмите, чтобы бросить купюру
      </p>
    </motion.div>
  )
}
