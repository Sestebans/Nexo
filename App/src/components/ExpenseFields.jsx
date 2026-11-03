import { Alert, Chip } from './ui.jsx'
import { CATEGORIES } from '../lib/categories.js'
import { thousands, onNum, fitFactor, dayLabel } from '../lib/format.js'

// Los mismos campos para registrar y para editar un gasto, así se ven y funcionan igual.
export default function ExpenseFields({ amount, setAmount, category, setCategory, note, setNote, when, setWhen, otherDay, errors }) {
  return <>
    {(errors.amount || errors.category) && <Alert>{errors.amount || errors.category}</Alert>}
    <div>
      <label className="small muted" htmlFor="amount">Monto</label>
      <div className={`amount-wrap ${errors.amount ? 'err' : ''}`}><span>$</span>
        <input id="amount" className="amount-input" style={{ '--k': fitFactor('$ ' + thousands(amount)) }} inputMode="numeric" placeholder="0" value={thousands(amount)} aria-invalid={!!errors.amount} onChange={onNum(setAmount)} />
      </div>
    </div>
    <div className="field">
      <label>Categoría</label>
      <div className="chips">{CATEGORIES.map(c => <Chip key={c.id} Icon={c.Icon} on={category === c.id} onClick={() => setCategory(c.id)}>{c.id}</Chip>)}</div>
    </div>
    <div className="field">
      <label>¿Cuándo fue?</label>
      <div className="chips">
        <Chip on={when === 'hoy'} onClick={() => setWhen('hoy')}>Hoy</Chip>
        <Chip on={when === 'ayer'} onClick={() => setWhen('ayer')}>Ayer</Chip>
        {otherDay && <Chip on={when === 'otra'} onClick={() => setWhen('otra')}>{dayLabel(otherDay)}</Chip>}
      </div>
    </div>
    <div className="field">
      <label htmlFor="note">Nota (opcional)</label>
      <input id="note" className="input" placeholder="Ej. almuerzo con amigos" value={note} onChange={e => setNote(e.target.value)} />
    </div>
  </>
}
