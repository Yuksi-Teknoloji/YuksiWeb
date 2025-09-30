// src/app/dashboards/[role]/admin/layout.tsx
import DashboardShell from "@/components/dashboard/Shell";
import { navForRole } from "@/app/config/nav";
import { notFound } from "next/navigation";
import { isRole } from "@/types/roles";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;          // ⬅️ önemli
  if (!isRole(role)) notFound();
  const nav = navForRole(role);
  if (!nav) notFound();

  return (
    <DashboardShell title="Admin" nav={nav}>
      {children}
    </DashboardShell>
  );
}
