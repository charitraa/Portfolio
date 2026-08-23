import { create } from 'zustand'
import { playlist } from '@/data/portfolio'
import { useSystem } from '@/store/system'

/**
 * Playback lives in a store rather than in the Music window because two things
 * drive it: the application, and the hi-fi sitting on the cabinet in the room.
 * Either can start a track, and both show the same state.
 *
 * The tracks are synthesised in the browser rather than shipped as files:
 * a seeded pentatonic arpeggio over a slow pad. It is deliberately quiet and
 * starts muted — nobody's portfolio should ambush a visitor with audio.
 */
class AmbientSynth {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private timer: number | null = null
  private step = 0

  private ensure() {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  setVolume(v: number) {
    if (!this.master || !this.ctx) return
    this.master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.16, this.ctx.currentTime, 0.15)
  }

  start(seed: number, volume: number) {
    const ctx = this.ensure()
    void ctx.resume()
    this.setVolume(volume)
    this.stopLoop()
    this.step = 0

    // A minor pentatonic, transposed by the track seed.
    const scale = [0, 3, 5, 7, 10, 12, 15]
    const rootHz = 174.61 * Math.pow(2, ((seed % 5) - 2) / 12)

    const tick = () => {
      if (!this.ctx || !this.master) return
      const t = this.ctx.currentTime
      const degree = scale[(this.step * (seed + 2)) % scale.length]
      const octave = this.step % 8 === 0 ? 2 : this.step % 3 === 0 ? 1 : 0
      const freq = rootHz * Math.pow(2, degree / 12 + octave)

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1400
      osc.type = this.step % 4 === 0 ? 'triangle' : 'sine'
      osc.frequency.value = freq

      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.5, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.9)

      osc.connect(filter).connect(gain).connect(this.master)
      osc.start(t)
      osc.stop(t + 2)
      this.step++

      // Drives the platter and the level meter on the hi-fi.
      useMusic.setState({ pulse: (useMusic.getState().pulse + 1) % 1000 })
    }

    tick()
    this.timer = window.setInterval(tick, 620)
  }

  private stopLoop() {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  stop() {
    this.stopLoop()
    this.setVolume(0)
  }
}

interface MusicState {
  index: number
  playing: boolean
  /** Seconds into the current track. */
  elapsed: number
  /** Bumped on every synthesised note, so the room can react to the music. */
  pulse: number

  toggle: () => void
  play: () => void
  pause: () => void
  select: (i: number) => void
  next: () => void
  prev: () => void
  seek: (sec: number) => void
}

export const useMusic = create<MusicState>((set, get) => ({
  index: 0,
  playing: false,
  elapsed: 0,
  pulse: 0,

  toggle: () => set((s) => ({ playing: !s.playing })),
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  select: (i) => set({ index: ((i % playlist.length) + playlist.length) % playlist.length, elapsed: 0, playing: true }),
  next: () => get().select(get().index + 1),
  prev: () => get().select(get().index - 1),
  seek: (sec) => set({ elapsed: Math.max(0, Math.min(playlist[get().index].duration, Math.round(sec))) }),
}))

export const currentTrack = () => playlist[useMusic.getState().index]

// ---------------------------------------------------------------------------
// The driver — one synth for the whole session, wired to the store
// ---------------------------------------------------------------------------

let synth: AmbientSynth | null = null
let sounding: { seed: number } | null = null
let clock: number | null = null

function gain() {
  const { volume, muted } = useSystem.getState()
  return muted ? 0 : volume / 100
}

function sync() {
  const { playing, index } = useMusic.getState()
  const track = playlist[index]

  if (playing) {
    if (!synth) synth = new AmbientSynth()
    if (!sounding || sounding.seed !== track.seed) {
      synth.start(track.seed, gain())
      sounding = { seed: track.seed }
    } else {
      synth.setVolume(gain())
    }
    if (clock === null) {
      clock = window.setInterval(() => {
        const s = useMusic.getState()
        const d = playlist[s.index].duration
        if (s.elapsed + 1 >= d) s.next()
        else useMusic.setState({ elapsed: s.elapsed + 1 })
      }, 1000)
    }
  } else {
    synth?.stop()
    sounding = null
    if (clock !== null) {
      clearInterval(clock)
      clock = null
    }
  }
}

/** Called once, from the app root. */
export function initMusic() {
  useMusic.subscribe((s, prev) => {
    if (s.playing !== prev.playing || s.index !== prev.index) sync()
  })
  useSystem.subscribe((s, prev) => {
    if (s.volume !== prev.volume || s.muted !== prev.muted) sync()
  })
}
