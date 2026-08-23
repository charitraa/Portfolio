import { AnimatePresence, motion as m } from 'framer-motion'
import { X } from 'lucide-react'
import { useApp, type PanelId } from '../../store/AppState'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { panelMeta } from './panelMeta'
import { StatusPill } from '../ui/primitives'
import { DashboardPanel } from './DashboardPanel'
import { ContactPanel } from './ContactPanel'
import { DatabasePanel } from './DatabasePanel'
import { ExperiencePanel } from './ExperiencePanel'
import { DnsPanel, IspPanel, RouterPanel } from './InfoPanels'
import { ProjectsPanel } from './ProjectsPanel'
import { ResumePanel } from './ResumePanel'
import { ServicesPanel } from './ServicesPanel'
import { SettingsPanel } from './SettingsPanel'
import { SkillsPanel } from './SkillsPanel'

function PanelBody({ id }: { id: PanelId }) {
  switch (id) {
    case 'dashboard':
      return <DashboardPanel />
    case 'settings':
      return <SettingsPanel />
    case 'client':
    case 'isp':
      return <IspPanel />
    case 'router':
      return <RouterPanel />
    case 'dns':
      return <DnsPanel />
    case 'firewall':
      return <SkillsPanel />
    case 'balancer':
      return <ProjectsPanel />
    case 'gateway':
      return <ServicesPanel />
    case 'app':
      return <ExperiencePanel />
    case 'database':
      return <DatabasePanel />
    case 'storage':
      return <ResumePanel />
    case 'contact':
      return <ContactPanel />
    default:
      return null
  }
}

/**
 * Slides in from the right on desktop, rises as a bottom sheet on mobile.
 * Content is keyed by panel id so switching devices re-runs entry animations.
 */
export function DetailPanel() {
  const { selected, select } = useApp()
  const isMobile = useIsMobile()
  const meta = selected ? panelMeta[selected] : null

  const variants = isMobile
    ? { hidden: { y: '100%' }, shown: { y: 0 } }
    : { hidden: { x: 24, opacity: 0 }, shown: { x: 0, opacity: 1 } }

  return (
    <AnimatePresence>
      {selected && meta && (
        <m.aside
          key="panel"
          initial="hidden"
          animate="shown"
          exit="hidden"
          variants={variants}
          transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          drag={isMobile ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={(_event, info) => {
            if (isMobile && info.offset.y > 120) select(null)
          }}
          className={
            isMobile
              ? 'fixed inset-x-0 bottom-0 z-40 flex max-h-[80vh] flex-col rounded-t-2xl border-t border-x bg-bg-2/95 shadow-2xl backdrop-blur-md'
              : 'z-20 flex h-full w-[400px] shrink-0 flex-col border-l bg-bg-2/80 backdrop-blur-md lg:w-[440px]'
          }
          role="dialog"
          aria-label={`${meta.title} details`}
        >
          {isMobile && (
            <div className="flex justify-center pt-2 pb-1">
              <span className="h-1 w-10 rounded-full bg-line" />
            </div>
          )}

          <header className="flex items-start gap-3 border-b px-4 py-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
              <meta.icon size={17} strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[9.5px] tracking-[0.14em] text-muted uppercase">
                {meta.kind}
              </div>
              <h2 className="truncate font-display text-[15px] font-bold text-ink">{meta.title}</h2>
              <div className="truncate font-mono text-[10px] text-muted">{meta.hostname}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden sm:block">
                <StatusPill label={meta.status} tone="ok" pulse />
              </span>
              <button
                onClick={() => select(null)}
                aria-label="Close panel"
                className="grid h-7 w-7 place-items-center rounded-md border text-muted transition-colors hover:border-err/50 hover:text-err"
              >
                <X size={14} />
              </button>
            </div>
          </header>

          <div key={selected} className="anim-rise flex-1 overflow-y-auto px-4 py-4">
            <PanelBody id={selected} />
          </div>
        </m.aside>
      )}
    </AnimatePresence>
  )
}
