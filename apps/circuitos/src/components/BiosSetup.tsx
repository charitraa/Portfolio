import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { identity, personal, resume, skillBanks, stats } from '../data/content'

/** Double-clicking the BIOS chip drops you into a retro setup utility. */
export function BiosSetup({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'F10' || e.key === 'Enter') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const totalRam = skillBanks.length

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center bg-[#000814] p-4"
        >
          <div className="relative w-full max-w-3xl overflow-hidden border-2 border-[#7f9fd0] bg-[#0a2472] font-mono text-[13px] text-[#d7e3ff] shadow-2xl">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
              <div className="h-full w-full bg-[repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]" />
            </div>

            <div className="bg-[#d7e3ff] px-3 py-1 text-center font-bold tracking-[0.2em] text-[#0a2472]">
              CIRCUITOS SETUP UTILITY — v{resume.version.replace('v', '')}
            </div>

            <div className="flex gap-2 border-b border-[#7f9fd0] bg-[#123a9e] px-3 py-1 text-[11px] tracking-widest">
              {['Main', 'Advanced', 'Boot', 'Exit'].map((t, i) => (
                <span key={t} className={i === 0 ? 'bg-[#d7e3ff] px-2 text-[#0a2472]' : 'px-2 text-[#a9c1ee]'}>
                  {t}
                </span>
              ))}
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-[1.4fr_1fr]">
              <div className="space-y-1">
                {[
                  ['System Name', identity.name],
                  ['Processor Type', identity.role],
                  ['Socket', identity.socket],
                  ['Core Count', identity.cores],
                  ['Core Speed', identity.clock],
                  ['Installed Memory', `${totalRam} banks (Frontend / Backend / Mobile / Cloud)`],
                  ['Storage Volume', 'EXPERIENCE 2023 → 2026'],
                  ['Graphics Adapter', 'PROJECTS RTX'],
                  ['Network Adapter', 'CONNECTED'],
                  ['System Language', personal.languages.join(' / ')],
                  ['System Time Zone', personal.timezone],
                  ['Projects Shipped', String(stats[0].value)],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="w-44 shrink-0 text-[#a9c1ee]">{k}</span>
                    <span className="text-[#ffe08a]">[{v}]</span>
                  </div>
                ))}
              </div>

              <div className="border border-[#7f9fd0] p-3 text-[11px] leading-relaxed">
                <div className="mb-2 border-b border-[#7f9fd0] pb-1 font-bold tracking-widest">
                  ITEM SPECIFIC HELP
                </div>
                <p className="text-[#a9c1ee]">
                  This board is a portfolio. Every component on it maps to a section — click the part,
                  read the section.
                </p>
                <p className="mt-2 text-[#a9c1ee]">Undocumented features:</p>
                <ul className="mt-1 space-y-0.5 text-[#ffe08a]">
                  <li>Up Up Dn Dn Lt Rt Lt Rt B A — RGB mode</li>
                  <li>CPU ×5 — developer mode</li>
                  <li>Hover every part — full power-up</li>
                  <li>Find the empty M.2 slot</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#7f9fd0] bg-[#123a9e] px-3 py-1.5 text-[11px] tracking-widest">
              <span className="text-[#a9c1ee]">[Up/Dn] Select Item &nbsp; [Lt/Rt] Select Menu</span>
              <button onClick={onClose} className="bg-[#d7e3ff] px-2 font-bold text-[#0a2472]">
                F10 = Save &amp; Exit
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
