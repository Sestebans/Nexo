import { money } from './format.js'

export function detectIntent(q = '') {
  const t = q.toLowerCase()
  if (/meta|ahorr|voy bien|logro|alcanz/.test(t)) return 'goal'
  if (/m[aá]s gast|categor[ií]a|en qu[eé] gast|donde se me va|d[oó]nde se me va/.test(t)) return 'category'
  if (/gastar|semana|al d[ií]a|me queda|disponible|presupuesto|alcanza|este mes/.test(t)) return 'budget'
  if (/racha|d[ií]as seguidos/.test(t)) return 'streak'
  return 'general'
}
export const needsData = intent => ['goal', 'category', 'budget'].includes(intent)

function localAnswer(intent, s, pro) {
  let text
  if (intent === 'budget') {
    text = s.over
      ? `Este mes ya te pasaste por ${money(-s.available)} frente a lo que recibes. Lo mejor es pausar gastos no esenciales hasta fin de mes.`
      : `Este mes te quedan ${money(s.available)} y faltan ${s.daysLeft} días. Eso da unos ${money(s.perDay)} al día.`
  } else if (intent === 'goal') {
    const g = s.activeGoal
    text = g
      ? `Vas en ${g.pct}% de "${g.name}": ${money(g.saved)} de ${money(g.target)}. Te faltan ${money(g.target - g.saved)}.`
      : 'Todavía no tienes una meta creada. Crea una y te ayudo a seguirla.'
  } else if (intent === 'category') {
    text = s.top
      ? `Lo que más pesa este mes es ${s.top.category.toLowerCase()}: ${money(s.top.amount)}, el ${s.top.pct}% de lo que has registrado.`
      : 'Aún no tengo gastos de este mes para comparar.'
  } else if (intent === 'streak') {
    text = s.streak > 0
      ? `Llevas ${s.streak} ${s.streak === 1 ? 'día' : 'días'} seguidos registrando. Tu mejor racha es de ${s.best}.`
      : 'Hoy puedes empezar una racha nueva registrando un gasto.'
  } else {
    text = s.income
      ? `Te puedo ayudar con tu presupuesto, tus metas o tus gastos. Por ahora llevas ${money(s.spent)} gastados este mes y te quedan ${money(s.available)}.`
      : 'Te puedo ayudar con tu presupuesto, tus metas o tus gastos.'
  }
  if (pro && s.byCategory.length > 1) {
    text += ' Análisis ampliado: ' + s.byCategory.slice(0, 3).map(c => `${c.category} ${money(c.amount)} (${c.pct}%)`).join(', ') + '.'
  }
  return text
}

// Solo viajan números agregados. Las descripciones de los gastos nunca salen del dispositivo.
const toContext = s => ({
  ingresoMensual: s.income, gastadoEsteMes: s.spent, disponible: s.available, diasRestantesDelMes: s.daysLeft, puedesGastarAlDia: s.perDay,
  categorias: s.byCategory.slice(0, 4).map(c => ({ categoria: c.category, monto: c.amount, porcentaje: c.pct })),
  metas: s.goals.map(g => ({ nombre: g.name, objetivo: g.target, ahorrado: g.saved })),
  rachaActual: s.streak, mejorRacha: s.best, gastosRegistrados: s.expenseCount,
})

export async function askCopilot({ question, snapshot, history = [], pro = false }) {
  const intent = detectIntent(question)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  try {
    const r = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        question, pro, context: toContext(snapshot),
        history: history.filter(m => m.text && !m.insufficient).slice(-6).map(m => ({ role: m.from === 'you' ? 'user' : 'assistant', text: m.text })),
      }),
    })
    if (!r.ok) throw new Error('api')
    const data = await r.json()
    if (!data.text) throw new Error('empty')
    return { text: data.text, source: 'ia', intent }
  } catch {
    return { text: localAnswer(intent, snapshot, pro), source: 'local', intent }
  } finally {
    clearTimeout(timer)
  }
}
