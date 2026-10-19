import { DOCK_SPACE, MENU_H, type Win } from "./store";

export type Rect = { x: number; y: number; w: number; h: number };
export type Vp = { w: number; h: number };

// Where a window actually sits: maximized windows fill the space between the menu bar and the Dock.
export function rectOf(win: Win, vp: Vp): Rect {
  if (win.maximized) return { x: 0, y: MENU_H, w: vp.w, h: vp.h - MENU_H - DOCK_SPACE };
  return { x: win.x, y: win.y, w: win.w, h: win.h };
}

// Mission Control: every open window scaled into a grid cell, in a stable (z) order.
export function missionLayout(wins: Win[], vp: Vp) {
  const list = [...wins].sort((a, b) => a.z - b.z);
  const n = list.length;
  const out = new Map<string, { x: number; y: number; s: number; cx: number; bottom: number }>();
  if (!n) return out;
  const cols = Math.ceil(Math.sqrt(n * (vp.w / vp.h) * 0.75));
  const rows = Math.ceil(n / cols);
  const top = MENU_H + 56;
  const areaH = vp.h - top - DOCK_SPACE - 24;
  const cellW = (vp.w - 64) / cols;
  const cellH = areaH / rows;
  list.forEach((win, i) => {
    const r = rectOf(win, vp);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const inRow = row === rows - 1 ? n - row * cols : cols;
    const rowOffset = ((cols - inRow) * cellW) / 2;
    const s = Math.min((cellW - 40) / r.w, (cellH - 56) / r.h, 0.7);
    const cx = 32 + rowOffset + col * cellW + cellW / 2;
    const cy = top + row * cellH + (cellH - 28) / 2;
    out.set(win.id, { x: cx - (r.w * s) / 2, y: cy - (r.h * s) / 2, s, cx, bottom: cy + (r.h * s) / 2 });
  });
  return out;
}
