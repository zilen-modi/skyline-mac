"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import { ChevronLeft, X } from "lucide-react";
import { apps } from "@/lib/apps";
import { MENU_H, useWM, type Win } from "@/lib/store";
import { rectOf, type Vp } from "@/lib/layout";

type Props = {
  win: Win;
  vp: Vp;
  mobile: boolean;
  mission?: { x: number; y: number; s: number };
  children: React.ReactNode;
};

const MIN_W = 380;
const MIN_H = 260;

export default function Window({ win, vp, mobile, mission, children }: Props) {
  const meta = apps[win.id];
  const focused = useWM((s) => s.focused === win.id);
  const { close, minimize, hideAll, toggleMax, focus, patch, setMission } = useWM.getState();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false); // dragging or resizing: no CSS transitions
  const r = rectOf(win, vp);

  // Move keyboard focus into a window when it opens or is brought forward.
  useEffect(() => {
    if (focused && !win.minimized && !ref.current?.contains(document.activeElement)) ref.current?.focus({ preventScroll: true });
  }, [focused, win.minimized]);

  // Minimize toward the app's Dock icon (bottom centre when there is none).
  const dockTarget = useMemo(() => {
    if (!win.minimized || typeof document === "undefined") return null;
    const el = document.querySelector(`[data-dock="${win.id}"]`);
    const b = el?.getBoundingClientRect();
    return b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: vp.w / 2, y: vp.h - 30 };
  }, [win.minimized, win.id, vp.w, vp.h]);

  function drag(e: React.PointerEvent) {
    if (mobile || e.button !== 0 || (e.target as HTMLElement).closest("button, input, a, [data-nodrag]")) return;
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    let bx = r.x;
    let by = r.y;
    if (win.maximized) {
      // Pull a maximized window back to its normal size under the pointer, like macOS.
      bx = sx - ((sx - r.x) / r.w) * win.w;
      by = MENU_H;
      patch(win.id, { maximized: false, x: bx, y: by });
    }
    setBusy(true);
    const move = (ev: PointerEvent) => {
      const x = Math.min(Math.max(bx + ev.clientX - sx, -win.w + 120), vp.w - 120);
      const y = Math.min(Math.max(by + ev.clientY - sy, MENU_H), vp.h - 60);
      patch(win.id, { x, y });
    };
    const up = () => {
      setBusy(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function resize(e: React.PointerEvent, edge: "e" | "s" | "se" | "w" | "sw") {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX;
    const sy = e.clientY;
    const start = { ...r };
    if (win.maximized) patch(win.id, { maximized: false, ...start });
    setBusy(true);
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      const p: Partial<Win> = {};
      if (edge.includes("e")) p.w = Math.max(MIN_W, Math.min(start.w + dx, vp.w - start.x));
      if (edge.includes("s")) p.h = Math.max(MIN_H, Math.min(start.h + dy, vp.h - start.y - 8));
      if (edge.includes("w")) {
        const w = Math.max(MIN_W, start.w - dx);
        p.w = w;
        p.x = start.x + start.w - w;
      }
      patch(win.id, p);
    };
    const up = () => {
      setBusy(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const t = { duration: reduce ? 0 : 0.26, ease: [0.2, 0.8, 0.2, 1] as const };

  if (mobile) {
    return (
      <motion.section
        ref={ref}
        role="dialog"
        aria-label={meta.title}
        tabIndex={-1}
        className={`win win-mobile app-${win.id}`}
        style={{ zIndex: win.z }}
        initial={reduce ? false : { x: "100%" }}
        animate={focused && !win.minimized ? { x: 0, opacity: 1, visibility: "visible" } : { opacity: 0, transitionEnd: { visibility: "hidden" } }}
        exit={reduce ? { opacity: 0 } : { x: "100%" }}
        transition={t}
      >
        <header className="win-bar">
          <button className="mob-back" onClick={hideAll}><ChevronLeft size={20} />Home</button>
          <h2 className="win-title">{meta.title}</h2>
          <button className="mob-close" aria-label={`Close ${meta.name}`} onClick={() => close(win.id)}><X size={18} /></button>
        </header>
        <div className="win-body">{children}</div>
      </motion.section>
    );
  }

  let animate: TargetAndTransition;
  if (mission) animate = { x: mission.x - r.x, y: mission.y - r.y, scale: mission.s, opacity: 1, visibility: "visible" };
  else if (win.minimized && dockTarget)
    animate = { x: dockTarget.x - r.x - (r.w * 0.06) / 2, y: dockTarget.y - r.y - (r.h * 0.06) / 2, scale: 0.06, opacity: 0, transitionEnd: { visibility: "hidden" } };
  else animate = { x: 0, y: 0, scale: 1, opacity: 1, visibility: "visible" };

  return (
    <motion.section
      ref={ref}
      role="dialog"
      aria-label={meta.title}
      aria-hidden={win.minimized && !mission ? true : undefined}
      tabIndex={-1}
      className={`win app-${win.id}${focused ? " focused" : ""}${busy ? " busy" : ""}${win.maximized ? " max" : ""}${mission ? " in-mission" : ""}`}
      style={{ left: r.x, top: r.y, width: r.w, height: r.h, zIndex: win.z, transformOrigin: "0 0" }}
      initial={reduce ? false : { opacity: 0, scale: 0.96, x: r.w * 0.02, y: r.h * 0.02 + 8 }}
      animate={animate}
      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.96, x: r.w * 0.02, y: r.h * 0.02 }}
      transition={t}
      onPointerDownCapture={() => !mission && focus(win.id)}
    >
      <header className="win-bar" onPointerDown={drag} onDoubleClick={(e) => !(e.target as HTMLElement).closest("button, input") && toggleMax(win.id)}>
        <div className="lights">
          <button className="light close" aria-label={`Close ${meta.name}`} onClick={() => close(win.id)}><svg viewBox="0 0 10 10"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" /></svg></button>
          <button className="light min" aria-label={`Minimize ${meta.name}`} onClick={() => minimize(win.id)}><svg viewBox="0 0 10 10"><path d="M2 5h6" /></svg></button>
          <button className="light zoom" aria-label={win.maximized ? `Restore ${meta.name}` : `Zoom ${meta.name}`} onClick={() => toggleMax(win.id)}><svg viewBox="0 0 10 10"><path d="M3 2.5h4.5V7M7 3L3 7" /></svg></button>
        </div>
        <h2 className="win-title">{meta.title}</h2>
      </header>
      <div className="win-body">{children}</div>
      {!win.maximized && (
        <>
          <div className="rz rz-e" onPointerDown={(e) => resize(e, "e")} />
          <div className="rz rz-w" onPointerDown={(e) => resize(e, "w")} />
          <div className="rz rz-s" onPointerDown={(e) => resize(e, "s")} />
          <div className="rz rz-se" onPointerDown={(e) => resize(e, "se")} />
          <div className="rz rz-sw" onPointerDown={(e) => resize(e, "sw")} />
        </>
      )}
      {mission && (
        <button
          className="mc-hit"
          aria-label={`Switch to ${meta.name}`}
          onClick={() => {
            focus(win.id);
            setMission(false);
          }}
        />
      )}
    </motion.section>
  );
}
