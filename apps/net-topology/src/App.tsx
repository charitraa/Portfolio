import { useCallback, useRef, useState } from 'react'
import { ActivityLog } from './components/layout/ActivityLog'
import { BootSequence } from './components/layout/BootSequence'
import { CommandPalette } from './components/layout/CommandPalette'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import { DetailPanel } from './components/panels/DetailPanel'
import { MobileTopology } from './components/topology/MobileTopology'
import { TopologyMap } from './components/topology/TopologyMap'
import { useIsMobile } from './hooks/useMediaQuery'
import { AppStateProvider, useApp } from './store/AppState'

function Shell() {
  const [booted, setBooted] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const isMobile = useIsMobile()
  const { pushLog, select, selected } = useApp()
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  const onBooted = useCallback(() => {
    setBooted(true)
    pushLog('portfolio ready — 200 OK', 'ok')
    // Land on the ISP node so the first screen has something to read —
    // unless the visitor arrived on a deep link.
    if (!selectedRef.current) select('isp')
  }, [pushLog, select])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg">
      <BootSequence onDone={onBooted} />

      <Navbar onToggleSidebar={() => setNavOpen((open) => !open)} />

      <div className="relative flex min-h-0 flex-1">
        <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />

        {/* Scrim behind the mobile drawer. */}
        {navOpen && (
          <div
            className="fixed inset-0 top-14 z-20 bg-black/50 md:hidden"
            onClick={() => setNavOpen(false)}
          />
        )}

        <main className="relative min-w-0 flex-1" aria-label="Network topology">
          {isMobile ? <MobileTopology /> : <TopologyMap />}

          {!isMobile && booted && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg border bg-bg-2/80 px-3 py-2 font-mono text-[10px] text-muted backdrop-blur-sm">
              <div>click a device to inspect · drag to pan · double-click to reset</div>
            </div>
          )}
        </main>

        {!isMobile && <DetailPanel />}
      </div>

      {isMobile && <DetailPanel />}

      <ActivityLog />
      <CommandPalette />
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  )
}
