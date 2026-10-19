"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import AppIcon from "@/components/icons/AppIcon";
import { useWM, type AppProps } from "@/lib/store";
import type { AppId } from "@/lib/apps";
import { profile } from "@/data/portfolio";

// Plain navigation for anyone who'd rather not explore a desktop.
const links: { label: string; sub: string; icon: AppId; open: [AppId, AppProps?] }[] = [
  { label: "Projects", sub: "Case studies and results", icon: "finder", open: ["finder", { path: "projects" }] },
  { label: "Resume", sub: "View, print or save as PDF", icon: "preview", open: ["preview"] },
  { label: "Experience", sub: "Roles and highlights", icon: "finder", open: ["finder", { path: "experience" }] },
  { label: "Career dashboard", sub: "Numbers and technologies", icon: "activity", open: ["activity"] },
  { label: "About me", sub: "Story and how I work", icon: "notes", open: ["notes", { note: "about" }] },
  { label: "Contact", sub: profile.email, icon: "mail", open: ["mail"] },
];

export default function QuickNav() {
  const show = useWM((s) => s.quickNav);
  const { setQuickNav, open } = useWM.getState();
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!show) return;
    first.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setQuickNav(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [show, setQuickNav]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onPointerDown={(e) => e.target === e.currentTarget && setQuickNav(false)}>
          <motion.nav
            id="quicknav"
            className="quicknav"
            aria-label="Quick navigation"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <div className="qn-head">
              <div>
                <h2>Quick navigation</h2>
                <p>Jump straight to any section. Everything here is also an app on the desktop.</p>
              </div>
              <button className="icon-btn" aria-label="Close quick navigation" onClick={() => setQuickNav(false)}><X size={16} /></button>
            </div>
            <ul>
              {links.map((l, i) => (
                <li key={l.label}>
                  <button ref={i === 0 ? first : undefined} onClick={() => { setQuickNav(false); open(...l.open); }}>
                    <AppIcon id={l.icon} size={36} />
                    <span><strong>{l.label}</strong><small>{l.sub}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
