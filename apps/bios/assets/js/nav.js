/* ============================================================
   nav.js — tab state, selection bar, keyboard and touch control.
   The whole site is operable without a mouse.
   ============================================================ */

const Nav = (() => {
  const TABS = [
    { id: "main",         label: "Main" },
    { id: "about",        label: "About" },
    { id: "projects",     label: "Projects" },
    { id: "skills",       label: "Skills" },
    { id: "services",     label: "Services" },
    { id: "stack",        label: "Tech Stack" },
    { id: "experience",   label: "Experience" },
    { id: "education",    label: "Education" },
    { id: "certificates", label: "Certificates" },
    { id: "resume",       label: "Resume" },
    { id: "contact",      label: "Contact" },
    { id: "settings",     label: "Settings" },
    { id: "exit",         label: "Exit" }
  ];
  const DEV_TAB = { id: "dev", label: "Dev Mode", secret: true };

  const tabbar   = document.getElementById("tabbar");
  const paneBody = document.getElementById("pane-body");
  const paneTitle= document.getElementById("pane-title");
  const helpText = document.getElementById("help-text");

  let tabs    = TABS.slice();
  let tabIdx  = 0;
  let detail  = null;          // { kind, id } when inside a submenu
  let items   = [];            // focusable elements on screen
  let cursor  = 0;
  let devOn   = false;

  /* ---------- tab bar ---------- */
  function buildTabs() {
    tabbar.innerHTML = "";
    tabs.forEach((t, i) => {
      const b = document.createElement("button");
      b.className = "tab" + (t.secret ? " tab-secret" : "");
      b.type = "button";
      b.role = "tab";
      b.textContent = t.label;
      b.setAttribute("aria-selected", String(i === tabIdx));
      b.addEventListener("click", () => { detail = null; setTab(i); });
      tabbar.appendChild(b);
    });
  }

  function syncTabs() {
    [...tabbar.children].forEach((b, i) => b.setAttribute("aria-selected", String(i === tabIdx)));
    const active = tabbar.children[tabIdx];
    if (active) active.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /* ---------- rendering ---------- */
  /* keepCursor: redraw in place (e.g. after toggling a setting) without
     throwing the selection bar back to the top of the screen. */
  function draw(keepCursor) {
    const tab = tabs[tabIdx];
    const prev = keepCursor === true ? cursor : 0;
    paneBody.innerHTML = "";

    if (detail && detail.kind === "project") {
      paneTitle.textContent = "Projects > Details";
      Render.screens.project(paneBody, detail.id);
    } else {
      paneTitle.textContent = tab.label;
      const fn = Render.screens[tab.id];
      if (fn) fn(paneBody);
    }

    if (App.settings.anim) {
      paneBody.classList.remove("refresh");
      void paneBody.offsetWidth;          // restart the wipe animation
      paneBody.classList.add("refresh");
      // Drop the class once it plays. The wipe clips content while it runs, so
      // it must never be left applied to a screen that is done animating.
      paneBody.addEventListener("animationend", () => paneBody.classList.remove("refresh"), { once: true });
    }

    items = [...paneBody.querySelectorAll("[data-focusable]")];
    select(prev, false);
    App.markVisited(tab.id);
    App.refreshLive();
  }

  /* Hash mirrors location so any screen is linkable: #skills, #projects/adsmitra */
  function syncHash() {
    const h = "#" + tabs[tabIdx].id + (detail ? "/" + detail.id : "");
    try { history.replaceState(null, "", h); } catch (_) { /* file:// */ }
  }

  function setTab(i, silent) {
    if (i < 0 || i >= tabs.length) return;
    tabIdx = i;
    detail = null;
    syncTabs();
    draw();
    if (!silent) Beep.tick();
    syncHash();
  }

  /* ---------- selection ---------- */
  function select(i, scroll = true) {
    if (!items.length) { cursor = 0; helpText.textContent = BIOS.helpDefault; return; }
    cursor = Math.max(0, Math.min(i, items.length - 1));
    items.forEach((n, k) => n.classList.toggle("is-selected", k === cursor));
    const cur = items[cursor];
    helpText.textContent = (cur && cur.__help) || BIOS.helpDefault;
    if (scroll && cur) cur.scrollIntoView({ block: "nearest" });
  }

  function move(delta) {
    if (!items.length) return;
    select((cursor + delta + items.length) % items.length);
    Beep.tick();
  }

  function activate() {
    const cur = items[cursor];
    if (!cur) return;
    if (cur.__alter) { cur.__alter(); Beep.enter(); return; }
    if (cur.__input) { cur.__input.focus(); Beep.key(); return; }
    if (cur.__action) { cur.__action(); Beep.enter(); return; }
    Beep.key();
  }

  function back() {
    if (detail) { detail = null; draw(); syncHash(); Beep.back(); return true; }
    return false;
  }

  /* ---------- keyboard ---------- */
  function onKey(e) {
    if (App.modalOpen()) return;                 // modals handle their own keys

    const tag = document.activeElement && document.activeElement.tagName;
    const typing = tag === "INPUT" || tag === "TEXTAREA";

    if (typing) {
      if (e.key === "Escape" || (e.key === "Enter" && tag !== "TEXTAREA")) {
        e.preventDefault();
        document.activeElement.blur();
        Beep.back();
      } else {
        Beep.key();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": e.preventDefault(); move(1); break;
      case "ArrowUp":   e.preventDefault(); move(-1); break;

      case "ArrowRight":
        e.preventDefault();
        if (items[cursor] && items[cursor].__alter) { items[cursor].__alter(); Beep.enter(); }
        else setTab((tabIdx + 1) % tabs.length);
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (items[cursor] && items[cursor].__alter) { items[cursor].__alter(); Beep.enter(); }
        else setTab((tabIdx - 1 + tabs.length) % tabs.length);
        break;

      case "+": case "=": case "-": case "_":
        if (items[cursor] && items[cursor].__alter) { e.preventDefault(); items[cursor].__alter(); Beep.enter(); }
        break;

      case "Enter": e.preventDefault(); activate(); break;

      case "Escape":
        e.preventDefault();
        if (!back()) { setTab(0); Beep.back(); }
        break;

      case "Home": e.preventDefault(); select(0); Beep.tick(); break;
      case "End":  e.preventDefault(); select(items.length - 1); Beep.tick(); break;

      case "PageDown": e.preventDefault(); select(cursor + 8); Beep.tick(); break;
      case "PageUp":   e.preventDefault(); select(cursor - 8); Beep.tick(); break;

      case "Tab":
        e.preventDefault();
        setTab(e.shiftKey ? (tabIdx - 1 + tabs.length) % tabs.length : (tabIdx + 1) % tabs.length);
        break;

      default:
        App.handleGlobalKey(e);
    }
  }

  /* ---------- pointer ---------- */
  function onClick(e) {
    const r = e.target.closest("[data-focusable]");
    if (!r) return;
    const i = items.indexOf(r);
    if (i < 0) return;
    if (i !== cursor) select(i);
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    activate();
  }

  /* Swipe left/right between tabs on touch devices. */
  function bindSwipe() {
    const zone = document.querySelector(".body");
    let x0 = 0, y0 = 0, t0 = 0;
    zone.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      x0 = t.clientX; y0 = t.clientY; t0 = Date.now();
    }, { passive: true });
    zone.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      if (Date.now() - t0 > 600) return;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      if (dx < 0) setTab((tabIdx + 1) % tabs.length);
      else        setTab((tabIdx - 1 + tabs.length) % tabs.length);
    }, { passive: true });
  }

  return {
    init() {
      buildTabs();
      const [wantTab, wantDetail] = location.hash.slice(1).split("/");
      const start = tabs.findIndex((t) => t.id === wantTab);
      tabIdx = start >= 0 ? start : 0;
      if (wantDetail && tabs[tabIdx].id === "projects"
          && BIOS.projects.items.some((p) => p.id === wantDetail)) {
        detail = { kind: "project", id: wantDetail };
      }
      syncTabs();
      draw();
      window.addEventListener("keydown", onKey);
      paneBody.addEventListener("click", onClick);
      bindSwipe();
    },

    goTab(id) {
      const i = tabs.findIndex((t) => t.id === id);
      if (i >= 0) { detail = null; setTab(i); }
    },
    pushDetail(kind, id) { detail = { kind, id }; draw(); syncHash(); },
    rerender: (keepCursor) => draw(keepCursor),
    tabCount: () => tabs.length,
    tabs: () => tabs,
    currentTab: () => tabs[tabIdx].id,
    select,

    unlockDev() {
      if (devOn) return false;
      devOn = true;
      tabs = TABS.concat([DEV_TAB]);
      buildTabs();
      syncTabs();
      return true;
    }
  };
})();
