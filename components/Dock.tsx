"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import AppIcon from "@/components/icons/AppIcon";
import { apps, dockOrder, type AppId } from "@/lib/apps";
import { useShallow } from "zustand/react/shallow";
import { useWM } from "@/lib/store";

const BASE = 50;
const PEAK = 84;

type Item = { id: AppId | "mission"; label: string; onClick: () => void };

export default function Dock({ mobile }: { mobile: boolean }) {
  const mouseX = useMotionValue(Infinity);
  const reduce = useReducedMotion();
  const openIds = useWM(useShallow((s) => Object.keys(s.wins)));
  const bounce = useWM((s) => s.bounce);
  const { open, setMission } = useWM.getState();
  const mission = useWM((s) => s.mission);

  const items: (Item | "sep")[] = [
    ...dockOrder.map((id) => ({ id, label: apps[id].name, onClick: () => open(id) })),
    "sep",
    { id: "preview", label: "Resume.pdf", onClick: () => open("preview") },
    ...(mobile ? [] : [{ id: "mission" as const, label: "Mission Control", onClick: () => setMission(!mission) }]),
  ];

  const magnify = !mobile && !reduce;

  // Arrow keys move between Dock items, like a toolbar.
  function onKey(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length]?.focus();
    e.preventDefault();
  }

  return (
    <nav aria-label="Dock" className={`dock-wrap${mobile ? " mobile" : ""}`}>
      <div
        className="dock"
        role="toolbar"
        aria-label="Apps"
        onKeyDown={onKey}
        onMouseMove={(e) => magnify && mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {items.map((it, i) =>
          it === "sep" ? (
            <span key={`sep${i}`} className="dock-sep" aria-hidden="true" />
          ) : (
            <DockIcon
              key={it.id}
              item={it}
              mouseX={mouseX}
              magnify={magnify}
              running={openIds.includes(it.id)}
              bouncing={!reduce && bounce === it.id}
              size={mobile ? 40 : BASE}
            />
          ),
        )}
      </div>
    </nav>
  );
}

function DockIcon({ item, mouseX, magnify, running, bouncing, size }: {
  item: Item; mouseX: MotionValue<number>; magnify: boolean; running: boolean; bouncing: boolean; size: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect();
    return b ? x - (b.left + b.width / 2) : Infinity;
  });
  const target = useTransform(distance, [-160, 0, 160], [size, PEAK, size]);
  const w = useSpring(target, { mass: 0.1, stiffness: 170, damping: 14 });

  return (
    <motion.button
      ref={ref}
      className="dock-item"
      data-dock={item.id}
      // Act on press: magnification can shift icons between press and release.
      onPointerDown={(e) => e.button === 0 && item.onClick()}
      onClick={(e) => e.detail === 0 && item.onClick()}
      aria-label={running ? `${item.label} (open)` : item.label}
      style={{ width: magnify ? w : size, height: magnify ? w : size }}
      animate={bouncing ? { y: [0, -22, 0, -10, 0] } : { y: 0 }}
      transition={bouncing ? { duration: 0.65, ease: "easeOut" } : undefined}
    >
      <AppIcon id={item.id} size="100%" />
      <span className="dock-tip" aria-hidden="true">{item.label}</span>
      {running && <span className="dock-dot" aria-hidden="true" />}
    </motion.button>
  );
}
