import { create } from 'zustand'
import { stations3d } from '@/world/stations3d'
import { notify } from '@/store/notifications'

/**
 * Which stations the visitor has found, persisted so a second visit is not a
 * second tutorial. Deliberately the whole of the "game" layer: no score, no
 * currency, no levels — just whether a place has been stood in, which is what
 * fast travel needs to know anyway.
 */

const KEY = 'charitraos.discovery.v1'

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Drop ids that no longer exist rather than trusting old storage.
    return Array.isArray(parsed) ? parsed.filter((id) => stations3d.some((s) => s.id === id)) : []
  } catch {
    return []
  }
}

interface DiscoveryState {
  found: string[]
  discover: (id: string) => void
  reset: () => void
}

export const useDiscovery = create<DiscoveryState>((set, get) => ({
  found: load(),

  discover: (id) => {
    if (get().found.includes(id)) return
    const station = stations3d.find((s) => s.id === id)
    if (!station) return

    const found = [...get().found, id]
    set({ found })
    try {
      localStorage.setItem(KEY, JSON.stringify(found))
    } catch {
      // Private browsing or a full quota — discovery just does not persist.
    }

    notify({
      title: `Found: ${station.name}`,
      body: `${station.blurb}  ·  ${found.length} of ${stations3d.length} stations`,
      glyph: station.glyph,
      timeout: 5200,
    })
  },

  reset: () => {
    set({ found: [] })
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* nothing to clear */
    }
  },
}))

export const TOTAL_STATIONS = stations3d.length
