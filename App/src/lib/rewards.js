// Recompensas por racha. proDays = días de NEXO Pro que se regalan.
export const REWARDS = [
  { id: 'r3', days: 3, title: 'Consejo personalizado', text: 'NEXO revisa tus registros y te deja un consejo hecho a tu medida.', proDays: 0 },
  { id: 'r7', days: 7, title: '3 días de NEXO Pro', text: 'El copiloto responde con un análisis más completo.', proDays: 3 },
  { id: 'r14', days: 14, title: '7 días de NEXO Pro', text: 'Una semana entera del análisis completo del copiloto.', proDays: 7 },
]

export const isProActive = (rewards, now = new Date()) => !!rewards?.proUntil && new Date(rewards.proUntil) > now

export function proDaysLeft(rewards, now = new Date()) {
  if (!isProActive(rewards, now)) return 0
  return Math.ceil((new Date(rewards.proUntil) - now) / 86400000)
}

// Recompensas que se desbloquean al pasar de una mejor racha a otra
export const newlyUnlocked = (before, after) => REWARDS.filter(r => before < r.days && after >= r.days)
