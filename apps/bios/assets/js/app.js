/* ============================================================
   app.js — settings, live values, modals, search, easter eggs
   and the wiring that starts the machine.
   ============================================================ */

const App = (() => {
  const LS_KEY = "devbios.settings.v1";
  const SS_KEY = "devbios.visited.v1";

  const DEFAULTS = { theme: "classic", crt: true, flicker: true, anim: true, sound: false };

  const settings = Object.assign({}, DEFAULTS);
  let visited = new Set();
  let startedAt = Date.now();

  const $ = (id) => document.getElementById(id);

  /* ============================================================
     SETTINGS
     ============================================================ */
  function loadSettings() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) Object.assign(settings, JSON.parse(raw));
    } catch (_) { /* storage blocked — defaults are fine */ }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) settings.anim = false;
    applySettings();
  }

  function saveSettings() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(settings)); } catch (_) {}
  }

  function applySettings() {
    document.documentElement.dataset.theme = settings.theme;
    document.body.classList.toggle("no-crt", !settings.crt);
    document.body.classList.toggle("flicker", !!settings.flicker && !!settings.crt && !!settings.anim);
    document.body.classList.toggle("no-anim", !settings.anim);
    Beep.setEnabled(settings.sound);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.body).backgroundColor;
  }

  function setSetting(k, v) {
    settings[k] = v;
    applySettings();
    saveSettings();
  }

  function resetSettings() {
    Object.assign(settings, DEFAULTS);
    applySettings();
    saveSettings();
  }

  /* ============================================================
     VISITED SECTIONS -> "memory usage"
     ============================================================ */
  function loadVisits() {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      if (raw) visited = new Set(JSON.parse(raw));
    } catch (_) {}
  }

  function markVisited(id) {
    if (visited.has(id)) return updateMem();
    visited.add(id);
    try { sessionStorage.setItem(SS_KEY, JSON.stringify([...visited])); } catch (_) {}
    updateMem();
  }

  function resetVisits() {
    visited = new Set([Nav.currentTab()]);
    try { sessionStorage.setItem(SS_KEY, JSON.stringify([...visited])); } catch (_) {}
    updateMem();
  }

  function updateMem() {
    const total = Nav.tabCount();
    const pct   = Math.min(100, Math.round((visited.size / total) * 100));
    const used  = Math.round(640 * pct / 100);
    $("sys-mem").textContent = used + "K / 640K";
    $("mem-fill").style.width = pct + "%";
    $("mem-hint").textContent = pct >= 100
      ? "All sections explored. Memory test passed."
      : "Explored " + visited.size + " of " + total + " sections.";
  }

  /* ============================================================
     LIVE VALUES (clock, uptime)
     ============================================================ */
  function two(n) { return String(n).padStart(2, "0"); }

  function clockString() {
    const d = new Date();
    return two(d.getHours()) + ":" + two(d.getMinutes()) + ":" + two(d.getSeconds());
  }

  function uptimeString() {
    const s = Math.floor((Date.now() - startedAt) / 1000);
    return two(Math.floor(s / 3600)) + ":" + two(Math.floor(s / 60) % 60) + ":" + two(s % 60);
  }

  function refreshLive() {
    const clock = clockString(), up = uptimeString();
    $("sys-clock").textContent = clock;
    $("sys-uptime").textContent = up;
    document.querySelectorAll('[data-live="clock"]').forEach((n) => { n.textContent = clock; });
    document.querySelectorAll('[data-live="uptime"]').forEach((n) => { n.textContent = up; });
  }

  /* ============================================================
     TOAST + MODAL
     ============================================================ */
  let toastTimer = null;
  function toast(msg, ms = 2600) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, ms);
  }

  let modalState = null;

  function modalOpen() { return !!modalState; }

  /* actions: [{ label, fn, primary }] — navigable with ←→ / ↑↓ / Enter */
  function showModal(title, bodyHTML, actions) {
    const box = $("modal");
    $("modal-title").textContent = title;
    $("modal-body").innerHTML = bodyHTML;
    const bar = $("modal-actions");
    bar.innerHTML = "";

    actions.forEach((a, i) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.type = "button";
      b.textContent = a.label;
      b.addEventListener("click", () => { closeModal(); a.fn && a.fn(); });
      bar.appendChild(b);
    });

    modalState = { actions, idx: Math.max(0, actions.findIndex((a) => a.primary)), bar };
    if (modalState.idx < 0) modalState.idx = 0;
    paintModal();
    box.hidden = false;
    Beep.enter();
  }

  function paintModal() {
    [...modalState.bar.children].forEach((b, i) => b.classList.toggle("is-selected", i === modalState.idx));
  }

  function closeModal() {
    $("modal").hidden = true;
    modalState = null;
  }

  function modalKey(e) {
    if (!modalState) return;
    const n = modalState.actions.length;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "Tab") {
      e.preventDefault(); modalState.idx = (modalState.idx + 1) % n; paintModal(); Beep.tick();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault(); modalState.idx = (modalState.idx - 1 + n) % n; paintModal(); Beep.tick();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const a = modalState.actions[modalState.idx];
      closeModal(); a.fn && a.fn();
    } else if (e.key === "Escape") {
      e.preventDefault(); closeModal(); Beep.back();
    }
  }

  /* ============================================================
     SEARCH — "Jump to Setting"
     ============================================================ */
  let searchIdx = 0;
  let searchHits = [];

  function buildIndex() {
    const idx = [];
    const add = (label, where, go) => idx.push({ label, where, go });

    Nav.tabs().forEach((t) => add(t.label, "Menu", () => Nav.goTab(t.id)));
    BIOS.projects.items.forEach((p) =>
      add(p.name, "Projects", () => { Nav.goTab("projects"); Nav.pushDetail("project", p.id); }));
    BIOS.skills.groups.forEach((g) => g.items.forEach((s) => add(s.label, "Skills", () => Nav.goTab("skills"))));
    BIOS.services.items.forEach((s) => add(s.label, "Services", () => Nav.goTab("services")));
    BIOS.stack.groups.forEach((g) => g.items.forEach((i) => add(i, "Tech Stack", () => Nav.goTab("stack"))));
    BIOS.certificates.items.forEach((c) => add(c.label, "Certificates", () => Nav.goTab("certificates")));
    BIOS.experience.items.forEach((e) => add(e.year + " " + e.title, "Experience", () => Nav.goTab("experience")));
    BIOS.contact.rows.forEach((c) => add(c.label, "Contact", () => Nav.goTab("contact")));
    add("Download Resume", "Resume", () => downloadResume());
    add("Print Resume", "Resume", () => printResume());
    add("Theme", "Settings", () => Nav.goTab("settings"));
    add("Sound", "Settings", () => Nav.goTab("settings"));
    return idx;
  }

  let INDEX = [];

  function openSearch() {
    INDEX = buildIndex();
    $("search").hidden = false;
    const input = $("search-input");
    input.value = "";
    runSearch("");
    setTimeout(() => input.focus(), 0);
  }

  function closeSearch() { $("search").hidden = true; }
  function searchOpen() { return !$("search").hidden; }

  function runSearch(q) {
    const needle = q.trim().toLowerCase();
    searchHits = !needle
      ? INDEX.slice(0, 10)
      : INDEX.filter((r) => r.label.toLowerCase().includes(needle)).slice(0, 12);
    searchIdx = 0;
    const ul = $("search-results");
    ul.innerHTML = "";
    if (!searchHits.length) {
      ul.innerHTML = '<li class="search-empty">No matching setting found.</li>';
      return;
    }
    searchHits.forEach((r, i) => {
      const li = document.createElement("li");
      li.innerHTML = '<span>' + Render.esc(r.label) + '</span><span class="sr-where">' + Render.esc(r.where) + '</span>';
      li.addEventListener("click", () => { closeSearch(); r.go(); });
      ul.appendChild(li);
    });
    paintSearch();
  }

  function paintSearch() {
    [...$("search-results").children].forEach((li, i) => li.classList.toggle("is-selected", i === searchIdx));
  }

  function searchKey(e) {
    if (e.key === "Escape") { e.preventDefault(); closeSearch(); Beep.back(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); searchIdx = (searchIdx + 1) % searchHits.length; paintSearch(); Beep.tick(); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); searchIdx = (searchIdx - 1 + searchHits.length) % searchHits.length; paintSearch(); Beep.tick(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const hit = searchHits[searchIdx];
      closeSearch();
      if (hit) { hit.go(); Beep.enter(); }
      return;
    }
    setTimeout(() => runSearch($("search-input").value), 0);
  }

  /* ============================================================
     RESUME
     ============================================================ */
  function downloadResume() {
    const url = BIOS.owner.resume;
    const go = () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast("Booting Resume.pdf from device 1...");
    };

    if (location.protocol === "file:") { go(); return; }
    fetch(url, { method: "HEAD" })
      .then((r) => {
        if (r.ok) go();
        else { Beep.error(); toast("ERROR 0x01: " + url + " not found. Drop your PDF there."); }
      })
      .catch(() => { Beep.error(); toast("ERROR 0x01: résumé file unreachable."); });
  }

  function printResume() {
    const o = BIOS.owner;
    const root = $("print-root");
    const rowsHTML = (rows) => rows.map(([l, v]) =>
      '<div class="p-row"><span class="p-label">' + Render.esc(l) + '</span>'
      + '<span class="p-dots"></span><span class="p-value">' + Render.esc(v) + '</span></div>').join("");

    root.innerHTML =
      '<div class="p-head">'
      + '<h1>' + Render.esc(o.name) + '</h1>'
      + rowsHTML([
          ["Role", o.role],
          ["Location", o.location],
          ["Email", o.email],
          ["GitHub", o.github.replace(/^https?:\/\//, "")],
          ["LinkedIn", o.linkedin.replace(/^https?:\/\//, "")]
        ])
      + '</div>'
      + '<h2>Summary</h2><p>' + Render.esc(RESUME_PRINT.summary) + '</p>'
      + RESUME_PRINT.sections.map((s) =>
          '<h2>' + Render.esc(s.title) + '</h2>'
          + (s.rows ? rowsHTML(s.rows) : "")
          + (s.bullets ? '<ul>' + s.bullets.map((b) => '<li>' + Render.esc(b) + '</li>').join("") + '</ul>' : "")
        ).join("")
      + '<div class="p-foot">Generated by Developer BIOS Utility v' + Render.esc(o.version)
      + ' &mdash; ' + new Date().toLocaleDateString() + '</div>';

    toast("Rendering résumé to printer...");
    setTimeout(() => window.print(), 120);
  }

  /* ============================================================
     EXIT / POWER
     ============================================================ */
  function confirmExit(mode) {
    showModal("Setup Confirmation", "<p>Save configuration changes and exit setup?</p>"
      + "<p class=\"hint\">Yes downloads the résumé. No returns to Main. Cancel stays here.</p>", [
      { label: "Yes", primary: true, fn: () => { if (mode === "save") downloadResume(); Nav.goTab("main"); } },
      { label: "No",  fn: () => Nav.goTab("main") },
      { label: "Cancel", fn: () => {} }
    ]);
  }

  function powerOff() {
    showModal("Power Off", "<p>Shut down the developer machine?</p>", [
      { label: "Yes", primary: true, fn: doPowerOff },
      { label: "Cancel", fn: () => {} }
    ]);
  }

  function doPowerOff() {
    const o = BIOS.owner;
    const veil = document.createElement("div");
    veil.className = "boot";
    veil.style.zIndex = 60;
    veil.innerHTML =
      '<pre class="boot-out">'
      + 'Saving configuration...\n'
      + '<span class="ok">Configuration saved.</span>\n\n'
      + 'Shutting down Developer BIOS...\n\n'
      + '<span class="hi">Thanks for booting my portfolio.</span>\n'
      + '<span class="dim">' + Render.esc(o.name) + ' &mdash; ' + Render.esc(o.email) + '</span>\n\n'
      + '<span class="cy">It is now safe to close this tab.</span>\n\n'
      + '<span class="dim">Press any key to power on again.</span><span class="cursor">_</span>'
      + '</pre>';
    document.body.appendChild(veil);
    Beep.back();
    const wake = () => { veil.remove(); window.removeEventListener("keydown", wake); veil.removeEventListener("click", wake); Beep.boot(); };
    window.addEventListener("keydown", wake);
    veil.addEventListener("click", wake);
  }

  /* Cosmetic firmware panic — reachable only from Dev Mode. */
  function blueScreen() {
    const veil = document.createElement("div");
    veil.className = "boot";
    veil.style.cssText = "z-index:60;background:#000080;color:#fff";
    veil.innerHTML =
      '<pre class="boot-out">'
      + 'FATAL EXCEPTION 0x0000DEAD\n\n'
      + 'A problem has been detected and this portfolio has been\n'
      + 'stopped to prevent damage to your expectations.\n\n'
      + 'DEVELOPER_TOO_CAFFEINATED\n\n'
      + 'Technical information:\n'
      + '  *** STOP: 0x0000DEAD (0xC0FFEE, 0xBADF00D, 0x1337, 0x2026)\n'
      + '  *** motivation.sys - Address 0x2026 base at 0x0000\n\n'
      + '<span class="dim">This error is entirely cosmetic. Nothing broke.</span>\n\n'
      + 'Press any key to continue...<span class="cursor">_</span>'
      + '</pre>';
    document.body.appendChild(veil);
    Beep.error();
    const wake = () => { veil.remove(); window.removeEventListener("keydown", wake); veil.removeEventListener("click", wake); };
    window.addEventListener("keydown", wake);
    veil.addEventListener("click", wake);
  }

  /* ============================================================
     HELP
     ============================================================ */
  function showHelp() {
    showModal("General Help", [
      "<p>This portfolio is a firmware setup utility. It works entirely from the keyboard.</p>",
      "<div>",
      rowsToHTML([
        ["↑ ↓", "Move between items"],
        ["← →", "Change menu / change value"],
        ["Enter", "Execute or open"],
        ["Esc", "Go back"],
        ["Home / End", "First / last item"],
        ["+ / -", "Change a setting value"],
        ["F1", "This help screen"],
        ["F2", "Download résumé"],
        ["F3 or /", "Jump to setting"],
        ["F5", "Refresh screen"],
        ["F10", "Save and exit"]
      ]),
      "</div>",
      '<p class="hint">On touch devices, swipe left or right to change menu and tap to select.</p>'
    ].join(""), [{ label: "OK", primary: true, fn: () => {} }]);
  }

  function rowsToHTML(rows) {
    return rows.map(([k, v]) =>
      '<div class="row"><span class="row-label">' + Render.esc(k) + '</span>'
      + '<span class="row-dots"></span><span class="row-value">' + Render.esc(v) + '</span></div>').join("");
  }

  /* ============================================================
     KONAMI CODE -> Developer Mode
     ============================================================ */
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let konamiPos = 0;

  function konami(e) {
    const want = KONAMI[konamiPos];
    if (e.key.toLowerCase() === want.toLowerCase()) {
      konamiPos++;
      if (konamiPos === KONAMI.length) {
        konamiPos = 0;
        if (Nav.unlockDev()) {
          Beep.secret();
          toast("DEVELOPER MODE UNLOCKED — new menu available.");
          Nav.goTab("dev");
        }
      }
    } else {
      konamiPos = (e.key === KONAMI[0]) ? 1 : 0;
    }
  }

  /* ============================================================
     GLOBAL KEYS (called by Nav for anything it does not consume)
     ============================================================ */
  function handleGlobalKey(e) {
    switch (e.key) {
      case "F1": e.preventDefault(); showHelp(); break;
      case "F2": e.preventDefault(); downloadResume(); break;
      case "F3": e.preventDefault(); openSearch(); break;
      case "/":  e.preventDefault(); openSearch(); break;
      case "F5":
        e.preventDefault();
        Nav.rerender();
        toast("Screen refreshed.");
        Beep.tick();
        break;
      case "F10": e.preventDefault(); confirmExit("save"); break;
      case "?": e.preventDefault(); showHelp(); break;
    }
  }

  /* ============================================================
     START
     ============================================================ */
  function startSetup() {
    const setup = $("setup");
    setup.hidden = false;
    if (settings.anim) {
      setup.classList.add("entering");
      setTimeout(() => setup.classList.remove("entering"), 600);
    }
    startedAt = Date.now();
    Nav.init();
    updateMem();
    refreshLive();
    setInterval(refreshLive, 1000);
    try { sessionStorage.setItem("devbios.booted", "1"); } catch (_) {}
  }

  function init() {
    loadSettings();
    loadVisits();

    /* Modal + search keys sit above everything else. stopPropagation keeps
       the setup screen from also reacting to them. */
    window.addEventListener("keydown", (e) => {
      if (searchOpen()) { e.stopPropagation(); searchKey(e); return; }
      if (modalOpen()) { e.stopPropagation(); modalKey(e); return; }
      konami(e);
    }, true);

    $("search-input").addEventListener("input", (e) => runSearch(e.target.value));
    $("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
    $("search").addEventListener("click", (e) => { if (e.target.id === "search") closeSearch(); });

    /* Browsers block audio until the user interacts — arm it on first input. */
    const arm = () => { if (settings.sound) Beep.setEnabled(true); };
    window.addEventListener("keydown", arm, { once: true });
    window.addEventListener("pointerdown", arm, { once: true });

    /* POST runs once per session. ?nopost=1 skips it outright — handy for
       linking straight to a section; #boot forces it to run again. */
    let alreadyBooted = false;
    try { alreadyBooted = sessionStorage.getItem("devbios.booted") === "1"; } catch (_) {}
    const forceBoot = location.hash === "#boot";
    const noPost = /[?&]nopost/.test(location.search);

    Boot.start(startSetup, { skip: !forceBoot && (alreadyBooted || noPost) });
  }

  return {
    init, settings, setSetting, resetSettings,
    markVisited, resetVisits, visitCount: () => visited.size,
    refreshLive, toast, showModal, modalOpen,
    downloadResume, printResume, confirmExit, powerOff, blueScreen,
    handleGlobalKey, openSearch, showHelp
  };
})();

document.addEventListener("DOMContentLoaded", App.init);
