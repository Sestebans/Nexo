import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronRight, Gift, Mic, Pencil, Plus } from 'lucide-react'
import Button from '../components/Button.jsx'
import Screen from '../components/Screen.jsx'
import ExpenseFields from '../components/ExpenseFields.jsx'
import { Alert, Chip, BigAmountConfirm } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { useStore, uid } from '../lib/store.jsx'
import { navigate } from '../lib/route.js'
import { dayKey, dayOffset, lastSevenDays, bestStreak, currentStreak } from '../lib/streak.js'
import { money, toNumber, dayLabel } from '../lib/format.js'
import { categoryIcon } from '../lib/categories.js'
import { parseExpense } from '../lib/parseExpense.js'
import { newlyUnlocked } from '../lib/rewards.js'

export function ExpenseRow({ item }) {
  const Icon = categoryIcon(item.category)
  return <button className="list-row row-btn" onClick={() => navigate(`/gastos/${item.id}`)} aria-label={`${item.description}, ${money(item.amount)}. Toca para editar`}>
    <div className="icon-tile" data-cat={item.category}><Icon size={20} /></div>
    <div style={{ flex: 1, minWidth: 0 }}><b>{item.description}</b><div className="small muted">{item.category}</div></div>
    <b className="num">{money(item.amount)}</b>
    <ChevronRight size={18} className="chev" />
  </button>
}

export function Expenses() {
  const { state, snapshot: s } = useStore()
  const groups = [...state.expenses].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).reduce((acc, e) => {
    ;(acc[e.day] = acc[e.day] || []).push(e); return acc
  }, {})
  const days = Object.keys(groups).sort().reverse()

  return <div className="stack">
    <div className="row"><h1 style={{ margin: 0 }}>Gastos</h1><span className="spacer" /><Button size="small" onClick={() => navigate('/gastos/nuevo')}><Plus size={16} /> Registrar</Button></div>

    {s.byCategory.length > 0 && <section className="card">
      <div className="row"><h2 style={{ margin: 0 }}>Este mes</h2><span className="spacer" /><b className="num">{money(s.spent)}</b></div>
      <div className="stack" style={{ marginTop: 14, gap: 14 }}>
        {s.byCategory.map(c => { const Icon = categoryIcon(c.category); return <div key={c.category}>
          <div className="row"><span className="icon-tile sm" data-cat={c.category}><Icon size={18} /></span><b>{c.category}</b><span className="spacer" /><span className="small muted">{c.pct}%</span><b className="num">{money(c.amount)}</b></div>
          <div className="bar" style={{ marginTop: 8 }}><span style={{ width: `${c.pct}%` }} /></div>
        </div> })}
      </div>
    </section>}

    {days.length === 0
      ? <div className="empty"><Gift size={28} /><p style={{ margin: '10px 0 14px' }}>Todavía no hay gastos. El primero toma 10 segundos.</p><Button onClick={() => navigate('/gastos/nuevo')}>Registrar mi primer gasto</Button></div>
      : <>
        <p className="small muted" style={{ margin: 0 }}>Toca un gasto para editarlo o eliminarlo.</p>
        {days.map(day => <section key={day} className="card">
          <div className="group-title" style={{ margin: '0 0 4px' }}>{dayLabel(day)}</div>
          <div className="list">{groups[day].map(item => <ExpenseRow key={item.id} item={item} />)}</div>
        </section>)}
      </>}
  </div>
}

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null
const dayFor = (when, otherDay) => (when === 'ayer' ? dayOffset(-1) : when === 'otra' ? otherDay : dayKey())

