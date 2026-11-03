import { ArrowLeft } from 'lucide-react'
import { navigate } from '../lib/route.js'

// Pantalla secundaria: barra superior con botón atrás y título.
export default function Screen({ title, to = '/', right, children }) {
  return <div className="screen">
    <div className="screen-top">
      <button className="back-btn" onClick={() => navigate(to)} aria-label="Volver"><ArrowLeft size={20} /></button>
      <h1 className="screen-title">{title}</h1>
      <span className="spacer" />{right}
    </div>
    <div className="stack">{children}</div>
  </div>
}
