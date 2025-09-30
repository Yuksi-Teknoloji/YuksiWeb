// src/app/dashboards/[role]/restaurants/layout.tsx
import { notFound } from "next/navigation";
import DashboardShell from "@/components/dashboard/Shell";
import { navForRole } from "@/app/config/nav";
import { isRole } from "@/types/roles";

export default async function RestaurantsLayout({
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
    <DashboardShell title="Restoran" nav={nav}>
      {children}
    </DashboardShell>
  );
}
