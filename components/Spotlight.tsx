"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Search } from "lucide-react";
import AppIcon from "@/components/icons/AppIcon";
import { useWM } from "@/lib/store";
import { search, suggestions, type Hit } from "@/lib/search";
import { copyText } from "@/lib/hooks";

export default function Spotlight() {
  const show = useWM((s) => s.spotlight);
  return <AnimatePresence>{show && <Panel />}</AnimatePresence>;
}

function Panel() {
  const { setSpotlight, open, notify } = useWM.getState();
  const [q, setQ] = useState("");
  const [at, setAt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const hits = useMemo(() => (q.trim() ? search(q) : suggestions), [q]);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { setAt(0); }, [q]);
  useEffect(() => {
    list.current?.querySelector(`[data-i="${at}"]`)?.scrollIntoView({ block: "nearest" });
  }, [at]);

  async function run(h: Hit) {
    setSpotlight(false);
    if ("open" in h.run) open(...h.run.open);
    else if ("href" in h.run) window.open(h.run.href, "_blank", "noopener,noreferrer");
    else notify((await copyText(h.run.copy)) ? "Email address copied" : h.run.copy);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") setAt((i) => Math.min(i + 1, hits.length - 1));
    else if (e.key === "ArrowUp") setAt((i) => Math.max(i - 1, 0));
    else if (e.key === "Enter" && hits[at]) run(hits[at]);
    else if (e.key === "Escape") setSpotlight(false);
    else return;
    e.preventDefault();
  }

  let lastGroup = "";
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} onPointerDown={(e) => e.target === e.currentTarget && setSpotlight(false)}>
      <motion.div
        className="spotlight"
        role="dialog"
        aria-label="Spotlight search"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.14 }}
        onKeyDown={onKey}
      >
        <div className="sl-field">
          <Search size={22} aria-hidden="true" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, skills, experience, contact…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="sl-results"
            aria-activedescendant={hits[at] ? `sl-${hits[at].id}` : undefined}
            spellCheck={false}
          />
        </div>
        {(hits.length > 0 || q) && (
          <ul className="sl-results" id="sl-results" role="listbox" ref={list}>
            {!q && <li className="sl-group" role="presentation">Suggestions</li>}
            {hits.map((h, i) => {
              const head = q && h.group !== lastGroup ? h.group : null;
              lastGroup = h.group;
              return (
                <li key={h.id + i} role="presentation">
                  {head && <div className="sl-group">{head}</div>}
                  <div
                    id={`sl-${h.id}`}
                    data-i={i}
                    role="option"
                    aria-selected={i === at}
                    className={`sl-hit${i === at ? " on" : ""}`}
                    onPointerMove={() => setAt(i)}
                    onClick={() => run(h)}
                  >
                    <AppIcon id={h.icon} size={26} />
                    <span className="sl-title">{h.title}</span>
                    {h.sub && <span className="sl-sub">{h.sub}</span>}
                    {i === at && <CornerDownLeft size={14} className="sl-enter" aria-hidden="true" />}
                  </div>
                </li>
              );
            })}
            {q && !hits.length && <li className="sl-none">No results for “{q}”</li>}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}
