import { useState } from 'react'
import { Flame, Shield } from 'lucide-react'
import Button from '../components/Button.jsx'
import Screen from '../components/Screen.jsx'
import { Alert } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { useToast } from '../components/Toast.jsx'
import { navigate } from '../lib/route.js'
import { money, thousands, toNumber, onNum } from '../lib/format.js'
import { isProActive } from '../lib/rewards.js'
import PalettePicker from '../components/PalettePicker.jsx'

export function Profile() {
  const { state, snapshot: s, actions } = useStore()
  const toast = useToast()
  const [income, setIncome] = useState(String(state.profile.income || ''))
  const [err, setErr] = useState('')

  function saveIncome(e) {
    e.preventDefault()
    if (toNumber(income) <= 0) { setErr('Escribe un valor mayor a $0.'); return }
    setErr(''); actions.updateIncome(toNumber(income)); toast('Ingresos actualizados')
  }
  function reset() {
    if (window.confirm('Esto borra tus gastos, metas, chat y recompensas de este dispositivo. ¿Seguro?')) {
      actions.reset(); navigate('/bienvenida', { replace: true })
    }
  }

  return <Screen title="Perfil" to="/">
    <div className="row" style={{ gap: 12 }}>
      <div className="card p16 spacer"><div className="row"><Flame size={18} /><span className="num" style={{ fontSize: 22 }}>{s.streak}</span></div><span className="small muted">días de racha</span></div>
      <div className="card p16 spacer"><span className="num" style={{ fontSize: 22 }}>{isProActive(state.rewards) ? 'Pro' : 'Gratis'}</span><div className="small muted">plan de NEXO</div></div>
    </div>

    <form className="card stack" onSubmit={saveIncome} noValidate>
      <h3 style={{ margin: 0 }}>Información financiera</h3>
      <label className="small muted" htmlFor="inc">Ingresos mensuales</label>
      <input id="inc" className="input" inputMode="numeric" value={income ? '$ ' + thousands(income) : ''} aria-invalid={!!err} onChange={onNum(setIncome)} />
      {err && <span className="field-error">{err}</span>}
      <Button type="submit" full>Guardar</Button>
      {state.profile.accounts.length > 0 && <span className="small muted">Cómo manejas tu plata: {state.profile.accounts.join(', ')}.</span>}
    </form>

    <section className="card stack">
      <div><h3 style={{ margin: 0 }}>Colores</h3><p className="small muted" style={{ margin: '4px 0 0' }}>Elige los colores que más te gusten. Se aplican a toda la app.</p></div>
      <PalettePicker />
    </section>

    <section className="card">
      <div className="row"><Shield size={20} /><h3 style={{ margin: 0 }}>Privacidad</h3></div>
      <p className="muted" style={{ margin: '8px 0 0' }}>NEXO no pide credenciales bancarias. Tus gastos y metas se guardan solo en este dispositivo. Al copiloto solo viajan cifras agregadas, nunca las descripciones de tus gastos.</p>
    </section>

    <section className="card stack">
      <h3 style={{ margin: 0 }}>Modo demostración</h3>
      <p className="small muted" style={{ margin: 0 }}>Carga 6 días de gastos de ejemplo. Si hoy registras uno, completas 7 días y desbloqueas NEXO Pro.</p>
      <Button variant="tertiary" full onClick={() => { actions.loadDemo(); toast('Datos de ejemplo cargados') }}>Cargar datos de ejemplo</Button>
      <Button variant="danger" full onClick={reset}>Reiniciar demo</Button>
    </section>
  </Screen>
}

export function Notifications() {
  const { state, actions } = useStore()
  const list = state.forum.notifications
  return <Screen title="Avisos" to="/">
    {list.length === 0 && <div className="empty">Aquí te aviso cuando alguien responda tus preguntas.</div>}
    {list.map(n => <button key={n.id} className="card tap row" style={{ cursor: 'pointer' }} onClick={() => { actions.markNotificationsRead(); navigate(n.to) }}>
      <span className="icon-tile lime">•</span><div style={{ flex: 1 }}><b>{n.text}</b><div className="small muted">{n.read ? 'Vista' : 'Nueva'}</div></div>
    </button>)}
    {list.some(n => !n.read) && <Button variant="ghost" full onClick={() => actions.markNotificationsRead()}>Marcar todo como visto</Button>}
  </Screen>
}
