// Marca de NEXO: dos puntos conectados (enlace) sobre el azul del copiloto.
export default function NexoOrb({ size = 'normal', decorative = false }) {
  const cls = ['mark', size === 'large' ? 'large' : '', size === 'small' ? 'small' : ''].filter(Boolean).join(' ')
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': 'NEXO' }
  return <span className={cls} {...a11y}>
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M15 32L33 16" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="15" cy="32" r="5.5" fill="#fff" />
      <circle cx="33" cy="16" r="5.5" style={{ fill: 'var(--lime)' }} />
    </svg>
  </span>
}
