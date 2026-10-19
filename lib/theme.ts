"use client";

import { useSyncExternalStore } from "react";

// Appearance: follows the system until the visitor picks one, then it is stored as html[data-theme].
export type Appearance = "light" | "dark";

function current(): Appearance {
  const t = document.documentElement.dataset.theme;
  if (t === "light" || t === "dark") return t;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function subscribe(cb: () => void) {
  window.addEventListener("themechange", cb);
  const m = window.matchMedia("(prefers-color-scheme: light)");
  m.addEventListener("change", cb);
  return () => {
    window.removeEventListener("themechange", cb);
    m.removeEventListener("change", cb);
  };
}

export function useAppearance() {
  return useSyncExternalStore(subscribe, current, () => "dark" as Appearance);
}

export function setAppearance(t: Appearance) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("appearance", t); } catch {}
  window.dispatchEvent(new Event("themechange"));
}

export function toggleAppearance() {
  setAppearance(current() === "dark" ? "light" : "dark");
}
