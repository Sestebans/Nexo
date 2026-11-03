import { useState } from 'react'
import { Check } from 'lucide-react'
import { PALETTES, applyPalette, savedPalette } from '../lib/palette.js'

// Cada persona elige sus colores favoritos. Se guarda en su dispositivo.
export default function PalettePicker() {
  const [current, setCurrent] = useState(savedPalette)
  return <div className="stack" style={{ gap: 10 }} role="group" aria-label="Colores de NEXO">
    {PALETTES.map(p => <button key={p.id} className="pal-opt" aria-pressed={current === p.id} onClick={() => setCurrent(applyPalette(p.id))}>
      <span className="pal-sw">{p.swatch.map(c => <i key={c} style={{ background: c }} />)}</span>
      <span style={{ flex: 1 }}><b>{p.name}</b><span className="small muted" style={{ display: 'block' }}>{p.note}</span></span>
      {current === p.id && <Check size={18} />}
    </button>)}
  </div>
}
