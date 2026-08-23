import { create } from 'zustand'

export interface Notification {
  id: string
  title: string
  body?: string
  glyph?: string
  /** Auto-dismiss delay in ms. 0 keeps it until dismissed. */
  timeout: number
  /** Kept in the notification centre after the toast disappears. */
  at: number
  action?: { label: string; run: () => void }
}

interface NotifyState {
  items: Notification[]
  /** Everything ever raised this session, for the panel's notification centre. */
  history: Notification[]
  seq: number
  doNotDisturb: boolean

  notify: (n: Omit<Notification, 'id' | 'at' | 'timeout'> & { timeout?: number }) => string
  dismiss: (id: string) => void
  clearHistory: () => void
  toggleDnd: () => void
}

export const useNotifications = create<NotifyState>((set, get) => ({
  items: [],
  history: [],
  seq: 0,
  doNotDisturb: false,

  notify: ({ timeout = 5000, ...rest }) => {
    const seq = get().seq + 1
    const id = `notif-${seq}`
    const item: Notification = { id, at: Date.now(), timeout, ...rest }
    set((s) => ({
      seq,
      history: [item, ...s.history].slice(0, 50),
      items: s.doNotDisturb ? s.items : [...s.items, item],
    }))
    if (timeout > 0 && !get().doNotDisturb) {
      setTimeout(() => get().dismiss(id), timeout)
    }
    return id
  },

  dismiss: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
  clearHistory: () => set({ history: [] }),
  toggleDnd: () => set((s) => ({ doNotDisturb: !s.doNotDisturb })),
}))

/** Call sites outside React (terminal commands, boot script) use this. */
export const notify = (n: Parameters<NotifyState['notify']>[0]) => useNotifications.getState().notify(n)
