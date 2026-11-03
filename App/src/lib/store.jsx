import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { dayKey, dayOffset } from './streak.js'
import { computeSnapshot } from './insights.js'
import { REWARDS } from './rewards.js'

const KEY = 'nexo:v1'
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
const nowISO = () => new Date().toISOString()

const SEED_POSTS = [
  { id: 'seed1', title: '¿Cómo empiezo a ahorrar si gano poco?', body: 'Recibo cerca de un salario mínimo y siempre llego a fin de mes sin nada. ¿Por dónde empiezo?', category: 'Ahorro', author: 'Camila R.', demo: true, createdAt: '2026-10-05T15:00:00.000Z',
    answers: [{ id: 'seed1a', author: 'Andrés M.', body: 'A mí me sirvió apartar un monto fijo pequeño apenas me pagaban, aunque fuera poco. Lo que no ves, no lo gastas.', helpful: 3, mine: false, demo: true }] },
  { id: 'seed2', title: '¿Me conviene sacar una tarjeta de crédito siendo estudiante?', body: 'Me ofrecieron una en la universidad pero no sé si tiene sentido tenerla tan joven.', category: 'Crédito', author: 'Daniel P.', demo: true, createdAt: '2026-10-07T18:30:00.000Z', answers: [] },
  { id: 'seed3', title: '¿Cómo organizo mis gastos si me pagan por días?', body: 'Trabajo medio tiempo y mis ingresos cambian cada semana. No sé cómo armar un presupuesto así.', category: 'Presupuesto', author: 'Valentina S.', demo: true, createdAt: '2026-10-09T13:10:00.000Z',
    answers: [{ id: 'seed3a', author: 'Laura G.', body: 'Yo calculo con lo que gané la semana anterior y no con lo que espero ganar. Así nunca me paso.', helpful: 2, mine: false, demo: true }] },
]

const initial = () => ({
  v: 1,
  profile: { onboarded: false, income: null, accounts: [] },
  expenses: [], goals: [],
  rewards: { claimed: [], proUntil: null },
  chat: [],
  forum: { posts: SEED_POSTS, notifications: [] },
})

function load() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return initial()
    const s = JSON.parse(raw)
    if (s?.v !== 1) return initial()
    const base = initial()
    return { ...base, ...s, profile: { ...base.profile, ...s.profile }, rewards: { ...base.rewards, ...s.rewards }, forum: { ...base.forum, ...s.forum } }
  } catch { return initial() }
}

function demoExpenses() {
  const rows = [
    [-6, 'Almuerzo', 14000, 'Comida'], [-6, 'Bus', 3200, 'Transporte'],
    [-5, 'Café', 6500, 'Comida'], [-5, 'Cine', 28000, 'Salidas'],
    [-4, 'Mercado', 45000, 'Comida'],
    [-3, 'Almuerzo', 15000, 'Comida'], [-3, 'Transporte', 8400, 'Transporte'],
    [-2, 'Libros', 32000, 'Educación'],
    [-1, 'Domicilio', 22000, 'Comida'], [-1, 'Almuerzo', 13500, 'Comida'],
  ]
  return rows.map(([off, description, amount, category]) => {
    const day = dayOffset(off)
    return { id: uid(), description, amount, category, day, createdAt: nowISO() }
  })
}

