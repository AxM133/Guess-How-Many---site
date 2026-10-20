import * as THREE from 'three'
import { ALIF_LOGO, BRAND_COLOR } from '@/shared/config'

// Все текстуры рисуются на canvas — никаких внешних картинок.

const NAVY = '#1d1a52'
const CYAN = '#22b8e6'
const CYAN_LIGHT = '#3fd0f2'

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function toTexture(canvas) {
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function dots(ctx, w, h, points) {
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  for (const [x, y, r] of points) {
    ctx.beginPath()
    ctx.arc(x * w, y * h, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function squiggle(ctx, x, y, size, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.strokeStyle = CYAN_LIGHT
  ctx.lineWidth = size * 0.28
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(-size, size * 0.4)
  ctx.lineTo(-size * 0.3, -size * 0.4)
  ctx.lineTo(size * 0.3, size * 0.4)
  ctx.lineTo(size, -size * 0.4)
  ctx.stroke()
  ctx.restore()
}

function mountain(ctx, w, h, peakX, peakY, leftY, rightY) {
  const g = ctx.createLinearGradient(0, peakY * h, 0, h)
  g.addColorStop(0, CYAN_LIGHT)
  g.addColorStop(1, CYAN)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(0, leftY * h)
  ctx.lineTo(peakX * w, peakY * h)
  ctx.lineTo(w, rightY * h)
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fill()
}

// Настоящий знак alif academy + надпись. x, y — левый верхний угол, h — высота знака
function logo(ctx, x, y, h) {
  const { viewBox: v, ring, caret, ringWidth } = ALIF_LOGO
  const k = h / v.h
  ctx.save()
  ctx.translate(x - v.x * k, y - v.y * k)
  ctx.scale(k, k)
  ctx.strokeStyle = BRAND_COLOR
  ctx.lineWidth = ringWidth
  ctx.stroke(new Path2D(ring))
  ctx.fillStyle = BRAND_COLOR
  ctx.fill(new Path2D(caret))
  ctx.restore()

  const textX = x + v.w * k + h * 0.22
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'
  ctx.font = `800 ${h * 0.62}px Manrope, sans-serif`
  ctx.fillText('alif', textX, y + h * 0.52)
  const alifW = ctx.measureText('alif ').width
  ctx.font = `500 ${h * 0.62}px Manrope, sans-serif`
  ctx.fillText('academy', textX + alifW, y + h * 0.52)
}

// Передняя сторона подставки — плакат как на фото
export function drawPoster() {
  const W = 1024
  const H = 1180
  const [c, ctx] = makeCanvas(W, H)

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#221e5e')
  bg.addColorStop(1, NAVY)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  mountain(ctx, W, H, 0.47, 0.73, 0.9, 0.86)
  dots(ctx, W, H, [
    [0.2, 0.05, 6],
    [0.88, 0.22, 7],
    [0.83, 0.92, 5],
    [0.62, 0.11, 4],
    [0.07, 0.62, 4],
  ])
  squiggle(ctx, W * 0.6, H * 0.1, 18, -0.6)
  squiggle(ctx, W * 0.86, H * 0.69, 22, -0.5)
  squiggle(ctx, W * 0.1, H * 0.76, 14, 0.4)

  logo(ctx, 80, 84, 70)

  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'alphabetic'
  ctx.font = '800 108px Manrope, sans-serif'
  ;['Знания', 'должны быть', 'доступны всем!'].forEach((line, i) => ctx.fillText(line, 76, 300 + i * 118))

  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.font = '600 33px Manrope, sans-serif'
  ;[
    'Помогите открыть бесплатный курс',
    'по программированию и внесите вклад',
    'в развитие IT в Таджикистане.',
  ].forEach((line, i) => ctx.fillText(line, 80, 600 + i * 44))

  ctx.fillStyle = CYAN
  ctx.beginPath()
  ctx.roundRect(76, 730, 420, 66, 33)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '700 34px Manrope, sans-serif'
  ctx.fillText('alif.academy/donation', 102, 775)

  return toTexture(c)
}

export function drawSide() {
  const W = 512
  const H = 590
  const [c, ctx] = makeCanvas(W, H)
  ctx.fillStyle = NAVY
  ctx.fillRect(0, 0, W, H)
  mountain(ctx, W, H, 0.6, 0.8, 0.92, 0.9)
  dots(ctx, W, H, [
    [0.25, 0.2, 4],
    [0.75, 0.45, 5],
    [0.4, 0.65, 3],
  ])
  squiggle(ctx, W * 0.7, H * 0.18, 12, -0.5)
  return toTexture(c)
}

// Банкноты сомони — упрощённо, по цветам купюр
export const DENOMINATIONS = [
  { value: 1, color: '#6b8e23', accent: '#c5d86d' },
  { value: 5, color: '#2563a8', accent: '#93c5fd' },
  { value: 10, color: '#9f2d2d', accent: '#fca5a5' },
  { value: 20, color: '#1f7a4d', accent: '#86efac' },
  { value: 50, color: '#8a5a2b', accent: '#f3c98b' },
  { value: 100, color: '#4338ca', accent: '#c4b5fd' },
  { value: 200, color: '#7e3a8f', accent: '#f0abfc' },
  { value: 500, color: '#c2410c', accent: '#fdba74' },
]

export function drawBanknote({ value, color, accent }) {
  const W = 512
  const H = 240
  const [c, ctx] = makeCanvas(W, H)

  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, color)
  g.addColorStop(0.55, accent)
  g.addColorStop(1, color)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // гильош
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 2
  for (let i = 0; i < 14; i++) {
    ctx.beginPath()
    ctx.ellipse(W * 0.68, H / 2, 30 + i * 9, 18 + i * 6, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.65)'
  ctx.lineWidth = 6
  ctx.strokeRect(10, 10, W - 20, H - 20)

  // овал с «портретом»
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.ellipse(W * 0.3, H / 2, 62, 80, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.beginPath()
  ctx.arc(W * 0.3, H / 2 - 18, 24, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(W * 0.3, H / 2 + 46, 44, 30, 0, Math.PI, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 6
  ctx.textBaseline = 'middle'
  ctx.font = '900 64px Unbounded, Manrope, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(String(value), W - 30, 62)
  ctx.font = '900 36px Unbounded, Manrope, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(String(value), 30, H - 44)
  ctx.font = '800 28px Manrope, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('СОМОНӢ', W - 30, H - 44)
  ctx.font = '700 15px Manrope, sans-serif'
  ctx.fillText('БОНКИ МИЛЛИИ ТОҶИКИСТОН', W - 30, 112)

  return toTexture(c)
}

// Ждём загрузки шрифтов, чтобы надписи на canvas были правильными
export const fontsReady = (async () => {
  try {
    await Promise.all([
      document.fonts.load('800 100px Manrope'),
      document.fonts.load('600 30px Manrope'),
      document.fonts.load('900 60px Unbounded'),
    ])
  } catch {
    /* без шрифтов нарисуем системными */
  }
})()
