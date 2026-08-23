import {
  Database,
  FileText,
  LayoutDashboard,
  Mail,
  Network,
  Route,
  Server,
  Settings,
  Shield,
  Split,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useApp, type PanelId } from '../../store/AppState'
import { Meter } from '../ui/primitives'
import { cn } from '../../utils/cn'

interface NavItem {
  id: PanelId | 'topology'
  label: string
  icon: LucideIcon
  hint: string
}

const primary: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: 'overview' },
  { id: 'topology', label: 'Topology', icon: Network, hint: 'map' },
]

const network: NavItem[] = [
  { id: 'isp', label: 'Home', icon: Route, hint: 'isp' },
  { id: 'router', label: 'About', icon: Route, hint: 'router' },
  { id: 'firewall', label: 'Skills', icon: Shield, hint: 'firewall' },
  { id: 'balancer', label: 'Projects', icon: Split, hint: 'lb' },
  { id: 'gateway', label: 'Services', icon: Wrench, hint: 'api-gw' },
  { id: 'app', label: 'Experience', icon: Server, hint: 'app' },
  { id: 'database', label: 'Education', icon: Database, hint: 'db' },
  { id: 'storage', label: 'Résumé', icon: FileText, hint: 'cdn' },
  { id: 'contact', label: 'Contact', icon: Mail, hint: 'smtp' },
]

const footerNav: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, hint: 'prefs' },
]

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { selected, select, focusNode, telemetry } = useApp()

  function go(item: NavItem) {
    if (item.id === 'topology') {
      select(null)
    } else if (item.id === 'dashboard' || item.id === 'settings') {
      select(item.id)
    } else {
      focusNode(item.id)
    }
    onNavigate()
  }

  return (
    <nav
      className={cn(
        'z-30 flex w-[212px] shrink-0 flex-col border-r bg-bg-2/70 backdrop-blur-md transition-transform duration-200',
        'max-md:fixed max-md:inset-y-14 max-md:left-0',
        open ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
        'md:translate-x-0',
      )}
      aria-label="Primary"
    >
      <div className="flex-1 overflow-y-auto px-2.5 py-3">
        <Group items={primary} selected={selected} onSelect={go} />

        <div className="mt-4 mb-1.5 px-2 font-mono text-[9.5px] tracking-[0.16em] text-muted/70 uppercase">
          Network path
        </div>
        <Group items={network} selected={selected} onSelect={go} numbered />

        <div className="mt-4">
          <Group items={footerNav} selected={selected} onSelect={go} />
        </div>
      </div>

      <div className="shrink-0 border-t px-3 py-3">
        <div className="mb-2 font-mono text-[9.5px] tracking-[0.16em] text-muted/70 uppercase">
          Live
        </div>
        <div className="space-y-2">
          <MiniMeter label="cpu" value={telemetry.cpu} tone="accent" />
          <MiniMeter label="mem" value={telemetry.memory} tone="purple" />
          <MiniMeter label="load" value={telemetry.load} tone="cyan" />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted">
          <span>uptime</span>
          <span className="text-ok">99.99%</span>
        </div>
      </div>
    </nav>
  )
}

function Group({
  items,
  selected,
  onSelect,
  numbered,
}: {
  items: NavItem[]
  selected: PanelId | null
  onSelect: (item: NavItem) => void
  numbered?: boolean
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item, i) => {
        const active = selected === item.id || (item.id === 'topology' && selected === null)
        return (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                active
                  ? 'bg-accent/12 text-accent'
                  : 'text-muted hover:bg-panel/70 hover:text-ink',
              )}
            >
              <item.icon size={15} strokeWidth={1.8} className="shrink-0" />
              <span className="flex-1 truncate font-display text-[12.5px] font-medium">
                {item.label}
              </span>
              <span className="font-mono text-[9px] text-muted/60 group-hover:text-muted">
                {numbered ? String(i + 1).padStart(2, '0') : item.hint}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function MiniMeter({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'accent' | 'purple' | 'cyan'
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[9.5px] text-muted">
        <span className="uppercase">{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <Meter value={value} tone={tone} height={4} label={label} />
    </div>
  )
}
