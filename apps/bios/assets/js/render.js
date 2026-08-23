/* ============================================================
   render.js — builds each setup screen from BIOS data.
   Focusable elements carry:  data-focusable
                              __help   (string shown in Item Help)
                              __action (fn run on ENTER)
                              __alter  (fn run on +/- or ENTER for settings)
   ============================================================ */

const Render = (() => {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  /* ---------- element helpers ---------------------------- */
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function group(title) {
    const g = el("div", "group");
    if (title) g.appendChild(el("h3", "group-title", esc(title)));
    return g;
  }

  /* One BIOS setting line: LABEL .......... VALUE */
  function row(label, value, opts = {}) {
    const r = el("div", "row" + (opts.sub ? " row-sub" : "") + (opts.disabled ? " is-disabled" : ""));
    r.appendChild(el("span", "row-label", esc(label)));
    r.appendChild(el("span", "row-dots"));

    if (opts.bar != null) {
      const track = el("div", "bar-track");
      const fill  = el("div", "bar-fill");
      fill.style.width = opts.bar + "%";
      track.appendChild(fill);
      r.appendChild(track);
    }
    const v = el("span", "row-value" + (opts.flag ? " v-" + opts.flag : ""), esc(value == null ? "" : value));
    if (opts.live) v.dataset.live = opts.live;
    r.appendChild(v);

    if (!opts.disabled) {
      r.dataset.focusable = "1";
      r.__help = opts.help || "";
      r.__action = opts.action || null;
      r.__alter = opts.alter || null;
      r.__search = opts.search !== false ? label : null;
    }
    return r;
  }

  function textBlock(parent, lines, cls) {
    (Array.isArray(lines) ? lines : [lines]).forEach((t) => {
      parent.appendChild(el("p", "text" + (cls ? " " + cls : ""), esc(t)));
    });
  }

  function tags(parent, items) {
    const ul = el("ul", "tag-list");
    items.forEach((t) => ul.appendChild(el("li", "tag", esc(t))));
    parent.appendChild(ul);
  }

  function open(url) {
    if (!url) { App.toast("No link configured for this item."); Beep.error(); return; }
    window.open(url, "_blank", "noopener");
  }

  /* ============================================================
     SCREENS
     ============================================================ */
  const screens = {};

  /* ---- MAIN ---- */
  screens.main = (root) => {
    const g = group("System Information");
    BIOS.main.rows.forEach((r) => {
      g.appendChild(row(r.label, r.value, {
        flag: r.flag, live: r.live,
        help: "System value. Read-only.",
        disabled: false
      }));
    });
    root.appendChild(g);

    const g2 = group("Quick Actions");
    g2.appendChild(row("View Projects", "4 modules", {
      sub: true, help: "Jump to the installed modules list.",
      action: () => Nav.goTab("projects")
    }));
    g2.appendChild(row("Download Resume", "Resume.pdf", {
      sub: true, help: "Fetch the résumé PDF. Shortcut: F2.",
      action: () => App.downloadResume()
    }));
    g2.appendChild(row("Contact", "Open ports", {
      sub: true, help: "Email, GitHub and LinkedIn.",
      action: () => Nav.goTab("contact")
    }));
    root.appendChild(g2);
  };

  /* ---- ABOUT ---- */
  screens.about = (root) => {
    const g = group("Developer Information");
    BIOS.about.rows.forEach((r) => g.appendChild(row(r.label, r.value, { flag: r.flag, help: "Developer attribute." })));
    root.appendChild(g);

    const g2 = group("Interests");
    tags(g2, BIOS.about.interests);
    root.appendChild(g2);

    const g3 = group("Description");
    textBlock(g3, BIOS.about.bio, "dim");
    root.appendChild(g3);
  };

  /* ---- PROJECTS (list) ---- */
  screens.projects = (root) => {
    const g = group("Installed Modules");
    BIOS.projects.items.forEach((p) => {
      g.appendChild(row(p.name, p.status, {
        sub: true, flag: "ok",
        help: p.summary + "  [ENTER] for details.",
        action: () => Nav.pushDetail("project", p.id)
      }));
    });
    root.appendChild(g);

    const g2 = group("Module Options");
    g2.appendChild(row("Show All Repositories", "GitHub", {
      sub: true, help: "Open the full GitHub profile.",
      action: () => open(BIOS.owner.github)
    }));
    root.appendChild(g2);
  };

  /* ---- PROJECT DETAIL ---- */
  screens.project = (root, id) => {
    const p = BIOS.projects.items.find((x) => x.id === id);
    if (!p) { root.appendChild(el("p", "text", "Module not found.")); return; }

    root.appendChild(el("p", "crumb", "Projects &gt; <b>" + esc(p.name) + "</b> &nbsp;&nbsp; [ESC] back"));

    const g = group("Device Information");
    g.appendChild(row("Module Name", p.name, { help: p.summary }));
    g.appendChild(row("Status", p.status, { flag: "ok", help: "Module state." }));
    g.appendChild(row("Tech Stack", p.stack.join(", "), { flag: "plain", help: "Technologies used." }));
    g.appendChild(row("Repository", p.github ? "Open GitHub" : "Not configured", {
      sub: !!p.github, flag: p.github ? undefined : "dim",
      help: p.github || "No repository link set.",
      action: () => open(p.github)
    }));
    g.appendChild(row("Live Demo", p.demo ? "Open Demo" : "Not deployed", {
      sub: !!p.demo, flag: p.demo ? undefined : "dim",
      help: p.demo || "No live deployment for this module.",
      action: () => open(p.demo)
    }));
    root.appendChild(g);

    const gs = group("Summary");
    textBlock(gs, p.summary, "dim");
    root.appendChild(gs);

    const gf = group("Features");
    p.features.forEach((f, i) => gf.appendChild(row("Feature " + String(i + 1).padStart(2, "0"), f, {
      flag: "plain", help: f, search: false
    })));
    root.appendChild(gf);

    if (p.shots && p.shots.length) {
      const gsh = group("Screenshots");
      const wrap = el("div", "shots");
      p.shots.forEach((src) => {
        const box = el("div", "shot");
        const img = el("img");
        img.src = src; img.alt = p.name + " screenshot"; img.loading = "lazy";
        box.appendChild(img);
        wrap.appendChild(box);
      });
      gsh.appendChild(wrap);
      root.appendChild(gsh);
    } else {
      const gsh = group("Screenshots");
      const wrap = el("div", "shots");
      for (let i = 0; i < 2; i++) wrap.appendChild(el("div", "shot", "NO SIGNAL"));
      gsh.appendChild(wrap);
      root.appendChild(gsh);
    }

    const ga = group("Architecture");
    textBlock(ga, p.architecture, "dim");
    root.appendChild(ga);

    const gl = group("Lessons Learned");
    textBlock(gl, p.lessons, "dim");
    root.appendChild(gl);
  };

  /* ---- SKILLS ---- */
  screens.skills = (root) => {
    BIOS.skills.groups.forEach((grp) => {
      const g = group(grp.title);
      grp.items.forEach((s) => {
        g.appendChild(row(s.label, s.level + "%", {
          bar: s.level,
          help: s.label + " — allocated " + s.level + "% of available resources."
        }));
      });
      root.appendChild(g);
    });
  };

  /* ---- SERVICES ---- */
  screens.services = (root) => {
    const g = group("Optional Subsystems");
    BIOS.services.items.forEach((s) => {
      g.appendChild(row(s.label, s.value, { flag: s.flag, help: s.note }));
    });
    root.appendChild(g);
  };

  /* ---- TECH STACK ---- */
  screens.stack = (root) => {
    BIOS.stack.groups.forEach((grp) => {
      const g = group(grp.title);
      grp.items.forEach((i) => g.appendChild(row(i, "Detected", { flag: "ok", help: i + " — in active use." })));
      root.appendChild(g);
    });
  };

  /* ---- EXPERIENCE ---- */
  screens.experience = (root) => {
    const g = group("Boot History");
    BIOS.experience.items.forEach((e) => {
      g.appendChild(row(e.year, e.title, { help: e.body }));
      const d = el("div", "tl");
      d.appendChild(el("p", "tl-body", esc(e.body)));
      g.appendChild(d);
    });
    root.appendChild(g);
  };

  /* ---- EDUCATION ---- */
  screens.education = (root) => {
    const g = group("Training Records");
    BIOS.education.rows.forEach((r) => g.appendChild(row(r.label, r.value, { flag: r.flag, help: "Education record." })));
    root.appendChild(g);

    const g2 = group("Coursework");
    tags(g2, BIOS.education.coursework);
    root.appendChild(g2);
  };

  /* ---- CERTIFICATES ---- */
  screens.certificates = (root) => {
    const g = group("Installed Credentials");
    BIOS.certificates.items.forEach((c) => g.appendChild(row(c.label, c.value, { flag: c.flag, help: c.note })));
    root.appendChild(g);
  };

  /* ---- RESUME ---- */
  screens.resume = (root) => {
    const g = group("Boot Device Configuration");
    BIOS.resume.rows.forEach((r) => g.appendChild(row(r.label, r.value, { flag: r.flag, help: "Boot device attribute." })));
    root.appendChild(g);

    const g2 = group("Actions");
    g2.appendChild(row("Download Resume.pdf", "Execute", {
      sub: true, help: "Download the résumé PDF. Shortcut: F2.",
      action: () => App.downloadResume()
    }));
    g2.appendChild(row("Print BIOS Résumé", "Execute", {
      sub: true, help: "Render the résumé as monochrome firmware output and open the print dialog.",
      action: () => App.printResume()
    }));
    root.appendChild(g2);
  };

  /* ---- CONTACT ---- */
  screens.contact = (root) => {
    const o = BIOS.owner;
    const targets = {
      mailto:   "mailto:" + o.email,
      github:   o.github,
      linkedin: o.linkedin
    };

    const g = group("Communication Ports");
    BIOS.contact.rows.forEach((r) => {
      g.appendChild(row(r.label, r.value, {
        flag: r.flag,
        sub: !!r.action,
        help: r.action ? "Press ENTER to open." : "Read-only.",
        action: r.action ? () => open(targets[r.action]) : null
      }));
    });
    root.appendChild(g);

    /* ---- message form (composes a mailto, no backend needed) ---- */
    const g2 = group("Send Message");
    const mk = (label, tag, name, ph) => {
      const f = el("div", "field");
      const id = "cf-" + name;
      const l  = el("label", null, esc(label));
      l.setAttribute("for", id);
      const input = document.createElement(tag);
      input.id = id; input.name = name; input.placeholder = ph;
      if (tag === "input") input.type = name === "email" ? "email" : "text";
      f.appendChild(l); f.appendChild(input);
      f.dataset.focusable = "1";
      f.__help = "Type your " + label.toLowerCase() + ". Press ENTER to move on.";
      f.__action = () => input.focus();
      f.__input = input;
      g2.appendChild(f);
      return input;
    };

    const fName = mk("Name",    "input",    "name",    "your name");
    const fMail = mk("Email",   "input",    "email",   "you@example.com");
    const fMsg  = mk("Message", "textarea", "message", "what do you want to build?");

    g2.appendChild(row("Send", "Execute", {
      sub: true, help: "Opens your mail client with the message pre-filled.",
      action: () => {
        if (!fMsg.value.trim()) { App.toast("ERROR: Message field is empty."); Beep.error(); return; }
        const subject = encodeURIComponent("Portfolio contact — " + (fName.value || "anonymous"));
        const body = encodeURIComponent(
          fMsg.value + "\n\n—\n" + (fName.value || "") + (fMail.value ? " <" + fMail.value + ">" : "")
        );
        window.location.href = "mailto:" + o.email + "?subject=" + subject + "&body=" + body;
        App.toast("Handing off to mail client...");
      }
    }));
    root.appendChild(g2);
  };

  /* ---- SETTINGS ---- */
  screens.settings = (root) => {
    const S = App.settings;

    const cycler = (key, values, labels) => () => {
      const i = values.indexOf(S[key]);
      App.setSetting(key, values[(i + 1) % values.length]);
      Nav.rerender(true);
    };

    const g = group("Display");
    g.appendChild(row("Theme", { classic: "Classic", modern: "Modern", contrast: "High Contrast" }[S.theme], {
      help: "Cycle: Classic (BIOS blue), Modern (dark), High Contrast. Press ENTER or +/-.",
      alter: cycler("theme", ["classic", "modern", "contrast"])
    }));
    g.appendChild(row("CRT Effect", S.crt ? "On" : "Off", {
      flag: S.crt ? "ok" : "dim",
      help: "Scanlines and screen vignette.",
      alter: cycler("crt", [true, false])
    }));
    g.appendChild(row("Flicker", S.flicker ? "On" : "Off", {
      flag: S.flicker ? "ok" : "dim",
      help: "Occasional CRT brightness flicker. Subtle.",
      alter: cycler("flicker", [true, false])
    }));
    root.appendChild(g);

    const g2 = group("System");
    g2.appendChild(row("Animation", S.anim ? "On" : "Off", {
      flag: S.anim ? "ok" : "dim",
      help: "Screen transitions and typing effects.",
      alter: cycler("anim", [true, false])
    }));
    g2.appendChild(row("Sound", S.sound ? "On" : "Off", {
      flag: S.sound ? "ok" : "dim",
      help: "PC-speaker beeps on navigation and boot.",
      alter: cycler("sound", [true, false])
    }));
    g2.appendChild(row("Language", "English", {
      flag: "dim", help: "Only English is installed in this build."
    }));
    root.appendChild(g2);

    const g3 = group("Maintenance");
    g3.appendChild(row("Load Setup Defaults", "Execute", {
      sub: true, help: "Restore all settings to factory values.",
      action: () => { App.resetSettings(); Nav.rerender(); App.toast("Setup defaults loaded."); }
    }));
    g3.appendChild(row("Reset Memory Counter", "Execute", {
      sub: true, help: "Clear the record of which sections you have visited.",
      action: () => { App.resetVisits(); App.toast("Memory counter cleared."); }
    }));
    root.appendChild(g3);
  };

  /* ---- EXIT ---- */
  screens.exit = (root) => {
    const g = group("Exit Options");
    g.appendChild(row("Save Changes and Exit", "Execute", {
      sub: true, help: "Downloads the résumé, then returns to the main screen.",
      action: () => App.confirmExit("save")
    }));
    g.appendChild(row("Discard Changes and Exit", "Execute", {
      sub: true, help: "Returns to the main screen without downloading anything.",
      action: () => App.confirmExit("discard")
    }));
    g.appendChild(row("Load Setup Defaults", "Execute", {
      sub: true, help: "Restore factory settings.",
      action: () => { App.resetSettings(); Nav.rerender(); App.toast("Setup defaults loaded."); }
    }));
    g.appendChild(row("Power Off", "Execute", {
      sub: true, help: "Shut the system down. You can always power it back on.",
      action: () => App.powerOff()
    }));
    root.appendChild(g);

    const g2 = group("Notes");
    textBlock(g2, "Nothing here is destructive. Exiting simply returns you to the Main screen — "
      + "this machine has no off switch that you cannot undo.", "dim");
    root.appendChild(g2);
  };

  /* ---- DEVELOPER MODE (hidden) ---- */
  screens.dev = (root) => {
    root.appendChild(el("pre", "ascii",
`  ____  _____ _   __  __  ___  ____  _____
 |  _ \\| ____| \\ / / |  \\/  |/ _ \\|  _ \\| ____|
 | | | |  _|  \\ V /  | |\\/| | | | | | | |  _|
 | |_| | |___  | |   | |  | | |_| | |_| | |___
 |____/|_____| |_|   |_|  |_|\\___/|____/|_____|`));

    const g = group("Unlocked");
    g.appendChild(row("Konami Code", "Accepted", { flag: "ok", help: "↑↑↓↓←→←→BA — you found it." }));
    g.appendChild(row("Access Level", "Ring 0", { help: "Full firmware access granted." }));
    g.appendChild(row("Sections Visited", App.visitCount() + " / " + Nav.tabCount(), { help: "How much of the machine you have explored." }));
    g.appendChild(row("Session Uptime", "", { live: "uptime", help: "Time spent in this session." }));
    g.appendChild(row("User Agent", navigator.userAgent.slice(0, 48) + "...", { flag: "dim", help: navigator.userAgent }));
    g.appendChild(row("Screen", window.innerWidth + "x" + window.innerHeight, { flag: "dim", help: "Viewport size." }));
    root.appendChild(g);

    const g2 = group("Debug");
    g2.appendChild(row("Dump Portfolio Data", "Execute", {
      sub: true, help: "Print the raw data object to the browser console.",
      action: () => { console.log(BIOS); App.toast("Data dumped to console. Press F12."); }
    }));
    g2.appendChild(row("Replay POST", "Execute", {
      sub: true, help: "Reboot the machine and watch the power-on self test again.",
      action: () => location.reload()
    }));
    g2.appendChild(row("Trigger Fatal Error", "Execute", {
      sub: true, help: "Purely cosmetic. Nothing actually breaks.",
      action: () => App.blueScreen()
    }));
    root.appendChild(g2);

    const g3 = group("Message");
    textBlock(g3, "If you got here with the Konami code, you are exactly the kind of person "
      + "I want to work with. Say hello — the Contact tab has the ports open.", "dim");
    root.appendChild(g3);
  };

  return { screens, row, group, el, esc, textBlock };
})();
