import { Box, GitPullRequest, MessagesSquare, Network, Smartphone, TrendingUp, Workflow, type LucideIcon } from "lucide-react";
import type { Project } from "@/data/portfolio";
import { FolderIcon } from "@/components/icons/AppIcon";

// Project covers drawn in code, so they follow the desktop's look and its light/dark appearance.
// Each one is a small app window showing what the project does, tinted with the project's accent.

const glyphs: Record<string, LucideIcon> = {
  "erp-atlas": Network,
  millwright: GitPullRequest,
  pricing: TrendingUp,
  "pwa-suite": Smartphone,
  etl: Workflow,
  "support-iq": MessagesSquare,
};

// Lighten a hex colour toward white (t = 0..1); used for folder tints, which take a plain colour.
function tint(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) + (255 - ((n >> s) & 255)) * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

// Finder folder with the project's symbol engraved on it, like macOS special folders.
export function ProjectFolder({ p, size = 92 }: { p: Project; size?: number }) {
  const Glyph = glyphs[p.id] ?? Box;
  return (
    <span className="pf" style={{ ["--acc" as string]: p.accent }}>
      <FolderIcon size={size} tint={tint(p.accent, 0.18)} />
      <Glyph className="pf-glyph" size={Math.round(size * 0.3)} strokeWidth={2.2} aria-hidden="true" />
    </span>
  );
}

export default function ProjectArt({ p, size, className = "" }: { p: Project; size: "card" | "hero"; className?: string }) {
  return (
    <span className={`pa ${size} ${className}`} style={{ ["--acc" as string]: p.accent }} role="img" aria-label={`${p.title}: ${p.kicker}`}>
      <span className="pa-win">
        <span className="pa-bar">
          <i /><i /><i />
          {size === "hero" && <span className="pa-title">{p.title}</span>}
        </span>
        <svg viewBox="0 0 320 190" aria-hidden="true">{(scenes[p.id] ?? scenes.fallback)()}</svg>
      </span>
    </span>
  );
}

const check = (cx: number, cy: number) => <path d={`M${cx - 3.5} ${cy} l2.5 2.5 l4.5 -5`} className="pa-chk" />;

