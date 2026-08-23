import { create } from "zustand";
import { SHEET_COUNT, sheetForPage } from "./content/story";

const SAVE_KEY = "mangga:progress";

type Saved = { sheet: number; bookmark: number; read: number[] };

function load(): Saved {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { sheet: 0, bookmark: 0, read: [] };
    const p = JSON.parse(raw) as Saved;
    return {
      sheet: Math.max(0, Math.min(SHEET_COUNT, p.sheet ?? 0)),
      bookmark: Math.max(0, Math.min(SHEET_COUNT, p.bookmark ?? 0)),
      read: Array.isArray(p.read) ? p.read : [],
    };
  } catch {
    return { sheet: 0, bookmark: 0, read: [] };
  }
}

const saved = load();

type Store = {
  /** how many sheets have been turned to the left. 0 = closed on the cover */
  sheet: number;
  /** the sheet the reader was on before the intro camera move finished */
  started: boolean;
  muted: boolean;
  bookmark: number;
  read: Set<number>;
  showToc: boolean;
  zoomed: boolean;

  setSheet: (n: number) => void;
  next: () => void;
  prev: () => void;
  goToPage: (pageIndex: number) => void;
  start: () => void;
  closeBook: () => void;
  toggleMute: () => void;
  setBookmark: (n: number) => void;
  toggleToc: () => void;
  toggleZoom: () => void;
};

const persist = (s: Pick<Store, "sheet" | "bookmark" | "read">) => {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ sheet: s.sheet, bookmark: s.bookmark, read: [...s.read] })
    );
  } catch {
    /* private mode — reading still works, it just will not remember */
  }
};

export const useBook = create<Store>((set, get) => ({
  sheet: saved.sheet,
  started: false,
  muted: false,
  bookmark: saved.bookmark,
  read: new Set(saved.read),
  showToc: false,
  zoomed: false,

  setSheet: (n) => {
    const sheet = Math.max(0, Math.min(SHEET_COUNT, n));
    const read = new Set(get().read).add(sheet);
    set({ sheet, read, showToc: false });
    persist({ sheet, bookmark: get().bookmark, read });
  },
  next: () => get().setSheet(get().sheet + 1),
  prev: () => get().setSheet(get().sheet - 1),
  goToPage: (pageIndex) => get().setSheet(sheetForPage(pageIndex)),

  start: () => {
    set({ started: true });
    if (get().sheet === 0) get().setSheet(1);
  },
  closeBook: () => get().setSheet(0),

  toggleMute: () => set({ muted: !get().muted }),
  setBookmark: (n) => {
    set({ bookmark: n });
    persist({ sheet: get().sheet, bookmark: n, read: get().read });
  },
  toggleToc: () => set({ showToc: !get().showToc }),
  toggleZoom: () => set({ zoomed: !get().zoomed }),
}));

export const progress = (read: Set<number>) =>
  Math.round(([...read].filter((n) => n > 0).length / SHEET_COUNT) * 100);
