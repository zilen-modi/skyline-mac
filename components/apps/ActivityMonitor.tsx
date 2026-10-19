"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useWM, type AppProps } from "@/lib/store";
import { experiences, projects, skills, stats, type Project } from "@/data/portfolio";

// Everything here is counted from data/portfolio.ts: no decorative fake "live" metrics.

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
function parseMonth(s: string, now: Date) {
  if (/present/i.test(s)) return now.getFullYear() * 12 + now.getMonth();
  const [m, y] = s.trim().split(/\s+/);
  return Number(y) * 12 + MONTHS.indexOf(m.slice(0, 3).toLowerCase());
}
function tenure(period: string, now: Date) {
  const [a, b] = period.split(/\s*[–-]\s*/);
  const start = parseMonth(a, now);
  const end = parseMonth(b ?? "Present", now);
  return { start, end, months: end - start + 1 };
}
const fmt = (m: number) => (m >= 12 ? `${Math.floor(m / 12)} yr${m >= 24 ? "s" : ""}${m % 12 ? ` ${m % 12} mo` : ""}` : `${m} mo`);

const usedIn = (tech: string) => projects.filter((p) => p.tech.some((t) => t.toLowerCase().startsWith(tech.toLowerCase()))).length;

type TabId = "overview" | "experience" | "tech" | "projects";
const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "experience", label: "Experience" },
  { id: "tech", label: "Technologies" },
  { id: "projects", label: "Projects" },
];

export default function ActivityMonitor({ props }: { props: AppProps }) {
  const [tab, setTab] = useState<TabId>((props.tab as TabId) ?? "overview");
  const [category, setCategory] = useState<string | null>((props.category as string) ?? null);

  useEffect(() => {
    if (props.tab) setTab(props.tab as TabId);
    if (props.category) setCategory(props.category as string);
  }, [props.nonce, props.tab, props.category]);

  const now = useMemo(() => new Date(), []);
  const roles = useMemo(() => experiences.map((e) => ({ ...e, ...tenure(e.period, now) })), [now]);
  const totalMonths = roles.reduce((n, r) => n + r.months, 0);

  return (
    <div className="activity">
      <div className="toolbar am-toolbar">
        <div className="am-tabs" role="tablist" aria-label="Views">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="am-body" role="tabpanel">
        {tab === "overview" && <Overview />}
        {tab === "experience" && <Experience roles={roles} />}
        {tab === "tech" && <Tech category={category} setCategory={setCategory} />}
        {tab === "projects" && <ProjectTable />}
      </div>
      <footer className="am-foot">
        <div><span>Experience</span><strong>{fmt(totalMonths)}</strong></div>
        <div><span>Companies</span><strong>{experiences.length}</strong></div>
        <div><span>Projects</span><strong>{projects.length}</strong></div>
        <div><span>Skills tracked</span><strong>{skills.reduce((n, s) => n + s.items.length, 0)}</strong></div>
      </footer>
    </div>
  );
}

function Bar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="am-track">
      <motion.span
        className="am-fill"
        style={{ background: color }}
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${Math.max(2, (value / max) * 100)}%` }}
        transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </span>
  );
}

function Overview() {
  const byStatus = (s: Project["status"]) => projects.filter((p) => p.status === s).length;
  const allTech = new Set(projects.flatMap((p) => p.tech));
  return (
    <>
      <ul className="am-tiles">
        {stats.map((s) => <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>)}
      </ul>
      <div className="am-grid2">
        <section className="am-card">
          <h3>Projects by status</h3>
          {([["private", "Private / client", "#ff9f0a"], ["public", "Public", "#30d158"], ["design", "In design", "#b9a4ff"]] as const)
            .filter(([s]) => byStatus(s))
            .map(([s, label, c], i) => (
              <div key={s} className="am-row">
                <span className="am-name">{label}</span>
                <Bar value={byStatus(s)} max={projects.length} color={c} delay={i * 0.08} />
                <span className="am-num">{byStatus(s)}</span>
              </div>
            ))}
        </section>
        <section className="am-card">
          <h3>Skills by area</h3>
          {skills.map((s, i) => (
            <div key={s.category} className="am-row">
              <span className="am-name">{s.category}</span>
              <Bar value={s.items.length} max={Math.max(...skills.map((x) => x.items.length))} color={s.color} delay={i * 0.06} />
              <span className="am-num">{s.items.length}</span>
            </div>
          ))}
        </section>
      </div>
      <p className="am-note">{allTech.size} distinct technologies across {projects.length} projects.</p>
    </>
  );
}

function Experience({ roles }: { roles: (typeof experiences[number] & { start: number; end: number; months: number })[] }) {
  const first = Math.min(...roles.map((r) => r.start));
  const last = Math.max(...roles.map((r) => r.end));
  const span = last - first + 1;
  const years = Array.from({ length: Math.floor(last / 12) - Math.floor(first / 12) + 1 }, (_, i) => Math.floor(first / 12) + i);
  const reduce = useReducedMotion();
  return (
    <section className="am-card">
      <h3>Timeline</h3>
      <div className="am-timeline">
        {[...roles].reverse().map((r, i) => (
          <div key={r.id} className="am-tl-row">
            <span className="am-name"><strong>{r.company}</strong><small>{r.role}</small></span>
            <span className="am-tl-track">
              <motion.span
                className="am-tl-bar"
                style={{ left: `${((r.start - first) / span) * 100}%`, background: r.color }}
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${(r.months / span) * 100}%` }}
                transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : i * 0.1 }}
                title={r.period}
              />
            </span>
            <span className="am-num">{fmt(r.months)}</span>
          </div>
        ))}
        <div className="am-tl-axis" aria-hidden="true">
          {years.map((y) => <span key={y} style={{ left: `${((Math.max(y * 12, first) - first) / span) * 100}%` }}>{y}</span>)}
        </div>
      </div>
      <ul className="am-roles">
        {roles.map((r) => <li key={r.id}><i style={{ background: r.color }} />{r.role}, {r.company} · {r.period}</li>)}
      </ul>
    </section>
  );
}

