"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShallow } from "zustand/react/shallow";
import MenuBar from "@/components/MenuBar";
import Dock from "@/components/Dock";
import Window from "@/components/Window";
import DesktopIcons from "@/components/DesktopIcons";
import Spotlight from "@/components/Spotlight";
import QuickNav from "@/components/QuickNav";
import Boot from "@/components/Boot";
import Toast from "@/components/Toast";
import Wallpaper from "@/components/Wallpaper";
import WallpaperPicker from "@/components/WallpaperPicker";
import ContextMenu from "@/components/ContextMenu";
import AppContent from "@/components/AppContent";
import { apps, type AppId } from "@/lib/apps";
import { useWM, type AppProps } from "@/lib/store";
import { missionLayout } from "@/lib/layout";
import { useIsMobile, useViewport } from "@/lib/hooks";
import { isWallpaper } from "@/lib/wallpapers";
import { toggleAppearance, useAppearance } from "@/lib/theme";
import { projects } from "@/data/portfolio";

// Deep links: /#projects, /#projects/erp-atlas, /#resume, /#contact, /#terminal…
function fromHash(hash: string): [AppId, AppProps?] | null {
  const [head, sub] = hash.replace(/^#\/?/, "").split("/");
  if (head === "projects") return ["finder", sub && projects.some((p) => p.id === sub) ? { path: `projects/${sub}` } : { path: "projects" }];
  if (head === "experience") return ["finder", { path: "experience" }];
  if (head === "resume" || head === "cv") return ["preview"];
  if (head === "contact") return ["mail"];
  if (head === "about") return ["notes", { note: "about" }];
  if (head === "career") return ["activity"];
  if (head in apps) return [head as AppId];
  return null;
}

export default function Desktop() {
  const wins = useWM(useShallow((s) => Object.values(s.wins).filter((w) => !!w)));
  const mission = useWM((s) => s.mission);
  const mobile = useIsMobile();
  const vp = useViewport();
  const [booting, setBooting] = useState<boolean | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const appearance = useAppearance();

  // First paint: boot once per session, then open the Welcome window (or a deep link).
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("booted") === "1"; } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setBooting(!seen && !reduce);
    try {
      const w = localStorage.getItem("wallpaper");
      if (isWallpaper(w)) useWM.setState({ wallpaper: w });
    } catch {}
    const { open } = useWM.getState();
    const link = fromHash(window.location.hash);
    if (link) open(...link);
    else open("welcome");
    const onHash = () => {
      const l = fromHash(window.location.hash);
      if (l) useWM.getState().open(...l);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Global shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useWM.getState();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        s.setSpotlight(!s.spotlight);
      } else if (e.key === "F3" || (e.ctrlKey && e.key === "ArrowUp")) {
        e.preventDefault();
        s.setMission(!s.mission);
      } else if (e.key === "Escape") {
        if (s.mission) s.setMission(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const layout = useMemo(() => (mission ? missionLayout(wins, vp) : null), [mission, wins, vp]);

  const bootDone = useCallback(() => setBooting(false), []);
  const closeCtx = useCallback(() => setCtx(null), []);

  const restart = () => {
    try { sessionStorage.removeItem("booted"); } catch {}
    setBooting(true);
  };

  return (
    <div className={`desktop${mobile ? " is-mobile" : ""}`}>
      <Wallpaper />
      <MenuBar mobile={mobile} onRestart={restart} />

      <main
        className="workspace"
        id="desktop"
        aria-label="Desktop"
        onContextMenu={(e) => {
          if (mobile || (e.target as HTMLElement).closest(".win, .desk-icon, .mc-backdrop")) return;
          e.preventDefault();
          setCtx({ x: e.clientX, y: e.clientY });
        }}
      >
        <DesktopIcons mobile={mobile} />

        <AnimatePresence>
          {mission && (
            <motion.div
              key="mc"
              className="mc-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => useWM.getState().setMission(false)}
            >
              <p className="mc-hint">Mission Control · click a window to switch, Esc to close</p>
              {!wins.length && <p className="mc-empty">No open windows</p>}
              {wins.map((w) => {
                const l = layout?.get(w.id);
                return l ? (
                  <span key={w.id} className="mc-label" style={{ left: l.cx, top: l.bottom + 10 }}>
                    {apps[w.id].name}{w.minimized ? " (minimized)" : ""}
                  </span>
                ) : null;
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {wins.map((w) => (
            <Window key={w.id} win={w} vp={vp} mobile={mobile} mission={layout?.get(w.id)}>
              <AppContent id={w.id} props={w.props} />
            </Window>
          ))}
        </AnimatePresence>
      </main>

      <Dock mobile={mobile} />
      <Spotlight />
      <QuickNav />
      <WallpaperPicker />
      {ctx && (
        <ContextMenu
          x={ctx.x}
          y={ctx.y}
          onClose={closeCtx}
          items={[
            { label: "Change Wallpaper…", action: () => useWM.getState().setPicker(true) },
            { label: appearance === "dark" ? "Use Light Appearance" : "Use Dark Appearance", action: toggleAppearance },
            "sep",
            { label: "Mission Control", action: () => useWM.getState().setMission(true) },
            { label: "Quick Navigation", action: () => useWM.getState().setQuickNav(true) },
          ]}
        />
      )}
      <Toast />
      <AnimatePresence>{booting && <Boot onDone={bootDone} />}</AnimatePresence>
    </div>
  );
}
