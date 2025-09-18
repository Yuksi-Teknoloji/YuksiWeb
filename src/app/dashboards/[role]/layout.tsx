// src/app/(dashboards)/[role]/layout.tsx
import DashboardShell from "@/components/dashboard/Shell";
import { NAV } from "../../config/nav";
import type { Role } from "@/types/auth";

export default function RoleDashboardLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: { role: Role };
}) {
  const role = params.role;
  if (!NAV[role]) {
    // geçersiz rol -> 404
    return <div className="p-6">Geçersiz rol</div>;
  }
  return (
    <DashboardShell title={role[0].toUpperCase() + role.slice(1)} role={role} nav={NAV[role]}>
      {children}
    </DashboardShell>
  );
}
