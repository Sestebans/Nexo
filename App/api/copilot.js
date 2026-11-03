// Función de servidor (Vercel). La clave de Anthropic vive aquí, nunca en el navegador.
// Variables de entorno: ANTHROPIC_API_KEY (obligatoria), ANTHROPIC_MODEL y ANTHROPIC_MODEL_PRO (opcionales).
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5'
const MODEL_PRO = process.env.ANTHROPIC_MODEL_PRO || 'claude-sonnet-5-5'

const SYSTEM = `Eres NEXO, un copiloto financiero para jóvenes de 18 a 25 años en Colombia.
Hablas en español, tuteando, cercano y directo, sin regaños ni sermones.
Usa SOLO las cifras del contexto que recibes, en pesos colombianos. No inventes datos, tasas, productos ni fechas.
Si faltan datos para responder bien, dilo y sugiere qué registrar.
Nunca pidas ni aceptes claves, números de tarjeta ni credenciales bancarias.
No eres asesor financiero licenciado: das orientación general. Si la pregunta implica una decisión grande (créditos, inversiones), sugiere comparar opciones o consultar a un profesional.
Respuestas cortas: máximo 5 frases. Sin markdown ni listas largas.`

const hits = new Map() // límite básico por IP (en serverless es de mejor esfuerzo)
function limited(ip) {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter(t => now - t < 60000)
  arr.push(now); hits.set(ip, arr)
  return arr.length > 20
}

const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const str = (v, n) => String(v ?? '').slice(0, n)

function cleanContext(c = {}) {
  return {
    ingresoMensual: num(c.ingresoMensual), gastadoEsteMes: num(c.gastadoEsteMes), disponible: num(c.disponible),
    diasRestantesDelMes: num(c.diasRestantesDelMes), puedesGastarAlDia: num(c.puedesGastarAlDia),
    categorias: (Array.isArray(c.categorias) ? c.categorias : []).slice(0, 4).map(x => ({ categoria: str(x.categoria, 30), monto: num(x.monto), porcentaje: num(x.porcentaje) })),
    metas: (Array.isArray(c.metas) ? c.metas : []).slice(0, 5).map(x => ({ nombre: str(x.nombre, 60), objetivo: num(x.objetivo), ahorrado: num(x.ahorrado) })),
    rachaActual: num(c.rachaActual), mejorRacha: num(c.mejorRacha), gastosRegistrados: num(c.gastosRegistrados),
  }
}

function buildMessages(history, question, context) {
  const msgs = []
  for (const h of (Array.isArray(history) ? history : []).slice(-6)) {
    const role = h.role === 'assistant' ? 'assistant' : 'user'
    const text = str(h.text, 600)
    if (!text) continue
    if (!msgs.length && role === 'assistant') continue
    if (msgs.length && msgs[msgs.length - 1].role === role) msgs[msgs.length - 1].content += '\n' + text
    else msgs.push({ role, content: text })
  }
  const final = `Datos del usuario (JSON):\n${JSON.stringify(context)}\n\nPregunta: ${str(question, 500)}`
  if (msgs.length && msgs[msgs.length - 1].role === 'user') msgs[msgs.length - 1].content += '\n\n' + final
  else msgs.push({ role: 'user', content: final })
  return msgs
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'sin_clave' })
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0]
  if (limited(ip)) return res.status(429).json({ error: 'muchas_solicitudes' })

  const body = req.body || {}
  const question = str(body.question, 500).trim()
  if (!question) return res.status(400).json({ error: 'pregunta_vacia' })
  const pro = body.pro === true

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: pro ? MODEL_PRO : MODEL,
        max_tokens: pro ? 500 : 320,
        system: SYSTEM + (pro ? '\nPuedes dar un análisis un poco más completo (hasta 8 frases).' : ''),
        messages: buildMessages(body.history, question, cleanContext(body.context)),
      }),
    })
    if (!r.ok) return res.status(502).json({ error: 'ia_no_disponible' })
    const data = await r.json()
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
    if (!text) return res.status(502).json({ error: 'respuesta_vacia' })
    return res.status(200).json({ text })
  } catch {
    return res.status(502).json({ error: 'ia_no_disponible' })
  }
}
