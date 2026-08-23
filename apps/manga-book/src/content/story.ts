/**
 * ────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU NEED TO EDIT TO MAKE THIS PORTFOLIO YOURS.
 * ────────────────────────────────────────────────────────────────
 *  Everything here is content. The renderers in src/pages/* turn
 *  each entry below into a hand-inked manga page on a canvas.
 *
 *  Pages are bound into SHEETS (front + back), so PAGES.length
 *  must stay EVEN. Add pages in pairs.
 *
 *  BINDING RULES (why the order looks the way it does):
 *    · even index  → right-hand page,  odd index → left-hand page
 *    · a spread is (odd, even): page 15 and 16 are seen together
 *    · so a chapter title page sits on an ODD index, and every
 *      chapter needs an ODD number of content pages after it
 *    · a project is a spread: story page on the odd index,
 *      evidence page on the even index right after it
 */

export const AUTHOR = {
  name: "Charitra Shrestha",
  role: "Full Stack Developer",
  volume: "01",
  title: "MY STORY",
  subtitle: "From Jhumka to Kathmandu",
  year: "2026",
  github: "https://github.com/charitraa",
  site: "https://www.charitrashrestha.com.np",
  linkedin: "linkedin.com/in/charitra-shrestha-78245b270",
  email: "code@charitrashrestha.com.np",
  position: "Founder",
  company: "Yaksha Soft",
  location: "Kathmandu, Nepal",
  publisher: "SHONEN DEV",
  isbn: "978-0-0000-0001-0",
  price: "FREE",
};

/* ── Panel grammar ───────────────────────────────────────────── */

export type ArtKind =
  | "none"
  | "hero" // manga bust of the protagonist
  | "laptop"
  | "desk"
  | "speedlines"
  | "sunburst"
  | "city"
  | "sparkle"
  | "door";

export type Bubble = {
  text: string;
  /** 0..1 within the panel */
  x: number;
  y: number;
  /** width as fraction of panel width */
  w: number;
  tail?: "bl" | "br" | "tl" | "tr" | "none";
  kind?: "speech" | "thought" | "shout";
};

export type Panel = {
  /** box in 0..1 of the page's content area */
  x: number;
  y: number;
  w: number;
  h: number;
  art?: ArtKind;
  /** halftone screentone density, 0..1 */
  tone?: number;
  /** narration box, top-left of the panel */
  caption?: string;
  bubbles?: Bubble[];
  sfx?: { text: string; x: number; y: number; rot?: number; size?: number };
};

export type Project = {
  name: string;
  tagline: string;
  arc: { label: string; body: string }[];
  stack: string[];
  results: string[];
  link: string;
  /** caption under the QR code on the evidence page */
  linkLabel?: string;
  note?: string;
};

export type Page =
  | { kind: "cover" }
  | { kind: "inside"; lines: string[]; sticky?: string }
  | { kind: "toc" }
  | {
      kind: "chapter";
      n: number;
      title: string;
      sub: string;
      jp: string;
      /** a colour plate: [top, bottom] duotone wash, the way a tankoubon
       *  prints its occasional colour insert. Use sparingly. */
      color?: [string, string];
    }
  | { kind: "panels"; head: string; panels: Panel[]; note?: string }
  | {
      kind: "skills";
      head: string;
      display?: string;
      sub?: string;
      note?: string;
      groups: { name: string; items: { name: string; level: number; tag: string }[] }[];
    }
  | { kind: "project"; side: "left" | "right"; p: Project }
  | {
      kind: "timeline";
      head: string;
      items: { year: string; title: string; body: string }[];
      note?: string;
    }
  | {
      kind: "equipment";
      head: string;
      display?: string;
      items: { slot: string; name: string; desc: string }[];
    }
  | {
      kind: "awards";
      head: string;
      display?: string;
      items: { title: string; body: string }[];
    }
  | { kind: "contact"; head: string; lines: string[] }
  | { kind: "end"; big?: string; sub?: string; kicker?: string }
  | { kind: "backcover" };

/* ── Boss fights ─────────────────────────────────────────────── */

const ADSMITRA: Project = {
  name: "AdsMitra",
  tagline: "An offline advertising marketplace for a market that still runs on phone calls.",
  arc: [
    {
      label: "THE CHALLENGE",
      body: "Offline advertising in Nepal is fragmented. Finding a hoarding board, a wall or a shutter means knowing somebody who knows somebody. Comparing prices means a week of phone calls. Managing the campaign afterwards means a notebook.",
    },
    {
      label: "THE PLAN",
      body: "One marketplace where a business can discover advertising spaces, compare them honestly, book them, and then manage the campaign in the same place. Not a directory — a transaction.",
    },
    {
      label: "THE FIGHT",
      body: "The hard part was never the code. It was convincing space owners who had run on trust and phone calls for twenty years that a listing page was worth their afternoon.",
    },
    {
      label: "THE RESULT",
      body: "A platform, and a company built around it. The build taught me software. AdsMitra taught me that distribution is a harder problem than deployment.",
    },
  ],
  stack: ["React", "Flutter", "Django REST", "PostgreSQL", "Linux"],
  results: [
    "Discover, compare, book, manage — in one place",
    "Built for a market that is still offline",
    "The reason Yaksha Soft exists",
  ],
  link: "https://www.charitrashrestha.com.np",
  linkLabel: "SCAN → MORE",
  note: "distribution > deployment",
};

