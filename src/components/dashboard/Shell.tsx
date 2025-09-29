// src/components/dashboard/Shell.tsx
import Header from "./Header";
import Sidebar from "./Sidebar";
import type { NavGroup } from "@/types/roles";

export default function DashboardShell({
  title, nav, children,
}: { title: string; nav: NavGroup[]; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-100 flex">
      <Sidebar nav={nav} />
      <div className="flex-1">
        <Header title={title} />
        <main className="px-4 py-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
