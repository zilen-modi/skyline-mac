// Wallpapers are drawn in code (components/Wallpaper.tsx); each has a light and a dark version.
export const wallpapers = [
  { id: "dunes", name: "Dunes" },
  { id: "hills", name: "Hills" },
  { id: "horizon", name: "Horizon" },
  { id: "mesh", name: "Mesh" },
  { id: "aurora", name: "Aurora" },
  { id: "graphite", name: "Graphite" },
] as const;

export type WallpaperId = (typeof wallpapers)[number]["id"];

export const DEFAULT_WALLPAPER: WallpaperId = "dunes";

export const isWallpaper = (id: unknown): id is WallpaperId => wallpapers.some((w) => w.id === id);
