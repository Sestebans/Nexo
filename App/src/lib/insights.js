import { currentStreak, bestStreak, lastSevenDays } from './streak.js'
import { money } from './format.js'

// Todas las cifras de NEXO salen de aquí, calculadas en el dispositivo. La IA solo las explica.
export function computeSnapshot(state, now = new Date()) {
  const income = state.profile.income || null
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthExpenses = state.expenses.filter(e => e.day?.startsWith(prefix))
  const spent = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = lastDay - now.getDate() + 1
  const available = income === null ? null : income - spent
  const byCat = monthExpenses.reduce((m, e) => ({ ...m, [e.category]: (m[e.category] || 0) + e.amount }), {})
  const byCategory = Object.entries(byCat)
    .map(([category, amount]) => ({ category, amount, pct: Math.round((amount / spent) * 100) }))
    .sort((a, b) => b.amount - a.amount)
  const goals = state.goals.map(g => ({ ...g, pct: Math.min(100, Math.round((g.saved / g.target) * 100)), done: g.saved >= g.target }))
  return {
    income, spent, available, daysLeft,
    over: available !== null && available < 0,
    perDay: available !== null && available > 0 ? Math.floor(available / daysLeft) : 0,
    spentPct: income ? Math.min(100, Math.round((spent / income) * 100)) : 0,
    byCategory, top: byCategory[0] || null,
    goals, activeGoal: goals.find(g => !g.done) || goals[0] || null,
    streak: currentStreak(state.expenses),
    best: bestStreak(state.expenses),
    week: lastSevenDays(state.expenses),
    expenseCount: state.expenses.length,
    hasEnoughData: !!income && state.expenses.length >= 3,
  }
}

// Regla simple de ahorro (20% del ingreso). Es una heurística, no una proyección exacta.
export function goalAdvice(s) {
  const g = s.activeGoal
  if (!g || !s.income || g.done) return null
  const remaining = g.target - g.saved
  const monthly = Math.max(10000, Math.round((s.income * 0.2) / 1000) * 1000)
  const months = Math.ceil(remaining / monthly)
  return {
    goalId: g.id,
    text: `Te faltan ${money(remaining)} para "${g.name}". Si apartas ${money(monthly)} al mes (el 20% de lo que recibes), la logras en unos ${months} ${months === 1 ? 'mes' : 'meses'}.`,
  }
}

export function personalTip(s) {
  if (!s.top) return 'Registra tus gastos unos días y te doy un consejo hecho a tu medida.'
  const extra = s.over ? ' Este mes ya te pasaste de lo que recibes, así que vale la pena frenar lo no esencial.' : ''
  return `Lo que más pesa en tu mes es ${s.top.category.toLowerCase()}: ${money(s.top.amount)}, el ${s.top.pct}% de lo que has registrado. Prueba ponerle un tope semanal y mira cómo cambia tu cifra al día.${extra}`
}
