/**
 * The sound of the door.
 *
 * Synthesised, like the music: a portfolio should not have to download a folder
 * of WAVs to make a lock sound like a lock. Everything here is oscillators,
 * one shared noise buffer and envelopes.
 *
 * Nothing is created until the visitor actually clicks the access panel, so the
 * AudioContext is always born inside a user gesture — no autoplay warnings, and
 * no context sitting open on a page nobody interacted with.
 */
class EntryAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private room: { src: AudioBufferSourceNode; gain: GainNode; hum: OscillatorNode } | null = null

  /** Mirrors Settings → Interface sounds. Off means every call below is a no-op. */
  enabled = false

  private ensure() {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      // Deliberately quiet. This is atmosphere, not a soundtrack.
      this.master.gain.value = 0.5
      this.master.connect(this.ctx.destination)
    }
    void this.ctx.resume()
    return this.ctx
  }

  /** Two seconds of white noise, reused by every hiss, clunk and sweep. */
  private noiseBuffer(ctx: AudioContext) {
    if (!this.noise) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      this.noise = buf
    }
    return this.noise
  }

  /** A single electronic pip, the kind an access panel makes per keypress. */
  private pip(at: number, freq: number, dur = 0.06, level = 0.16, type: OscillatorType = 'square') {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = 1.6
    osc.type = type
    osc.frequency.value = freq

    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(level, at + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)

    osc.connect(filter).connect(gain).connect(this.master!)
    osc.start(at)
    osc.stop(at + dur + 0.02)
  }

  /** Filtered noise: hiss, air, the scrape of a bolt. */
  private hiss(at: number, dur: number, freq: number, level: number, q = 0.7, sweepTo?: number) {
    const ctx = this.ctx!
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer(ctx)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(freq, at)
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, at + dur)
    filter.Q.value = q
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(level, at + Math.min(0.03, dur * 0.3))
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)

    src.connect(filter).connect(gain).connect(this.master!)
    src.start(at)
    src.stop(at + dur + 0.05)
  }

  /** A solenoid letting go: a low thump with the metal of the bolt on top. */
  private clunk(at: number, level = 0.5) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, at)
    osc.frequency.exponentialRampToValueAtTime(48, at + 0.14)
    gain.gain.setValueAtTime(level, at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22)
    osc.connect(gain).connect(this.master!)
    osc.start(at)
    osc.stop(at + 0.25)

    this.hiss(at, 0.09, 2600, level * 0.34, 1.1, 900)
  }

  /** Reading the finger: a sweep up, held, then the verdict. */
  scan() {
    if (!this.enabled || !this.ensure()) return
    const t = this.ctx!.currentTime
    this.pip(t, 1180, 0.05, 0.1)
    this.hiss(t + 0.04, 0.55, 700, 0.05, 1.4, 3200)
    this.pip(t + 0.3, 1480, 0.05, 0.09)
  }

  /** Access granted, the locks withdrawing, and the leaf on its closer. */
  unlock() {
    if (!this.enabled || !this.ensure()) return
    const t = this.ctx!.currentTime

    // Three ascending pips — the universal sound of a credential accepted.
    this.pip(t, 880, 0.07, 0.14)
    this.pip(t + 0.13, 1320, 0.07, 0.14)
    this.pip(t + 0.26, 1760, 0.16, 0.16, 'triangle')

    // Magnetic lock dropping, then the two bolts.
    this.clunk(t + 0.52, 0.55)
    this.clunk(t + 0.68, 0.3)

    // The leaf itself: a slow motor under a long breath of air off the seal.
    const ctx = this.ctx!
    const motor = ctx.createOscillator()
    const motorGain = ctx.createGain()
    const motorFilter = ctx.createBiquadFilter()
    motorFilter.type = 'lowpass'
    motorFilter.frequency.value = 320
    motor.type = 'sawtooth'
    motor.frequency.setValueAtTime(46, t + 0.8)
    motor.frequency.linearRampToValueAtTime(58, t + 1.8)
    motor.frequency.linearRampToValueAtTime(40, t + 2.7)
    motorGain.gain.setValueAtTime(0, t + 0.8)
    motorGain.gain.linearRampToValueAtTime(0.07, t + 1.1)
    motorGain.gain.setValueAtTime(0.07, t + 2.2)
    motorGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.9)
    motor.connect(motorFilter).connect(motorGain).connect(this.master!)
    motor.start(t + 0.8)
    motor.stop(t + 3)

    this.hiss(t + 0.8, 1.9, 420, 0.045, 0.6, 260)
    // The seal meeting the frame at the end of its travel.
    this.clunk(t + 2.85, 0.16)
  }

  /** Refused: a flat two-tone buzz. */
  deny() {
    if (!this.enabled || !this.ensure()) return
    const t = this.ctx!.currentTime
    this.pip(t, 220, 0.16, 0.16, 'sawtooth')
    this.pip(t + 0.2, 180, 0.24, 0.16, 'sawtooth')
  }

  /**
   * The room beyond the door: rack fans, air handling, mains hum. Starts when
   * the door is open and stays for the session.
   */
  ambience(on: boolean) {
    if (on && (!this.enabled || !this.ensure())) return
    if (on && this.room) return

    if (!on) {
      if (!this.room || !this.ctx) return
      const { src, gain, hum } = this.room
      const t = this.ctx.currentTime
      gain.gain.setTargetAtTime(0, t, 0.4)
      src.stop(t + 2)
      hum.stop(t + 2)
      this.room = null
      return
    }

    const ctx = this.ctx!
    const t = ctx.currentTime

    // One fader for the whole bed, so it can be brought up and taken away as
    // a single thing.
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.gain.setTargetAtTime(1, t, 1.2)
    gain.connect(this.master!)

    // Fans: noise rolled off hard, so it sits under everything as air rather
    // than as static.
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer(ctx)
    src.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 460
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 90
    const fans = ctx.createGain()
    fans.gain.value = 0.05
    src.connect(lp).connect(hp).connect(fans).connect(gain)
    src.start()

    // Mains hum off the equipment, well below the fans.
    const hum = ctx.createOscillator()
    const humGain = ctx.createGain()
    hum.type = 'sine'
    hum.frequency.value = 50
    humGain.gain.value = 0.014
    hum.connect(humGain).connect(gain)
    hum.start()

    this.room = { src, gain, hum }
  }
}

export const entryAudio = new EntryAudio()
