// Registry of every app on the desktop: names, default window size and search keywords.

export type AppId = "welcome" | "finder" | "terminal" | "safari" | "notes" | "activity" | "mail" | "preview";

export type AppMeta = {
  id: AppId;
  name: string;      // shown in the menu bar and the Dock tooltip
  title: string;     // window title
  w: number;
  h: number;
  keywords: string;  // used by Spotlight
};

export const apps: Record<AppId, AppMeta> = {
  welcome: { id: "welcome", name: "Welcome", title: "Welcome", w: 580, h: 540, keywords: "home hello intro start" },
  finder: { id: "finder", name: "Finder", title: "Projects", w: 940, h: 620, keywords: "projects work case study folders portfolio" },
  safari: { id: "safari", name: "Safari", title: "Safari", w: 980, h: 650, keywords: "browser live links github linkedin leetcode demos" },
  notes: { id: "notes", name: "Notes", title: "Notes", w: 860, h: 580, keywords: "about me story philosophy education awards" },
  terminal: { id: "terminal", name: "Terminal", title: "zilen — zsh", w: 740, h: 480, keywords: "cli shell command line developer mode" },
  activity: { id: "activity", name: "Activity Monitor", title: "Activity Monitor — Career", w: 900, h: 600, keywords: "career dashboard stats experience skills technologies numbers" },
  mail: { id: "mail", name: "Mail", title: "New Message", w: 760, h: 580, keywords: "contact email hire message reach" },
  preview: { id: "preview", name: "Preview", title: "Resume.pdf", w: 760, h: 720, keywords: "resume cv pdf download print" },
};

export const dockOrder: AppId[] = ["finder", "safari", "notes", "terminal", "activity", "mail"];
