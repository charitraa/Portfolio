import { LayoutDashboard, Settings, type LucideIcon } from 'lucide-react'
import { devices } from '../../data/topology'
import type { PanelId } from '../../store/AppState'

export interface PanelMeta {
  title: string
  kind: string
  hostname: string
  icon: LucideIcon
  status: string
}

const deviceMeta = Object.fromEntries(
  devices.map((device) => [
    device.data.id,
    {
      title: device.data.section,
      kind: device.data.kind,
      hostname: device.data.hostname,
      icon: device.data.icon,
      status: 'connected',
    } satisfies PanelMeta,
  ]),
) as Record<string, PanelMeta>

export const panelMeta: Record<PanelId, PanelMeta> = {
  ...deviceMeta,
  dashboard: {
    title: 'Dashboard',
    kind: 'CONTROL PLANE',
    hostname: 'noc.charitra.dev',
    icon: LayoutDashboard,
    status: 'live',
  },
  settings: {
    title: 'Settings',
    kind: 'PREFERENCES',
    hostname: 'local.config',
    icon: Settings,
    status: 'ready',
  },
} as Record<PanelId, PanelMeta>
