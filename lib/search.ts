import { apps, type AppId } from "./apps";
import type { AppProps } from "./store";
import { awards, experiences, profile, projects, skills } from "@/data/portfolio";

export type Hit = {
  id: string;
  group: "Top hits" | "Apps" | "Projects" | "Experience" | "Skills" | "Contact";
  title: string;
  sub?: string;
  icon: AppId;
  text: string; // what the query is matched against
  run: { open: [AppId, AppProps?] } | { href: string } | { copy: string };
};

export const index: Hit[] = [
  ...(Object.values(apps).map((a) => ({
    id: `app-${a.id}`, group: "Apps", title: a.name, sub: a.title !== a.name ? a.title : undefined, icon: a.id,
    text: `${a.name} ${a.title} ${a.keywords}`, run: { open: [a.id] },
  })) as Hit[]),
  ...projects.map<Hit>((p) => ({
    id: `project-${p.id}`, group: "Projects", title: p.title, sub: p.kicker, icon: "finder",
    text: `${p.title} ${p.kicker} ${p.summary} ${p.tech.join(" ")}`, run: { open: ["finder", { path: `projects/${p.id}` }] },
  })),
  ...experiences.map<Hit>((e) => ({
    id: `exp-${e.id}`, group: "Experience", title: `${e.role} · ${e.company}`, sub: e.period, icon: "finder",
    text: `${e.company} ${e.role} ${e.period} ${e.highlights.join(" ")}`, run: { open: ["finder", { path: "experience", focus: e.id }] },
  })),
  ...skills.flatMap<Hit>((s) =>
    s.items.map((item) => ({
      id: `skill-${item}`, group: "Skills", title: item, sub: s.category, icon: "activity",
      text: `${item} ${s.category}`, run: { open: ["activity", { tab: "tech", category: s.category }] },
    })),
  ),
  { id: "c-mail", group: "Contact", title: `Email ${profile.firstName}`, sub: profile.email, icon: "mail", text: `email contact hire mail ${profile.email}`, run: { open: ["mail"] } },
  { id: "c-copy", group: "Contact", title: "Copy email address", sub: profile.email, icon: "mail", text: `copy email ${profile.email}`, run: { copy: profile.email } },
  { id: "c-in", group: "Contact", title: "LinkedIn", sub: profile.linkedin.replace(/^https?:\/\//, ""), icon: "safari", text: "linkedin profile connect", run: { href: profile.linkedin } },
  { id: "c-gh", group: "Contact", title: "GitHub", sub: profile.github.replace(/^https?:\/\//, ""), icon: "safari", text: "github code repositories", run: { href: profile.github } },
  { id: "c-cv", group: "Contact", title: "Resume", sub: "Resume.pdf", icon: "preview", text: "resume cv pdf download", run: { open: ["preview"] } },
  { id: "c-awards", group: "Contact", title: "Education & awards", sub: awards[0], icon: "notes", text: `education awards degree college ${awards.join(" ")}`, run: { open: ["notes", { note: "education" }] } },
];

// Word starts beat substrings, which beat letters-in-order (a light fuzzy match).
function score(hit: Hit, q: string) {
  const title = hit.title.toLowerCase();
  const text = hit.text.toLowerCase();
  if (title.startsWith(q)) return 100;
  if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(title)) return 80;
  if (title.includes(q)) return 60;
  if (text.includes(q)) return 40;
  let i = 0;
  for (const ch of title) if (ch === q[i]) i++;
  return i === q.length ? 20 : 0;
}

export function search(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const ranked = index
    .map((h) => ({ h, s: score(h, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  // The single best hit is promoted into its own group, like Spotlight's "Top Hit".
  const out = ranked.slice(0, 24).map((x) => x.h);
  if (!out.length) return out;
  const [top, ...rest] = out;
  return [{ ...top, group: "Top hits" }, ...rest.filter((h) => h.id !== top.id)];
}

export const suggestions: Hit[] = index.filter((h) => ["app-finder", "c-cv", "c-mail", "project-erp-atlas", "project-millwright", "app-terminal"].includes(h.id));