export function NewExpense() {
  const { state, snapshot, actions } = useStore()
  const toast = useToast()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [when, setWhen] = useState('hoy')
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(null)
  const [big, setBig] = useState(null)

  // Voz: lo que se dicta rellena el mismo formulario
  const [voiceMsg, setVoiceMsg] = useState(null) // { kind: 'ok' | 'warn', text }
  const [listening, setListening] = useState(false)
  const rec = useRef(null)
  useEffect(() => () => rec.current?.abort?.(), [])

  // Atajo: los últimos gastos distintos, para repetirlos con un toque
  const recent = useMemo(() => {
    const seen = new Set(), out = []
    for (const e of [...state.expenses].reverse()) {
      const k = `${e.description}|${e.amount}|${e.category}`
      if (!seen.has(k)) { seen.add(k); out.push(e) }
      if (out.length >= 3) break
    }
    return out
  }, [state.expenses])

  function save(data) {
    const expense = { id: uid(), description: data.note || data.category, amount: data.amount, category: data.category, day: dayFor(data.when), createdAt: new Date().toISOString() }
    const all = [...state.expenses, expense]
    const unlocked = newlyUnlocked(bestStreak(state.expenses), bestStreak(all)).filter(r => !state.rewards.claimed.includes(r.id))
    actions.addExpense(expense)
    setBig(null)
    setSaved({ expense, week: lastSevenDays(all), streak: currentStreak(all), unlocked })
  }
  // Frena un monto mayor que el ingreso mensual antes de guardarlo
  function guarded(data) {
    if (snapshot.income && data.amount > snapshot.income) { setBig(data); return }
    save(data)
  }
  function undo() {
    actions.removeExpense(saved.expense.id)
    setSaved(null)
    toast('Gasto deshecho')
  }

  function submitForm(e) {
    e.preventDefault()
    const errs = {}
    if (toNumber(amount) <= 0) errs.amount = 'Revisa el monto. Debe ser un número mayor a cero.'
    if (!category) errs.category = 'Elige una categoría.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    guarded({ amount: toNumber(amount), category, note: note.trim(), when })
  }

  function understand(text) {
    const p = parseExpense(text)
    if (!p.amount) { setVoiceMsg({ kind: 'warn', text: 'No pude entender el monto. Prueba con "gasté 15 mil en almuerzo" o escríbelo abajo.' }); return }
    setAmount(String(p.amount)); setCategory(p.category); setNote(p.note); setWhen(p.when); setErrors({}); setBig(null)
    setVoiceMsg({ kind: 'ok', text: `Entendí: "${text}". Revisa los datos de abajo y guarda.` })
  }
  function listen() {
    if (!SR) return
    if (listening) { rec.current?.stop(); return }
    const r = new SR(); rec.current = r
    r.lang = 'es-CO'; r.interimResults = false; r.maxAlternatives = 1
    r.onresult = ev => understand(ev.results[0][0].transcript)
    r.onerror = () => { setListening(false); setVoiceMsg({ kind: 'warn', text: 'No pude escucharte. Revisa el permiso del micrófono o escríbelo abajo.' }) }
    r.onend = () => setListening(false)
    setVoiceMsg(null); setListening(true); r.start()
  }
  function focusWrite() { document.getElementById('amount')?.focus() }
  function reset() { setSaved(null); setAmount(''); setCategory(''); setNote(''); setWhen('hoy'); setVoiceMsg(null); setErrors({}); setBig(null) }

  if (saved) {
    const e = saved.expense
    const Icon = categoryIcon(e.category)
    return <Screen title="Gasto registrado" to="/">
      <div className="success-mark"><Check size={36} /></div>
      <div className="card row"><span className="icon-tile" data-cat={e.category}><Icon size={22} /></span><div style={{ flex: 1, minWidth: 0 }}><b>{e.description}</b><div className="small muted">{e.category} · {dayLabel(e.day)}</div></div><b className="num">{money(e.amount)}</b></div>
      <Button full variant="tertiary" onClick={undo}>Deshacer</Button>
      <section className="card card-lime">
        <h3 style={{ margin: 0 }}>Racha actual: {saved.streak} {saved.streak === 1 ? 'día' : 'días'}</h3>
        <div className="streak-days">{saved.week.map(d => <div key={d.key} className={`streak-day ${d.on ? 'on' : ''} ${d.today ? 'today' : ''}`}><span className="streak-dot">{d.on && <Check size={14} />}</span>{d.label}</div>)}</div>
      </section>
      {saved.unlocked.map(r => <Alert key={r.id} kind="ok">Desbloqueaste una recompensa: {r.title}.</Alert>)}
      {saved.unlocked.length > 0 && <Button full variant="secondary" onClick={() => navigate('/racha')}><Gift size={18} /> Ver mi recompensa</Button>}
      <Button full onClick={() => navigate('/')}>Volver al inicio</Button>
      <Button full variant="ghost" onClick={reset}>Registrar otro gasto</Button>
    </Screen>
  }

  return <Screen title="Registrar gasto" to="/gastos">
    <div className="input-modes">
      {SR && <button type="button" className={`mode-btn ${listening ? 'live' : ''}`} onClick={listen}><Mic size={20} /> {listening ? 'Te escucho… toca para parar' : 'Grabar audio'}</button>}
      <button type="button" className="mode-btn" onClick={focusWrite}><Pencil size={20} /> Escribir</button>
    </div>
    {!listening && (SR
      ? <p className="muted small" style={{ margin: 0 }}>Toca "Grabar audio" y di, por ejemplo: "gasté 15 mil en almuerzo". Se llenan los datos y tú confirmas.</p>
      : <Alert>Tu navegador no permite dictado por voz. Escribe el gasto abajo.</Alert>)}
    {voiceMsg && <Alert kind={voiceMsg.kind}>{voiceMsg.text}</Alert>}

    {big && <BigAmountConfirm amount={big.amount} income={snapshot.income} onFix={() => setBig(null)} onKeep={() => save(big)} />}

    <form className="stack" onSubmit={submitForm} noValidate>
      {recent.length > 0 && <div className="field">
        <label>Repetir uno reciente</label>
        <div className="chips scroll" aria-label="Gastos recientes">{recent.map(e => <Chip key={e.id} Icon={categoryIcon(e.category)} onClick={() => guarded({ amount: e.amount, category: e.category, note: e.description, when: 'hoy' })}>{e.description} · {money(e.amount)}</Chip>)}</div>
      </div>}
      <ExpenseFields amount={amount} setAmount={setAmount} category={category} setCategory={setCategory} note={note} setNote={setNote} when={when} setWhen={setWhen} errors={errors} />
      <Button type="submit" full>Guardar gasto</Button>
      <Button type="button" variant="ghost" full onClick={() => navigate('/gastos')}>Cancelar</Button>
    </form>
  </Screen>
}

