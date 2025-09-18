// src/components/dashboard/Shell.tsx
import Sidebar from "./Sidebar";
import type { NavGroup } from "../../app/config/nav";

export default function DashboardShell({
  title, nav, role, children,
}: {
  title: string;
  role: string;
  nav: NavGroup[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-neutral-100 flex">
      <Sidebar nav={nav} role={role} />
      <div className="flex-1">
        <header className="sticky top-0 bg-white border-b px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-semibold">{title}</h1>
            <div className="text-sm text-neutral-500">Rol: {role}</div>
          </div>
        </header>
        <main className="px-4 py-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
