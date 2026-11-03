import { useState } from 'react'
import { Check, Flame, Plus } from 'lucide-react'
import Button from '../components/Button.jsx'
import NexoOrb from '../components/NexoOrb.jsx'
import { HelpButton, HelpNote, Money } from '../components/ui.jsx'
import { ExpenseRow } from './Expenses.jsx'
import { useStore } from '../lib/store.jsx'
import { navigate } from '../lib/route.js'
import { money } from '../lib/format.js'
import { goalIcon } from '../lib/categories.js'

export default function Home() {
  const { state, snapshot: s } = useStore()
  const [help, setHelp] = useState('') // '', 'day' o 'streak'
  const toggle = k => setHelp(h => (h === k ? '' : k))
  const recent = [...state.expenses].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 3)
  const g = s.activeGoal
  const GIcon = g ? goalIcon(g.name) : null
  const tip = s.top
    ? `Lo que más pesa este mes es ${s.top.category.toLowerCase()}: ${s.top.pct}% de lo que has registrado.`
    : 'Registra tu primer gasto de hoy y empiezo a mostrarte en qué se te va la plata.'

  return <div className="stack">
    <section className="hero-card" aria-label="Resumen del mes">
      <div className="hero-label">{s.over ? 'Te pasaste este mes por' : 'Te quedan este mes'}</div>
      <Money value={Math.abs(s.available ?? 0)} />
      <div className={`hero-bar ${s.over ? 'over' : ''}`} role="img" aria-label={`Has gastado el ${s.spentPct}% de tus ingresos`}><span style={{ width: `${s.spentPct}%` }} /></div>
      <div className="hero-meta">
        <div>Gastado<b>{money(s.spent)}</b></div>
        <div style={{ textAlign: 'right' }}>
          {s.over ? 'Ingresos del mes' : <>Puedes gastar al día<HelpButton label="¿Cómo se calcula lo que puedes gastar al día?" open={help === 'day'} onClick={() => toggle('day')} /></>}
          <b>{s.over ? money(s.income) : money(s.perDay)}</b>
        </div>
      </div>
      {help === 'day' && <HelpNote dark>Es lo que te queda este mes dividido entre los días que faltan. Se actualiza cada vez que registras un gasto.</HelpNote>}
    </section>

    <Button full onClick={() => navigate('/gastos/nuevo')}><Plus size={18} /> Registrar gasto de hoy</Button>

    <section className="insight">
      <div className="insight-title"><NexoOrb size="small" /> NEXO</div>
      <p style={{ margin: 0 }}>{tip}</p>
    </section>

    <section className="card card-lime" aria-label="Racha">
      <div className="row">
        <Flame size={22} />
        <h3 style={{ margin: 0 }}>{s.streak === 0 ? 'Empieza tu racha' : `${s.streak} ${s.streak === 1 ? 'día' : 'días'} de racha`}</h3>
        <HelpButton label="¿Qué es la racha?" open={help === 'streak'} onClick={() => toggle('streak')} />
        <span className="spacer" />
        <Button variant="ghost" size="small" onClick={() => navigate('/racha')}>Recompensas</Button>
      </div>
      {help === 'streak' && <HelpNote>Cuenta los días seguidos en que registras al menos un gasto. Con 3, 7 y 14 días desbloqueas recompensas.</HelpNote>}
      <p className="small" style={{ margin: '6px 0 0' }}>{s.streak === 0 ? 'Registra un gasto hoy y cuenta como el día 1.' : 'Registrar cada día me deja darte respuestas con sentido.'}</p>
      <div className="streak-days">
        {s.week.map(d => <div key={d.key} className={`streak-day ${d.on ? 'on' : ''} ${d.today ? 'today' : ''}`}>
          <span className="streak-dot">{d.on && <Check size={14} />}</span>{d.label}
        </div>)}
      </div>
    </section>

    <section className="card">
      <div className="row"><h2 style={{ margin: 0 }}>Tu meta</h2><span className="spacer" /><Button variant="ghost" size="small" onClick={() => navigate('/metas')}>Ver metas</Button></div>
      {g ? <button className="row" style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', padding: '14px 0 0', color: 'inherit' }} onClick={() => navigate(`/metas/${g.id}`)}>
        <span className="icon-tile lime"><GIcon size={22} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="row"><b style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</b><span className="spacer" /><span className="small muted">{g.pct}%</span></span>
          <span className="bar" style={{ display: 'block', margin: '8px 0 6px' }}><span style={{ width: `${g.pct}%` }} /></span>
          <span className="small muted">{money(g.saved)} de {money(g.target)}</span>
        </span>
      </button> : <p className="muted small" style={{ margin: '12px 0 0' }}>Todavía no has creado una meta.</p>}
    </section>

    <section className="card">
      <div className="row"><h2 style={{ margin: 0 }}>Últimos gastos</h2><span className="spacer" />{state.expenses.length > 0 && <Button variant="ghost" size="small" onClick={() => navigate('/gastos')}>Ver todos</Button>}</div>
      {recent.length === 0
        ? <p className="muted small" style={{ margin: '12px 0 0' }}>Aquí van a aparecer tus gastos apenas registres el primero.</p>
        : <div className="list" style={{ marginTop: 8 }}>{recent.map(item => <ExpenseRow key={item.id} item={item} />)}</div>}
    </section>
  </div>
}