const HISAB: Project = {
  name: "Hisab",
  tagline: "The money app that reads the bank SMS so you don't have to.",
  arc: [
    {
      label: "THE CHALLENGE",
      body: "In Nepal every payment already announces itself — eSewa, Khalti and the banks all send an SMS the second money moves. Expense apps still make you type it in again, so everybody quits by week two.",
    },
    {
      label: "THE PLAN",
      body: "A Flutter client that reads those alerts on the device and turns them into real transactions, with a Django REST backend for history, categories and sync. Manual entry stays — cash sends no SMS.",
    },
    {
      label: "THE FIGHT",
      body: "No two senders write an alert the same way. Amounts, balances and merchant names all move around. I built per-sender rules with a fallback that asks instead of guessing, because a wrong number is worse than a missing one.",
    },
    {
      label: "THE RESULT",
      body: "Open the app and the month is mostly already filled in. What is left is the part a machine genuinely cannot know: what the spending was for.",
    },
  ],
  stack: ["Flutter", "Dart", "Django REST", "Python", "SQLite"],
  results: [
    "SMS capture for eSewa, Khalti and bank alerts",
    "Manual entry kept for cash",
    "Client and server both open source",
  ],
  link: "https://github.com/charitraa/Hisab",
  note: "banks agree on nothing.",
};

const DJANGOPROBE: Project = {
  name: "DjangoProbe",
  tagline: "A test runner that finds your endpoints before your users do.",
  arc: [
    {
      label: "THE CHALLENGE",
      body: "Untested routes ship constantly — not because anyone is careless, but because writing the fiftieth piece of test boilerplate is the least interesting hour of the week.",
    },
    {
      label: "THE PLAN",
      body: "Walk the Django URL configuration, discover every endpoint the project actually exposes, then let AI draft intelligent test cases for each one instead of a human typing them.",
    },
    {
      label: "THE FIGHT",
      body: "Discovery is the easy half. Authentication, required payloads and endpoints with side effects are the hard half — a tool you point at a real project has to be safe to point at a real project.",
    },
    {
      label: "THE RESULT",
      body: "Point it at a Django codebase and get a running test pass over the API surface, including the routes nobody remembered were still there.",
    },
  ],
  stack: ["Python", "Django", "DRF", "AI", "CLI"],
  results: [
    "Automatic endpoint discovery",
    "Generated cases per route",
    "Runs against any Django project",
  ],
  link: "https://github.com/charitraa/DjangoProbe",
  note: "the forgotten routes are the scary ones",
};

const TRANSLATE: Project = {
  name: "EN ⇄ NE Live",
  tagline: "Two languages, one conversation, no waiting for a transcript.",
  arc: [
    {
      label: "THE CHALLENGE",
      body: "Nepali is a low-resource language. The tooling that exists is text-first and usually one-directional — fine for a document, useless for two people trying to actually talk.",
    },
    {
      label: "THE PLAN",
      body: "A full speech-to-speech pipeline in both directions: listen, transcribe, translate, speak — English to Nepali and Nepali to English, running in real time.",
    },
    {
      label: "THE FIGHT",
      body: "The whole project is a latency argument. Buffer long enough and the translation is accurate but the conversation is dead; buffer too little and you translate half a sentence. The tuning was the work.",
    },
    {
      label: "THE RESULT",
      body: "A conversation instead of a transcript — the thing you want when someone is standing in front of you.",
    },
  ],
  stack: ["Python", "Speech-to-Text", "Translation", "TTS"],
  results: [
    "Bidirectional English ⇄ Nepali",
    "Speech in, speech out",
    "Tuned for live conversation",
  ],
  link: "https://github.com/charitraa/Real-Time-English-Nepali-Bidirection-Speech-Translation",
  note: "latency is the whole product",
};

const SUGGIT: Project = {
  name: "suggit",
  tagline: 'A commit-message suggester, so nobody has to read "fix stuff" again.',
  arc: [
    {
      label: "THE CHALLENGE",
      body: "The commit message is the last thing you write and the first thing future-you reads. It loses that fight every single time.",
    },
    {
      label: "THE PLAN",
      body: "Read the staged diff, ask Gemini for a message, then pre-fill it in the prompt as editable text. Suggest, never dictate — you keep the last word.",
    },
    {
      label: "THE FIGHT",
      body: "A git hook that blocks on a network call is a tool people uninstall by Friday. So there is an offline fallback that still produces something honest when there is no key and no signal.",
    },
    {
      label: "THE RESULT",
      body: "A history you can actually read back, at the cost of zero extra keystrokes.",
    },
  ],
  stack: ["Python", "Google Gemini", "Git hooks", "CLI"],
  results: [
    "Pre-filled autocomplete, not a menu",
    "Offline fallback with no key",
    "Installs as a git hook",
  ],
  link: "https://github.com/charitraa/suggit",
  note: "never block a git hook on the network",
};

/* ── The volume ──────────────────────────────────────────────── */

