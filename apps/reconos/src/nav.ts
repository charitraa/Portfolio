import {
  Award,
  BadgeCheck,
  Crosshair,
  FileText,
  FolderGit2,
  LayoutDashboard,
  Layers,
  Mail,
  Settings2,
  Sparkles,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  path: string
  title: string
  icon: LucideIcon
  group: 'main' | 'profile' | 'system'
  /** Shown in the command palette and sidebar tooltips. */
  hint?: string
  shortcut?: string
}

export const NAV: NavItem[] = [
  { path: '/dashboard', title: 'Dashboard', icon: LayoutDashboard, group: 'main', hint: 'Overview and live activity', shortcut: 'Ctrl D' },
  { path: '/target', title: 'Target', icon: Crosshair, group: 'main', hint: 'Scan this portfolio' },
  { path: '/projects', title: 'Projects', icon: FolderGit2, group: 'main', hint: 'Case studies and repositories', shortcut: 'Ctrl P' },
  { path: '/skills', title: 'Skills', icon: Sparkles, group: 'main', hint: 'Proficiency breakdown' },
  { path: '/services', title: 'Services', icon: Wrench, group: 'main', hint: 'What I can build for you' },
  { path: '/stack', title: 'Tech Stack', icon: Layers, group: 'main', hint: 'Tools by category', shortcut: 'Ctrl T' },

  { path: '/experience', title: 'Experience', icon: TrendingUp, group: 'profile', hint: 'Career timeline' },
  { path: '/achievements', title: 'Achievements', icon: Award, group: 'profile', hint: 'Awards and highlights' },
  { path: '/certifications', title: 'Certifications', icon: BadgeCheck, group: 'profile', hint: 'Credentials' },
  { path: '/resume', title: 'Resume', icon: FileText, group: 'profile', hint: 'Download the PDF', shortcut: 'Ctrl R' },

  { path: '/contact', title: 'Contact', icon: Mail, group: 'system', hint: 'Send a message' },
  { path: '/settings', title: 'Settings', icon: Settings2, group: 'system', hint: 'Theme and preferences' },
]

export const navByPath = (path: string) => NAV.find((n) => n.path === path)

export const GROUPS: { id: NavItem['group']; label: string }[] = [
  { id: 'main', label: 'Workspace' },
  { id: 'profile', label: 'Profile' },
  { id: 'system', label: 'System' },
]
