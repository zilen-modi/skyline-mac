"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type CtxItem = { label: string; action: () => void } | "sep";

// Right-click menu for the desktop background.
export default function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: CtxItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  // Keep the menu on screen.
  useLayoutEffect(() => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return;
    setPos({ x: Math.min(x, window.innerWidth - b.width - 6), y: Math.min(y, window.innerHeight - b.height - 6) });
  }, [x, y]);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const off = (e: Event) => !ref.current?.contains(e.target as Node) && onClose();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", off);
    window.addEventListener("keydown", key);
    window.addEventListener("resize", onClose);
    return () => {
      window.removeEventListener("pointerdown", off);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const list = Array.from(ref.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const i = list.indexOf(document.activeElement as HTMLElement);
    list[(i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length]?.focus();
  }

  return (
    <div ref={ref} className="menu-pop ctx-menu" role="menu" aria-label="Desktop" style={{ left: pos.x, top: pos.y }} onKeyDown={onKey} onContextMenu={(e) => e.preventDefault()}>
      {items.map((it, i) =>
        it === "sep" ? (
          <div key={i} className="menu-sep" role="separator" />
        ) : (
          <button key={i} role="menuitem" className="menu-item" tabIndex={-1} onClick={() => { onClose(); it.action(); }}>
            <span className="check" />
            <span>{it.label}</span>
          </button>
        ),
      )}
    </div>
  );
}
