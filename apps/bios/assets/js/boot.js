/* ============================================================
   boot.js — Power-on self test.
   Tells a story: the visitor is booting Charitra's machine, and
   the machine is detecting a developer.
   ============================================================ */

const Boot = (() => {
  const el      = document.getElementById("boot");
  const out     = document.getElementById("boot-out");
  const foot    = document.getElementById("boot-foot");
  const barFill = document.getElementById("boot-bar-fill");
  const countEl = document.getElementById("boot-count");
  const skipBtn = document.getElementById("boot-skip");

  const o    = BIOS.owner;
  const cols = 42;                 // column where the check result lands
  let done   = false;
  let onDone = () => {};
  let timers = [];
  let countdown = null;

  /* ---- script -------------------------------------------------
     type: "line"  plain text, typed out
           "check" label ......... RESULT
           "wait"  pause
           "bar"   progress bar fill
  --------------------------------------------------------------- */
  const script = [
    { t: "line",  text: "Developer BIOS (C) 2026 " + o.name, cls: "hi" },
    { t: "line",  text: "BIOS Date: 08/03/26   Ver: " + o.version + "   Build: portfolio", cls: "dim" },
    { t: "line",  text: "" },
    { t: "line",  text: "Power On...", cls: "hi" },
    { t: "wait",  ms: 260 },
    { t: "line",  text: "" },

    { t: "check", label: "Detecting Developer",   result: o.name,   cls: "cy" },
    { t: "check", label: "CPU Type",              result: o.role,   cls: "cy" },
    { t: "check", label: "Location",              result: o.location, cls: "cy" },
    { t: "line",  text: "" },

    { t: "check", label: "Checking CPU",          result: "OK" },
    { t: "check", label: "Checking Memory",       result: "OK" },
    { t: "check", label: "Detecting Storage",     result: "OK" },
    { t: "check", label: "Loading Projects",      result: "4 FOUND" },
    { t: "check", label: "Loading Skills",        result: "OK" },
    { t: "check", label: "Loading Experience",    result: "OK" },
    { t: "check", label: "Loading Certificates",  result: "OK" },
    { t: "check", label: "Mounting Resume.pdf",   result: "READY" },
    { t: "check", label: "Coffee Subsystem",      result: "LOW", cls: "warn" },
    { t: "check", label: "Portfolio Interface",   result: "ONLINE" },
    { t: "line",  text: "" },

    { t: "bar" },
    { t: "line",  text: "" },
    { t: "line",  text: "Developer detected. Skills database ready.", cls: "hi" },
    { t: "line",  text: "" }
  ];

  const pad = (s, n) => s + ".".repeat(Math.max(2, n - s.length));

  function write(html) {
    out.insertAdjacentHTML("beforeend", html);
    out.scrollTop = out.scrollHeight;
  }

  function after(ms, fn) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  /* Type a string one character at a time, then continue. */
  function typeLine(text, cls, speed, next) {
    if (!text) { write("\n"); return next(); }
    const span = document.createElement("span");
    if (cls) span.className = cls;
    out.appendChild(span);
    let i = 0;
    (function step() {
      if (i >= text.length) { write("\n"); return next(); }
      span.textContent += text[i++];
      after(speed, step);
    })();
  }

  function runBar(next) {
    let pct = 0;
    (function step() {
      pct += 6 + Math.random() * 12;
      if (pct >= 100) {
        barFill.style.width = "100%";
        return after(180, next);
      }
      barFill.style.width = pct + "%";
      after(45, step);
    })();
  }

  function run(fast) {
    foot.hidden = false;
    const speed = fast ? 0 : 6;
    let i = 0;

    (function step() {
      if (done) return;
      if (i >= script.length) return finishPost();

      const s = script[i++];

      if (s.t === "wait")  return after(fast ? 0 : s.ms, step);
      if (s.t === "bar")   return fast ? step() : runBar(step);
      if (s.t === "line")  return typeLine(s.text, s.cls, speed, () => after(fast ? 0 : 60, step));

      /* check line: label dots RESULT */
      const cls = s.cls || "ok";
      typeLine(pad(s.label, cols), "dim", speed, () => {
        // rewind the newline typeLine just wrote so the result sits on the same row
        out.lastChild.remove();
        write(`<span class="${cls}">${s.result}</span>\n`);
        Beep.tick();
        after(fast ? 0 : 90 + Math.random() * 90, step);
      });
    })();
  }

  function finishPost() {
    if (done) return;
    Beep.post();
    let n = 5;
    countEl.textContent = n;
    countdown = setInterval(() => {
      n -= 1;
      countEl.textContent = Math.max(n, 0);
      if (n <= 0) finish();
    }, 1000);
  }

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    timers = [];
    if (countdown) clearInterval(countdown);
    Beep.boot();
    el.remove();
    onDone();
  }

  return {
    start(cb, opts = {}) {
      onDone = cb;
      if (opts.skip) { finish(); return; }

      /* ENTER / any key enters setup immediately; ESC fast-forwards POST. */
      const onKey = (e) => {
        if (done) { window.removeEventListener("keydown", onKey); return; }
        if (e.key === "Escape") { e.preventDefault(); timers.forEach(clearTimeout); timers = []; out.innerHTML = ""; run(true); return; }
        e.preventDefault();
        finish();
      };
      window.addEventListener("keydown", onKey);
      el.addEventListener("click", (e) => { if (e.target !== skipBtn) finish(); });
      skipBtn.addEventListener("click", finish);

      run(false);
    },
    finish
  };
})();
