export default function Button({ variant = 'primary', size = '', full = false, children, ...props }) {
  const classes = ['btn', variant, size === 'small' ? 'small-btn' : '', full ? 'full' : ''].filter(Boolean).join(' ')
  return <button className={classes} {...props}>{children}</button>
}
