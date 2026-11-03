import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

// toast('Texto') o toast('Texto', { label: 'Deshacer', onClick: () => ... })
export function ToastProvider({ children }) {
  const [t, setT] = useState(null)
  const timer = useRef()
  const toast = useCallback((text, action) => {
    setT({ text, action })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setT(null), action ? 7000 : 3000)
  }, [])
  return <ToastCtx.Provider value={toast}>
    {children}
    <div className="toast-zone" aria-live="polite">
      {t && <div className="toast">
        <span>{t.text}</span>
        {t.action && <button className="toast-act" onClick={() => { t.action.onClick(); setT(null) }}>{t.action.label}</button>}
      </div>}
    </div>
  </ToastCtx.Provider>
}
