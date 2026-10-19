"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun, X } from "lucide-react";
import { WallpaperArt } from "@/components/Wallpaper";
import { useWM } from "@/lib/store";
import { setAppearance, useAppearance } from "@/lib/theme";
import { wallpapers } from "@/lib/wallpapers";

// A small "System Settings → Wallpaper" pane.
export default function WallpaperPicker() {
  const show = useWM((s) => s.picker);
  return <AnimatePresence>{show && <Pane />}</AnimatePresence>;
}

function Pane() {
  const current = useWM((s) => s.wallpaper);
  const { setPicker, setWallpaper } = useWM.getState();
  const theme = useAppearance();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("[aria-pressed=true]")?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setPicker(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [setPicker]);

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onPointerDown={(e) => e.target === e.currentTarget && setPicker(false)}>
      <motion.div
        ref={ref}
        className="wp-picker"
        role="dialog"
        aria-label="Wallpaper"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ duration: 0.16 }}
      >
        <div className="wp-head">
          <h2>Wallpaper</h2>
          <div className="am-tabs" role="group" aria-label="Appearance">
            <button aria-pressed={theme === "light"} className={theme === "light" ? "on" : ""} onClick={() => setAppearance("light")}><Sun size={13} />Light</button>
            <button aria-pressed={theme === "dark"} className={theme === "dark" ? "on" : ""} onClick={() => setAppearance("dark")}><Moon size={13} />Dark</button>
          </div>
          <button className="icon-btn" aria-label="Close wallpaper settings" onClick={() => setPicker(false)}><X size={16} /></button>
        </div>
        <ul className="wp-grid">
          {wallpapers.map((w) => (
            <li key={w.id}>
              <button className="wp-thumb" aria-pressed={current === w.id} onClick={() => setWallpaper(w.id)}>
                <span className="wp-thumb-art"><WallpaperArt id={w.id} theme={theme} /></span>
                <span>{w.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="wp-note">Each wallpaper has a light and a dark version. Your choice is remembered on this device.</p>
      </motion.div>
    </motion.div>
  );
}
