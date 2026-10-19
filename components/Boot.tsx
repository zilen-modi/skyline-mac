"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Monogram } from "@/components/icons/AppIcon";

const DURATION = 1.3;

// A short, skippable start-up: logo, progress bar, then the desktop fades in.
export default function Boot({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const finish = () => {
      try { sessionStorage.setItem("booted", "1"); } catch {}
      onDone();
    };
    const t = setTimeout(finish, DURATION * 1000 + 150);
    window.addEventListener("keydown", finish, { once: true });
    window.addEventListener("pointerdown", finish, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, [onDone]);

  return (
    <motion.div className="boot" role="status" aria-label="Starting up" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Monogram size={64} />
      </motion.div>
      <div className="boot-bar">
        <motion.span initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: DURATION, ease: [0.4, 0, 0.2, 1] }} />
      </div>
      <p className="boot-skip">Press any key to skip</p>
    </motion.div>
  );
}
