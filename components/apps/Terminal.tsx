"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { apps, type AppId } from "@/lib/apps";
import { useWM } from "@/lib/store";
import { setAppearance, toggleAppearance } from "@/lib/theme";
import { isWallpaper, wallpapers } from "@/lib/wallpapers";
import { experiences, profile, projects, skills, stats } from "@/data/portfolio";

type Seg = { t: string; c?: "accent" | "dim" | "good" | "err" | "blue" | "bold"; href?: string };
type Line = { id: number; segs: Seg[] };

const PROMPT = "visitor@zilen ~ %";
const FILES = ["about.md", "contact.txt", "resume.pdf", "projects/"];
const appNames = Object.keys(apps) as AppId[];

const commands: Record<string, { desc: string; args?: () => string[] }> = {
  help: { desc: "list commands" },
  about: { desc: "who I am" },
  projects: { desc: "list projects" },
  project: { desc: "details of one project, e.g. project erp-atlas", args: () => projects.map((p) => p.id) },
  skills: { desc: "tech I work with" },
  experience: { desc: "where I've worked" },
  stats: { desc: "the numbers" },
  contact: { desc: "how to reach me" },
  resume: { desc: "open my resume" },
  open: { desc: "open an app, e.g. open finder", args: () => appNames },
  ls: { desc: "list files" },
  cat: { desc: "print a file, e.g. cat about.md", args: () => FILES.filter((f) => !f.endsWith("/")) },
  theme: { desc: "switch appearance: theme light | dark", args: () => ["light", "dark"] },
  wallpaper: { desc: "change wallpaper, e.g. wallpaper hills", args: () => wallpapers.map((w) => w.id) },
  history: { desc: "commands you've run" },
  clear: { desc: "clear the screen (Ctrl+L)" },
  exit: { desc: "close Terminal" },
};

let nextId = 0;
const L = (...segs: (Seg | string)[]): Line => ({ id: nextId++, segs: segs.map((s) => (typeof s === "string" ? { t: s } : s)) });
const blank = () => L("");

function commonPrefix(xs: string[]) {
  if (!xs.length) return "";
  let p = xs[0];
  for (const x of xs) while (!x.startsWith(p)) p = p.slice(0, -1);
  return p;
}

