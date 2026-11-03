import { Bell, Flame, UserRound } from 'lucide-react'
import NexoOrb from './NexoOrb.jsx'
import { navigate } from '../lib/route.js'
import { useStore } from '../lib/store.jsx'
import { isProActive } from '../lib/rewards.js'

export default function TopBar({ path }) {
  const { state, snapshot } = useStore()
  const unread = state.forum.notifications.filter(n => !n.read).length
  const pro = isProActive(state.rewards)
  return <header className="mobile-top">
    <NexoOrb size="small" /><span className="brand-word">NEXO</span>
    {pro && <span className="pro-badge">PRO</span>}
    <span className="spacer" />
    <button className="icon-btn" onClick={() => navigate('/avisos')} aria-label={unread ? `Avisos, ${unread} nuevos` : 'Avisos'}>
      <Bell size={18} />{unread > 0 && <span className="dot-badge">{unread}</span>}
    </button>
    {path !== '/' && <button className="streak-chip" onClick={() => navigate('/racha')} aria-label={`Racha de ${snapshot.streak} días`}><Flame size={15} />{snapshot.streak}</button>}
    <button className={`icon-btn ${path === '/perfil' ? 'active' : ''}`} onClick={() => navigate('/perfil')} aria-label="Perfil"><UserRound size={18} /></button>
  </header>
}
