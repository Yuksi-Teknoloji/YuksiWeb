// src/app/(dashboards)/admin/layout.tsx
import DashboardShell from "@/components/dashboard/Shell";
import nav from  "../../../config/nav/admin";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell title="Admin" nav={nav}>{children}</DashboardShell>;
}
