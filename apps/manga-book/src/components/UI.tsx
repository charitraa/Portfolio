import { useEffect, useRef, useState } from "react";
import { AUTHOR, CHAPTERS, PAGES, SHEET_COUNT, sheetForPage } from "../content/story";
import { progress, useBook } from "../state";
import { sfx, setMuted, unlockAudio } from "../audio";

const TAB_COLORS = [
  "#c8412f",
  "#c47a1e",
  "#8a9c3a",
  "#2f8b7a",
  "#3a6fa8",
  "#5b4b9c",
  "#a03a72",
  "#8a6a2c",
  "#4a5a6a",
];

/* ── loading ───────────────────────────────────────────────────── */

export function Loader({ done, total }: { done: number; total: number }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0907] text-paper">
      <div className="font-title text-5xl tracking-wide text-[#e8dcc0]">
        {AUTHOR.title}
      </div>
      <div className="mt-1 font-title text-xl text-[#c8412f]">VOL. {AUTHOR.volume}</div>
      <div className="mt-8 h-[3px] w-64 overflow-hidden bg-white/10">
        <div
          className="h-full bg-[#c8a250] transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 text-xs tracking-[0.3em] text-white/40">
        INKING PAGE {done} / {total}
      </div>
    </div>
  );
}

/* ── title card ────────────────────────────────────────────────── */