export function EditExpense({ id }) {
  const { state, snapshot, actions } = useStore()
  const toast = useToast()
  const e = state.expenses.find(x => x.id === id)
  const [amount, setAmount] = useState(e ? String(e.amount) : '')
  const [category, setCategory] = useState(e?.category || '')
  const [note, setNote] = useState(e && e.description !== e.category ? e.description : '')
  const [when, setWhen] = useState(!e ? 'hoy' : e.day === dayKey() ? 'hoy' : e.day === dayOffset(-1) ? 'ayer' : 'otra')
  const [errors, setErrors] = useState({})
  const [big, setBig] = useState(null)

  if (!e) return <Screen title="Gasto" to="/gastos"><div className="empty">No encontré ese gasto.</div></Screen>
  const otherDay = e.day !== dayKey() && e.day !== dayOffset(-1) ? e.day : null

  function commit(data) {
    actions.updateExpense(e.id, { amount: data.amount, category: data.category, description: data.note || data.category, day: dayFor(data.when, e.day) })
    toast('Gasto actualizado')
    navigate('/gastos')
  }
  function submit(ev) {
    ev.preventDefault()
    const errs = {}
    if (toNumber(amount) <= 0) errs.amount = 'Revisa el monto. Debe ser un número mayor a cero.'
    if (!category) errs.category = 'Elige una categoría.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    const data = { amount: toNumber(amount), category, note: note.trim(), when }
    if (snapshot.income && data.amount > snapshot.income) { setBig(data); return }
    commit(data)
  }
  function remove() {
    const copy = e
    actions.removeExpense(e.id)
    navigate('/gastos')
    toast('Gasto eliminado', { label: 'Deshacer', onClick: () => actions.addExpense(copy) })
  }

  return <Screen title="Editar gasto" to="/gastos">
    {big && <BigAmountConfirm amount={big.amount} income={snapshot.income} onFix={() => setBig(null)} onKeep={() => commit(big)} />}
    <form className="stack" onSubmit={submit} noValidate>
      <ExpenseFields amount={amount} setAmount={setAmount} category={category} setCategory={setCategory} note={note} setNote={setNote} when={when} setWhen={setWhen} otherDay={otherDay} errors={errors} />
      <Button type="submit" full>Guardar cambios</Button>
    </form>
    <Button variant="danger" full onClick={remove}>Eliminar gasto</Button>
  </Screen>
}
