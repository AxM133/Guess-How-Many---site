import { AnimatePresence, motion } from 'motion/react'

export function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role="status"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10 }}
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-2xl ${
            toast.error ? 'bg-rose-500 text-white' : 'bg-white text-ink-950'
          }`}
        >
          {toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