function Tech({ category, setCategory }: { category: string | null; setCategory: (c: string | null) => void }) {
  const rows = useMemo(() => {
    if (category) {
      const s = skills.find((x) => x.category === category);
      return (s?.items ?? []).map((t) => ({ t, n: usedIn(t), color: s!.color }));
    }
    const counts = new Map<string, number>();
    projects.forEach((p) => p.tech.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    const colorOf = (t: string) => skills.find((s) => s.items.some((i) => t.toLowerCase().startsWith(i.toLowerCase())))?.color ?? "#8e8e93";
    return [...counts].map(([t, n]) => ({ t, n, color: colorOf(t) }));
  }, [category]);
  const sorted = [...rows].sort((a, b) => b.n - a.n || a.t.localeCompare(b.t));
  const max = Math.max(1, ...sorted.map((r) => r.n));
  return (
    <section className="am-card">
      <div className="am-filters" role="group" aria-label="Filter by area">
        <button aria-pressed={!category} className={!category ? "on" : ""} onClick={() => setCategory(null)}>All in projects</button>
        {skills.map((s) => (
          <button key={s.category} aria-pressed={category === s.category} className={category === s.category ? "on" : ""} onClick={() => setCategory(s.category)}>
            <i style={{ background: s.color }} />{s.category}
          </button>
        ))}
      </div>
      <p className="am-note">{category ? `Core ${category.toLowerCase()} skills, with how many featured projects use each.` : "Every technology used in a featured project, by number of projects."}</p>
      {sorted.map((r, i) => (
        <div key={r.t} className="am-row">
          <span className="am-name">{r.t}</span>
          <Bar value={r.n} max={max} color={r.color} delay={Math.min(i, 12) * 0.03} />
          <span className="am-num">{r.n ? `${r.n} project${r.n > 1 ? "s" : ""}` : "skill"}</span>
        </div>
      ))}
    </section>
  );
}

function ProjectTable() {
  const open = useWM((s) => s.open);
  const [sort, setSort] = useState<{ k: "title" | "status" | "tech" | "impact"; dir: 1 | -1 }>({ k: "tech", dir: -1 });
  const val = (p: Project) => (sort.k === "title" ? p.title : sort.k === "status" ? p.status : sort.k === "tech" ? p.tech.length : p.impact.length);
  const list = [...projects].sort((a, b) => {
    const x = val(a);
    const y = val(b);
    return (typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y))) * sort.dir;
  });
  const th = (k: typeof sort.k, label: string) => (
    <th aria-sort={sort.k === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button onClick={() => setSort({ k, dir: sort.k === k ? (sort.dir === 1 ? -1 : 1) : k === "title" ? 1 : -1 })}>
        {label}{sort.k === k && (sort.dir === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
      </button>
    </th>
  );
  return (
    <table className="am-table">
      <thead><tr>{th("title", "Project")}{th("status", "Status")}{th("tech", "Technologies")}{th("impact", "Results listed")}</tr></thead>
      <tbody>
        {list.map((p) => (
          <tr key={p.id}>
            <td><button className="row-btn" onClick={() => open("finder", { path: `projects/${p.id}` })}>{p.title}<small>{p.kicker}</small></button></td>
            <td>{p.status === "design" ? "In design" : p.status === "private" ? "Private" : "Public"}</td>
            <td>{p.tech.length}</td>
            <td>{p.impact.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
