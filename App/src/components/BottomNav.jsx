import { Home, Wallet, Target, Users } from 'lucide-react'
import NexoOrb from './NexoOrb.jsx'
import { navigate } from '../lib/route.js'

const items = [
  { id: '/', label: 'Inicio', Icon: Home },
  { id: '/gastos', label: 'Gastos', Icon: Wallet },
  { id: '/copiloto', label: 'Copiloto', Icon: null },
  { id: '/metas', label: 'Metas', Icon: Target },
  { id: '/foro', label: 'Comunidad', Icon: Users },
]

export default function BottomNav({ path }) {
  const isActive = id => (id === '/' ? path === '/' : path.startsWith(id))
  return <nav className="mobile-nav" aria-label="Navegación principal">
    {items.map(({ id, label, Icon }) => {
      const on = isActive(id)
      return <button key={id} className={on ? 'active' : ''} onClick={() => navigate(id)} aria-current={on ? 'page' : undefined}>
        {Icon ? <span className="nav-ico"><Icon size={20} strokeWidth={on ? 2.2 : 1.8} /></span> : <span className="nav-mark"><NexoOrb decorative /></span>}
        <span>{label}</span>
      </button>
    })}
  </nav>
}
