/* ============================================================
   audio.js — PC-speaker style beeps, synthesised (no audio files).
   Every sound is opt-in and respects the Settings > Sound toggle.
   ============================================================ */

const Beep = (() => {
  let ctx = null;
  let enabled = false;

  function ensure() {
    if (!enabled) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /* A single square-wave blip — the PC speaker's whole vocabulary. */
  function tone(freq, ms, gain = 0.04, type = "square") {
    const c = ensure();
    if (!c) return;
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;

    const t0 = c.currentTime;
    const t1 = t0 + ms / 1000;
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, t1);

    osc.connect(amp).connect(c.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }

  return {
    setEnabled(v) {
      enabled = !!v;
      if (enabled) ensure();
    },
    isEnabled: () => enabled,

    post()   { tone(880, 220, 0.05); },                                  // one long POST beep
    boot()   { tone(660, 90); setTimeout(() => tone(990, 140), 110); },  // boot complete
    tick()   { tone(1400, 12, 0.018); },                                 // menu navigation
    key()    { tone(1000, 10, 0.014); },                                 // keypress click
    enter()  { tone(1320, 40, 0.03); },
    back()   { tone(520, 45, 0.03); },
    error()  { tone(200, 180, 0.05, "sawtooth"); },
    secret() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 90, 0.04), i * 90)); }
  };
})();
