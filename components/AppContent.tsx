"use client";

import type { AppId } from "@/lib/apps";
import type { AppProps } from "@/lib/store";
import Welcome from "@/components/apps/Welcome";
import Finder from "@/components/apps/Finder";
import Safari from "@/components/apps/Safari";
import Notes from "@/components/apps/Notes";
import Terminal from "@/components/apps/Terminal";
import ActivityMonitor from "@/components/apps/ActivityMonitor";
import Mail from "@/components/apps/Mail";
import Preview from "@/components/apps/Preview";

const content: Record<AppId, React.ComponentType<{ props: AppProps }>> = {
  welcome: Welcome,
  finder: Finder,
  safari: Safari,
  notes: Notes,
  terminal: Terminal,
  activity: ActivityMonitor,
  mail: Mail,
  preview: Preview,
};

export default function AppContent({ id, props }: { id: AppId; props: AppProps }) {
  const App = content[id];
  return <App props={props} />;
}
