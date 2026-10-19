// Single source of truth for every app on the desktop and the résumé.

export const profile = {
  name: "Zilen Modi",
  firstName: "Zilen",
  role: "Full Stack Engineer",
  headline: "Full Stack Engineer · data-heavy web apps & cloud systems",
  tagline: "I turn messy systems into fast, trustworthy products, from legacy ERPs to offline-first apps.",
  about: [
    "Full Stack Engineer with 3.5+ years building enterprise products and cloud-native systems. I design serverless pipelines on AWS, ship fast Next.js frontends, and build the tooling that makes large migrations safe.",
    "I care about measurable results and systems people can trust: every answer cited, every check executable, every number traceable.",
  ],
  email: "zilenmodi@gmail.com",
  github: "https://github.com/zilen-modi",
  linkedin: "https://linkedin.com/in/zilen-modi",
  leetcode: "https://leetcode.com/zilenmodi",
  location: "Ahmedabad, India",
  remote: "Open to remote",
  available: true,
  cv: "/Zilen-Modi-CV.pdf",
};

export const stats = [
  { value: "3.5+", label: "Years experience" },
  { value: "12+", label: "Developers mentored" },
  { value: "70%", label: "Lighthouse boost" },
  { value: "785+", label: "LeetCode solved" },
];

export type Project = {
  id: string;
  title: string;
  kicker: string;          // one-line category
  summary: string;         // the problem and what I built
  impact: string[];        // results, metric first
  tech: string[];
  status: "private" | "public" | "design";
  links?: { label: string; href: string }[];
  accent: string;          // tints the project's folder and cover art (components/ProjectArt.tsx)
  // optional case-study detail; Finder shows each section only when it is filled in
  role?: string;           // your contribution
  architecture?: string[];
  tradeoffs?: string[];
};

export const projects: Project[] = [
  {
    id: "erp-atlas",
    title: "ERP Atlas",
    kicker: "Legacy system intelligence · migration tooling",
    summary:
      "A toolkit that makes a decades-old Pick/UniVerse ERP understandable and its migration verifiable: it indexes ~10,000 programs, 1,800 screens and 5,500 data dictionaries, answers questions with code citations, and compares old vs new records field by field at every step of a business flow.",
    impact: [
      "Old-vs-new Compare turned a manual, error-prone parity check into a repeatable run with notes and PDF reports",
      "3D branch network, screen viewer, data-quality profiler and background-jobs map from one index",
      "Read-only by design: hard-coded endpoint allowlist, sensitive files blocked",
    ],
    tech: ["Python", "FastAPI", "SQLite", "Next.js", "three.js", "Playwright", "MCP"],
    status: "private",
    accent: "#7c5cff",
  },
  {
    id: "millwright",
    title: "Millwright",
    kicker: "Engineering agent · ticket to pull request",
    summary:
      "An agent pipeline that resolves a ticket end to end across a multi-repo codebase: routes it to the right repositories, checks git history for an existing fix, plans, builds in an isolated worktree, runs the repo's own gates, reviews against the design and acceptance criteria, and opens a PR, then stops at the human merge gate.",
    impact: [
      "Nothing self-reports a pass: scores exist only as receipts bound to the commit they measured",
      "Executable gates (linter, pixel diff, accessibility) instead of prompt rules; fails closed",
      "Control panel showing what each run did, what it cost, and why a gate refused",
    ],
    tech: ["TypeScript", "Node.js", "Git worktrees", "Playwright", "LLM agents"],
    status: "private",
    accent: "#0a84ff",
  },
  {
    id: "pricing",
    title: "Pricing & Margin Intelligence",
    kicker: "Pricing engine · B2B distribution",
    summary:
      "A margin-aware pricing engine that learns segmented willingness-to-pay from ~130k order lines and puts the right price, with a plain-language rationale and guardrails, in front of the rep at the moment of the quote.",
    impact: [
      "Flags ~$724k/yr of margin at risk when supplier costs move, SKU by SKU",
      "Floor/target/ceiling guidance with override reasons and a margin-leakage dashboard",
      "Recommendations validated against ground-truth patterns planted in the data",
    ],
    tech: ["Python", "FastAPI", "React", "TypeScript", "pandas"],
    status: "private",
    accent: "#30d158",
  },
  {
    id: "pwa-suite",
    title: "Offline-first app suite",
    kicker: "Four installable iPhone apps · zero servers",
    summary:
      "Safar (trips and shared expenses), Fortuna (personal finance and SIPs), Aaj (tasks and habits) and Thali (meal planner with auto grocery list): private PWAs that install on an iPhone and keep every byte on-device, built on one shared foundation.",
    impact: [
      "No accounts, no servers, no trackers; works fully offline",
      "Daily IndexedDB snapshots with point-in-time restore and self-recovery",
      "PDF reports, multi-currency, settle-up and recurring-rule engines with unit tests",
    ],
    tech: ["React 19", "TypeScript", "Vite", "Zustand", "Tailwind", "PWA"],
    status: "private",
    accent: "#ff9f0a",
  },
  {
    id: "etl",
    title: "Serverless ETL Pipeline",
    kicker: "AWS data platform",
    summary:
      "An AWS-native pipeline for multi-valued legacy data: Lambda workers fed by SQS, staged in S3, with a dead-letter queue for failures and a pluggable adapter layer that transforms records before persisting them to MongoDB.",
    impact: [
      "Asynchronous processing with automatic retries and full error isolation",
      "Adapter pattern keeps parsing, transformation and persistence independently testable",
    ],
    tech: ["AWS Lambda", "SQS", "S3", "DLQ", "Node.js", "MongoDB"],
    status: "private",
    accent: "#ff6b3d",
  },
  {
    id: "support-iq",
    title: "SupportIQ AI",
    kicker: "AI customer support platform · in design",
    summary:
      "A support platform for SaaS teams: upload docs or crawl a site, then deploy an embeddable agent that answers with citations, with analytics, feedback loops, AI cost tracking and a golden-set regression suite for answer quality.",
    impact: [
      "Product requirements, system design and RAG pipeline specified",
      "Typed contracts (Zod) shared by a NestJS API and a FastAPI/LangGraph AI service",
    ],
    tech: ["Next.js", "NestJS", "FastAPI", "LangGraph", "Zod", "RAG"],
    status: "design",
    accent: "#ff375f",
  },
];

