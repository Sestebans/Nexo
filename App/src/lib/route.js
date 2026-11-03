import { useEffect, useState } from 'react'

const read = () => window.location.hash.replace(/^#/, '') || '/'

export function navigate(path, { replace = false } = {}) {
  if (replace) window.location.replace('#' + path)
  else window.location.hash = path
}

export function useRoute() {
  const [path, setPath] = useState(read)
  useEffect(() => {
    const on = () => setPath(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return path
}

export function splitPath(full) {
  const [p, q = ''] = full.split('?')
  return { path: p.replace(/\/+$/, '') || '/', query: new URLSearchParams(q) }
}