function reducer(state, a) {
  switch (a.type) {
    case 'completeOnboarding': {
      const { income, accounts, goal } = a
      return { ...state, profile: { onboarded: true, income, accounts }, goals: [{ id: uid(), name: goal.name, target: goal.target, saved: 0, createdAt: nowISO() }, ...state.goals] }
    }
    case 'updateIncome': return { ...state, profile: { ...state.profile, income: a.income } }
    case 'addExpense': return { ...state, expenses: [...state.expenses, a.expense] }
    case 'updateExpense': return { ...state, expenses: state.expenses.map(e => e.id === a.id ? { ...e, ...a.patch } : e) }
    case 'removeExpense': return { ...state, expenses: state.expenses.filter(e => e.id !== a.id) }
    case 'addGoal': return { ...state, goals: [...state.goals, { id: uid(), saved: 0, createdAt: nowISO(), ...a.goal }] }
    case 'updateGoal': return { ...state, goals: state.goals.map(g => g.id === a.id ? { ...g, ...a.patch } : g) }
    case 'contribute': return { ...state, goals: state.goals.map(g => g.id === a.id ? { ...g, saved: g.saved + a.amount } : g) }
    case 'claimReward': {
      const r = REWARDS.find(x => x.id === a.id)
      if (!r || state.rewards.claimed.includes(r.id)) return state
      const base = state.rewards.proUntil && new Date(state.rewards.proUntil) > new Date() ? new Date(state.rewards.proUntil) : new Date()
      const proUntil = r.proDays ? new Date(base.getTime() + r.proDays * 86400000).toISOString() : state.rewards.proUntil
      return { ...state, rewards: { claimed: [...state.rewards.claimed, r.id], proUntil } }
    }
    case 'chatAdd': return { ...state, chat: [...state.chat, a.msg] }
    case 'chatResolve': return { ...state, chat: state.chat.map(m => m.id === a.id ? { ...m, resolved: a.value } : m) }
    case 'chatClear': return { ...state, chat: [] }
    case 'addPost': return { ...state, forum: { ...state.forum, posts: [a.post, ...state.forum.posts] } }
    case 'addAnswer': return { ...state, forum: { ...state.forum, posts: state.forum.posts.map(p => p.id === a.postId ? { ...p, answers: [...p.answers, a.answer] } : p) } }
    case 'toggleHelpful': return { ...state, forum: { ...state.forum, posts: state.forum.posts.map(p => p.id !== a.postId ? p : { ...p, answers: p.answers.map(x => x.id !== a.answerId ? x : { ...x, mine: !x.mine, helpful: x.helpful + (x.mine ? -1 : 1) }) }) } }
    case 'notify': return { ...state, forum: { ...state.forum, notifications: [a.note, ...state.forum.notifications] } }
    case 'markNotificationsRead': return { ...state, forum: { ...state.forum, notifications: state.forum.notifications.map(n => ({ ...n, read: true })) } }
    case 'loadDemo': {
      const goals = state.goals.map((g, i) => i === 0 ? { ...g, saved: Math.max(g.saved, Math.round((g.target * 0.2) / 1000) * 1000) } : g)
      const keep = state.expenses.filter(e => e.day === dayKey())
      return { ...state, expenses: [...demoExpenses(), ...keep], goals }
    }
    case 'reset': return initial()
    default: return state
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)
  const timers = useRef([])
  const [persistError, setPersistError] = useState(false)

  useEffect(() => {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); setPersistError(false) } catch { setPersistError(true) }
  }, [state])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const actions = useMemo(() => ({
    completeOnboarding: v => dispatch({ type: 'completeOnboarding', ...v }),
    updateIncome: income => dispatch({ type: 'updateIncome', income }),
    addExpense: expense => dispatch({ type: 'addExpense', expense }),
    updateExpense: (id, patch) => dispatch({ type: 'updateExpense', id, patch }),
    removeExpense: id => dispatch({ type: 'removeExpense', id }),
    addGoal: goal => dispatch({ type: 'addGoal', goal }),
    updateGoal: (id, patch) => dispatch({ type: 'updateGoal', id, patch }),
    contribute: (id, amount) => dispatch({ type: 'contribute', id, amount }),
    claimReward: id => dispatch({ type: 'claimReward', id }),
    chatAdd: msg => dispatch({ type: 'chatAdd', msg }),
    chatResolve: (id, value) => dispatch({ type: 'chatResolve', id, value }),
    chatClear: () => dispatch({ type: 'chatClear' }),
    toggleHelpful: (postId, answerId) => dispatch({ type: 'toggleHelpful', postId, answerId }),
    addAnswer: (postId, body) => dispatch({ type: 'addAnswer', postId, answer: { id: uid(), author: 'Tú', body, helpful: 0, mine: false } }),
    markNotificationsRead: () => dispatch({ type: 'markNotificationsRead' }),
    loadDemo: () => dispatch({ type: 'loadDemo' }),
    reset: () => dispatch({ type: 'reset' }),
    // Publica y simula que otra persona responde a los pocos segundos (solo demostración)
    publishPost: ({ text, category }) => {
      const id = uid()
      const m = text.trim().match(/^[^?\n]{5,80}\??/)
      const title = (m ? m[0] : text.trim().slice(0, 80)).trim()
      dispatch({ type: 'addPost', post: { id, title, body: text.trim(), category, author: 'Tú', demo: false, createdAt: nowISO(), answers: [] } })
      timers.current.push(setTimeout(() => {
        dispatch({ type: 'addAnswer', postId: id, answer: { id: uid(), author: 'Laura G.', body: 'Buena pregunta. A mí me ayudó anotar todo durante un mes para ver a dónde se iba la plata antes de decidir nada.', helpful: 0, mine: false, demo: true } })
        dispatch({ type: 'notify', note: { id: uid(), text: 'Nueva respuesta a tu pregunta', to: `/foro/${id}`, read: false, createdAt: nowISO() } })
      }, 7000))
      return id
    },
  }), [])

  const snapshot = useMemo(() => computeSnapshot(state), [state.profile, state.expenses, state.goals])
  const value = useMemo(() => ({ state, actions, snapshot, persistError }), [state, actions, snapshot, persistError])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
