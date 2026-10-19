"use client";

import { ArrowRight, FileText, MapPin, Send } from "lucide-react";
import { useWM } from "@/lib/store";
import { profile, stats } from "@/data/portfolio";
import { useIsMobile, useMounted } from "@/lib/hooks";
import { isMac } from "@/components/MenuBar";

export default function Welcome() {
  const open = useWM((s) => s.open);
  const mounted = useMounted();
  const mobile = useIsMobile();
  const initials = profile.name.split(" ").map((n) => n[0]).join("");

  return (
    <div className="welcome">
      <div className="wl-head">
        <div className="avatar" aria-hidden="true">{initials}</div>
        <div>
          <h1>Hello, I&apos;m {profile.firstName}.</h1>
          <p className="wl-role">{profile.headline}</p>
        </div>
      </div>
      <p className="wl-tagline">{profile.tagline}</p>
      <div className="wl-meta">
        {profile.available && <span className="pill good"><i />Available for opportunities</span>}
        <span className="pill"><MapPin size={13} />{profile.location} · {profile.remote}</span>
      </div>
      <div className="wl-actions">
        <button className="btn primary" onClick={() => open("finder", { path: "projects" })}>View Projects<ArrowRight size={15} /></button>
        <button className="btn" onClick={() => open("preview")}><FileText size={15} />Open Resume</button>
        <button className="btn" onClick={() => open("mail")}><Send size={15} />Contact</button>
      </div>
      <dl className="wl-stats">
        {stats.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="wl-tip">
        {mobile ? (
          <>Tip: tap <strong>Home</strong> to see every app, or{" "}</>
        ) : (
          <>Tip: double-click icons on the desktop, press <kbd>{mounted && !isMac() ? "Ctrl" : "⌘"}</kbd> <kbd>K</kbd> to search, or{" "}</>
        )}
        <button className="link" onClick={() => useWM.getState().setQuickNav(true)}>use quick navigation</button>.
      </p>
      <p className="wl-legal">A macOS-inspired portfolio. Not affiliated with or endorsed by Apple.</p>
    </div>
  );
}
