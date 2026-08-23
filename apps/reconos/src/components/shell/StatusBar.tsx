import { Check, GitBranch, Lock, Wifi } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { navByPath } from '@/nav'
import { hhmm, useClock } from '@/hooks'
import { useApp } from '@/store/app'

export function StatusBar() {
  const { pathname } = useLocation()
  const now = useClock()
  const logs = useApp((s) => s.logs)
  const view = navByPath(pathname)?.title ?? 'Detail'
  const last = logs[logs.length - 1]

  return (
    <footer className="flex h-[22px] shrink-0 items-center gap-3 bg-blue px-2 font-mono text-[10.5px] text-white/95">
      <span className="flex items-center gap-1">
        <GitBranch size={11} /> main
      </span>
      <span className="flex items-center gap-1">
        <Check size={11} /> 0 findings
      </span>
      <span className="hidden items-center gap-1 sm:flex">
        <Lock size={11} /> TLS 1.3
      </span>
      <span className="hidden truncate opacity-90 md:block">
        {last ? last.text : 'Ready.'}
      </span>
      <span className="ml-auto hidden sm:inline">{view}</span>
      <span className="flex items-center gap-1">
        <Wifi size={11} /> 12ms
      </span>
      <span>{hhmm(now)}</span>
    </footer>
  )
}
