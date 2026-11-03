import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Send } from 'lucide-react'
import Button from '../components/Button.jsx'
import NexoOrb from '../components/NexoOrb.jsx'
import { Chip } from '../components/ui.jsx'
import { useStore, uid } from '../lib/store.jsx'
import { useToast } from '../components/Toast.jsx'
import { navigate } from '../lib/route.js'
import { askCopilot, detectIntent, needsData } from '../lib/copilot.js'
import { goalAdvice } from '../lib/insights.js'
import { isProActive } from '../lib/rewards.js'

const SUGGESTED = ['¿Cuánto puedo gastar al día?', '¿Voy bien con mi meta?', '¿En qué gasté más?']

export default function Copilot() {
  const { state, snapshot: s, actions } = useStore()
  const toast = useToast()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const alive = useRef(true)
  const end = useRef(null)
  const pro = isProActive(state.rewards)
  useEffect(() => () => { alive.current = false }, [])
  useEffect(() => { end.current?.scrollIntoView?.({ block: 'end' }) }, [state.chat.length, loading])

  async function send(q) {
    const text = q.trim()
    if (!text || loading) return
    setInput('')
    actions.chatAdd({ id: uid(), from: 'you', text })
    const intent = detectIntent(text)
    if (needsData(intent) && !s.hasEnoughData) {
      actions.chatAdd({ id: uid(), from: 'nexo', insufficient: true, text: 'Me faltan datos para responder bien.' })
      return
    }
    setLoading(true)
    const res = await askCopilot({ question: text, snapshot: s, history: state.chat, pro })
    if (alive.current) setLoading(false)
    actions.chatAdd({ id: uid(), from: 'nexo', text: res.text, source: res.source, advice: res.intent === 'goal' ? goalAdvice(s) : null })
  }

  return <div className="stack">
    <div className="row">
      <NexoOrb /><div><h1 style={{ margin: 0, fontSize: 24 }}>Copiloto</h1><span className="small muted">{pro ? 'NEXO Pro activo' : 'Pregúntame sobre tu plata'}</span></div>
      <span className="spacer" />
      {state.chat.length > 0 && <button className="icon-btn" aria-label="Nueva conversación" onClick={() => actions.chatClear()}><RotateCcw size={17} /></button>}
    </div>

    <div className="chat" aria-live="polite">
      <div className="bubble nexo"><div className="bubble-hd"><NexoOrb size="small" />NEXO</div>Hola. Con lo que registras te puedo decir cuánto te queda, cómo vas con tu meta y en qué se te va la plata. ¿Qué quieres saber?</div>
      {state.chat.map(m => m.from === 'you'
        ? <div key={m.id} className="bubble you">{m.text}</div>
        : <div key={m.id} className="bubble nexo">
          <div className="bubble-hd"><NexoOrb size="small" />NEXO</div>
          {m.insufficient ? <div className="stack" style={{ gap: 10 }}>
            <b>Me faltan datos para responder bien</b>
            <span>Con al menos 3 gastos registrados puedo decirte algo útil. Hoy llevas {s.expenseCount}.</span>
            <Button variant="secondary" onClick={() => navigate('/gastos/nuevo')}>Registrar un gasto</Button>
          </div> : <>
            {m.text}
            {m.source === 'local' && <div className="bubble-src">Respuesta con tus números, sin usar la IA.</div>}
            {m.advice && <div className="card" style={{ marginTop: 12, background: 'var(--lime-50)' }}>
              <b>Acción sugerida</b>
              <p style={{ margin: '6px 0 12px' }}>{m.advice.text}</p>
              {m.resolved
                ? <span className="small muted">{m.resolved === 'keep' ? 'Mantienes tu meta como está.' : 'Vas a ajustar tu meta.'}</span>
                : <div className="row">
                  <Button variant="tertiary" size="small" onClick={() => { actions.chatResolve(m.id, 'keep'); toast('Listo, mantienes tu meta') }}>Mantener meta</Button>
                  <Button size="small" onClick={() => { actions.chatResolve(m.id, 'adjust'); navigate(`/metas/${m.advice.goalId}?editar=1`) }}>Ajustar meta</Button>
                </div>}
            </div>}
          </>}
        </div>)}
      {loading && <div className="bubble nexo" aria-label="NEXO está escribiendo"><span className="typing"><i /><i /><i /></span></div>}
      <div ref={end} />
    </div>

    <div className="chips scroll" aria-label="Preguntas sugeridas">{SUGGESTED.map(q => <Chip key={q} onClick={() => send(q)}>{q}</Chip>)}</div>
    <form className="composer" onSubmit={e => { e.preventDefault(); send(input) }}>
      <input className="input" aria-label="Escribe tu pregunta" placeholder="Escribe tu pregunta sobre tu plata…" value={input} onChange={e => setInput(e.target.value)} maxLength={300} />
      <button className="send-btn" aria-label="Enviar" disabled={loading || !input.trim()}><Send size={18} /></button>
    </form>
    <p className="small muted" style={{ margin: 0 }}>No compartas claves ni datos de tarjetas. NEXO da orientación general y no reemplaza a un asesor financiero.</p>
  </div>
}
