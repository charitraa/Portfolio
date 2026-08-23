import { vi } from 'vitest'

/** jsdom ships neither of these, and the shell touches both on mount. */
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    // Report a desktop viewport so the full multi-panel layout renders.
    matches: /min-width/.test(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

/**
 * Node 26 exposes its own `localStorage` global that is unusable without
 * --localstorage-file, and it shadows the jsdom one. Install a plain in-memory
 * implementation so the persisted store works.
 */
if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function') {
  const store = new Map<string, string>()
  const shim: Storage = {
    get length() {
      return store.size
    },
    key: (i) => [...store.keys()][i] ?? null,
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
    clear: () => store.clear(),
  }
  Object.defineProperty(globalThis, 'localStorage', { value: shim, configurable: true })
  Object.defineProperty(window, 'localStorage', { value: shim, configurable: true })
}

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('scrollTo', () => {})
