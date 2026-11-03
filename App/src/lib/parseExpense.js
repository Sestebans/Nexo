// Convierte "gasté 15 mil en almuerzo" en { amount, category, note }. Todo se calcula en el dispositivo.
const WORDS = { un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, quince: 15, veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50 }
const MULT = { mil: 1000, luca: 1000, lucas: 1000, k: 1000, millon: 1e6, millón: 1e6, millones: 1e6, palo: 1e6, palos: 1e6 }

const CATEGORY_WORDS = {
  Comida: /almuerzo|comida|desayuno|cena|restaurante|mercado|caf[eé]|pizza|hamburguesa|domicilio|empanada|snack|jugo|helado|tienda/,
  Transporte: /transporte|bus|taxi|uber|didi|transmilenio|gasolina|metro|pasaje|moto|peaje|parqueadero|sitp/,
  Salidas: /salidas?|cine|fiesta|cerveza|trago|concierto|salida|discoteca|bar\b|rumba|paseo/,
  Compras: /compras?\b|ropa|zapatos|tenis|compr[eé]|camiseta|regalo|maquillaje|aud[ií]fonos/,
  Educación: /educaci[oó]n|libro|matr[ií]cula|curso|universidad|fotocopias|semestre|taller/,
}

export function parseAmount(raw) {
  // Quita el $ y los separadores de miles (15.000 -> 15000) conservando el resto del texto
  let t = raw.replace(/\$/g, ' ')
  while (/(\d)[.,](\d{3})(?!\d)/.test(t)) t = t.replace(/(\d)[.,](\d{3})(?!\d)/g, '$1$2')
  let m = t.match(/(\d+(?:[.,]\d+)?)\s*(millones|mill[oó]n|mil|lucas?|k|palos?)?(?![a-záéíóúA-ZÁÉÍÓÚ])/i)
  if (m) {
    const n = parseFloat(m[1].replace(',', '.'))
    return { amount: Math.round(n * (m[2] ? MULT[m[2].toLowerCase()] : 1)), matched: m[0], clean: t }
  }
  m = t.match(/\b(un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|quince|veinte|treinta|cuarenta|cincuenta)\s+(millones|mill[oó]n|mil|lucas?|palos?)\b/i)
  if (m) return { amount: WORDS[m[1].toLowerCase()] * MULT[m[2].toLowerCase()], matched: m[0], clean: t }
  return { amount: null, matched: '', clean: t }
}

export function parseExpense(raw = '') {
  const original = raw.trim()
  const when = /\bayer\b/i.test(original) ? 'ayer' : 'hoy'
  const text = original.replace(/\b(ayer|hoy)\b/gi, ' ').replace(/\s+/g, ' ').trim()
  const { amount, matched, clean } = parseAmount(text)
  const lower = text.toLowerCase()
  const category = Object.entries(CATEGORY_WORDS).find(([, re]) => re.test(lower))?.[0] || 'Otro'

  let note = matched ? clean.replace(matched, ' ') : clean
  note = note.replace(/\s+/g, ' ').trim()
  let prev
  do {
    prev = note
    note = note
      .replace(/^(gast[eé]|pagu[eé]|compr[eé]|me cost[oó]|fueron|fue|son|en|de|por|para|pesos|el|la|un|una)\s+/i, '')
      .replace(/[,.]+$/, '')
      .trim()
  } while (note !== prev)
  note = note ? note.charAt(0).toUpperCase() + note.slice(1) : ''
  return { amount, category, note, when }
}
