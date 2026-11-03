import { useState } from 'react'
import { Check, PartyPopper, Plus } from 'lucide-react'
import Button from '../components/Button.jsx'
import Screen from '../components/Screen.jsx'
import { Alert, Chip, Field, Money } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { useToast } from '../components/Toast.jsx'
import { navigate } from '../lib/route.js'
import { money, thousands, toNumber, onNum } from '../lib/format.js'
import { goalIcon } from '../lib/categories.js'

export function Goals() {
  const { snapshot: s } = useStore()
  return <div className="stack">
    <div className="row"><h1 style={{ margin: 0 }}>Metas</h1><span className="spacer" /><Button size="small" onClick={() => navigate('/metas/nueva')}><Plus size={16} /> Crear</Button></div>
    {s.goals.length === 0 && <div className="empty"><p style={{ margin: '0 0 14px' }}>Tu primera meta empieza aquí.</p><Button onClick={() => navigate('/metas/nueva')}>Crear una meta</Button></div>}
    {s.goals.map(g => { const Icon = goalIcon(g.name); return <button key={g.id} className="card tap" onClick={() => navigate(`/metas/${g.id}`)} style={{ cursor: 'pointer' }}>
      <div className="row"><span className="icon-tile lime"><Icon size={22} /></span><div style={{ flex: 1, minWidth: 0 }}><h3 style={{ margin: 0 }}>{g.name}</h3><span className="small muted">{g.done ? 'Meta cumplida' : 'Meta de ahorro'}</span></div>{g.done ? <span className="pill dark"><Check size={13} /> Lista</span> : <span className="pill">{g.pct}%</span>}</div>
      <div className="row wrap" style={{ margin: '16px 0 8px' }}><b className="num">{money(g.saved)}</b><span className="spacer" /><span className="small muted">de {money(g.target)}</span></div>
      <div className="bar"><span style={{ width: `${g.pct}%` }} /></div>
    </button> })}
  </div>
}

const IDEAS = ['Moto', 'Viaje', 'Celular', 'Fondo de emergencia', 'Universidad']

export function NewGoal() {
  const { actions } = useStore()
  const toast = useToast()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [errors, setErrors] = useState({})
  function submit(e) {
    e.preventDefault()
    const errs = {}
    if (name.trim().length < 2) errs.name = 'Ponle un nombre a tu meta.'
    if (toNumber(target) <= 0) errs.target = 'Escribe cuánto necesitas.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    actions.addGoal({ name: name.trim(), target: toNumber(target) })
    toast('Meta creada')
    navigate('/metas')
  }
  return <Screen title="Crear meta" to="/metas">
    <form className="stack" onSubmit={submit} noValidate>
      <Field label="Nombre" id="gname" error={errors.name}><input id="gname" className="input" placeholder="Ej. Viaje a Cartagena" value={name} aria-invalid={!!errors.name} onChange={e => setName(e.target.value)} /></Field>
      <div className="chips scroll">{IDEAS.map(i => <Chip key={i} on={name === i} onClick={() => setName(i)}>{i}</Chip>)}</div>
      <Field label="¿Cuánto necesitas?" id="gtarget" error={errors.target}><input id="gtarget" className="input" inputMode="numeric" placeholder="$ 1.500.000" value={target ? '$ ' + thousands(target) : ''} aria-invalid={!!errors.target} onChange={onNum(setTarget)} /></Field>
      <Button type="submit" full>Crear meta</Button>
    </form>
  </Screen>
}

export function GoalDetail({ id, edit }) {
  const { snapshot: s, actions } = useStore()
  const toast = useToast()
  const g = s.goals.find(x => x.id === id)
  const [add, setAdd] = useState('')
  const [err, setErr] = useState('')
  const [editing, setEditing] = useState(!!edit)
  const [name, setName] = useState(g?.name || '')
  const [target, setTarget] = useState(g ? String(g.target) : '')
  const [celebrate, setCelebrate] = useState(false)

  if (!g) return <Screen title="Meta" to="/metas"><div className="empty">No encontré esa meta.</div></Screen>
  const Icon = goalIcon(g.name)
  const remaining = Math.max(0, g.target - g.saved)

  function contribute(e) {
    e.preventDefault()
    const n = toNumber(add)
    if (n <= 0) { setErr('Escribe un valor mayor a $0.'); return }
    setErr('')
    const done = g.saved + n >= g.target
    actions.contribute(g.id, n)
    setAdd('')
    if (done && !g.done) setCelebrate(true); else toast('Abono registrado')
  }
  function saveEdit(e) {
    e.preventDefault()
    if (name.trim().length < 2 || toNumber(target) <= 0) { setErr('Revisa el nombre y el valor de la meta.'); return }
    actions.updateGoal(g.id, { name: name.trim(), target: toNumber(target) })
    setErr(''); setEditing(false); toast('Meta actualizada')
  }

  if (celebrate || g.done) {
    return <Screen title="Meta cumplida" to="/metas">
      <div className="success-mark"><PartyPopper size={34} /></div>
      <h1 style={{ textAlign: 'center', marginBottom: 0 }}>¡Lo lograste!</h1>
      <p className="muted" style={{ textAlign: 'center' }}>Completaste "{g.name}" con {money(g.saved)}.</p>
      <Button full onClick={() => navigate('/metas/nueva')}>Crear otra meta</Button>
      <Button full variant="ghost" onClick={() => { setCelebrate(false); navigate('/metas') }}>Volver a mis metas</Button>
    </Screen>
  }

  return <Screen title="Tu meta" to="/metas">
    <section className="card">
      <div className="row"><span className="icon-tile lime"><Icon size={22} /></span><div style={{ flex: 1 }}><h2 style={{ margin: 0 }}>{g.name}</h2><span className="small muted">Te faltan {money(remaining)}</span></div><span className="pill">{g.pct}%</span></div>
      <div className="row wrap" style={{ margin: '18px 0 8px' }}><Money value={g.saved} size="md" /><span className="spacer" /><span className="small muted">de {money(g.target)}</span></div>
      <div className="bar"><span style={{ width: `${g.pct}%` }} /></div>
    </section>

    {!editing && <form className="card stack" onSubmit={contribute} noValidate>
      <h3 style={{ margin: 0 }}>Abonar a esta meta</h3>
      <input className="input" aria-label="Valor del abono" inputMode="numeric" placeholder="$ 50.000" value={add ? '$ ' + thousands(add) : ''} aria-invalid={!!err} onChange={onNum(setAdd)} />
      {err && <span className="field-error">{err}</span>}
      <Button type="submit" full>Abonar</Button>
    </form>}

    {editing
      ? <form className="card stack" onSubmit={saveEdit} noValidate>
        <h3 style={{ margin: 0 }}>Ajustar meta</h3>
        <Field label="Nombre" id="ename"><input id="ename" className="input" value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Valor objetivo" id="etarget"><input id="etarget" className="input" inputMode="numeric" value={target ? '$ ' + thousands(target) : ''} onChange={onNum(setTarget)} /></Field>
        {err && <Alert>{err}</Alert>}
        <Button type="submit" full>Guardar cambios</Button>
        <Button type="button" variant="ghost" full onClick={() => { setEditing(false); setErr('') }}>Cancelar</Button>
      </form>
      : <Button full variant="tertiary" onClick={() => setEditing(true)}>Ajustar meta</Button>}
  </Screen>
}
