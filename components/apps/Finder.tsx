"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Briefcase, ChevronLeft, ChevronRight, Clock, Compass, FolderClosed, LayoutGrid, List, Lock, Mail, Search } from "lucide-react";
import { useWM, type AppProps } from "@/lib/store";
import { experiences, projects, type Project } from "@/data/portfolio";
import ProjectArt, { ProjectFolder } from "@/components/ProjectArt";
import { useIsMobile } from "@/lib/hooks";

type Path = "projects" | "experience" | "recents" | `projects/${string}`;

const statusLabel: Record<Project["status"], string> = { private: "Private", public: "Public", design: "In design" };
const statusColor: Record<Project["status"], string> = { private: "#ff9f0a", public: "#30d158", design: "#b9a4ff" };

export default function Finder({ props }: { props: AppProps }) {
  const [history, setHistory] = useState<Path[]>([(props.path as Path) ?? "projects"]);
  const [at, setAt] = useState(0);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string | null>(null);
  const [tag, setTag] = useState<Project["status"] | null>(null);
  const [recents, setRecents] = useState<string[]>(() => (typeof props.path === "string" && props.path.startsWith("projects/") ? [props.path.slice(9)] : []));
  const path = history[at];
  const reduce = useReducedMotion();
  const body = useRef<HTMLDivElement>(null);

  function go(p: Path) {
    if (p === path) return;
    setHistory((h) => [...h.slice(0, at + 1), p]);
    setAt((i) => i + 1);
    setSelected(null);
    if (p.startsWith("projects/")) {
      const id = p.slice(9);
      setRecents((r) => [id, ...r.filter((x) => x !== id)].slice(0, 6));
    }
  }

  // Opened again from elsewhere (Spotlight, desktop, terminal): jump to the requested place.
  useEffect(() => {
    if (props.path) {
      go(props.path as Path);
      setQuery("");
    }
    if (props.focus) requestAnimationFrame(() => body.current?.querySelector(`#exp-${props.focus}`)?.scrollIntoView({ block: "start" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.nonce]);

  useEffect(() => { body.current?.scrollTo({ top: 0 }); }, [path]);

  const searching = query.trim().length > 0;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = path === "recents" ? recents.map((id) => projects.find((p) => p.id === id)!).filter(Boolean) : projects;
    if (tag) list = list.filter((p) => p.status === tag);
    if (q) list = projects.filter((p) => `${p.title} ${p.kicker} ${p.summary} ${p.tech.join(" ")}`.toLowerCase().includes(q));
    return list;
  }, [query, path, tag, recents]);

  const project = path.startsWith("projects/") ? projects.find((p) => p.id === path.slice(9)) : undefined;
  const crumbs: { label: string; path?: Path }[] = searching
    ? [{ label: `Searching “${query.trim()}”` }]
    : project
      ? [{ label: "Projects", path: "projects" }, { label: project.title }]
      : [{ label: path === "experience" ? "Experience" : path === "recents" ? "Recents" : "Projects" }];

  const side: { p: Path; label: string; icon: React.ReactNode }[] = [
    { p: "projects", label: "Projects", icon: <FolderClosed size={15} /> },
    { p: "experience", label: "Experience", icon: <Briefcase size={15} /> },
    { p: "recents", label: "Recents", icon: <Clock size={15} /> },
  ];

  return (
    <div className="finder">
      <aside className="sidebar" aria-label="Finder sidebar">
        <p className="side-h">Favourites</p>
        {side.map((s) => (
          <button key={s.p} className={`side-item${(path === s.p || (s.p === "projects" && project)) && !searching ? " on" : ""}`} onClick={() => { setQuery(""); setTag(null); go(s.p); }}>
            {s.icon}{s.label}
          </button>
        ))}
        <p className="side-h">Tags</p>
        {(Object.keys(statusLabel) as Project["status"][]).filter((k) => projects.some((p) => p.status === k)).map((k) => (
          <button key={k} className={`side-item${tag === k ? " on" : ""}`} aria-pressed={tag === k} onClick={() => { setTag(tag === k ? null : k); setQuery(""); if (path !== "projects") go("projects"); }}>
            <i className="tag-dot" style={{ background: statusColor[k] }} />{statusLabel[k]}
          </button>
        ))}
      </aside>

      <section className="finder-main">
        <div className="toolbar">
          <div className="seg">
            <button aria-label="Back" disabled={at === 0} onClick={() => { setAt(at - 1); setQuery(""); }}><ChevronLeft size={17} /></button>
            <button aria-label="Forward" disabled={at >= history.length - 1} onClick={() => { setAt(at + 1); setQuery(""); }}><ChevronRight size={17} /></button>
          </div>
          <nav className="crumbs" aria-label="Breadcrumbs">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <ChevronRight size={13} aria-hidden="true" />}
                {c.path ? <button onClick={() => go(c.path!)}>{c.label}</button> : <strong aria-current="page">{c.label}</strong>}
              </span>
            ))}
          </nav>
          {!project && path !== "experience" && (
            <div className="seg" role="group" aria-label="View">
              <button aria-label="Icon view" aria-pressed={view === "grid"} className={view === "grid" ? "on" : ""} onClick={() => setView("grid")}><LayoutGrid size={15} /></button>
              <button aria-label="List view" aria-pressed={view === "list"} className={view === "list" ? "on" : ""} onClick={() => setView("list")}><List size={15} /></button>
            </div>
          )}
          <label className="search">
            <Search size={14} aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" aria-label="Search projects" />
          </label>
        </div>

        <div className="finder-body" ref={body}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={searching ? "search" : path}
              initial={reduce ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -10 }}
              transition={{ duration: 0.14 }}
            >
              {project && !searching ? (
                <CaseStudy p={project} />
              ) : path === "experience" && !searching ? (
                <ExperienceList />
              ) : (
                <ProjectGrid list={shown} view={view} selected={selected} onSelect={setSelected} onOpen={(id) => { setQuery(""); go(`projects/${id}`); }} empty={path === "recents" && !searching ? "Projects you open will show up here." : "No projects match."} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <footer className="statusbar">
          {project && !searching ? `${project.tech.length} technologies · ${statusLabel[project.status]}` : path === "experience" && !searching ? `${experiences.length} roles` : `${shown.length} item${shown.length === 1 ? "" : "s"}`}
        </footer>
      </section>
    </div>
  );
}

