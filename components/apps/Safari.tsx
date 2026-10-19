"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, FolderOpen, Lock, Mail, Plus, RotateCw, Star, X } from "lucide-react";
import { useWM, type AppProps } from "@/lib/store";
import { profile, projects, site } from "@/data/portfolio";
import { Code, GitHub, LinkedIn } from "@/components/icons/Brand";
import ProjectArt from "@/components/ProjectArt";

type Tab = { key: number; stack: string[]; at: number };

const host = new URL(site.url).host;
const urlOf = (page: string) => (page === "home" ? `${host}/` : `${host}/#projects/${page}`);
const titleOf = (page: string) => (page === "home" ? "Favourites" : projects.find((p) => p.id === page)?.title ?? "Not found");

const external = [
  { label: "GitHub", href: profile.github, icon: <GitHub size={22} />, bg: "#24292f" },
  { label: "LinkedIn", href: profile.linkedin, icon: <LinkedIn size={22} />, bg: "#0a66c2" },
  { label: "LeetCode", href: profile.leetcode, icon: <Code size={22} />, bg: "#f59e0b" },
];

let tabKey = 0;

export default function Safari({ props }: { props: AppProps }) {
  const [tabs, setTabs] = useState<Tab[]>(() => [{ key: tabKey++, stack: [(props.page as string) ?? "home"], at: 0 }]);
  const [active, setActive] = useState(tabs[0].key);
  const [editing, setEditing] = useState<string | null>(null);
  const [spin, setSpin] = useState(0);
  const notify = useWM((s) => s.notify);
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];
  const page = tab.stack[tab.at];

  const navigate = (p: string) =>
    setTabs((ts) => ts.map((t) => (t.key === tab.key ? { ...t, stack: [...t.stack.slice(0, t.at + 1), p], at: t.at + 1 } : t)));
  const step = (d: number) => setTabs((ts) => ts.map((t) => (t.key === tab.key ? { ...t, at: t.at + d } : t)));

  function newTab(p = "home") {
    const t = { key: tabKey++, stack: [p], at: 0 };
    setTabs((ts) => [...ts, t]);
    setActive(t.key);
  }

  function closeTab(key: number) {
    const rest = tabs.filter((t) => t.key !== key);
    if (!rest.length) return setTabs([{ ...tabs[0], stack: ["home"], at: 0 }]);
    setTabs(rest);
    if (key === active) setActive(rest[rest.length - 1].key);
  }

  // Opened from Finder with a project: reuse its tab if one is already showing it.
  useEffect(() => {
    const p = props.page as string | undefined;
    if (!p) return;
    setTabs((ts) => {
      const hit = ts.find((t) => t.stack[t.at] === p);
      if (hit) {
        setActive(hit.key);
        return ts;
      }
      const t = { key: tabKey++, stack: [p], at: 0 };
      setActive(t.key);
      return [...ts, t];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.nonce]);

  function go(raw: string) {
    setEditing(null);
    const q = raw.trim().toLowerCase().replace(new RegExp(`^(https?://)?${host.replace(/\./g, "\\.")}/?(#projects/)?`), "");
    if (!q) return navigate("home");
    const p = projects.find((x) => x.id === q || x.title.toLowerCase().includes(q) || x.tech.some((t) => t.toLowerCase() === q));
    if (p) return navigate(p.id);
    if (/^https?:\/\/|\.[a-z]{2,}(\/|$)/.test(q)) {
      window.open(q.startsWith("http") ? q : `https://${q}`, "_blank", "noopener,noreferrer");
      notify("Opened in a new browser tab");
      return;
    }
    navigate(`missing:${q}`);
  }

  return (
    <div className="safari">
      <div className="toolbar">
        <div className="seg">
          <button aria-label="Back" disabled={tab.at === 0} onClick={() => step(-1)}><ChevronLeft size={17} /></button>
          <button aria-label="Forward" disabled={tab.at >= tab.stack.length - 1} onClick={() => step(1)}><ChevronRight size={17} /></button>
        </div>
        <form className="urlbar" onSubmit={(e) => { e.preventDefault(); go(editing ?? ""); }}>
          <Lock size={12} aria-hidden="true" />
          <input
            aria-label="Address"
            value={editing ?? (page.startsWith("missing:") ? page.slice(8) : urlOf(page))}
            onFocus={(e) => { setEditing(e.target.value); requestAnimationFrame(() => e.target.select()); }}
            onBlur={() => setEditing(null)}
            onChange={(e) => setEditing(e.target.value)}
            spellCheck={false}
          />
          <button type="button" aria-label="Reload" onMouseDown={(e) => e.preventDefault()} onClick={() => setSpin((s) => s + 1)}><RotateCw size={13} style={{ transform: `rotate(${spin * 360}deg)`, transition: "transform .5s" }} /></button>
        </form>
        <button className="icon-btn small" aria-label="New tab" onClick={() => newTab()}><Plus size={16} /></button>
      </div>
      <div className="tabs" role="tablist" aria-label="Tabs">
        {tabs.map((t) => (
          <div key={t.key} className={`tab${t.key === tab.key ? " on" : ""}`}>
            <button role="tab" aria-selected={t.key === tab.key} onClick={() => setActive(t.key)}>{titleOf(t.stack[t.at])}</button>
            <button className="tab-x" aria-label={`Close tab ${titleOf(t.stack[t.at])}`} onClick={() => closeTab(t.key)}><X size={12} /></button>
          </div>
        ))}
      </div>
      <div className="webview" key={`${tab.key}-${tab.at}-${spin}`}>
        {page === "home" ? <Home onOpen={navigate} /> : page.startsWith("missing:") ? <Missing q={page.slice(8)} onHome={() => navigate("home")} /> : <ProjectPage id={page} />}
      </div>
    </div>
  );
}

function Home({ onOpen }: { onOpen: (p: string) => void }) {
  const anyLive = projects.some((p) => p.links?.length);
  return (
    <div className="sf-home">
      <h2><Star size={16} />Favourites</h2>
      <ul className="sf-favs">
        {external.map((x) => (
          <li key={x.label}>
            <a href={x.href} target="_blank" rel="noopener noreferrer">
              <span className="fav-tile" style={{ background: x.bg }}>{x.icon}</span>
              <span>{x.label}<ArrowUpRight size={11} /></span>
            </a>
          </li>
        ))}
      </ul>
      <h2>Project pages</h2>
      {!anyLive && <p className="sf-note">Most of this work is private client or internal tooling, so there are no public demos. Each page below has the details, and walkthroughs are available on request.</p>}
      <ul className="sf-cards">
        {projects.map((p) => (
          <li key={p.id}>
            <button onClick={() => onOpen(p.id)}>
              <ProjectArt p={p} size="card" className="sf-thumb" />
              <strong>{p.title}</strong>
              <small>{urlOf(p.id).replace(`${host}/`, "")}</small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectPage({ id }: { id: string }) {
  const p = projects.find((x) => x.id === id);
  const open = useWM((s) => s.open);
  if (!p) return null;
  return (
    <article className="sf-page">
      <ProjectArt p={p} size="hero" className="sf-hero" />
      <div className="sf-content">
        <header className="sf-head">
          <p className="kicker">{p.kicker}</p>
          <h1>{p.title}</h1>
        </header>
        <p className="lead">{p.summary}</p>
        <div className="sf-cols">
          <section>
            <h2>What it does</h2>
            <ul>{p.impact.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
          <aside>
            <h2>Built with</h2>
            <ul className="chips">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul>
            <div className="sf-cta">
              {p.links?.length ? (
                p.links.map((l) => <a key={l.href} className="btn primary" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}<ArrowUpRight size={14} /></a>)
              ) : (
                <>
                  <p className="sf-private"><Lock size={13} />{p.status === "design" ? "In design, not deployed yet" : "Private repository"}</p>
                  <button className="btn primary" onClick={() => open("mail", { subject: `Walkthrough of ${p.title}` })}><Mail size={14} />Request a walkthrough</button>
                </>
              )}
              <button className="btn" onClick={() => open("finder", { path: `projects/${p.id}` })}><FolderOpen size={14} />Case study</button>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

function Missing({ q, onHome }: { q: string; onHome: () => void }) {
  return (
    <div className="sf-missing">
      <h2>Can&apos;t find “{q}”</h2>
      <p>Try a project name like <em>ERP Atlas</em> or a technology like <em>FastAPI</em>.</p>
      <button className="btn" onClick={onHome}>Back to Favourites</button>
    </div>
  );
}