function TitleCard() {
  const start = useBook((s) => s.start);
  const sheet = useBook((s) => s.sheet);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-end pb-16">
      <div className="pointer-events-auto flex flex-col items-center">
        <p className="mb-4 max-w-sm text-center text-sm leading-relaxed text-white/50">
          {AUTHOR.name}'s portfolio, printed as a manga volume.
          <br />
          Drag a page corner to turn it.
        </p>
        <button
          onClick={() => {
            unlockAudio();
            sfx.open();
            start();
          }}
          className="group relative cursor-pointer border-2 border-[#c8a250] bg-[#c8412f] px-10 py-3 font-title text-2xl tracking-widest text-[#fdf6e6] shadow-[6px_6px_0_#0b0907] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-[3px_3px_0_#0b0907]"
        >
          {sheet > 0 ? "CONTINUE READING" : "OPEN BOOK"}
        </button>
        {sheet > 0 && (
          <p className="mt-3 font-hand text-lg text-[#c8a250]">
            you left off on page {Math.max(1, sheet * 2 - 1)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── chapter tabs down the fore-edge ───────────────────────────── */

function ChapterTabs() {
  const goToPage = useBook((s) => s.goToPage);
  const sheet = useBook((s) => s.sheet);

  return (
    <div className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-[3px] pr-1">
      {CHAPTERS.map((c, i) => {
        const active = sheet >= sheetForPage(c.pageIndex) &&
          (i === CHAPTERS.length - 1 || sheet < sheetForPage(CHAPTERS[i + 1].pageIndex));
        return (
          <button
            key={c.n}
            onClick={() => goToPage(c.pageIndex)}
            title={`Chapter ${c.n} — ${c.title}`}
            style={{ background: TAB_COLORS[i % TAB_COLORS.length] }}
            className={`group flex h-9 cursor-pointer items-center overflow-hidden rounded-l-sm border-y border-l border-black/30 text-left transition-all ${
              active ? "w-40 shadow-[0_0_0_2px_rgba(200,162,80,0.9)]" : "w-7 hover:w-40"
            }`}
          >
            <span className="w-7 shrink-0 text-center font-title text-sm text-white/90">
              {c.n}
            </span>
            <span className="truncate pr-2 font-title text-sm tracking-wide text-white">
              {c.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── table of contents overlay ─────────────────────────────────── */

function TocPanel() {
  const showToc = useBook((s) => s.showToc);
  const toggleToc = useBook((s) => s.toggleToc);
  const goToPage = useBook((s) => s.goToPage);
  const read = useBook((s) => s.read);

  if (!showToc) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={toggleToc}
    >
      <div
        className="w-[min(90vw,540px)] border-4 border-ink bg-[#efe6d2] p-8 text-ink shadow-[10px_10px_0_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 font-title text-4xl">CONTENTS</div>
        <div className="mb-5 h-[3px] bg-ink" />
        <ul className="space-y-1">
          {CHAPTERS.map((c) => (
            <li key={c.n}>
              <button
                onClick={() => goToPage(c.pageIndex)}
                className="flex w-full cursor-pointer items-baseline gap-3 py-1 text-left hover:bg-ink/10"
              >
                <span className="w-14 shrink-0 font-title text-lg text-[#c8412f]">
                  CH.{c.n}
                </span>
                <span className="font-bold">{c.title}</span>
                <span className="mx-2 flex-1 border-b border-dashed border-ink/40" />
                <span className="tabular-nums text-sm opacity-70">{c.folio}</span>
                {read.has(sheetForPage(c.pageIndex)) && (
                  <span className="ml-1 text-xs text-[#2f8b7a]">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between text-xs opacity-60">
          <span>{PAGES.length} pages · vol. {AUTHOR.volume}</span>
          <span>{progress(read)}% read</span>
        </div>
      </div>
    </div>
  );
}

/* ── reading HUD ───────────────────────────────────────────────── */

function IconButton({
  onClick,
  onPointerDown,
  onPointerUp,
  label,
  children,
  active,
}: {
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      title={label}
      aria-label={label}
      className={`flex h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 border border-white/15 px-3 font-title text-sm tracking-wider transition-colors ${
        active
          ? "bg-[#c8412f] text-white"
          : "bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Hud() {
  const {
    sheet,
    setSheet,
    toggleToc,
    bookmark,
    setBookmark,
    muted,
    toggleMute,
    zoomed,
    toggleZoom,
    read,
  } = useBook();

  /**
   * Hold to riffle. The repeat only starts once the press has clearly outlived
   * an ordinary click — it used to fire from the first millisecond at 130ms
   * intervals, so a normal 300ms click queued two repeats *and* the trailing
   * click and the book lurched three sheets at once.
   */
  const hold = useRef({ delay: 0, repeat: 0, fired: false });

  const stopHold = () => {
    clearTimeout(hold.current.delay);
    clearInterval(hold.current.repeat);
  };

  const startHold = (dir: 1 | -1) => {
    stopHold();
    hold.current.fired = false;
    hold.current.delay = window.setTimeout(() => {
      hold.current.fired = true;
      hold.current.repeat = window.setInterval(() => {
        const s = useBook.getState();
        s.setSheet(s.sheet + dir);
      }, 150);
    }, 350);
  };

  // a press that turned into a riffle has already done the turning
  const tap = (dir: 1 | -1) => () => {
    if (hold.current.fired) return;
    const s = useBook.getState();
    s.setSheet(s.sheet + dir);
  };

  useEffect(() => stopHold, []);

  const left = sheet;
  const right = SHEET_COUNT - sheet;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-3 pb-5">
      {/* thickness = progress */}
      <div className="pointer-events-auto flex items-end gap-2 text-[10px] tracking-[0.2em] text-white/40">
        <span className="tabular-nums">{left * 2}</span>
        <div className="flex h-5 items-end gap-[1px]">
          {Array.from({ length: SHEET_COUNT }, (_, i) => (
            <button
              key={i}
              onClick={() => setSheet(i)}
              title={`Sheet ${i + 1}`}
              className={`w-[3px] cursor-pointer transition-all ${
                i < sheet ? "h-5 bg-[#c8a250]" : "h-3 bg-white/25 hover:bg-white/50"
              } ${i === bookmark - 1 ? "!bg-[#c8412f]" : ""}`}
            />
          ))}
        </div>
        <span className="tabular-nums">{right * 2}</span>
      </div>

      <div className="pointer-events-auto flex items-center gap-1.5 border border-white/10 bg-black/55 p-1.5 backdrop-blur">
        <IconButton
          onClick={tap(-1)}
          onPointerDown={() => startHold(-1)}
          onPointerUp={stopHold}
          label="Previous page (hold to flip back)"
        >
          ◀
        </IconButton>
        <IconButton onClick={toggleToc} label="Table of contents">
          CONTENTS
        </IconButton>
        <IconButton
          onClick={() => {
            setBookmark(sheet);
            sfx.ribbon();
          }}
          active={bookmark === sheet && sheet > 0}
          label="Place the bookmark ribbon here"
        >
          BOOKMARK
        </IconButton>
        <IconButton onClick={toggleZoom} active={zoomed} label="Zoom (double-click the page)">
          {zoomed ? "ZOOM OUT" : "ZOOM IN"}
        </IconButton>
        <IconButton onClick={() => setSheet(0)} label="Close the book">
          CLOSE
        </IconButton>
        <IconButton onClick={toggleMute} active={!muted} label="Paper sounds">
          {muted ? "SOUND OFF" : "SOUND ON"}
        </IconButton>
        <IconButton
          onClick={tap(1)}
          onPointerDown={() => startHold(1)}
          onPointerUp={stopHold}
          label="Next page (hold to flip forward)"
        >
          ▶
        </IconButton>
      </div>

      <div className="text-[10px] tracking-[0.25em] text-white/25">
        ← → TURN · T CONTENTS · B BOOKMARK · Z ZOOM · {progress(read)}% READ
      </div>
    </div>
  );
}

/* ── the blank last page ───────────────────────────────────────── */

function SecretPage() {
  const sheet = useBook((s) => s.sheet);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    setReveal(false);
    if (sheet !== SHEET_COUNT) return;
    const t = setTimeout(() => setReveal(true), 5000);
    return () => clearTimeout(t);
  }, [sheet]);

  if (!reveal) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-30 flex justify-center">
      <div className="animate-pulse border border-[#c8a250]/50 bg-black/70 px-6 py-3 text-center backdrop-blur">
        <div className="font-title text-2xl tracking-widest text-[#c8a250]">
          YOU READ THE WHOLE THING
        </div>
        <a
          href={AUTHOR.github}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto font-hand text-lg text-white/70 underline"
        >
          so here is the source of everything → {AUTHOR.github.replace("https://", "")}
        </a>
      </div>
    </div>
  );
}

/* ── keyboard ──────────────────────────────────────────────────── */

function Keys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useBook.getState();
      switch (e.key) {
        case "ArrowRight":
        case " ":
          s.next();
          break;
        case "ArrowLeft":
          s.prev();
          break;
        case "Home":
          s.setSheet(0);
          break;
        case "End":
          s.setSheet(SHEET_COUNT);
          break;
        case "t":
        case "T":
          s.toggleToc();
          break;
        case "b":
        case "B":
          s.setBookmark(s.sheet);
          sfx.ribbon();
          break;
        case "z":
        case "Z":
          s.toggleZoom();
          break;
        case "m":
        case "M":
          s.toggleMute();
          break;
        case "Escape":
          if (s.showToc) s.toggleToc();
          else if (s.zoomed) s.toggleZoom();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

/* ── root overlay ──────────────────────────────────────────────── */

export function UI() {
  const started = useBook((s) => s.started);
  const sheet = useBook((s) => s.sheet);
  const muted = useBook((s) => s.muted);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  const closed = !started || sheet === 0;

  return (
    <>
      <Keys />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between p-5">
        <div>
          <div className="font-title text-xl tracking-wider text-[#e8dcc0]">
            {AUTHOR.name.toUpperCase()}
          </div>
          <div className="text-[10px] tracking-[0.3em] text-white/35">
            {AUTHOR.role.toUpperCase()} · {AUTHOR.location.toUpperCase()}
          </div>
        </div>
        <a
          href={AUTHOR.github}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto border border-white/15 px-3 py-1.5 font-title text-sm tracking-wider text-white/60 transition-colors hover:border-[#c8a250] hover:text-[#c8a250]"
        >
          GITHUB
        </a>
      </header>

      {closed ? (
        <TitleCard />
      ) : (
        <>
          <Hud />
          <ChapterTabs />
          <SecretPage />
        </>
      )}
      <TocPanel />
    </>
  );
}