function ProjectGrid({ list, view, selected, onSelect, onOpen, empty }: {
  list: Project[]; view: "grid" | "list"; selected: string | null; onSelect: (id: string) => void; onOpen: (id: string) => void; empty: string;
}) {
  const mobile = useIsMobile();
  if (!list.length) return <p className="empty">{empty}</p>;
  if (view === "list")
    return (
      <table className="flist">
        <thead><tr><th>Name</th><th>Kind</th><th>Status</th></tr></thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} className={selected === p.id ? "sel" : ""}>
              <td><button className="row-btn" onClick={() => onSelect(p.id)} onDoubleClick={() => onOpen(p.id)} onKeyDown={(e) => e.key === "Enter" && onOpen(p.id)}><ProjectFolder p={p} size={20} />{p.title}</button></td>
              <td>{p.kicker}</td>
              <td><i className="tag-dot" style={{ background: statusColor[p.status] }} />{statusLabel[p.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  return (
    <ul className="fgrid">
      {list.map((p) => (
        <li key={p.id}>
          <button
            className={`folder${selected === p.id ? " sel" : ""}`}
            onClick={(e) => (e.detail === 0 || mobile ? onOpen(p.id) : onSelect(p.id))}
            onPointerUp={(e) => e.pointerType === "touch" && onOpen(p.id)}
            onDoubleClick={() => onOpen(p.id)}
            aria-label={`${p.title}, ${p.kicker}. Open case study`}
          >
            <ProjectFolder p={p} />
            <span className="folder-name">{p.title}</span>
            <span className="folder-kind">{p.kicker.split(" · ")[0]}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function CaseStudy({ p }: { p: Project }) {
  const open = useWM((s) => s.open);
  const sections: { h: string; body: React.ReactNode }[] = [
    { h: "The problem & what I built", body: <p>{p.summary}</p> },
    ...(p.role ? [{ h: "My contribution", body: <p>{p.role}</p> }] : []),
    ...(p.architecture?.length ? [{ h: "Architecture", body: <ul>{p.architecture.map((a) => <li key={a}>{a}</li>)}</ul> }] : []),
    ...(p.tradeoffs?.length ? [{ h: "Trade-offs", body: <ul>{p.tradeoffs.map((a) => <li key={a}>{a}</li>)}</ul> }] : []),
    { h: "Results", body: <ul className="impact">{p.impact.map((a) => <li key={a}>{a}</li>)}</ul> },
  ];
  return (
    <article className="case">
      <ProjectArt p={p} size="hero" className="case-hero" />
      <header className="case-head">
        <p className="kicker">{p.kicker}</p>
        <h2>{p.title}</h2>
        <span className="pill" style={{ color: statusColor[p.status] }}>
          {p.status === "private" && <Lock size={12} />}{statusLabel[p.status]}
        </span>
      </header>
      {sections.map((s) => (
        <section key={s.h} className="case-sec">
          <h3>{s.h}</h3>
          {s.body}
        </section>
      ))}
      <section className="case-sec">
        <h3>Tech stack</h3>
        <ul className="chips">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>
      <div className="case-actions">
        <button className="btn" onClick={() => open("safari", { page: p.id })}><Compass size={15} />Open in Safari</button>
        <button className="btn" onClick={() => open("mail", { subject: `About ${p.title}` })}><Mail size={15} />Ask about this project</button>
        {p.links?.map((l) => <a key={l.href} className="btn" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
      </div>
    </article>
  );
}

function ExperienceList() {
  return (
    <ol className="exp-list">
      {experiences.map((e) => (
        <li key={e.id} id={`exp-${e.id}`} className="exp">
          <span className="exp-dot" style={{ background: e.color }} aria-hidden="true" />
          <div>
            <h3>{e.role} <span>· {e.company}</span></h3>
            <p className="exp-meta">{e.period} · {e.location}{e.current && <span className="pill good small"><i />Current</span>}</p>
            <ul>{e.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
