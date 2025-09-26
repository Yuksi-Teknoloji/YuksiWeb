// src/components/dashboard/Shell.tsx
import Header from "./Header";
import type { NavGroup } from "@/types/roles";

export default function DashboardShell({
  children,
}: {
  title?: string; // opsiyonel
  nav?: any;      // opsiyonel
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
