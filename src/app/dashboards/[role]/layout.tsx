// src/app/dashboards/[role]/layout.tsx
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { navForRole } from "@/app/config/nav";
import { notFound } from "next/navigation";
import "@/styles/soft-ui.css";

export default function AppShellLayout({ children, params }) {
  const { role } = params || {}; // params is synchronous in Next 15
  const nav = navForRole(role);
  if (!nav) notFound();

  return (
    <div className="min-h-dvh bg-neutral-100 flex">
      <Sidebar nav={nav} />
      <div className="flex-1 orange-ui">
        <Header
          title="Yüksi Panel"
          headerClass="bg-orange-500 border-orange-400 text-white"
          titleClass="font-extrabold"
        />
        <main className="px-4 py-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
