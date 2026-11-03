import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Button from '../components/Button.jsx'
import NexoOrb from '../components/NexoOrb.jsx'
import { Alert, Chip, Field } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { navigate } from '../lib/route.js'
import { thousands, toNumber, onNum } from '../lib/format.js'

const SLIDES = [
  { title: 'Tu plata, sin rodeos', text: 'Mira cuánto te queda este mes y cuánto puedes gastar al día, sin hojas de cálculo.', art: 1 },
  { title: 'Registra en segundos', text: 'Escribe o dilo en voz alta: "gasté 15 mil en almuerzo". NEXO lo entiende y tú solo confirmas.', art: 2 },
  { title: 'Un copiloto, no un banco', text: 'Te acompaño con tus metas y tus dudas. Nunca te pido claves ni que conectes tus cuentas.', art: 3 },
]

function Art({ n }) {
  const ink = { fill: 'var(--ink)' }, lime = { fill: 'var(--lime)' }, ai = { fill: 'var(--ai)' }, soft = { fill: 'var(--ink)', opacity: 0.12 }
  return <svg viewBox="0 0 320 200" aria-hidden="true" role="img">
    {n === 1 && <><rect x="40" y="110" width="240" height="14" rx="7" style={soft} /><rect x="40" y="110" width="150" height="14" rx="7" style={ink} /><circle cx="228" cy="68" r="38" style={lime} /><circle cx="228" cy="68" r="16" style={ink} /><rect x="40" y="146" width="90" height="14" rx="7" style={ai} /></>}
    {n === 2 && <><rect x="52" y="44" width="150" height="46" rx="23" style={ink} /><rect x="118" y="108" width="150" height="46" rx="23" style={lime} /><circle cx="76" cy="67" r="9" style={lime} /><circle cx="244" cy="131" r="9" style={ink} /></>}
    {n === 3 && <><path d="M96 138L224 62" style={{ stroke: 'var(--ink)' }} strokeWidth="12" strokeLinecap="round" fill="none" /><circle cx="96" cy="138" r="30" style={ai} /><circle cx="224" cy="62" r="30" style={lime} /><circle cx="96" cy="138" r="10" fill="#fff" /></>}
  </svg>
}

const ACCOUNTS = ['Débito', 'Crédito', 'Efectivo', 'Billetera digital']
const GOAL_IDEAS = ['Moto', 'Viaje', 'Celular', 'Fondo de emergencia', 'Universidad']

export default function Onboarding() {
  const { actions } = useStore()
  const [step, setStep] = useState(0) // 0 a 2 carrusel, 3 formulario
  const [income, setIncome] = useState('')
  const [accounts, setAccounts] = useState([])
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [errors, setErrors] = useState({})

  function submit(e) {
    e.preventDefault()
    const errs = {}
    if (toNumber(income) <= 0) errs.income = 'Escribe cuánto recibes al mes.'
    if (goalName.trim().length < 2) errs.goalName = 'Cuéntame qué quieres lograr.'
    if (toNumber(goalTarget) <= 0) errs.goalTarget = 'Escribe cuánto necesitas.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    actions.completeOnboarding({ income: toNumber(income), accounts, goal: { name: goalName.trim(), target: toNumber(goalTarget) } })
    navigate('/', { replace: true })
  }
  const toggleAccount = a => setAccounts(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  if (step < 3) {
    const s = SLIDES[step]
    return <div className="onb">
      <div className="onb-top">
        <NexoOrb size="small" /><span className="brand-word">NEXO</span><span className="spacer" />
        <Button variant="ghost" size="small" onClick={() => setStep(3)}>Saltar</Button>
      </div>
      <div className="onb-body">
        <div className="illus"><Art n={s.art} /></div>
        {step === 0 && <div className="eyebrow">Tu copiloto financiero</div>}
        <h1 className="welcome-title" style={{ marginBottom: 0 }}>{s.title}</h1>
        <p className="muted" style={{ fontSize: 18, lineHeight: 1.5 }}>{s.text}</p>
        <span className="spacer" />
        <div className="dots" aria-label={`Pantalla ${step + 1} de 3`}>{SLIDES.map((_, i) => <i key={i} className={i === step ? 'on' : ''} />)}</div>
        <Button full onClick={() => setStep(step + 1)}>{step === 2 ? 'Empezar' : 'Siguiente'} <ArrowRight size={18} /></Button>
      </div>
    </div>
  }

  const hasErrors = Object.keys(errors).length > 0
  return <form className="onb" onSubmit={submit} noValidate>
    <div className="onb-top">
      <button type="button" className="back-btn" onClick={() => setStep(2)} aria-label="Volver"><ArrowLeft size={20} /></button>
      <h1 className="screen-title">Tu situación inicial</h1>
    </div>
    <div className="onb-body">
      {hasErrors
        ? <Alert>Completa los campos pendientes para continuar.</Alert>
        : <p className="muted" style={{ margin: 0 }}>Solo lo mínimo para empezar. No pedimos claves ni datos de tus cuentas.</p>}

      <Field label="Ingresos mensuales" id="income" error={errors.income} help="Lo que recibes en un mes, aproximado.">
        <input id="income" className="input" inputMode="numeric" placeholder="$ 1.500.000" value={income ? '$ ' + thousands(income) : ''} aria-invalid={!!errors.income} aria-describedby={errors.income ? 'income-err' : undefined} onChange={onNum(setIncome)} />
      </Field>

      <div className="field">
        <label>Cómo manejas tu plata (opcional)</label>
        <div className="chips">{ACCOUNTS.map(a => <Chip key={a} on={accounts.includes(a)} onClick={() => toggleAccount(a)}>{a}</Chip>)}</div>
        <span className="small muted">Solo para ubicarme. No pedimos números de tarjeta ni claves.</span>
      </div>

      <Field label="Tu primera meta" id="goalName" error={errors.goalName}>
        <input id="goalName" className="input" placeholder="Ej. Ahorrar para una moto" value={goalName} aria-invalid={!!errors.goalName} aria-describedby={errors.goalName ? 'goalName-err' : undefined} onChange={e => setGoalName(e.target.value)} />
      </Field>
      <div className="chips scroll" aria-label="Ideas de meta">{GOAL_IDEAS.map(g => <Chip key={g} on={goalName === g} onClick={() => setGoalName(g)}>{g}</Chip>)}</div>
      <Field label="¿Cuánto necesitas para lograrla?" id="goalTarget" error={errors.goalTarget}>
        <input id="goalTarget" className="input" inputMode="numeric" placeholder="$ 3.000.000" value={goalTarget ? '$ ' + thousands(goalTarget) : ''} aria-invalid={!!errors.goalTarget} aria-describedby={errors.goalTarget ? 'goalTarget-err' : undefined} onChange={onNum(setGoalTarget)} />
      </Field>

      <span className="spacer" />
      <Button type="submit" full>Continuar <ArrowRight size={18} /></Button>
    </div>
  </form>
}
