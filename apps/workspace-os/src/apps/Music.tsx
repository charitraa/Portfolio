import { playlist } from '@/data/portfolio'
import { IconBtn, Scroll, StatusBar } from '@/os/ui'
import { useSystem } from '@/store/system'
import { useMusic } from '@/store/music'
import type { AppWindowProps } from '@/os/types'

/**
 * The transport lives in `@/store/music` — the hi-fi in the room plays the
 * same tracks through the same synthesiser, so this window is a view onto
 * playback rather than the owner of it.
 */
function mmss(sec: number) {
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
}

export default function Music(_: AppWindowProps) {
  const { volume, muted, setVolume, toggleMute } = useSystem()
  // Field-by-field: the store also carries a per-note pulse for the room, and
  // this window has no business re-rendering on it.
  const index = useMusic((s) => s.index)
  const playing = useMusic((s) => s.playing)
  const elapsed = useMusic((s) => s.elapsed)
  const { toggle, select, seek } = useMusic.getState()

  const track = playlist[index]

  return (
    <div className="flex h-full flex-col">
      {/* Now playing */}
      <div
        className="shrink-0 p-5"
        style={{ background: `linear-gradient(150deg, var(--accent-soft), transparent)` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="grid h-20 w-20 shrink-0 place-items-center rounded-xl text-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 30%, #000))',
            }}
          >
            <span className={playing ? 'spin-slow' : ''}>💿</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[16px] font-semibold tracking-tight">{track.title}</div>
            <div className="truncate text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
              {track.artist}
            </div>
            <div className="mt-1 text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {muted ? 'Muted — unmute to hear it' : playing ? 'Synthesising…' : 'Paused'}
            </div>
          </div>
        </div>

        {/* Seek bar */}
        <div className="mt-4 flex items-center gap-3">
          <span className="w-9 font-mono text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
            {mmss(elapsed)}
          </span>
          <input
            type="range"
            min={0}
            max={track.duration}
            value={elapsed}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, var(--accent) ${(elapsed / track.duration) * 100}%, color-mix(in oklab, var(--text) 15%, transparent) ${(elapsed / track.duration) * 100}%)`,
            }}
            aria-label="Seek"
          />
          <span className="w-9 text-right font-mono text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
            {mmss(track.duration)}
          </span>
        </div>

        {/* Transport */}
        <div className="mt-3 flex items-center gap-2">
          <IconBtn title="Previous" onClick={() => select((index - 1 + playlist.length) % playlist.length)}>
            ⏮
          </IconBtn>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause' : 'Play'}
            className="grid h-10 w-10 place-items-center rounded-full text-[15px]"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <IconBtn title="Next" onClick={() => select((index + 1) % playlist.length)}>
            ⏭
          </IconBtn>

          <div className="ml-auto flex items-center gap-2">
            <IconBtn title={muted ? 'Unmute' : 'Mute'} onClick={toggleMute} active={muted}>
              {muted ? '🔇' : volume > 50 ? '🔊' : '🔉'}
            </IconBtn>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, var(--accent) ${muted ? 0 : volume}%, color-mix(in oklab, var(--text) 15%, transparent) ${muted ? 0 : volume}%)`,
              }}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      <Scroll className="px-2 py-2">
        {playlist.map((t, i) => (
          <button
            key={t.title}
            type="button"
            onDoubleClick={() => select(i)}
            onClick={() => select(i)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
            style={{ background: i === index ? 'var(--accent-soft)' : undefined }}
          >
            <span className="w-4 text-center text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {i === index && playing ? '▶' : i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium">{t.title}</span>
              <span className="block truncate text-[11px]" style={{ color: 'var(--text-dim)' }}>
                {t.artist} · {t.mood}
              </span>
            </span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {mmss(t.duration)}
            </span>
          </button>
        ))}
      </Scroll>

      <StatusBar>
        <span>{playlist.length} tracks</span>
        <span className="ml-auto">Synthesised live with WebAudio — no audio files in this repo</span>
      </StatusBar>
    </div>
  )
}