export const experiences = [
  {
    id: "distinction",
    color: "#a78bfa",
    company: "Distinction Dev",
    location: "Ahmedabad, IN",
    role: "Software Developer",
    period: "Jul 2025 – Present",
    current: true,
    highlights: [
      "Built a serverless ETL pipeline on AWS Lambda, SQS, S3 and DLQ with async processing, automatic retries and full error isolation.",
      "Designed a decoupled data-ingestion layer with pluggable adapters for complex multi-valued transformations and MongoDB persistence.",
      "Migrated a large ERP front end to Next.js with Redux Toolkit in a monorepo, and built internal tooling to verify the migration.",
    ],
  },
  {
    id: "bacancy",
    color: "#38bdf8",
    company: "Bacancy Technology",
    location: "Ahmedabad, IN",
    role: "Software Engineer",
    period: "Aug 2023 – Jun 2025",
    current: false,
    highlights: [
      "Built the auction module for a platform driving $100M+ revenue and 2.4M participants in its 2025 event.",
      "Led front-end development across multiple client web apps with Next.js, TypeScript and React.",
      "Trained and mentored 12+ junior developers, raising team productivity and code quality.",
      "Enforced engineering best practices, achieving a 70% improvement in Lighthouse performance scores.",
    ],
  },
  {
    id: "simform",
    color: "#34d399",
    company: "Simform Solutions",
    location: "Ahmedabad, IN",
    role: "Software Engineer Trainee",
    period: "Feb 2023 – Jul 2023",
    current: false,
    highlights: [
      "Built a Kanban task scheduler with a Firebase real-time backend.",
      "Set up GitHub Actions CI/CD deploying to AWS S3 + CloudFront for zero-downtime releases.",
      "Improved React performance by 15% with memoisation patterns.",
    ],
  },
];

export const skills: { category: string; color: string; items: string[] }[] = [
  { category: "Frontend", color: "#a78bfa", items: ["React", "Next.js", "TypeScript", "three.js", "TanStack Query", "Redux Toolkit", "Tailwind"] },
  { category: "Backend", color: "#38bdf8", items: ["Node.js", "Python", "FastAPI", "NestJS", "Express", "REST", "tRPC"] },
  { category: "Data", color: "#34d399", items: ["PostgreSQL", "MongoDB", "SQLite", "Prisma", "pandas"] },
  { category: "Cloud & DevOps", color: "#f59e0b", items: ["AWS Lambda", "SQS", "S3", "CloudFront", "GitHub Actions", "Vercel"] },
  { category: "AI tooling", color: "#f472b6", items: ["LLM agents", "RAG", "MCP", "Evaluation suites"] },
];

export const education = [
  {
    institution: "Vishwakarma Government Engineering College",
    degree: "B.E. in Computer Engineering",
    period: "2019 – 2023",
    score: "CGPA 8.82 / 10",
  },
];

export const awards = [
  "Best Team of the Quarter, Q1 2025 (Distinction Dev)",
  "Best Employee of the Quarter, Q1 2024 (Bacancy)",
  "Top team of 461, Azadi Ka Amrit Mahotsav Hackathon 2022",
  "785+ LeetCode and 270+ GeeksforGeeks problems solved",
];

// What you're learning right now; the Notes app shows this note only when the list is non-empty.
export const learning: string[] = [];

export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyline-mac.vercel.app",
  title: "Zilen Modi · Full Stack Engineer",
  description:
    "Full Stack Engineer building data-heavy web apps, cloud systems and migration tooling. Projects: ERP Atlas, Millwright, Pricing & Margin Intelligence, offline-first apps.",
};