const scenes: Record<string, () => React.ReactNode> = {
  // Index of a legacy system: program list + dependency graph + a cited answer.
  "erp-atlas": () => {
    const N = [[136, 40], [200, 28], [266, 50], [152, 100], [224, 92], [290, 112], [126, 150], [190, 146]];
    const E = [[0, 1], [1, 2], [0, 3], [1, 4], [3, 4], [4, 5], [2, 5], [3, 6], [4, 7], [6, 7]];
    const hot = new Set(["0-3", "3-4", "4-5"]);
    return (
      <>
        <rect width="94" height="190" className="pa-c" />
        <rect x="8" y="11" width="78" height="17" rx="5" className="pa-s" />
        {[54, 40, 48, 34, 52, 38, 44].map((w, i) => <rect key={i} x="16" y={16 + i * 22} width={w} height="6" rx="3" className={i ? "pa-l" : "pa-a"} />)}
        {E.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} className={hot.has(`${a}-${b}`) ? "pa-k" : "pa-kl"} />
        ))}
        {N.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={[0, 3, 4, 5].includes(i) ? 7 : 5} className={[0, 3, 4, 5].includes(i) ? "pa-a" : "pa-l"} />)}
        <rect x="214" y="140" width="96" height="40" rx="8" className="pa-c pa-edge" />
        <rect x="224" y="150" width="58" height="5" rx="2.5" className="pa-l" />
        <rect x="224" y="160" width="44" height="5" rx="2.5" className="pa-l" />
        <rect x="286" y="148" width="16" height="11" rx="5.5" className="pa-a" />
      </>
    );
  },

  // A run log: each stage passes its gate, the last one waits at the human merge gate.
  millwright: () => {
    const rows = [92, 120, 70, 104, 84];
    return (
      <>
        <rect x="23" y="22" width="2" height="128" className="pa-l" />
        {rows.map((w, i) => {
          const y = 22 + i * 32;
          const done = i < 4;
          return (
            <g key={i}>
              <circle cx="24" cy={y} r="9" className={done ? "pa-a" : "pa-c pa-ring"} />
              {done ? check(24, y) : <circle cx="24" cy={y} r="3" className="pa-a" />}
              <rect x="44" y={y - 7} width={w} height="7" rx="3.5" className="pa-l" />
              <rect x="44" y={y + 4} width={w * 0.55} height="5" rx="2.5" className="pa-l pa-dim" />
              <rect x="252" y={y - 7} width="54" height="14" rx="7" className={done ? "pa-s" : "pa-c pa-ring"} />
              <rect x="262" y={y - 2} width={done ? 34 : 26} height="4" rx="2" className={done ? "pa-a" : "pa-l"} />
            </g>
          );
        })}
        <rect x="12" y="166" width="296" height="18" rx="5" className="pa-c" />
        {[0, 1, 2].map((i) => <rect key={i} x={20 + i * 22} y="172" width="14" height="6" rx="3" className="pa-a" />)}
        <rect x="90" y="172" width="80" height="6" rx="3" className="pa-l" />
      </>
    );
  },

  // Quote guidance: KPI tiles, a floor–ceiling band and the target price line.
  pricing: () => {
    const target = [[16, 120], [74, 112], [130, 118], [186, 102], [242, 108], [304, 94]];
    return (
      <>
        {[50, 40, 58].map((w, i) => (
          <g key={i}>
            <rect x={12 + i * 102} y="12" width="94" height="40" rx="8" className="pa-c" />
            <rect x={22 + i * 102} y="21" width="34" height="5" rx="2.5" className="pa-l" />
            <rect x={22 + i * 102} y="32" width={w} height="10" rx="3" className={i === 1 ? "pa-a" : "pa-l"} />
          </g>
        ))}
        {[80, 104, 128, 152, 176].map((y) => <rect key={y} x="12" y={y} width="296" height="1" className="pa-l" />)}
        <polygon points="16,98 74,90 130,96 186,80 242,86 304,72 304,118 242,130 186,124 130,140 74,134 16,142" className="pa-s" />
        <polyline points={target.map((pt) => pt.join(",")).join(" ")} className="pa-k" />
        {target.map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.5" className="pa-a" />)}
        {[[44, 152], [104, 148], [214, 146]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" className="pa-l" />)}
        <circle cx="160" cy="160" r="4" className="pa-warn" />
      </>
    );
  },

  // Four installable phone apps on one shared foundation.
  "pwa-suite": () => {
    const colors = ["#ff9f0a", "#30d158", "#0a84ff", "#ff375f"];
    return (
      <>
        {colors.map((c, i) => {
          const x = 16 + i * 76;
          return (
            <g key={c}>
              <rect x={x} y="16" width="64" height="168" rx="12" className="pa-c pa-ring-l" />
              <rect x={x + 24} y="22" width="16" height="3" rx="1.5" className="pa-l" />
              <rect x={x + 7} y="32" width="50" height="34" rx="7" style={{ fill: c }} />
              {[0, 1, 2, 3].map((r) => (
                <g key={r}>
                  <circle cx={x + 12} cy={80 + r * 18} r="4" style={{ fill: c, opacity: 0.35 }} />
                  <rect x={x + 20} y={77 + r * 18} width={[30, 22, 26, 18][r]} height="6" rx="3" className="pa-l" />
                </g>
              ))}
            </g>
          );
        })}
        <rect x="16" y="176" width="288" height="1" className="pa-l" />
      </>
    );
  },

  // S3 → SQS → Lambda → MongoDB, with failures parked in a dead-letter queue.
  etl: () => {
    const boxes = [{ x: 12, w: 56, t: "S3" }, { x: 90, w: 56, t: "SQS" }, { x: 168, w: 56, t: "λ" }, { x: 246, w: 64, t: "Mongo" }];
    return (
      <>
        {boxes.map((b, i) => (
          <g key={b.t}>
            <rect x={b.x} y="44" width={b.w} height="46" rx="9" className={i === 2 ? "pa-s pa-edge-a" : "pa-c pa-edge"} />
            <text x={b.x + b.w / 2} y="71" textAnchor="middle" className="pa-tx">{b.t}</text>
            {i < 3 && (
              <>
                <line x1={b.x + b.w + 4} y1="67" x2={boxes[i + 1].x - 8} y2="67" className="pa-k" />
                <path d={`M${boxes[i + 1].x - 9} 62 l6 5 l-6 5`} className="pa-k" />
              </>
            )}
          </g>
        ))}
        <path d="M184 40 a14 14 0 1 1 24 0" className="pa-k pa-thin" />
        <path d="M205 36 l3 4 l-5 1" className="pa-k pa-thin" />
        <path d="M196 94 V146 H152" className="pa-err" />
        <rect x="90" y="128" width="56" height="36" rx="8" className="pa-c pa-edge-err" />
        <text x="118" y="150" textAnchor="middle" className="pa-tx pa-tx-err">DLQ</text>
        {[0, 1, 2].map((i) => <rect key={i} x={234 + i * 26} y="118" width="20" height="20" rx="5" className="pa-s" />)}
      </>
    );
  },

  // An embeddable support agent answering with citations.
  "support-iq": () => (
    <>
      <rect x="16" y="14" width="150" height="32" rx="11" className="pa-c" />
      <rect x="28" y="22" width="110" height="6" rx="3" className="pa-l" />
      <rect x="28" y="32" width="72" height="6" rx="3" className="pa-l" />
      <rect x="60" y="56" width="244" height="72" rx="12" className="pa-s" />
      {[196, 214, 180, 120].map((w, i) => <rect key={i} x="74" y={68 + i * 13} width={w} height="6" rx="3" className="pa-l" />)}
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={60 + i * 28} y="134" width="22" height="13" rx="6.5" className="pa-a" />
          <text x={71 + i * 28} y="143.5" textAnchor="middle" className="pa-tx pa-tx-w">{i + 1}</text>
        </g>
      ))}
      <rect x="16" y="158" width="288" height="24" rx="12" className="pa-c pa-ring-l" />
      <rect x="30" y="167" width="96" height="6" rx="3" className="pa-l" />
      <circle cx="291" cy="170" r="8" className="pa-a" />
    </>
  ),

  fallback: () => (
    <>
      <rect x="12" y="12" width="296" height="22" rx="6" className="pa-c" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={12 + i * 100} y="44" width="92" height="120" rx="8" className="pa-c" />
          <rect x={22 + i * 100} y="54" width="72" height="40" rx="5" className={i ? "pa-s" : "pa-a"} />
          <rect x={22 + i * 100} y="104" width="56" height="6" rx="3" className="pa-l" />
          <rect x={22 + i * 100} y="116" width="40" height="6" rx="3" className="pa-l" />
        </g>
      ))}
    </>
  ),
};
