import { dayKey } from './streak.js'

export const money = v =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(v || 0))

export const digits = s => String(s ?? '').replace(/\D/g, '')
export const thousands = s => digits(s).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
export const toNumber = s => Number(digits(s) || 0)

export function dayLabel(key) {
  const today = dayKey()
  const y = new Date(); y.setDate(y.getDate() - 1)
  if (key === today) return 'Hoy'
  if (key === dayKey(y)) return 'Ayer'
  const [yy, mm, dd] = key.split('-').map(Number)
  return new Date(yy, mm - 1, dd).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

// Los campos de dinero guardan solo dígitos (máximo 10) y se muestran con puntos: 1.500.000
export const onNum = setter => e => setter(digits(e.target.value).slice(0, 10))

// Factor para achicar la letra cuando la cifra es larga y que nunca se corte
export const fitFactor = text => (text.length <= 11 ? 1 : text.length === 12 ? 0.9 : text.length === 13 ? 0.82 : 0.74)
