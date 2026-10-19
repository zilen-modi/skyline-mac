import { create } from "zustand";
import { apps, type AppId } from "./apps";
import { DEFAULT_WALLPAPER, type WallpaperId } from "./wallpapers";

export const MENU_H = 28;
export const DOCK_SPACE = 88;

// Extra data an app is opened with (e.g. which project Finder should show).
// `nonce` changes on every open so an already-open app can react to a new request.
export type AppProps = { [key: string]: string | number | undefined; nonce?: number };

export type Win = {
  id: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  props: AppProps;
};

type Wins = Partial<Record<AppId, Win>>;

type WM = {
  wins: Wins;
  topZ: number;
  focused: AppId | null;
  spotlight: boolean;
  mission: boolean;
  quickNav: boolean;
  picker: boolean;
  wallpaper: WallpaperId;
  bounce: AppId | null;
  toast: { msg: string; key: number } | null;
  open: (id: AppId, props?: AppProps) => void;
  close: (id: AppId) => void;
  minimize: (id: AppId) => void;
  hideAll: () => void;
  toggleMax: (id: AppId) => void;
  focus: (id: AppId) => void;
  patch: (id: AppId, p: Partial<Win>) => void;
  setSpotlight: (v: boolean) => void;
  setMission: (v: boolean) => void;
  setQuickNav: (v: boolean) => void;
  setPicker: (v: boolean) => void;
  setWallpaper: (id: WallpaperId) => void;
  notify: (msg: string) => void;
};

// The window that should hold focus after another one goes away.
function topVisible(wins: Wins): AppId | null {
  let best: Win | null = null;
  for (const w of Object.values(wins)) if (w && !w.minimized && (!best || w.z > best.z)) best = w;
  return best?.id ?? null;
}

function placement(id: AppId, count: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const meta = apps[id];
  const w = Math.min(meta.w, vw - 32);
  const h = Math.min(meta.h, vh - MENU_H - DOCK_SPACE - 16);
  const step = count % 6;
  const x = Math.max(8, Math.round((vw - w) / 2 - 70 + step * 28));
  const y = Math.max(MENU_H + 8, Math.round(MENU_H + (vh - MENU_H - DOCK_SPACE - h) / 2 - 30 + step * 24));
  return { x, y, w, h };
}

let nonce = 0;
let bounceTimer: ReturnType<typeof setTimeout> | undefined;

export const useWM = create<WM>((set, get) => ({
  wins: {},
  topZ: 10,
  focused: null,
  spotlight: false,
  mission: false,
  quickNav: false,
  picker: false,
  wallpaper: DEFAULT_WALLPAPER,
  bounce: null,
  toast: null,

  open: (id, props) => {
    const { wins, topZ } = get();
    const z = topZ + 1;
    const p = { ...props, nonce: ++nonce };
    const existing = wins[id];
    if (existing) {
      set({ wins: { ...wins, [id]: { ...existing, z, minimized: false, props: props ? p : existing.props } }, topZ: z, focused: id, mission: false });
      return;
    }
    const count = Object.keys(wins).length;
    set({
      wins: { ...wins, [id]: { id, ...placement(id, count), z, minimized: false, maximized: false, props: p } },
      topZ: z,
      focused: id,
      mission: false,
      bounce: id,
    });
    clearTimeout(bounceTimer);
    bounceTimer = setTimeout(() => set({ bounce: null }), 700);
  },

  close: (id) => {
    const wins = { ...get().wins };
    delete wins[id];
    set({ wins, focused: topVisible(wins) });
  },

  minimize: (id) => {
    const w = get().wins[id];
    if (!w) return;
    const wins = { ...get().wins, [id]: { ...w, minimized: true } };
    set({ wins, focused: topVisible(wins) });
  },

  hideAll: () => {
    const wins: Wins = {};
    for (const w of Object.values(get().wins)) if (w) wins[w.id] = { ...w, minimized: true };
    set({ wins, focused: null });
  },

  toggleMax: (id) => {
    const w = get().wins[id];
    if (w) get().patch(id, { maximized: !w.maximized, minimized: false });
  },

  focus: (id) => {
    const { wins, topZ, focused } = get();
    const w = wins[id];
    if (!w || (focused === id && !w.minimized)) return;
    set({ wins: { ...wins, [id]: { ...w, z: topZ + 1, minimized: false } }, topZ: topZ + 1, focused: id });
  },

  patch: (id, p) => {
    const w = get().wins[id];
    if (w) set({ wins: { ...get().wins, [id]: { ...w, ...p } } });
  },

  setSpotlight: (v) => set({ spotlight: v, mission: false, quickNav: false, picker: false }),
  setMission: (v) => set({ mission: v, spotlight: false, quickNav: false, picker: false }),
  setQuickNav: (v) => set({ quickNav: v, spotlight: false, mission: false, picker: false }),
  setPicker: (v) => set({ picker: v, spotlight: false, mission: false, quickNav: false }),
  setWallpaper: (id) => {
    set({ wallpaper: id });
    try { localStorage.setItem("wallpaper", id); } catch {}
  },
  notify: (msg) => set({ toast: { msg, key: Date.now() } }),
}));
