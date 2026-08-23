import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { CommandPalette } from '@/components/CommandPalette'
import { Toasts } from '@/components/Toasts'
import { ViewSkeleton } from '@/components/ViewSkeleton'
import { ConsolePanel } from '@/components/shell/ConsolePanel'
import { MobileNav } from '@/components/shell/MobileNav'
import { Sidebar } from '@/components/shell/Sidebar'
import { StatusBar } from '@/components/shell/StatusBar'
import { TabBar } from '@/components/shell/TabBar'
import { Toolbar } from '@/components/shell/Toolbar'
import { projectById } from '@/data/projects'
import { useMediaQuery } from '@/hooks'
import { navByPath } from '@/nav'
import { useApp } from '@/store/app'
import { NotFound } from '@/views/NotFound'

/* Views load on demand so the shell paints before the chart bundle arrives. */
const named = <K extends string>(key: K) =>
  function load<T extends Record<K, React.ComponentType>>(mod: T) {
    return { default: mod[key] }
  }

const Achievements = lazy(() => import('@/views/Achievements').then(named('Achievements')))
const Certifications = lazy(() => import('@/views/Certifications').then(named('Certifications')))
const Contact = lazy(() => import('@/views/Contact').then(named('Contact')))
const Dashboard = lazy(() => import('@/views/Dashboard').then(named('Dashboard')))
const Experience = lazy(() => import('@/views/Experience').then(named('Experience')))
const ProjectDetail = lazy(() => import('@/views/ProjectDetail').then(named('ProjectDetail')))
const Projects = lazy(() => import('@/views/Projects').then(named('Projects')))
const Resume = lazy(() => import('@/views/Resume').then(named('Resume')))
const Services = lazy(() => import('@/views/Services').then(named('Services')))
const Settings = lazy(() => import('@/views/Settings').then(named('Settings')))
const Skills = lazy(() => import('@/views/Skills').then(named('Skills')))
const TechStack = lazy(() => import('@/views/TechStack').then(named('TechStack')))
const Target = lazy(() => import('@/views/Target').then(named('Target')))

/** Mirrors theme, accent and density from the store onto <html>. */
function useThemeSync() {
  const theme = useApp((s) => s.settings.theme)
  const accent = useApp((s) => s.settings.accent)
  const density = useApp((s) => s.settings.density)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    document.documentElement.dataset.density = density
  }, [density])
  useEffect(() => {
    const map = {
      blue: '#007acc',
      orange: '#f57c00',
      green: '#4caf50',
      purple: '#7e57c2',
    }
    document.documentElement.style.setProperty('--color-blue', map[accent])
  }, [accent])
}

/** Opens a tab for whatever route is active, and titles it correctly. */
function useTabSync() {
  const { pathname } = useLocation()
  const openTab = useApp((s) => s.openTab)
  useEffect(() => {
    const nav = navByPath(pathname)
    if (nav) {
      openTab({ path: pathname, title: nav.title })
      document.title = `${nav.title} — ReconOS`
      return
    }
    const match = pathname.match(/^\/projects\/(.+)$/)
    const project = match ? projectById(match[1]) : undefined
    if (project) {
      openTab({ path: pathname, title: project.name })
      document.title = `${project.name} — ReconOS`
    }
  }, [pathname, openTab])
}

function useGlobalHotkeys() {
  const navigate = useNavigate()
  const setPalette = useApp((s) => s.setPalette)
  const set = useApp((s) => s.set)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if (e.key === 'Escape') {
        setPalette(false)
        return
      }
      if (!(e.ctrlKey || e.metaKey)) return

      if (e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette(true)
        return
      }
      // While the user is typing, leave every other browser shortcut alone.
      if (typing) return

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault()
        set('consoleOpen', !useApp.getState().settings.consoleOpen)
        return
      }

      const routes: Record<string, string> = {
        p: '/projects',
        d: '/dashboard',
        t: '/stack',
        r: '/resume',
      }
      const path = routes[e.key.toLowerCase()]
      if (path) {
        e.preventDefault()
        navigate(path)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, setPalette, set])
}

/** One-time boot log so the console is never empty on first paint. */
function useBootSequence() {
  useEffect(() => {
    const { log, notify } = useApp.getState()
    const lines: [string, Parameters<typeof log>[1], number][] = [
      ['ReconOS v2.4.0 — initialising workspace', 'info', 120],
      ['Mounting data sources… ok', 'ok', 420],
      ['Loaded project index (6 records)', 'ok', 780],
      ['TLS handshake complete — cipher TLS_AES_256_GCM_SHA384', 'info', 1100],
      ['Session established. Type `help` for commands.', 'ok', 1450],
    ]
    const timers = lines.map(([text, kind, delay]) =>
      setTimeout(() => log(text, kind), delay),
    )
    const hello = setTimeout(
      () => notify('Welcome to ReconOS', 'Press Ctrl+K to open the command palette.', 'info'),
      1900,
    )
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(hello)
    }
  }, [])
}

export default function App() {
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useThemeSync()
  useTabSync()
  useGlobalHotkeys()
  useBootSequence()

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg">
      <Toolbar onToggleSidebar={() => setMobileNavOpen((v) => !v)} />

      <div className="flex min-h-0 flex-1">
        {isDesktop && <Sidebar />}

        <main className="flex min-w-0 flex-1 flex-col">
          <TabBar />
          <div className="scroll-y min-h-0 flex-1 bg-bg pb-14 md:pb-0">
            <AnimatePresence mode="wait">
              <Suspense key={location.pathname} fallback={<ViewSkeleton />}>
                <Routes location={location}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/target" element={<Target />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/skills" element={<Skills />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/stack" element={<TechStack />} />
                  <Route path="/experience" element={<Experience />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/certifications" element={<Certifications />} />
                  <Route path="/resume" element={<Resume />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </div>
          <ConsolePanel />
        </main>
      </div>

      <StatusBar />

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <CommandPalette />
      <Toasts />
    </div>
  )
}
