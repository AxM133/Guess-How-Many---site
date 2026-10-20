import confetti from 'canvas-confetti'

const COLORS = ['#22d3ee', '#67e8f9', '#a78bfa', '#ffffff', '#facc15']

export function celebrate() {
  confetti({ particleCount: 140, spread: 80, origin: { y: 0.7 }, colors: COLORS })
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: COLORS }), 200)
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: COLORS }), 350)
}
