import {
  Activity, Compass, FileText, FolderOpen, Hand, LayoutGrid, Mail, NotebookPen, Terminal, type LucideIcon,
} from "lucide-react";
import type { AppId } from "@/lib/apps";

// Our own rounded-square app icons: a gradient tile plus a Lucide glyph. Inspired by macOS, not copied from it.
const looks: Record<AppId | "mission", { bg: string; fg: string; Icon: LucideIcon }> = {
  welcome: { bg: "linear-gradient(160deg,#c9b8ff,#7c5cff 60%,#4b2fd6)", fg: "#fff", Icon: Hand },
  finder: { bg: "linear-gradient(160deg,#6cc4ff,#0a84ff 55%,#0058d6)", fg: "#fff", Icon: FolderOpen },
  safari: { bg: "linear-gradient(160deg,#ffffff,#dfe9f7)", fg: "#0a84ff", Icon: Compass },
  notes: { bg: "linear-gradient(180deg,#ffe066 0 30%,#fffdf3 30%)", fg: "#b98a00", Icon: NotebookPen },
  terminal: { bg: "linear-gradient(160deg,#3a3d46,#15171c)", fg: "#30d158", Icon: Terminal },
  activity: { bg: "linear-gradient(160deg,#2c2f38,#101215)", fg: "#30d158", Icon: Activity },
  mail: { bg: "linear-gradient(160deg,#7cc8ff,#1a8cff 60%,#0060df)", fg: "#fff", Icon: Mail },
  preview: { bg: "linear-gradient(160deg,#ffffff,#e9e4ff)", fg: "#6c4cff", Icon: FileText },
  mission: { bg: "linear-gradient(160deg,#9b8cff,#3b2f8f)", fg: "#fff", Icon: LayoutGrid },
};

export default function AppIcon({ id, size = 48 }: { id: AppId | "mission"; size?: number | string }) {
  const { bg, fg, Icon } = looks[id];
  return (
    <span className="app-icon" style={{ width: size, height: size, background: bg, color: fg }} aria-hidden="true">
      <Icon strokeWidth={2} />
    </span>
  );
}

// A folder for the desktop and Finder, optionally with a project cover peeking out.
export function FolderIcon({ size = 64, tint = "#5ab0ff" }: { size?: number; tint?: string }) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 64 52" aria-hidden="true" className="folder-icon">
      <path d="M4 8a4 4 0 0 1 4-4h14l5 5h29a4 4 0 0 1 4 4v3H4z" fill={tint} opacity="0.75" />
      <rect x="4" y="13" width="56" height="35" rx="4" fill={tint} />
      <rect x="4" y="13" width="56" height="6" rx="3" fill="#fff" opacity="0.18" />
    </svg>
  );
}

export function DocIcon({ size = 56 }: { size?: number }) {
  return (
    <svg width={size * 0.8} height={size} viewBox="0 0 48 60" aria-hidden="true">
      <path d="M4 4a3 3 0 0 1 3-3h24l13 13v42a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#fff" stroke="rgba(0,0,0,.12)" />
      <path d="M31 1v10a3 3 0 0 0 3 3h10" fill="#e8e8ee" />
      <rect x="11" y="22" width="22" height="3" rx="1.5" fill="#c9c9d3" />
      <rect x="11" y="29" width="26" height="3" rx="1.5" fill="#c9c9d3" />
      <rect x="11" y="36" width="18" height="3" rx="1.5" fill="#c9c9d3" />
      <rect x="9" y="45" width="20" height="9" rx="2.5" fill="#ff453a" />
      <text x="19" y="51.8" fontSize="6.5" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="system-ui">PDF</text>
    </svg>
  );
}

export function Monogram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.14" />
      <path d="M7.5 7.5h9l-9 9h9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
