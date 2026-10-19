"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pin, Search } from "lucide-react";
import type { AppProps } from "@/lib/store";
import { awards, education, experiences, learning, profile, projects, stats } from "@/data/portfolio";

type Note = { id: string; title: string; pinned?: boolean; preview: string; body: React.ReactNode; text: string };

const yearsSince = experiences.at(-1)?.period.match(/\d{4}/)?.[0];

// Every note is built from data/portfolio.ts so nothing here can drift from the rest of the site.
const notes: Note[] = [
  {
    id: "about",
    title: "About me",
    pinned: true,
    preview: profile.tagline,
    text: `${profile.tagline} ${profile.about.join(" ")}`,
    body: (
      <>
        <p className="lead">{profile.tagline}</p>
        {profile.about.map((p) => <p key={p}>{p}</p>)}
        <p>Based in {profile.location}. {profile.remote}.</p>
      </>
    ),
  },
  {
    id: "how",
    title: "How I work",
    pinned: true,
    preview: profile.about[1],
    text: profile.about[1],
    body: (
      <>
        <p className="lead">{profile.about[1]}</p>
        <p>What that looks like in projects I&apos;ve built:</p>
        <ul className="checks">
          <li><strong>Executable checks over promises.</strong> {projects.find((p) => p.id === "millwright")?.impact[1]}.</li>
          <li><strong>Receipts, not self-reports.</strong> {projects.find((p) => p.id === "millwright")?.impact[0]}.</li>
          <li><strong>Safe by construction.</strong> {projects.find((p) => p.id === "erp-atlas")?.impact[2]}.</li>
          <li><strong>Make the slow thing repeatable.</strong> {projects.find((p) => p.id === "erp-atlas")?.impact[0]}.</li>
        </ul>
      </>
    ),
  },
  {
    id: "highlights",
    title: "Highlights",
    preview: stats.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(" · "),
    text: stats.map((s) => `${s.value} ${s.label}`).join(" "),
    body: (
      <>
        <ul className="hl-grid">
          {stats.map((s) => <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>)}
        </ul>
        <p>Working professionally since {yearsSince}, across {experiences.length} companies.</p>
        <ul>{experiences.flatMap((e) => e.highlights.filter((h) => /\d/.test(h)).slice(0, 1)).map((h) => <li key={h}>{h}</li>)}</ul>
      </>
    ),
  },
  ...(learning.length
    ? [{
        id: "learning",
        title: "Currently learning",
        preview: learning.join(", "),
        text: learning.join(" "),
        body: <ul>{learning.map((l) => <li key={l}>{l}</li>)}</ul>,
      }]
    : []),
  {
    id: "education",
    title: "Education & awards",
    preview: `${education[0]?.degree}, ${education[0]?.score}`,
    text: `${education.map((e) => `${e.degree} ${e.institution}`).join(" ")} ${awards.join(" ")}`,
    body: (
      <>
        {education.map((e) => (
          <p key={e.institution}><strong>{e.degree}</strong><br />{e.institution} · {e.period} · {e.score}</p>
        ))}
        <h3>Awards</h3>
        <ul>{awards.map((a) => <li key={a}>{a}</li>)}</ul>
      </>
    ),
  },
];

export default function Notes({ props }: { props: AppProps }) {
  const [active, setActive] = useState((props.note as string) ?? "about");
  const [q, setQ] = useState("");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (props.note) setActive(props.note as string);
  }, [props.nonce, props.note]);

  const list = useMemo(() => notes.filter((n) => `${n.title} ${n.text}`.toLowerCase().includes(q.trim().toLowerCase())), [q]);
  const note = notes.find((n) => n.id === active) ?? notes[0];
  const pinned = list.filter((n) => n.pinned);
  const rest = list.filter((n) => !n.pinned);

  const item = (n: Note) => (
    <li key={n.id}>
      <button className={`note-item${n.id === note.id ? " on" : ""}`} aria-current={n.id === note.id || undefined} onClick={() => setActive(n.id)}>
        <strong>{n.pinned && <Pin size={11} aria-label="Pinned" />}{n.title}</strong>
        <span>{n.preview}</span>
      </button>
    </li>
  );

  return (
    <div className="notes">
      <aside className="notes-side" aria-label="Notes">
        <label className="search">
          <Search size={14} aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes" aria-label="Search notes" />
        </label>
        {pinned.length > 0 && <><p className="side-h">Pinned</p><ul>{pinned.map(item)}</ul></>}
        {rest.length > 0 && <><p className="side-h">Notes</p><ul>{rest.map(item)}</ul></>}
        {!list.length && <p className="empty">No notes match.</p>}
      </aside>
      <div className="note-page">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={note.id}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
          >
            <h2>{note.title}</h2>
            {note.body}
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