export const PAGES: Page[] = [
  /* 0 */ { kind: "cover" },

  /* 1 */ {
    kind: "inside",
    lines: [
      "This is not a résumé.",
      "",
      "It is an autobiography, drawn as a manga —",
      "a boy from a small town in eastern Nepal,",
      "chasing a dream through code.",
      "",
      "Every project is a chapter.",
      "Every bug is a boss fight.",
      "",
      "Turn the pages by dragging a corner.",
    ],
  },

  /* 2 */ { kind: "toc" },

  /* ═══ VOL. 1 — THE BEGINNING ═══════════════════════════════ */

  /* 3 */ {
    kind: "chapter",
    n: 1,
    title: "A BOY FROM JHUMKA",
    sub: "where the story starts, and it starts small",
    jp: "第一話",
    color: ["#f2b76a", "#7c5aa8"],
  },
  /* 4 */ {
    kind: "panels",
    head: "CH. 1 — A BOY FROM JHUMKA",
    note: "home.",
    panels: [
      {
        x: 0,
        y: 0,
        w: 1,
        h: 0.32,
        art: "city",
        tone: 0.16,
        caption: "Jhumka, Sunsari. Eastern Nepal. A quiet town, a long way from anywhere.",
        bubbles: [
          { text: "Nothing happens here.", x: 0.66, y: 0.26, w: 0.3, tail: "bl", kind: "thought" },
        ],
      },
      {
        x: 0.52,
        y: 0.34,
        w: 0.48,
        h: 0.28,
        art: "desk",
        tone: 0.2,
        caption: "A middle-class house. No luxury, no shortcuts.",
        bubbles: [
          {
            text: "Study.\nThat is the one thing\nnobody can take from you.",
            x: 0.5,
            y: 0.52,
            w: 0.86,
            tail: "tl",
          },
        ],
      },
      {
        x: 0,
        y: 0.34,
        w: 0.48,
        h: 0.28,
        art: "sparkle",
        tone: 0.14,
        caption: "Every broken thing in the house ended up on this table.",
        bubbles: [
          { text: "...but WHY\ndoes it work?", x: 0.52, y: 0.56, w: 0.42, tail: "br", kind: "thought" },
        ],
      },
      {
        x: 0,
        y: 0.64,
        w: 1,
        h: 0.36,
        art: "sunburst",
        tone: 0.28,
        sfx: { text: "カチッ", x: 0.22, y: 0.78, rot: -7, size: 54 },
        bubbles: [
          {
            text: "Maybe one day...\nI'll build something\npeople actually use.",
            x: 0.58,
            y: 0.3,
            w: 0.4,
            tail: "bl",
          },
        ],
      },
    ],
  },

  /* ═══ VOL. 2 — THE DREAM BEGINS ════════════════════════════ */

  /* 5 */ {
    kind: "chapter",
    n: 2,
    title: "SCHOOL DAYS",
    sub: "football, exams, and one afternoon that mattered",
    jp: "第二話",
  },
  /* 6 */ {
    kind: "panels",
    head: "CH. 2 — SCHOOL DAYS",
    note: "still play. still lose.",
    panels: [
      {
        x: 0.5,
        y: 0,
        w: 0.5,
        h: 0.3,
        art: "sunburst",
        tone: 0.24,
        sfx: { text: "ドドド", x: 0.5, y: 0.8, rot: -6, size: 48 },
        bubbles: [
          { text: "Sagar Matha School.\nFootball first,\nhomework later.", x: 0.5, y: 0.24, w: 0.82, tail: "none" },
        ],
      },
      {
        x: 0,
        y: 0,
        w: 0.48,
        h: 0.3,
        art: "desk",
        tone: 0.18,
        caption: "Then exams. Then textbooks until the lamp got hot.",
      },
      {
        x: 0,
        y: 0.32,
        w: 1,
        h: 0.32,
        art: "laptop",
        tone: 0.22,
        caption: "Then, one afternoon: computer class.",
        bubbles: [
          {
            text: "Everyone else finished\nthe assignment and left.",
            x: 0.68,
            y: 0.24,
            w: 0.34,
            tail: "bl",
          },
        ],
      },
      {
        x: 0,
        y: 0.66,
        w: 1,
        h: 0.34,
        art: "sparkle",
        tone: 0.3,
        sfx: { text: "カタカタ", x: 0.22, y: 0.8, rot: -5, size: 44 },
        bubbles: [
          {
            text: "I don't want it to work.\nI want to know\nWHY it works.",
            x: 0.6,
            y: 0.32,
            w: 0.4,
            tail: "bl",
            kind: "thought",
          },
        ],
      },
    ],
  },

  /* ═══ VOL. 3 — THE CROSSROADS ══════════════════════════════ */

  /* 7 */ {
    kind: "chapter",
    n: 3,
    title: "THE CROSSROADS",
    sub: "which road should I choose?",
    jp: "第三話",
  },
  /* 8 */ {
    kind: "panels",
    head: "CH. 3 — THE CROSSROADS",
    note: "everyone had a plan.",
    panels: [
      {
        x: 0,
        y: 0,
        w: 1,
        h: 0.32,
        art: "door",
        tone: 0.2,
        caption: "After +2 at Koshi College, every friend had a different plan.",
        bubbles: [
          { text: "Government job.", x: 0.2, y: 0.34, w: 0.26, tail: "br" },
          { text: "Business.", x: 0.52, y: 0.6, w: 0.2, tail: "tl" },
          { text: "Abroad.", x: 0.82, y: 0.32, w: 0.2, tail: "bl" },
        ],
      },
      {
        x: 0.52,
        y: 0.34,
        w: 0.48,
        h: 0.28,
        art: "hero",
        tone: 0.22,
        bubbles: [
          { text: "I wanted abroad too.\nI won't pretend\notherwise.", x: 0.5, y: 0.24, w: 0.82, tail: "none", kind: "thought" },
        ],
      },
      {
        x: 0,
        y: 0.34,
        w: 0.48,
        h: 0.28,
        art: "speedlines",
        tone: 0.34,
        caption: "But life does not always follow the first plan.",
      },
      {
        x: 0,
        y: 0.64,
        w: 1,
        h: 0.36,
        art: "city",
        tone: 0.24,
        sfx: { text: "ドン", x: 0.2, y: 0.76, rot: -8, size: 72 },
        caption: "Kathmandu. PCPS College. A University of Bedfordshire degree.",
        bubbles: [
          {
            text: "Then I'll build\nthe future here.",
            x: 0.62,
            y: 0.3,
            w: 0.36,
            tail: "bl",
            kind: "shout",
          },
        ],
      },
    ],
  },

  /* ═══ VOL. 4 — LEVEL UP ════════════════════════════════════ */

  /* 9 */ {
    kind: "chapter",
    n: 4,
    title: "LEVEL UP",
    sub: "the city of opportunities, and the grind that came with it",
    jp: "第四話",
  },
  /* 10 */ {
    kind: "panels",
    head: "CH. 4 — LEVEL UP",
    note: "the RPG arc",
    panels: [
      {
        x: 0,
        y: 0,
        w: 1,
        h: 0.3,
        art: "city",
        tone: 0.2,
        caption: "Kathmandu was not easy. New city, new people, new competition.",
        bubbles: [
          { text: "Everyone here\nis good.", x: 0.7, y: 0.3, w: 0.28, tail: "bl", kind: "thought" },
        ],
      },
      {
        x: 0.52,
        y: 0.32,
        w: 0.48,
        h: 0.28,
        art: "laptop",
        tone: 0.18,
        caption: "So every assignment became a rep.",
        bubbles: [
          { text: "Ship it, then\nread why it worked.", x: 0.5, y: 0.56, w: 0.84, tail: "tl" },
        ],
      },
      {
        x: 0,
        y: 0.32,
        w: 0.48,
        h: 0.28,
        art: "desk",
        tone: 0.16,
        bubbles: [
          {
            text: "Django.\nReact.\nFlutter.\nLinux.",
            x: 0.5,
            y: 0.42,
            w: 0.6,
            tail: "none",
            kind: "thought",
          },
        ],
      },
      {
        x: 0,
        y: 0.62,
        w: 1,
        h: 0.38,
        art: "sunburst",
        tone: 0.4,
        sfx: { text: "LEVEL UP", x: 0.34, y: 0.74, rot: -7, size: 66 },
        bubbles: [
          {
            text: "SKILL UNLOCKED:\nCYBERSECURITY",
            x: 0.68,
            y: 0.28,
            w: 0.38,
            tail: "bl",
            kind: "shout",
          },
        ],
      },
    ],
  },

  /* ═══ VOL. 5 — THE DEVELOPER ARC ═══════════════════════════ */

  /* 11 */ {
    kind: "chapter",
    n: 5,
    title: "THE DEVELOPER ARC",
    sub: "writing code that matters, and breaking it first",
    jp: "第五話",
  },
  /* 12 */ {
    kind: "panels",
    head: "CH. 5 — THE DEVELOPER ARC",
    note: "it worked locally!!",
    panels: [
      {
        x: 0,
        y: 0,
        w: 1,
        h: 0.3,
        art: "desk",
        tone: 0.2,
        caption: "Internships. Freelance. Deadlines that did not care how I felt.",
        bubbles: [
          { text: "It worked on\nmy machine.", x: 0.72, y: 0.3, w: 0.26, tail: "bl" },
        ],
      },
      {
        x: 0.52,
        y: 0.32,
        w: 0.48,
        h: 0.3,
        art: "speedlines",
        tone: 0.42,
        sfx: { text: "ドォン", x: 0.5, y: 0.78, rot: -8, size: 58 },
        bubbles: [
          { text: "500\nINTERNAL SERVER\nERROR", x: 0.5, y: 0.3, w: 0.84, tail: "none", kind: "shout" },
        ],
      },
      {
        x: 0,
        y: 0.32,
        w: 0.48,
        h: 0.3,
        art: "laptop",
        tone: 0.18,
        bubbles: [
          { text: "Merge conflict.\nOn a Friday.", x: 0.5, y: 0.44, w: 0.78, tail: "none", kind: "thought" },
        ],
      },
      {
        x: 0,
        y: 0.64,
        w: 1,
        h: 0.36,
        art: "sparkle",
        tone: 0.24,
        caption: "One bug fixed. Another appeared. Giving up was never on the list.",
        bubbles: [
          { text: "Again.", x: 0.24, y: 0.42, w: 0.18, tail: "br" },
          { text: "Every failure is\njust the next lesson\narriving early.", x: 0.68, y: 0.3, w: 0.36, tail: "bl" },
        ],
      },
    ],
  },
  /* 13 */ {
    kind: "awards",
    head: "CH. 5 — THE DEVELOPER ARC",
    display: "BOSS BATTLES",
    items: [
      {
        title: "THE MIDNIGHT BUG",
        body: "Reproduces only in production, only for one user, only sometimes. Beaten by logging everything and admitting the assumption was wrong.",
      },
      {
        title: "THE DEADLINE",
        body: "Immune to effort, weak to scope. Learned to negotiate what ships rather than promise everything and deliver it badly.",
      },
      {
        title: "THE MERGE CONFLICT",
        body: "Appears on Friday evening, always in the file everyone touched. Beaten by smaller commits and branches that do not live for a month.",
      },
      {
        title: "THE INTERVIEW",
        body: "Asks about algorithms you last saw in a lecture hall. Beaten by explaining how you actually think instead of performing certainty.",
      },
      {
        title: "THE FIRST DEPLOY",
        body: "Nothing teaches you about environments like watching a build succeed locally and fail on the server in front of everyone.",
      },
      {
        title: "THE IMPOSTER",
        body: "The recurring boss. Comes back every time the difficulty rises, which means it usually shows up right before something good happens.",
      },
    ],
  },
  /* 14 */ {
    kind: "timeline",
    head: "CH. 5 — THE DEVELOPER ARC",
    note: "quests completed → git log",
    items: [
      {
        year: "git init",
        title: "Quest accepted",
        body: "Every project begins with the same four characters and an empty folder. The first commit is always the hardest one, because it is the one that admits you are going to try.",
      },
      {
        year: "+1204 −38",
        title: "The refactor quest",
        body: "Deleting more than you add is the day you stop being a beginner. Half of getting good is learning which code was never load-bearing.",
      },
      {
        year: "git revert",
        title: "The humbling",
        body: "Shipped it, broke it, rolled it back, read the diff, understood it properly, shipped it again. This is the loop. There is no shortcut past it.",
      },
      {
        year: "merged",
        title: "Quest completed",
        body: "Somebody else's branch, somebody else's review, and your name in the history of a thing that is bigger than you. Then the next issue opens.",
      },
    ],
  },

  /* ═══ VOL. 6 — BUILDERS DON'T JUST BUILD APPS ══════════════ */

  /* 15 */ {
    kind: "chapter",
    n: 6,
    title: "BUILDING ADSMITRA",
    sub: "builders don't just build apps",
    jp: "第六話",
    color: ["#7fc7d9", "#c8412f"],
  },
  /* 16 */ {
    kind: "panels",
    head: "CH. 6 — BUILDING ADSMITRA",
    note: "the map didn't exist.",
    panels: [
      {
        x: 0,
        y: 0,
        w: 1,
        h: 0.32,
        art: "city",
        tone: 0.2,
        caption: "Kathmandu. Every wall, shutter and hoarding board is advertising space.",
        bubbles: [
          { text: "Who owns\nthat one?", x: 0.74, y: 0.3, w: 0.24, tail: "bl" },
        ],
      },
      {
        x: 0.52,
        y: 0.34,
        w: 0.48,
        h: 0.28,
        art: "desk",
        tone: 0.18,
        caption: "Nobody could say. Not the price, not the dates, not who to call.",
      },
      {
        x: 0,
        y: 0.34,
        w: 0.48,
        h: 0.28,
        art: "sparkle",
        tone: 0.16,
        bubbles: [
          {
            text: "So the market\nalready exists.\nIt just has no map.",
            x: 0.5,
            y: 0.44,
            w: 0.82,
            tail: "none",
            kind: "thought",
          },
        ],
      },
      {
        x: 0,
        y: 0.64,
        w: 1,
        h: 0.36,
        art: "sunburst",
        tone: 0.36,
        sfx: { text: "ドン", x: 0.24, y: 0.76, rot: -8, size: 74 },
        bubbles: [
          {
            text: "Then we\nbuild the map.",
            x: 0.64,
            y: 0.3,
            w: 0.34,
            tail: "bl",
            kind: "shout",
          },
        ],
      },
    ],
  },
  /* 17 */ { kind: "project", side: "left", p: ADSMITRA },
  /* 18 */ { kind: "project", side: "right", p: ADSMITRA },

  /* ═══ VOL. 7 — THE ENTREPRENEUR ARC ════════════════════════ */

  /* 19 */ {
    kind: "chapter",
    n: 7,
    title: "STARTUP JOURNEY",
    sub: "the arc where the hard part stopped being code",
    jp: "第七話",
  },
  /* 20 */ {
    kind: "panels",
    head: "CH. 7 — STARTUP JOURNEY",
    note: "listen more than you speak",
    panels: [
      {
        x: 0,
        y: 0,
        w: 1,
        h: 0.26,
        art: "door",
        tone: 0.2,
        caption: "The next challenge was not the code. It was a room with people in it.",
        bubbles: [
          { text: "Pitching is just\ndebugging a stranger's\ndoubts.", x: 0.66, y: 0.34, w: 0.34, tail: "bl", kind: "thought" },
        ],
      },
      {
        x: 0.52,
        y: 0.28,
        w: 0.48,
        h: 0.24,
        art: "hero",
        tone: 0.22,
        bubbles: [
          { text: "So — what problem\ndoes this actually solve?", x: 0.5, y: 0.3, w: 0.88, tail: "none" },
        ],
      },
      {
        x: 0,
        y: 0.28,
        w: 0.48,
        h: 0.24,
        art: "none",
        tone: 0.5,
        caption: "Sometimes the answer was:",
        bubbles: [
          { text: "No.", x: 0.52, y: 0.6, w: 0.26, tail: "tl", kind: "shout" },
        ],
      },
      {
        x: 0,
        y: 0.54,
        w: 1,
        h: 0.2,
        art: "speedlines",
        tone: 0.3,
        caption: "Sometimes: 'come back later.' Every rejection added another page.",
      },
      {
        x: 0,
        y: 0.76,
        w: 1,
        h: 0.24,
        art: "sunburst",
        tone: 0.34,
        sfx: { text: "バン", x: 0.22, y: 0.7, rot: -9, size: 62 },
        caption: "January 2026.",
        bubbles: [
          { text: "Yaksha Soft.\nFounder.", x: 0.66, y: 0.4, w: 0.32, tail: "bl", kind: "shout" },
        ],
      },
    ],
  },

  /* ═══ VOL. 8 — THE PROJECTS ════════════════════════════════ */

  /* 21 */ {
    kind: "chapter",
    n: 8,
    title: "PROJECTS",
    sub: "four more boss fights, and the side quests between them",
    jp: "第八話",
  },
  /* 22 */ {
    kind: "timeline",
    head: "CH. 8 — PROJECTS",
    note: "in order of difficulty",
    items: [
      {
        year: "BOSS 01",
        title: "Hisab",
        body: "An expense tracker that reads Nepali payment SMS, so nobody has to type their own life into a form to find out where the money went.",
      },
      {
        year: "BOSS 02",
        title: "DjangoProbe",
        body: "An AI test runner that discovers a Django project's endpoints and writes the test cases nobody wanted to write.",
      },
      {
        year: "BOSS 03",
        title: "EN ⇄ NE Live",
        body: "Real-time speech-to-speech translation between English and Nepali, both directions, at conversation speed rather than transcript speed.",
      },
      {
        year: "BOSS 04",
        title: "suggit",
        body: "A git commit-message suggester with a pre-filled prompt and an offline fallback for when there is no key and no signal.",
      },
    ],
  },
  /* 23 */ { kind: "project", side: "left", p: HISAB },
  /* 24 */ { kind: "project", side: "right", p: HISAB },
  /* 25 */ { kind: "project", side: "left", p: DJANGOPROBE },
  /* 26 */ { kind: "project", side: "right", p: DJANGOPROBE },
  /* 27 */ { kind: "project", side: "left", p: TRANSLATE },
  /* 28 */ { kind: "project", side: "right", p: TRANSLATE },
  /* 29 */ { kind: "project", side: "left", p: SUGGIT },
  /* 30 */ { kind: "project", side: "right", p: SUGGIT },
  /* 31 */ {
    kind: "awards",
    head: "CH. 8 — PROJECTS",
    display: "SIDE QUESTS",
    items: [
      {
        title: "CONSTRUCTION MANAGEMENT",
        body: "A full-stack system for a genuinely unglamorous industry — React 18 and TypeScript on the front, a Django REST API underneath, built around how the work actually gets scheduled.",
      },
      {
        title: "HEARTGAME",
        body: "A real-time multiplayer card game. React, TypeScript and Vite for the table, Django REST for the rules — because a card game is a state machine that four people argue with at once.",
      },
      {
        title: "VIDEOMASTER",
        body: "One downloader for YouTube, TikTok, Instagram, X, Facebook and Reddit, instead of six sketchy sites with nine buttons that all say DOWNLOAD.",
      },
      {
        title: "HEALTH ML BACKENDS",
        body: "Django services behind deep-learning models — hair-fall and scalp analysis, skin lesion screening, plant identification. The model is the easy part; the API around it is the project.",
      },
      {
        title: "QR ATTENDANCE",
        body: "Roll call taken with a camera instead of a clipboard. A small Django service that removed ten minutes from somebody's every single morning.",
      },
      {
        title: "MINDFUL BLOG",
        body: "Django and React, with rich text, comments and sessions — all the parts everyone assumes are solved until the day they build one themselves.",
      },
    ],
  },
  /* 32 */ {
    kind: "awards",
    head: "CH. 8 — PROJECTS",
    display: "ACHIEVEMENTS",
    items: [
      {
        title: "FIRST CLASS DEGREE",
        body: "BE Computer Software Engineering, University of Bedfordshire at PCPS College, 2023–2025. Finished with First Class while already working full-time.",
      },
      {
        title: "FOUNDED A COMPANY",
        body: "Yaksha Soft, January 2026, Kathmandu. The arc where the boss fights stopped being technical and started being conversations.",
      },
      {
        title: "HIRED BEFORE GRADUATION",
        body: "Two internships in 2024 turned into a full-time Junior Software Developer role that ran a year and five months — while the degree was still in progress.",
      },
      {
        title: "SHIPPED TO REAL USERS",
        body: "Flutter and React applications carrying live maps, location tracking and real payments through Khalti and eSewa. Money moving is the strictest code review there is.",
      },
      {
        title: "OPEN SOURCE",
        body: "Public repositories anyone can read, clone and break — suggit, DjangoProbe, Hisab and the rest. Knowledge kept private stops compounding.",
      },
      {
        title: "MENTORING",
        body: "Walking people through their first deploy, their first merge conflict, their first production mistake. Nobody was born knowing this.",
      },
    ],
  },

  /* ═══ VOL. 9 — SKILLS ══════════════════════════════════════ */

  /* 33 */ {
    kind: "chapter",
    n: 9,
    title: "SKILLS",
    sub: "the status screen, honestly filled in",
    jp: "第九話",
  },
  /* 34 */ {
    kind: "skills",
    head: "CH. 9 — SKILLS",
    display: "STATUS",
    sub: "training log — updated continuously",
    note: "levels = how often I reach for it, not a certificate",
    groups: [
      {
        name: "LANGUAGES",
        items: [
          { name: "TypeScript", level: 0.9, tag: "MASTERED" },
          { name: "Python", level: 0.88, tag: "MASTERED" },
          { name: "JavaScript", level: 0.86, tag: "LEVEL UP!" },
          { name: "Dart", level: 0.76, tag: "TRAINED" },
        ],
      },
      {
        name: "FRONTEND",
        items: [
          { name: "React", level: 0.87, tag: "MASTERED" },
          { name: "HTML5 / CSS3", level: 0.85, tag: "LEVEL UP!" },
          { name: "Tailwind", level: 0.78, tag: "TRAINED" },
          { name: "Bootstrap", level: 0.74, tag: "TRAINED" },
        ],
      },
      {
        name: "MOBILE",
        items: [
          { name: "Flutter", level: 0.85, tag: "MASTERED" },
          { name: "Provider", level: 0.8, tag: "LEVEL UP!" },
          { name: "Kotlin", level: 0.62, tag: "UNLOCKED" },
        ],
      },
    ],
  },
  /* 35 */ {
    kind: "skills",
    head: "CH. 9 — SKILLS",
    display: "STATUS II",
    sub: "the half of the stack nobody screenshots",
    note: "web security is the hobby that keeps becoming the job",
    groups: [
      {
        name: "BACKEND",
        items: [
          { name: "Django / DRF", level: 0.9, tag: "MASTERED" },
          { name: "Express.js", level: 0.78, tag: "TRAINED" },
          { name: "Node.js", level: 0.76, tag: "TRAINED" },
          { name: "PHP", level: 0.6, tag: "UNLOCKED" },
        ],
      },
      {
        name: "DATA",
        items: [
          { name: "MySQL", level: 0.82, tag: "LEVEL UP!" },
          { name: "MongoDB", level: 0.74, tag: "TRAINED" },
          { name: "SQLite", level: 0.8, tag: "TRAINED" },
        ],
      },
      {
        name: "THE FIELD",
        items: [
          { name: "Git", level: 0.88, tag: "MASTERED" },
          { name: "Linux", level: 0.82, tag: "LEVEL UP!" },
          { name: "Kali / websec", level: 0.7, tag: "TRAINED" },
          { name: "WordPress", level: 0.65, tag: "UNLOCKED" },
        ],
      },
    ],
  },
  /* 36 */ {
    kind: "equipment",
    head: "CH. 9 — SKILLS",
    display: "LOADOUT",
    items: [
      { slot: "SWORD", name: "React", desc: "Fast, precise, cuts an interface into parts you can name." },
      { slot: "SHIELD", name: "Django", desc: "Holds the line. Batteries and armour already included." },
      { slot: "ARMOUR", name: "TypeScript", desc: "Worn daily. Catches the mistake before the user does." },
      { slot: "BOOTS", name: "Flutter", desc: "One codebase, both platforms, quick on the ground." },
      { slot: "SCROLL", name: "MySQL", desc: "Exact, ancient, remembers what everyone else forgot." },
      { slot: "COMPASS", name: "Git", desc: "How you find your way back when a branch goes wrong." },
      { slot: "LANTERN", name: "Kali Linux", desc: "For reading my own work the way an attacker would." },
      { slot: "POTION", name: "VS Code", desc: "Cheap, everywhere, configured the same on every machine." },
    ],
  },

  /* ═══ VOL. 10 — EXPERIENCE ═════════════════════════════════ */

  /* 37 */ {
    kind: "chapter",
    n: 10,
    title: "EXPERIENCE",
    sub: "the paper trail — where I worked, where I studied",
    jp: "第十話",
  },
  /* 38 */ {
    kind: "timeline",
    head: "CH. 10 — EXPERIENCE",
    note: "scope first, promise second",
    items: [
      {
        year: "MAY 2024",
        title: "PCPS College — Intern",
        body: "Four months in Lalitpur: cross-platform Flutter apps, React.js frontends wired to PHP backends over REST, plus internal tools and WordPress sites. Also my first sprint planning, my first standup, and my first code review with my name on it.",
      },
      {
        year: "AUG 2024",
        title: "CodSoft — Web Developer, Intern",
        body: "Two months, fully remote: React.js on the front, Django REST Framework behind it. Building to a brief written by somebody I had never met in person is its own separate skill.",
      },
      {
        year: "AUG 2024",
        title: "LBEF Campus — Junior Software Developer",
        body: "A year and five months full-time in Kathmandu, shipping Flutter and React to people who were counting on it. The next page is what came out of it.",
      },
      {
        year: "JAN 2026",
        title: "Yaksha Soft — Founder",
        body: "Full-time, on-site, Kathmandu. React and Flutter, plus everything else that comes with running the place: the pitch, the pricing, the payroll and the promise.",
      },
    ],
  },
  /* 39 */ {
    kind: "awards",
    head: "CH. 10 — EXPERIENCE",
    display: "ON THE JOB",
    items: [
      {
        title: "FLUTTER IN PRODUCTION",
        body: "Cross-platform apps with Provider holding the state together. One codebase, two platforms, and state that stays honest once the widget tree gets deep enough to hide in.",
      },
      {
        title: "REST ON BOTH ENDS",
        body: "Integrating APIs to fetch and manage dynamic data, then building the responsive components that render it — on mobile and on web, from the same contract.",
      },
      {
        title: "MAPS THAT KNOW WHERE YOU ARE",
        body: "Live location tracking, place search and map views through the Flutter Google Maps plugins. Permissions, accuracy and battery are one problem in three costumes.",
      },
      {
        title: "TAKING REAL MONEY",
        body: "Khalti and eSewa integrated as payment gateways. Nothing sharpens error handling like a flow whose failure case costs somebody actual rupees.",
      },
      {
        title: "REACT + TYPESCRIPT",
        body: "Web work where clean architecture and usability were the requirements, not the closing slide. Types are the cheapest code review you will ever get.",
      },
      {
        title: "AGILE, ACTUALLY",
        body: "Sprint planning, daily standups, code review and Git in a team that had to agree with each other. The ceremonies matter less than saying when you are stuck.",
      },
    ],
  },
  /* 40 */ {
    kind: "timeline",
    head: "CH. 10 — EXPERIENCE",
    note: "the library was the real classroom",
    items: [
      {
        year: "2007 – 2020",
        title: "SLC — Sagar Matha",
        body: "Unique Sagarmatha Education Academy, Jhumka. Grade A+. Thirteen years of school, and somewhere in the middle of them the computer lab stopped being a room I was sent to and became the one I stayed in.",
      },
      {
        year: "2021 – 2022",
        title: "+2 Computer Science",
        body: "Koshi St. James College. Grade B+. The first time the subject on the timetable matched the thing I was already doing at home after everyone else had gone to bed.",
      },
      {
        year: "2023 – 2025",
        title: "BE Computer Software Engineering",
        body: "University of Bedfordshire, studied at PCPS College, Kathmandu. First Class Degree. Algorithms, operating systems, databases and networks — the four subjects that quietly keep paying rent years after the exam.",
      },
    ],
  },

  /* ═══ VOL. 11 — THE NEVER-ENDING ARC ═══════════════════════ */

  /* 41 */ {
    kind: "chapter",
    n: 11,
    title: "THE NEVER-ENDING ARC",
    sub: "technology never stops. neither do I.",
    jp: "第十一話",
    color: ["#8fd0a8", "#3b5ca8"],
  },
  /* 42 */ {
    kind: "panels",
    head: "CH. 11 — THE NEVER-ENDING ARC",
    note: "next mountain →",
    panels: [
      {
        x: 0,
        y: 0,
        w: 1,
        h: 0.3,
        art: "sunburst",
        tone: 0.24,
        caption: "Every new technology is another mountain that appeared overnight.",
        bubbles: [
          { text: "Good.", x: 0.74, y: 0.32, w: 0.2, tail: "bl" },
        ],
      },
      {
        x: 0.52,
        y: 0.32,
        w: 0.48,
        h: 0.28,
        art: "sparkle",
        tone: 0.2,
        bubbles: [
          {
            text: "Artificial Intelligence.\nThree.js.\nSystem design.",
            x: 0.5,
            y: 0.36,
            w: 0.86,
            tail: "none",
          },
        ],
      },
      {
        x: 0,
        y: 0.32,
        w: 0.48,
        h: 0.28,
        art: "laptop",
        tone: 0.18,
        bubbles: [
          {
            text: "Cybersecurity.\nOpen source.\nThe next thing\nafter those.",
            x: 0.5,
            y: 0.4,
            w: 0.8,
            tail: "none",
          },
        ],
      },
      {
        x: 0,
        y: 0.62,
        w: 1,
        h: 0.38,
        art: "door",
        tone: 0.26,
        sfx: { text: "つづく", x: 0.24, y: 0.76, rot: -6, size: 58 },
        caption: "Still studying. Still building. Still failing. Still improving.",
        bubbles: [
          {
            text: "Dreaming bigger\nthan yesterday.",
            x: 0.66,
            y: 0.3,
            w: 0.34,
            tail: "bl",
            kind: "shout",
          },
        ],
      },
    ],
  },

  /* ═══ FINAL — CONTACT ══════════════════════════════════════ */

  /* 43 */ {
    kind: "chapter",
    n: 12,
    title: "CONTACT",
    sub: "the page where you get to write the next line",
    jp: "最終話",
  },
  /* 44 */ {
    kind: "contact",
    head: "CH. 12 — CONTACT",
    lines: [
      "Thanks for reading this far.",
      "",
      "If you have something worth building —",
      "a product, a problem, or a mess that needs untangling —",
      "I would like to hear about it.",
      "",
      "Open to work, collaboration and the kind of idea",
      "that sounds slightly too big at the start.",
    ],
  },

  /* 45 */ {
    kind: "end",
    big: "TO BE CONTINUED",
    sub: "the story isn't finished",
    kicker: "NEXT CHAPTER LOADING...",
  },
  /* 46 */ {
    kind: "inside",
    sticky: "vol. 02 is being written in a branch somewhere",
    lines: [
      "STAFF",
      "",
      `Story & art — ${AUTHOR.name}`,
      "Lettering — Bangers, Zen Maru Gothic, Caveat",
      "Inking — HTML canvas, by hand, page by page",
      "Binding — React Three Fiber",
      "",
      "No page in this volume is an image file.",
      "Every panel is drawn at runtime.",
      "",
      "Thank you for reading.",
    ],
  },
  /* 47 */ { kind: "backcover" },
];

if (PAGES.length % 2 !== 0) {
  throw new Error(
    `PAGES must be an even number (front + back of each sheet). Got ${PAGES.length}.`
  );
}

/* ── Derived: chapter index for the TOC and the chapter picker ── */

export type ChapterEntry = {
  n: number;
  title: string;
  /** index into PAGES */
  pageIndex: number;
  /** printed folio number */
  folio: number;
};

/** The cover and inside cover carry no printed number. */
export const FIRST_NUMBERED_PAGE = 2;

export const folioFor = (pageIndex: number) =>
  pageIndex < FIRST_NUMBERED_PAGE ? 0 : pageIndex - FIRST_NUMBERED_PAGE + 1;

export const CHAPTERS: ChapterEntry[] = PAGES.flatMap((p, i) =>
  p.kind === "chapter"
    ? [{ n: p.n, title: p.title, pageIndex: i, folio: folioFor(i) }]
    : []
);

/** Sheets: turning to sheet N means N sheets lie on the left. */
export const SHEET_COUNT = PAGES.length / 2;

/** Which sheet must be turned for `pageIndex` to be visible. */
export const sheetForPage = (pageIndex: number) => Math.ceil(pageIndex / 2);
