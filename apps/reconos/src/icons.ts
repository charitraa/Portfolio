import {
  Box,
  BrainCircuit,
  Cloud,
  CloudUpload,
  Database,
  Gauge,
  GitBranch,
  Globe,
  Layout,
  PenTool,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

/**
 * Data files reference icons by name. Resolving through an explicit map keeps
 * the bundle to the icons actually used — `import * as Icons` would pull the
 * whole library in.
 */
export const ICONS: Record<string, LucideIcon> = {
  BrainCircuit,
  Cloud,
  CloudUpload,
  Database,
  Gauge,
  GitBranch,
  Globe,
  Layout,
  PenTool,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
}

export const iconByName = (name: string): LucideIcon => ICONS[name] ?? Box
