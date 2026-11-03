export const PALETTES = [
  { id: 'lima', name: 'Lima y tinta', note: 'La actual. Fresca, con acento verde lima.', swatch: ['#F6F2EA', '#14142B', '#C9F25C', '#3A4BFF'] },
  { id: 'coral', name: 'Coral y ciruela', note: 'Cálida y cercana, más amable.', swatch: ['#FFF5EE', '#2A1038', '#FF8F70', '#6C4BFF'] },
  { id: 'mar', name: 'Mar y menta', note: 'Serena, transmite calma y confianza.', swatch: ['#EEF6F5', '#0D2B33', '#7BE3C3', '#2F5BFF'] },
  { id: 'sol', name: 'Sol y noche', note: 'Enérgica. Ojo: el amarillo recuerda a Bancolombia.', swatch: ['#FFFAEB', '#1A1814', '#FFD23F', '#2748FF'] },
]
const KEY = 'nexo:palette'
const PAPER = { lima: '#F6F2EA', coral: '#FFF5EE', mar: '#EEF6F5', sol: '#FFFAEB' }

export function applyPalette(id) {
  const ok = PALETTES.some(p => p.id === id) ? id : 'lima'
  if (ok === 'lima') document.documentElement.removeAttribute('data-palette')
  else document.documentElement.setAttribute('data-palette', ok)
  let m = document.querySelector('meta[name="theme-color"]')
  if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m) }
  m.content = PAPER[ok]
  try { window.localStorage.setItem(KEY, ok) } catch { /* sin almacenamiento */ }
  return ok
}
export function savedPalette() {
  try { return window.localStorage.getItem(KEY) || 'lima' } catch { return 'lima' }
}
