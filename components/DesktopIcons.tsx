"use client";

import { useEffect, useState } from "react";
import AppIcon, { DocIcon, FolderIcon } from "@/components/icons/AppIcon";
import { apps, dockOrder, type AppId } from "@/lib/apps";
import { useWM, type AppProps } from "@/lib/store";

type Icon = { key: string; label: string; art: React.ReactNode; open: [AppId, AppProps?] };

const desktopIcons: Icon[] = [
  { key: "projects", label: "Projects", art: <FolderIcon size={58} />, open: ["finder", { path: "projects" }] },
  { key: "resume", label: "Resume.pdf", art: <DocIcon size={56} />, open: ["preview"] },
  { key: "about", label: "About Me", art: <FolderIcon size={58} tint="#b9a4ff" />, open: ["notes", { note: "about" }] },
  { key: "contact", label: "Contact", art: <FolderIcon size={58} tint="#30d158" />, open: ["mail"] },
];

export default function DesktopIcons({ mobile }: { mobile: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const open = useWM((s) => s.open);

  // Clicking empty desktop clears the selection.
  useEffect(() => {
    const off = (e: PointerEvent) => !(e.target as HTMLElement).closest(".desk-icon") && setSelected(null);
    window.addEventListener("pointerdown", off);
    return () => window.removeEventListener("pointerdown", off);
  }, []);

  if (mobile) {
    // Phones get a home screen of every app instead of a desktop.
    const home: Icon[] = [
      { key: "welcome", label: "Welcome", art: <AppIcon id="welcome" size={58} />, open: ["welcome"] },
      ...dockOrder.map((id) => ({ key: id, label: apps[id].name, art: <AppIcon id={id} size={58} />, open: [id] as [AppId] })),
      { key: "preview", label: "Resume", art: <AppIcon id="preview" size={58} />, open: ["preview"] },
    ];
    return (
      <ul className="home-grid" aria-label="Apps">
        {home.map((it) => (
          <li key={it.key}>
            <button className="home-icon" onClick={() => open(...it.open)}>
              {it.art}
              <span>{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="desk-icons" aria-label="Desktop items">
      {desktopIcons.map((it) => (
        <li key={it.key}>
          <button
            className={`desk-icon${selected === it.key ? " sel" : ""}`}
            aria-label={`Open ${it.label}`}
            onPointerDown={(e) => {
              setSelected(it.key);
              if (e.pointerType === "touch") open(...it.open);
            }}
            onDoubleClick={() => open(...it.open)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), open(...it.open))}
          >
            <span className="desk-art">{it.art}</span>
            <span className="desk-label">{it.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