export default function Terminal() {
  const { open, close } = useWM.getState();
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<Line[]>([]);
  const queue = useRef<Line[]>([]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // Output reveals line by line, which reads like it's being typed. Instant with reduced motion.
  const print = (lines: Line[]) => {
    if (reduce) setShown((s) => [...s, ...lines]);
    else queue.current.push(...lines);
  };

  // Show anything still queued, then these lines, so output never interleaves.
  const flushWith = (lines: Line[]) => {
    const pending = queue.current.splice(0);
    setShown((s) => [...s, ...pending, ...lines]);
  };

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      const next = queue.current.splice(0, 1);
      if (next.length) setShown((s) => [...s, ...next]);
    }, 16);
    return () => clearInterval(t);
  }, [reduce]);

  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    print([
      L({ t: `Last login: ${new Date().toDateString()} on ttys001`, c: "dim" }),
      L("Welcome to ", { t: `${profile.name}'s`, c: "accent" }, " portfolio shell."),
      L("Type ", { t: "help", c: "good" }, " to see what I can do. Tab completes, ↑/↓ walks history."),
      blank(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [shown]);

  function run(raw: string) {
    const cmd = raw.trim();
    const echo = L({ t: PROMPT, c: "good" }, ` ${raw}`);
    flushWith([echo]);
    if (!cmd) return;
    setHist((h) => [...h, cmd]);
    setHi(-1);
    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ").toLowerCase();
    const out: Line[] = [];

    switch (name.toLowerCase()) {
      case "help":
        out.push(L({ t: "Available commands", c: "bold" }));
        for (const [k, v] of Object.entries(commands)) out.push(L({ t: k.padEnd(12), c: "good" }, { t: v.desc, c: "dim" }));
        break;
      case "about":
      case "whoami":
        out.push(L({ t: profile.name, c: "accent" }, ` · ${profile.role}`), L({ t: profile.tagline, c: "dim" }), blank());
        profile.about.forEach((p) => out.push(L(p)));
        break;
      case "projects":
        projects.forEach((p) => out.push(L({ t: p.id.padEnd(14), c: "good" }, { t: p.title, c: "bold" }, { t: ` — ${p.kicker}`, c: "dim" })));
        out.push(blank(), L({ t: "Try: ", c: "dim" }, { t: `project ${projects[0].id}`, c: "good" }, { t: " or ", c: "dim" }, { t: "open finder", c: "good" }));
        break;
      case "project": {
        const p = projects.find((x) => x.id === arg || x.title.toLowerCase() === arg);
        if (!p) {
          out.push(L({ t: `project: not found: ${arg || "(none)"}. `, c: "err" }, "Ids: ", projects.map((x) => x.id).join(", ")));
          break;
        }
        out.push(L({ t: p.title, c: "accent" }, { t: `  [${p.status}]`, c: "dim" }), L({ t: p.kicker, c: "dim" }), blank(), L(p.summary), blank());
        p.impact.forEach((i) => out.push(L({ t: "  ✓ ", c: "good" }, i)));
        out.push(blank(), L({ t: "stack: ", c: "dim" }, p.tech.join(" · ")));
        open("finder", { path: `projects/${p.id}` });
        out.push(L({ t: "→ opened the case study in Finder", c: "dim" }));
        break;
      }
      case "skills":
        skills.forEach((s) => out.push(L({ t: s.category.padEnd(16), c: "good" }, s.items.join(", "))));
        break;
      case "experience":
        experiences.forEach((e) => {
          out.push(L({ t: e.role, c: "bold" }, " @ ", { t: e.company, c: "accent" }, { t: `  ${e.period}`, c: "dim" }));
          e.highlights.forEach((h) => out.push(L({ t: "  • ", c: "dim" }, h)));
        });
        break;
      case "stats":
        stats.forEach((s) => out.push(L({ t: s.value.padEnd(8), c: "accent" }, s.label)));
        break;
      case "contact":
        out.push(
          L({ t: "email    ", c: "dim" }, { t: profile.email, c: "blue", href: `mailto:${profile.email}` }),
          L({ t: "linkedin ", c: "dim" }, { t: profile.linkedin, c: "blue", href: profile.linkedin }),
          L({ t: "github   ", c: "dim" }, { t: profile.github, c: "blue", href: profile.github }),
          L({ t: "Or run ", c: "dim" }, { t: "open mail", c: "good" }),
        );
        break;
      case "resume":
      case "cv":
        open("preview");
        out.push(L({ t: "→ opened Resume.pdf in Preview", c: "dim" }));
        break;
      case "open": {
        const id = appNames.find((a) => a === arg || apps[a].name.toLowerCase() === arg);
        if (!id) out.push(L({ t: `open: unknown app "${arg}". `, c: "err" }, "Apps: ", appNames.join(", ")));
        else {
          open(id);
          out.push(L({ t: `→ opened ${apps[id].name}`, c: "dim" }));
        }
        break;
      }
      case "ls":
        out.push(L(...FILES.map((f) => ({ t: `${f}   `, c: f.endsWith("/") ? ("blue" as const) : undefined }))));
        break;
      case "cd":
        if (arg.startsWith("projects")) {
          open("finder", { path: "projects" });
          out.push(L({ t: "→ opened projects/ in Finder", c: "dim" }));
        } else out.push(L({ t: `cd: no such directory: ${arg || "~"}`, c: "err" }));
        break;
      case "cat":
        if (arg === "about.md") profile.about.forEach((p) => out.push(L(p)));
        else if (arg === "contact.txt") return run("contact");
        else if (arg === "resume.pdf") out.push(L({ t: "cat: resume.pdf is binary. Try ", c: "err" }, { t: "resume", c: "good" }));
        else out.push(L({ t: `cat: ${arg || "(none)"}: No such file`, c: "err" }));
        break;
      case "theme":
        if (arg === "light" || arg === "dark") setAppearance(arg);
        else toggleAppearance();
        out.push(L({ t: "→ appearance updated", c: "dim" }));
        break;
      case "wallpaper":
        if (isWallpaper(arg)) {
          useWM.getState().setWallpaper(arg);
          out.push(L({ t: `→ wallpaper set to ${arg}`, c: "dim" }));
        } else {
          if (arg) out.push(L({ t: `wallpaper: unknown "${arg}". `, c: "err" }));
          out.push(L({ t: "Wallpapers: ", c: "dim" }, wallpapers.map((w) => w.id).join(", ")));
          if (!arg) useWM.getState().setPicker(true);
        }
        break;
      case "history":
        [...hist, cmd].forEach((h, i) => out.push(L({ t: String(i + 1).padStart(4) + "  ", c: "dim" }, h)));
        break;
      case "date":
        out.push(L(new Date().toString()));
        break;
      case "echo":
        out.push(L(rest.join(" ")));
        break;
      case "sudo":
        out.push(L({ t: "Permission denied. ", c: "err" }, "But you can still hire me: ", { t: "contact", c: "good" }));
        break;
      case "clear":
        queue.current = [];
        setShown([]);
        return;
      case "exit":
        close("terminal");
        return;
      default:
        out.push(L({ t: `zsh: command not found: ${name}`, c: "err" }), L({ t: "Type ", c: "dim" }, { t: "help", c: "good" }, { t: " for a list of commands.", c: "dim" }));
    }
    print([...out, blank()]);
  }

  function complete() {
    const parts = input.split(/\s+/);
    if (parts.length === 1) {
      const opts = Object.keys(commands).filter((c) => c.startsWith(parts[0].toLowerCase()));
      if (opts.length === 1) setInput(opts[0] + " ");
      else if (opts.length > 1) {
        const p = commonPrefix(opts);
        if (p.length > parts[0].length) setInput(p);
        else flushWith([L({ t: PROMPT, c: "good" }, ` ${input}`), L({ t: opts.join("   "), c: "dim" })]);
      }
      return;
    }
    const argsOf = commands[parts[0].toLowerCase()]?.args;
    if (!argsOf) return;
    const partial = parts.slice(1).join(" ").toLowerCase();
    const opts = argsOf().filter((a) => a.startsWith(partial));
    if (opts.length === 1) setInput(`${parts[0]} ${opts[0]}`);
    else if (opts.length > 1) {
      const p = commonPrefix(opts);
      if (p.length > partial.length) setInput(`${parts[0]} ${p}`);
      else flushWith([L({ t: PROMPT, c: "good" }, ` ${input}`), L({ t: opts.join("   "), c: "dim" })]);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!hist.length) return;
      const i = hi === -1 ? hist.length - 1 : Math.max(0, hi - 1);
      setHi(i);
      setInput(hist[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hi === -1) return;
      const i = hi + 1;
      if (i >= hist.length) {
        setHi(-1);
        setInput("");
      } else {
        setHi(i);
        setInput(hist[i]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      queue.current = [];
      setShown([]);
    }
  }

  return (
    <div className="terminal" ref={scroller} onClick={() => !window.getSelection()?.toString() && inputRef.current?.focus()}>
      <div role="log" aria-live="polite" aria-label="Terminal output">
        {shown.map((l) => (
          <div key={l.id} className="t-line">
            {l.segs.map((s, i) =>
              s.href ? (
                <a key={i} className={`t-${s.c ?? "x"}`} href={s.href} target={s.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">{s.t}</a>
              ) : (
                <span key={i} className={s.c ? `t-${s.c}` : undefined}>{s.t}</span>
              ),
            )}
            {l.segs.every((s) => !s.t) && " "}
          </div>
        ))}
      </div>
      <div className="t-input">
        <label htmlFor="term-in" className="t-good">{PROMPT}</label>
        <input
          id="term-in"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Terminal command"
          autoFocus
        />
      </div>
    </div>
  );
}
