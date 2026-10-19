"use client";

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useWM } from "@/lib/store";
import { useAppearance, type Appearance } from "@/lib/theme";
import { useMounted } from "@/lib/hooks";
import type { WallpaperId } from "@/lib/wallpapers";

// The desktop background. It fades in after hydration (the choice lives in localStorage)
// and cross-fades whenever the wallpaper or the appearance changes.
export default function Wallpaper() {
  const id = useWM((s) => s.wallpaper);
  const theme = useAppearance();
  const mounted = useMounted();
  const reduce = useReducedMotion();
  return (
    <div className="wallpaper" aria-hidden="true">
      <AnimatePresence initial={false}>
        {mounted && (
          <motion.div
            key={`${id}-${theme}`}
            className="wp-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.5 }}
          >
            <WallpaperArt id={id} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WallpaperArt({ id, theme }: { id: WallpaperId; theme: Appearance }) {
  const uid = useId().replace(/:/g, "");
  if (id === "aurora") return <div className="wp-art wp-aurora" />;
  const Art = { dunes: Dunes, hills: Hills, horizon: Horizon, mesh: Mesh, graphite: Graphite }[id];
  return (
    <svg className="wp-art" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      <Art dark={theme === "dark"} u={uid} />
    </svg>
  );
}

type ArtProps = { dark: boolean; u: string };

function Sky({ u, stops }: { u: string; stops: string[] }) {
  return (
    <>
      <defs>
        <linearGradient id={`${u}sky`} x1="0" y1="0" x2="0" y2="1">
          {stops.map((c, i) => <stop key={i} offset={i / (stops.length - 1)} stopColor={c} />)}
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${u}sky)`} />
    </>
  );
}

function Glow({ u, cx, cy, r, color, core, o = 0.85 }: { u: string; cx: number; cy: number; r: number; color: string; core?: number; o?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}glow`}>
          <stop offset="0" stopColor={color} stopOpacity={o} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${u}glow)`} />
      {core && <circle cx={cx} cy={cy} r={core} fill={color} />}
    </>
  );
}

// Deterministic stars so server and client agree.
const stars = Array.from({ length: 90 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return { x: (a - Math.floor(a)) * 1600, y: (b - Math.floor(b)) * 560, r: 0.8 + ((i * 7) % 5) * 0.35, o: 0.35 + ((i * 3) % 6) * 0.1 };
});
const Stars = ({ fill }: { fill: string }) => <g fill={fill}>{stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />)}</g>;

const dunePaths = [
  "M0 560 C300 470 620 650 920 560 S1400 460 1600 540 V1000 H0Z",
  "M0 650 C280 590 560 740 880 660 S1380 590 1600 670 V1000 H0Z",
  "M0 750 C320 680 700 850 1000 770 S1420 700 1600 780 V1000 H0Z",
  "M0 850 C360 790 760 950 1080 870 S1460 820 1600 870 V1000 H0Z",
  "M0 940 C420 890 820 1010 1160 950 S1500 920 1600 940 V1000 H0Z",
];

function Dunes({ dark, u }: ArtProps) {
  const c = dark
    ? { sky: ["#0c0f1f", "#2a1c4c", "#5d2f70"], sun: "#ffb38a", l: ["#6a3a86", "#552f75", "#412563", "#2e1b4d", "#1d1236"] }
    : { sky: ["#fdeedd", "#fccbb3", "#f6a898"], sun: "#fff3d6", l: ["#f2ae99", "#e8917d", "#d87565", "#c25a55", "#a2434a"] };
  return (
    <>
      <Sky u={u} stops={c.sky} />
      {dark && <Stars fill="#fff" />}
      <Glow u={u} cx={1080} cy={540} r={340} color={c.sun} core={92} />
      {dunePaths.map((d, i) => <path key={i} d={d} fill={c.l[i]} />)}
    </>
  );
}

function Hills({ dark, u }: ArtProps) {
  const c = dark
    ? { sky: ["#05101a", "#0c2736", "#164a55"], sun: "#e8f3ff", l: ["#1d5560", "#17444f", "#12363f", "#0d2830", "#081c22"] }
    : { sky: ["#b7ddff", "#dcefff", "#f4fbff"], sun: "#fff6cf", l: ["#b2e0c6", "#86cba4", "#5fb385", "#41976a", "#2c7b53"] };
  const hills = [
    "M0 610 Q200 500 420 585 T860 565 T1300 595 T1600 560 V1000 H0Z",
    "M0 700 Q260 610 520 690 T1040 670 T1600 700 V1000 H0Z",
    "M0 790 Q300 720 600 795 T1200 775 T1600 805 V1000 H0Z",
    "M0 880 Q340 815 700 885 T1400 870 T1600 880 V1000 H0Z",
    "M0 955 Q400 905 800 960 T1600 950 V1000 H0Z",
  ];
  return (
    <>
      <Sky u={u} stops={c.sky} />
      {dark && <Stars fill="#e8f3ff" />}
      <Glow u={u} cx={420} cy={300} r={dark ? 220 : 300} color={c.sun} core={dark ? 44 : 70} />
      {hills.map((d, i) => <path key={i} d={d} fill={c.l[i]} />)}
    </>
  );
}

function Horizon({ dark, u }: ArtProps) {
  const c = dark
    ? { sky: ["#04050c", "#0a0f30", "#1c215f"], planet: "#06071a", rim: "#8fa6ff", glow: "#5b6cff" }
    : { sky: ["#9fc2ff", "#dbe7ff", "#fff0e2"], planet: "#eef2ff", rim: "#ffffff", glow: "#ffb38a" };
  return (
    <>
      <Sky u={u} stops={c.sky} />
      {dark && <Stars fill="#fff" />}
      <defs>
        <filter id={`${u}blur`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="40" /></filter>
      </defs>
      <circle cx="800" cy="2050" r="1300" fill="none" stroke={c.glow} strokeWidth="90" opacity="0.55" filter={`url(#${u}blur)`} />
      <circle cx="800" cy="2050" r="1300" fill={c.planet} />
      <circle cx="800" cy="2050" r="1300" fill="none" stroke={c.rim} strokeWidth="3" opacity="0.9" />
    </>
  );
}

function Mesh({ dark, u }: ArtProps) {
  const blobs = [
    { x: 300, y: 260, r: 380, c: "#7c5cff" },
    { x: 1320, y: 220, r: 360, c: "#0a84ff" },
    { x: 1120, y: 820, r: 340, c: "#ff375f" },
    { x: 380, y: 860, r: 280, c: "#ff9f0a" },
    { x: 820, y: 520, r: 220, c: "#30d158" },
  ];
  return (
    <>
      <rect width="1600" height="1000" fill={dark ? "#0e0c18" : "#f6f3ff"} />
      <defs>
        <filter id={`${u}mesh`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="130" /></filter>
      </defs>
      <g filter={`url(#${u}mesh)`} opacity={dark ? 0.75 : 0.5}>
        {blobs.map((b) => <circle key={b.c} cx={b.x} cy={b.y} r={b.r} fill={b.c} />)}
      </g>
    </>
  );
}

function Graphite({ dark, u }: ArtProps) {
  return (
    <>
      <Sky u={u} stops={dark ? ["#1b1d23", "#121317", "#0c0d10"] : ["#f6f6f9", "#ececf1", "#e1e2e9"]} />
      <defs>
        <pattern id={`${u}dots`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill={dark ? "#fff" : "#000"} opacity={dark ? 0.08 : 0.09} />
        </pattern>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${u}dots)`} />
      <Glow u={u} cx={800} cy={120} r={620} color={dark ? "#7c5cff" : "#b9a4ff"} o={0.3} />
    </>
  );
}
