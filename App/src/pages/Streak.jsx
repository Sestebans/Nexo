import { Check, Flame, Gift, Lock } from 'lucide-react'
import Button from '../components/Button.jsx'
import Screen from '../components/Screen.jsx'
import { useStore, uid } from '../lib/store.jsx'
import { useToast } from '../components/Toast.jsx'
import { navigate } from '../lib/route.js'
import { REWARDS, isProActive, proDaysLeft } from '../lib/rewards.js'
import { personalTip } from '../lib/insights.js'

export default function Streak() {
  const { state, snapshot: s, actions } = useStore()
  const toast = useToast()
  const next = REWARDS.find(r => s.best < r.days)

  function claim(r) {
    actions.claimReward(r.id)
    if (r.id === 'r3') {
      actions.chatAdd({ id: uid(), from: 'nexo', text: personalTip(s), source: 'local' })
      toast('Recompensa canjeada. Te dejé un consejo en el copiloto.')
    } else toast(`Recompensa canjeada: ${r.title}`)
  }

  return <Screen title="Racha y recompensas" to="/">
    <section className="card card-lime">
      <div className="row"><Flame size={24} /><span className="eyebrow" style={{ color: 'var(--ink)' }}>Racha actual</span></div>
      <div className="money xl">{s.streak} <span style={{ fontSize: 22 }}>{s.streak === 1 ? 'día' : 'días'}</span></div>
      <div className="streak-days">{s.week.map(d => <div key={d.key} className={`streak-day ${d.on ? 'on' : ''} ${d.today ? 'today' : ''}`}><span className="streak-dot">{d.on && <Check size={14} />}</span>{d.label}</div>)}</div>
      <p className="small" style={{ margin: '14px 0 0' }}>Tu mejor racha: {s.best} {s.best === 1 ? 'día' : 'días'}. {next ? `Te faltan ${next.days - s.best} para "${next.title}".` : 'Ya reclamaste todo lo disponible.'}</p>
    </section>

    {isProActive(state.rewards) && <div className="card"><div className="row"><span className="pro-badge">PRO</span><span>NEXO Pro activo. Te quedan {proDaysLeft(state.rewards)} {proDaysLeft(state.rewards) === 1 ? 'día' : 'días'}.</span></div><p className="small muted" style={{ margin: '8px 0 0' }}>Con Pro, el copiloto da un análisis más completo en cada respuesta.</p></div>}

    <h2 style={{ margin: '4px 0 0' }}>Recompensas</h2>
    {REWARDS.map(r => {
      const unlocked = s.best >= r.days
      const claimed = state.rewards.claimed.includes(r.id)
      return <section key={r.id} className={`card reward ${unlocked ? '' : 'locked'}`}>
        <span className={`icon-tile ${unlocked ? 'lime' : ''}`}>{unlocked ? <Gift size={22} /> : <Lock size={22} />}</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>{r.title}</h3>
          <p className="small muted" style={{ margin: '4px 0 10px' }}>{r.text}</p>
          {claimed ? <span className="pill dark"><Check size={13} /> Canjeada</span>
            : unlocked ? <Button size="small" onClick={() => claim(r)}>Canjear</Button>
            : <span className="small muted">Se desbloquea con {r.days} días de racha. Te faltan {r.days - s.best}.</span>}
        </div>
      </section>
    })}
    {state.rewards.claimed.includes('r3') && <Button variant="tertiary" full onClick={() => navigate('/copiloto')}>Ver mi consejo en el copiloto</Button>}
  </Screen>
}
