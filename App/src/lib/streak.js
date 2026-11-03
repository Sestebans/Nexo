// Fechas en hora local (Colombia), no UTC, para que la racha no cambie a las 7 p. m.
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const dayOffset = n => { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d) }
const nextDay = k => { const [y, m, d] = k.split('-').map(Number); return dayKey(new Date(y, m - 1, d + 1)) }

const LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export function lastSevenDays(expenses) {
  const logged = new Set(expenses.map(e => e.day).filter(Boolean))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = dayKey(d)
    return { key, label: LETTERS[d.getDay()], on: logged.has(key), today: i === 6 }
  })
}

// Días seguidos con al menos un gasto. Si hoy aún no registras, la racha sigue viva desde ayer.
export function currentStreak(expenses) {
  const logged = new Set(expenses.map(e => e.day).filter(Boolean))
  const d = new Date()
  if (!logged.has(dayKey(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (logged.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1) }
  return n
}

// Mejor racha de la historia: las recompensas ya ganadas no se pierden si se rompe la racha.
export function bestStreak(expenses) {
  const days = [...new Set(expenses.map(e => e.day).filter(Boolean))].sort()
  let best = 0, run = 0, prev = null
  for (const k of days) {
    run = prev && nextDay(prev) === k ? run + 1 : 1
    best = Math.max(best, run)
    prev = k
  }
  return best
}
