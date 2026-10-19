# skyline-mac

Zilen Modi's portfolio as a macOS-inspired desktop: a menu bar, a Dock, draggable windows and apps that each show part of the story.

| App | What it shows |
|---|---|
| Finder | Projects and case studies, experience |
| Safari | A page per project, plus GitHub / LinkedIn / LeetCode |
| Notes | About me, how I work, education & awards |
| Terminal | The same content as commands (`help`, `projects`, `project <id>`, `wallpaper <name>`…) |
| Activity Monitor | Career numbers, an experience timeline, technologies |
| Mail | Contact form (opens your mail app) |
| Preview | The résumé, printable to PDF |

Also: ⌘K / Ctrl+K Spotlight search, Mission Control (F3), light/dark appearance, a wallpaper picker (right-click the desktop), deep links like `/#projects/erp-atlas`, and a full-screen app layout on phones.

All content comes from `data/portfolio.ts`. Project covers (`components/ProjectArt.tsx`) and wallpapers (`components/Wallpaper.tsx`) are drawn in code.

Not affiliated with or endorsed by Apple.

## Develop

```bash
npm install
npm run dev   # http://localhost:3001
```

Built with Next.js, React, TypeScript, Motion, Zustand and Lucide.
