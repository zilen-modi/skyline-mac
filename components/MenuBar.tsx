"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Moon, Search, Sun } from "lucide-react";
import { Monogram } from "@/components/icons/AppIcon";
import { apps, type AppId } from "@/lib/apps";
import { useShallow } from "zustand/react/shallow";
import { useWM } from "@/lib/store";
import { toggleAppearance, useAppearance } from "@/lib/theme";
import { useMounted } from "@/lib/hooks";
import { profile } from "@/data/portfolio";

type Entry = { label: string; hint?: string; action: () => void; checked?: boolean; disabled?: boolean } | "sep";
type Menu = { id: string; label: React.ReactNode; aria: string; bold?: boolean; items: Entry[] };

export const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export default function MenuBar({ mobile, onRestart }: { mobile: boolean; onRestart: () => void }) {
  const wm = useWM.getState();
  const focusedId = useWM((s) => s.focused);
  const openIds = useWM(useShallow((s) => Object.keys(s.wins) as AppId[]));
  const appearance = useAppearance();
  const mounted = useMounted();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const mod = mounted && !isMac() ? "Ctrl+" : "⌘";

  const go = (id: AppId, props?: Record<string, string>) => () => wm.open(id, props);

  const menus: Menu[] = [
    {
      id: "logo",
      label: <Monogram size={16} />,
      aria: "Portfolio menu",
      items: [
        { label: "About This Portfolio", action: go("welcome") },
        "sep",
        { label: appearance === "dark" ? "Switch to Light Appearance" : "Switch to Dark Appearance", action: toggleAppearance },
        { label: "Change Wallpaper…", action: () => wm.setPicker(true) },
        { label: "Quick Navigation…", action: () => wm.setQuickNav(true) },
        "sep",
        { label: "Restart…", action: onRestart },
      ],
    },
    {
      id: "app",
      label: focusedId ? apps[focusedId].name : "Portfolio",
      aria: "App menu",
      bold: true,
      items: [
        { label: `About ${profile.name}`, action: go("notes", { note: "about" }) },
        { label: "Download Resume", action: go("preview") },
        "sep",
        { label: `Contact ${profile.firstName}…`, action: go("mail") },
      ],
    },
    {
      id: "file",
      label: "File",
      aria: "File menu",
      items: [
        { label: "Open Projects", hint: "", action: go("finder") },
        { label: "Open Resume.pdf", action: go("preview") },
        { label: "New Terminal", action: go("terminal") },
        { label: "New Message", action: go("mail") },
        "sep",
        { label: "Close Window", disabled: !focusedId, action: () => focusedId && wm.close(focusedId) },
      ],
    },
    {
      id: "view",
      label: "View",
      aria: "View menu",
      items: [
        { label: "Spotlight Search", hint: `${mod}K`, action: () => wm.setSpotlight(true) },
        { label: "Mission Control", hint: "F3", action: () => wm.setMission(true) },
        { label: "Quick Navigation", action: () => wm.setQuickNav(true) },
        "sep",
        { label: "Dark Appearance", checked: appearance === "dark", action: toggleAppearance },
      ],
    },
    {
      id: "go",
      label: "Go",
      aria: "Go menu",
      items: [
        { label: "Projects", action: go("finder", { path: "projects" }) },
        { label: "Experience", action: go("finder", { path: "experience" }) },
        { label: "Career Dashboard", action: go("activity") },
        { label: "About Me", action: go("notes", { note: "about" }) },
        { label: "Live Links", action: go("safari") },
        { label: "Resume", action: go("preview") },
        { label: "Contact", action: go("mail") },
      ],
    },
    {
      id: "window",
      label: "Window",
      aria: "Window menu",
      items: [
        { label: "Minimize", disabled: !focusedId, action: () => focusedId && wm.minimize(focusedId) },
        { label: "Zoom", disabled: !focusedId, action: () => focusedId && wm.toggleMax(focusedId) },
        "sep",
        ...(openIds.length
          ? openIds.map((id) => ({ label: apps[id].title, checked: id === focusedId, action: () => wm.focus(id) }))
          : [{ label: "No open windows", disabled: true, action: () => {} }]),
      ],
    },
  ];

  const visible = mobile ? menus.filter((m) => m.id === "logo" || m.id === "go") : menus;

  // Close on outside click.
  useEffect(() => {
    if (!openMenu) return;
    const off = (e: PointerEvent) => !barRef.current?.contains(e.target as Node) && setOpenMenu(null);
    window.addEventListener("pointerdown", off);
    return () => window.removeEventListener("pointerdown", off);
  }, [openMenu]);

  function onBarKey(e: React.KeyboardEvent) {
    if (!openMenu) return;
    const i = visible.findIndex((m) => m.id === openMenu);
    if (e.key === "Escape") {
      setOpenMenu(null);
      barRef.current?.querySelector<HTMLButtonElement>(`[data-menu="${openMenu}"]`)?.focus();
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const next = visible[(i + (e.key === "ArrowRight" ? 1 : -1) + visible.length) % visible.length].id;
      setOpenMenu(next);
      requestAnimationFrame(() => barRef.current?.querySelector<HTMLElement>(`#menu-${next} [role=menuitem]:not([aria-disabled=true])`)?.focus());
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const items = Array.from(barRef.current?.querySelectorAll<HTMLElement>(`#menu-${openMenu} [role=menuitem]:not([aria-disabled=true])`) ?? []);
      const at = items.indexOf(document.activeElement as HTMLElement);
      items[(at + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    } else return;
    e.preventDefault();
  }

  return (
    <header className="menubar" ref={barRef} onKeyDown={onBarKey}>
      <a className="skip" href="#quicknav" onClick={(e) => { e.preventDefault(); wm.setQuickNav(true); }}>Skip to quick navigation</a>
      <nav className="menus" aria-label="Menu bar">
        {visible.map((m) => (
          <div key={m.id} className="menu">
            <button
              data-menu={m.id}
              className={`menu-btn${m.bold ? " bold" : ""}${openMenu === m.id ? " on" : ""}`}
              aria-label={typeof m.label === "string" ? undefined : m.aria}
              aria-haspopup="menu"
              aria-expanded={openMenu === m.id}
              onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
              onMouseEnter={() => openMenu && openMenu !== m.id && setOpenMenu(m.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenMenu(m.id);
                  requestAnimationFrame(() => barRef.current?.querySelector<HTMLElement>(`#menu-${m.id} [role=menuitem]:not([aria-disabled=true])`)?.focus());
                }
              }}
            >
              {m.label}
            </button>
            {openMenu === m.id && (
              <div className="menu-pop" role="menu" id={`menu-${m.id}`} aria-label={m.aria}>
                {m.items.map((it, i) =>
                  it === "sep" ? (
                    <div key={i} className="menu-sep" role="separator" />
                  ) : (
                    <button
                      key={i}
                      role="menuitem"
                      className="menu-item"
                      aria-disabled={it.disabled || undefined}
                      tabIndex={-1}
                      onClick={() => {
                        if (it.disabled) return;
                        setOpenMenu(null);
                        it.action();
                      }}
                    >
                      <span className="check">{it.checked ? "✓" : ""}</span>
                      <span>{it.label}</span>
                      {it.hint && <kbd>{it.hint}</kbd>}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="status">
        <button className="status-btn" aria-label="Quick navigation" title="Quick navigation" onClick={() => wm.setQuickNav(true)}><LayoutGrid size={14} /></button>
        <button className="status-btn" aria-label={`Switch to ${appearance === "dark" ? "light" : "dark"} appearance`} title="Appearance" onClick={toggleAppearance}>
          {mounted && appearance === "light" ? <Moon size={14} /> : <Sun size={14} />}
        </button>
        <button className="status-btn" aria-label="Spotlight search" title={`Spotlight (${mod}K)`} onClick={() => wm.setSpotlight(true)}><Search size={14} /></button>
        <Clock mobile={mobile} />
      </div>
    </header>
  );
}

function Clock({ mobile }: { mobile: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="clock" />;
  const day = now.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return <time className="clock" dateTime={now.toISOString()}>{mobile ? time : `${day}  ${time}`}</time>;
}
