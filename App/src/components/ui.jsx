import { TriangleAlert, CircleCheck } from 'lucide-react'
import { money, fitFactor } from '../lib/format.js'
import Button from './Button.jsx'

export function Alert({ kind = 'warn', children }) {
  const Icon = kind === 'ok' ? CircleCheck : TriangleAlert
  return <div className={`alert ${kind}`} role={kind === 'ok' ? 'status' : 'alert'}><Icon size={20} /><div>{children}</div></div>
}

export function Chip({ on, onClick, children, Icon }) {
  return <button type="button" className={`chip ${on ? 'on' : ''}`} aria-pressed={!!on} onClick={onClick}>{Icon && <Icon size={16} />}{children}</button>
}

export function Field({ label, id, error, help, children }) {
  return <div className="field">
    <label htmlFor={id}>{label}</label>
    {children}
    {error ? <span className="field-error" id={`${id}-err`}>{error}</span> : help ? <span className="small muted">{help}</span> : null}
  </div>
}

// Cifra grande que se ajusta sola al ancho. size: "" (44px), "xl" (52px) o "md" (32px).
export function Money({ value, size = '' }) {
  const text = money(value)
  return <span className={`money ${size}`} style={{ '--k': fitFactor(text) }}>{text}</span>
}

// Ayuda corta en el lugar donde surge la duda: un botón "?" que abre una nota.
export function HelpButton({ label, open, onClick }) {
  return <button type="button" className="help-btn" aria-label={label} aria-expanded={!!open} onClick={onClick}>?</button>
}
export function HelpNote({ dark, children }) {
  return <div className={`help-note ${dark ? 'on-dark' : ''}`} role="note">{children}</div>
}

// Frena un monto raro antes de guardarlo.
export function BigAmountConfirm({ amount, income, onFix, onKeep }) {
  return <div className="card stack" role="alertdialog" aria-label="Revisa este monto" style={{ background: 'var(--wa-50)', borderColor: 'transparent' }}>
    <div className="row" style={{ color: 'var(--wa)' }}><TriangleAlert size={20} /><b>Este monto es mayor que lo que recibes al mes</b></div>
    <p style={{ margin: 0 }}>Escribiste {money(amount)} y tus ingresos son {money(income)}. ¿Está bien?</p>
    <div className="row"><Button variant="tertiary" full onClick={onFix}>Corregir monto</Button><Button full onClick={onKeep}>Sí, guardar</Button></div>
  </div>
}
