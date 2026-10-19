"use client";

import { useEffect, useState } from "react";
import { Download, Minus, Plus, Printer } from "lucide-react";
import { awards, education, experiences, profile, projects, skills } from "@/data/portfolio";

// The résumé, rendered from the same data as every app. Print it, or save it as a PDF from the print dialog.
export default function Preview() {
  const [zoom, setZoom] = useState(1);
  const [hasPdf, setHasPdf] = useState(false);

  // Offer the real PDF only if one has been added to public/.
  useEffect(() => {
    fetch(profile.cv, { method: "HEAD" }).then((r) => setHasPdf(r.ok && (r.headers.get("content-type") ?? "").includes("pdf"))).catch(() => {});
  }, []);

  const strip = (u: string) => u.replace(/^https?:\/\//, "");

  return (
    <div className="preview">
      <div className="toolbar">
        <div className="seg" role="group" aria-label="Zoom">
          <button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(1)))}><Minus size={15} /></button>
          <span className="zoom-val" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(1)))}><Plus size={15} /></button>
        </div>
        <span className="grow" />
        {hasPdf && <a className="btn small" href={profile.cv} download><Download size={14} />Download PDF</a>}
        <button className="btn small primary" onClick={() => window.print()}><Printer size={14} />Print / Save as PDF</button>
      </div>
      <div className="paper-scroll">
        <article className="paper print-root" style={{ zoom }}>
          <header>
            <h1>{profile.name}</h1>
            <p className="r-role">{profile.headline}</p>
            <p className="r-contact">
              {profile.location} · {profile.remote} · <a href={`mailto:${profile.email}`}>{profile.email}</a> · <a href={profile.linkedin}>{strip(profile.linkedin)}</a> · <a href={profile.github}>{strip(profile.github)}</a>
            </p>
          </header>
          <section>
            <h2>Summary</h2>
            {profile.about.map((a) => <p key={a}>{a}</p>)}
          </section>
          <section>
            <h2>Experience</h2>
            {experiences.map((e) => (
              <div key={e.id} className="r-item">
                <div className="r-line"><strong>{e.role}, {e.company}</strong><span>{e.period}</span></div>
                <ul>{e.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
              </div>
            ))}
          </section>
          <section>
            <h2>Selected projects</h2>
            {projects.map((p) => (
              <div key={p.id} className="r-item">
                <div className="r-line"><strong>{p.title}</strong><span>{p.tech.slice(0, 4).join(", ")}</span></div>
                <p>{p.impact[0]}.</p>
              </div>
            ))}
          </section>
          <section>
            <h2>Skills</h2>
            {skills.map((s) => <p key={s.category}><strong>{s.category}:</strong> {s.items.join(", ")}</p>)}
          </section>
          <section className="r-two">
            <div>
              <h2>Education</h2>
              {education.map((e) => <p key={e.institution}><strong>{e.degree}</strong><br />{e.institution}, {e.period} · {e.score}</p>)}
            </div>
            <div>
              <h2>Awards</h2>
              <ul>{awards.map((a) => <li key={a}>{a}</li>)}</ul>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
