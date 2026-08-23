/**
 * Paper sounds, synthesised. Filtered noise bursts read as paper far better
 * than a short sample loop does, and nothing has to be downloaded.
 */

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function ac(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBuffer(a: AudioContext): AudioBuffer {
  if (noise) return noise;
  const len = a.sampleRate * 1.2;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // brown-ish noise: closer to paper than white noise
    const w = Math.random() * 2 - 1;
    last = (last + 0.03 * w) / 1.03;
    d[i] = last * 3.2;
  }
  noise = buf;
  return buf;
}

type Opts = {
  dur?: number;
  freq?: number;
  q?: number;
  gain?: number;
  sweepTo?: number;
  type?: BiquadFilterType;
};

function burst({
  dur = 0.34,
  freq = 1800,
  q = 0.8,
  gain = 0.22,
  sweepTo,
  type = "bandpass",
}: Opts) {
  const a = ac();
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  src.playbackRate.value = 0.8 + Math.random() * 0.5;
  src.loop = true;

  const filter = a.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, a.currentTime);
  filter.Q.value = q;
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, a.currentTime + dur);

  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, a.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + dur * 0.16);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);

  src.connect(filter).connect(g).connect(a.destination);
  src.start();
  src.stop(a.currentTime + dur + 0.02);
}

let muted = false;
export const setMuted = (m: boolean) => (muted = m);

export const sfx = {
  flip: () =>
    !muted &&
    burst({ dur: 0.38, freq: 900, sweepTo: 3400, q: 0.7, gain: 0.16 }),
  fastFlip: () => !muted && burst({ dur: 0.12, freq: 2600, q: 1.4, gain: 0.09 }),
  open: () => {
    if (muted) return;
    burst({ dur: 0.6, freq: 420, sweepTo: 1600, q: 0.6, gain: 0.2 });
  },
  close: () => {
    if (muted) return;
    burst({ dur: 0.5, freq: 2400, sweepTo: 90, q: 0.5, gain: 0.3, type: "lowpass" });
  },
  corner: () => !muted && burst({ dur: 0.08, freq: 3800, q: 2, gain: 0.045 }),
  ribbon: () => !muted && burst({ dur: 0.22, freq: 1400, sweepTo: 600, q: 1.1, gain: 0.09 }),
};

/** Browsers only allow audio after a gesture; call this from the Open button. */
export const unlockAudio = () => void ac();
