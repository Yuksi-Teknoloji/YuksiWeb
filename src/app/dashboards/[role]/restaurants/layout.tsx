//TO DO --- IT WILL BE CHANGED

// src/app/(dashboards)/bayi/layout.tsx
import DashboardShell from "@/components/dashboard/Shell";
import nav from  "../../../config/nav/restaurant";
export default function BayiLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell title="Bayi" nav={nav}>{children}</DashboardShell>;
}
