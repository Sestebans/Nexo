import { useState } from 'react'
import { Check, MessageCircle, Plus, Search, ThumbsUp } from 'lucide-react'
import Button from '../components/Button.jsx'
import Screen from '../components/Screen.jsx'
import { Alert, Chip } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { navigate } from '../lib/route.js'
import { moderate } from '../lib/moderation.js'

const CATS = ['Ahorro', 'Presupuesto', 'Crédito', 'Hábitos', 'Primer empleo', 'Otra']

const initialOf = name => (name || '?').trim().charAt(0).toUpperCase()
const when = iso => { const d = Math.floor((Date.now() - new Date(iso)) / 86400000); return d <= 0 ? 'hoy' : `hace ${d} ${d === 1 ? 'día' : 'días'}` }

export function Forum() {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Todas')
  const posts = state.forum.posts.filter(p => (cat === 'Todas' || p.category === cat) && (`${p.title} ${p.body}`.toLowerCase().includes(q.toLowerCase())))
  return <div className="stack">
    <div className="row"><h1 style={{ margin: 0 }}>Comunidad</h1><span className="spacer" /><Button size="small" onClick={() => navigate('/foro/nueva')}><Plus size={16} /> Preguntar</Button></div>
    <div className="search"><Search size={18} /><input className="input" aria-label="Buscar preguntas" placeholder="Buscar o filtrar preguntas" value={q} onChange={e => setQ(e.target.value)} /></div>
    <div className="chips scroll" aria-label="Categorías">{['Todas', ...CATS].map(c => <Chip key={c} on={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
    {posts.length === 0 && <div className="empty">No encontré preguntas con eso.<div style={{ marginTop: 12 }}><Button variant="secondary" onClick={() => navigate('/foro/nueva')}>Hacer una pregunta nueva</Button></div></div>}
    {posts.map(p => <button key={p.id} className="card tap" onClick={() => navigate(`/foro/${p.id}`)} style={{ cursor: 'pointer' }}>
      <div className="post-meta"><span className="avatar">{initialOf(p.author)}</span><span>{p.author}</span><span>·</span><span>{p.category}</span>{p.demo && <span className="pill soft">Ejemplo</span>}</div>
      <h3 style={{ margin: '10px 0 6px' }}>{p.title}</h3>
      <div className="post-meta"><MessageCircle size={15} />{p.answers.length} {p.answers.length === 1 ? 'respuesta' : 'respuestas'}</div>
    </button>)}
  </div>
}

export function NewPost() {
  const { actions } = useStore()
  const [text, setText] = useState('')
  const [category, setCategory] = useState('Ahorro')
  const [error, setError] = useState('')
  const [publishedId, setPublishedId] = useState(null)

  function submit(e) {
    e.preventDefault()
    const r = moderate(text)
    if (!r.ok) { setError(r.reason); return }
    setError('')
    setPublishedId(actions.publishPost({ text, category }))
  }

  if (publishedId) return <Screen title="Pregunta publicada" to="/foro">
    <div className="success-mark"><Check size={36} /></div>
    <div className="card"><p style={{ margin: 0 }}>{text.trim()}</p></div>
    <Alert kind="ok">Otras personas de la comunidad ya pueden responderte. Te avisamos aquí cuando llegue una respuesta.</Alert>
    <p className="small muted" style={{ margin: 0 }}>En esta demostración, las respuestas son de ejemplo y llegan a los pocos segundos.</p>
    <Button full onClick={() => navigate(`/foro/${publishedId}`)}>Ver respuestas</Button>
    <Button full variant="ghost" onClick={() => navigate('/foro')}>Volver a la comunidad</Button>
  </Screen>

  return <Screen title="Nueva pregunta" to="/foro">
    <form className="stack" onSubmit={submit} noValidate>
      {error && <Alert>{error}</Alert>}
      <div className="field">
        <label htmlFor="q">Tu pregunta</label>
        <textarea id="q" className="textarea" placeholder="Escribe tu pregunta sobre tu plata…" value={text} aria-invalid={!!error} onChange={e => setText(e.target.value)} />
        <span className="small muted">Recuerda seguir las normas: sin enlaces, teléfonos, claves ni promociones.</span>
      </div>
      <div className="field"><label>Categoría</label><div className="chips">{CATS.map(c => <Chip key={c} on={category === c} onClick={() => setCategory(c)}>{c}</Chip>)}</div></div>
      <Button type="submit" full>Publicar</Button>
    </form>
  </Screen>
}

export function PostDetail({ id }) {
  const { state, actions } = useStore()
  const [reply, setReply] = useState('')
  const [err, setErr] = useState('')
  const p = state.forum.posts.find(x => x.id === id)
  if (!p) return <Screen title="Pregunta" to="/foro"><div className="empty">No encontré esa pregunta.</div></Screen>

  function send(e) {
    e.preventDefault()
    const r = moderate(reply)
    if (!r.ok) { setErr(r.reason); return }
    setErr(''); actions.addAnswer(p.id, reply.trim()); setReply('')
  }

  return <Screen title="Pregunta" to="/foro">
    <section className="card">
      <div className="post-meta"><span className="avatar">{initialOf(p.author)}</span><span>{p.author}</span><span>·</span><span>{when(p.createdAt)}</span>{p.demo && <span className="pill soft">Ejemplo</span>}</div>
      <h2 style={{ margin: '12px 0 8px' }}>{p.title}</h2>
      {p.body !== p.title && <p style={{ margin: 0 }}>{p.body}</p>}
    </section>
    <section className="card">
      <h3>Respuestas ({p.answers.length})</h3>
      {p.answers.length === 0 && <p className="muted small" style={{ margin: 0 }}>Todavía nadie responde. Sé la primera persona.</p>}
      {p.answers.map(a => <div className="answer" key={a.id}>
        <div className="post-meta"><span className="avatar">{initialOf(a.author)}</span><span>{a.author}</span>{a.demo && <span className="pill soft">Ejemplo</span>}</div>
        <p style={{ margin: 0 }}>{a.body}</p>
        <div><button className={`helpful ${a.mine ? 'on' : ''}`} aria-pressed={a.mine} onClick={() => actions.toggleHelpful(p.id, a.id)}><ThumbsUp size={15} /> Marcar como útil · {a.helpful}</button></div>
      </div>)}
    </section>
    <form className="stack" onSubmit={send} noValidate>
      {err && <Alert>{err}</Alert>}
      <textarea className="textarea" aria-label="Tu respuesta" style={{ minHeight: 90 }} placeholder="Escribe tu respuesta…" value={reply} onChange={e => setReply(e.target.value)} />
      <Button type="submit" full>Responder</Button>
    </form>
  </Screen>
}
