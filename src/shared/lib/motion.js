export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1]

// Плавное появление блока при прокрутке
export const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: EASE_OUT_EXPO },
}
