import { useEffect } from 'react'
import { StoreProvider, useStore } from './lib/store.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { useRoute, navigate, splitPath } from './lib/route.js'
import TopBar from './components/TopBar.jsx'
import BottomNav from './components/BottomNav.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Home from './pages/Home.jsx'
import { Expenses, NewExpense, EditExpense } from './pages/Expenses.jsx'
import { Alert } from './components/ui.jsx'
import { Goals, NewGoal, GoalDetail } from './pages/Goals.jsx'
import Copilot from './pages/Copilot.jsx'
import { Forum, NewPost, PostDetail } from './pages/Forum.jsx'
import Streak from './pages/Streak.jsx'
import { Profile, Notifications } from './pages/Profile.jsx'

const TABS = ['/', '/gastos', '/copiloto', '/metas', '/foro']

function resolve(full) {
  const { path, query } = splitPath(full)
  if (TABS.includes(path)) {
    const view = { '/': <Home />, '/gastos': <Expenses />, '/copiloto': <Copilot />, '/metas': <Goals />, '/foro': <Forum /> }[path]
    return { view, tab: true, path }
  }
  let m
  if (path === '/gastos/nuevo') return { view: <NewExpense /> }
  if ((m = path.match(/^\/gastos\/([^/]+)$/))) return { view: <EditExpense key={m[1]} id={m[1]} /> }
  if (path === '/metas/nueva') return { view: <NewGoal /> }
  if ((m = path.match(/^\/metas\/([^/]+)$/))) return { view: <GoalDetail key={m[1]} id={m[1]} edit={query.get('editar') === '1'} /> }
  if (path === '/foro/nueva') return { view: <NewPost /> }
  if ((m = path.match(/^\/foro\/([^/]+)$/))) return { view: <PostDetail key={m[1]} id={m[1]} /> }
  if (path === '/racha') return { view: <Streak /> }
  if (path === '/perfil') return { view: <Profile /> }
  if (path === '/avisos') return { view: <Notifications /> }
  return { view: <Home />, tab: true, path: '/' }
}

function Shell() {
  const route = useRoute()
  const { state, persistError } = useStore()
  const banner = persistError && <div className="persist-banner"><Alert>No pude guardar tus datos en este navegador. Si cierras o recargas la página, los perderías. Prueba fuera del modo privado.</Alert></div>
  const onboarded = state.profile.onboarded

  useEffect(() => {
    if (!onboarded && !route.startsWith('/bienvenida')) navigate('/bienvenida', { replace: true })
    if (onboarded && route.startsWith('/bienvenida')) navigate('/', { replace: true })
  }, [onboarded, route])

  useEffect(() => { window.scrollTo?.(0, 0) }, [route])

  if (!onboarded) return <div className="app-shell">{banner}<Onboarding /></div>
  const r = resolve(route)
  return <div className="app-shell">
    <main className={`main ${r.tab && !r.noNav ? '' : 'plain'}`}>
      {banner}
      {r.tab && <TopBar path={r.path} />}
      {r.view}
    </main>
    {r.tab && !r.noNav && <BottomNav path={r.path} />}
    
  </div>
}

export default function App() {
  return <StoreProvider><ToastProvider><Shell /></ToastProvider></StoreProvider>
}
