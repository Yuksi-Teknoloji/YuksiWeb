// src/app/(app)/layout.tsx
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import adminNav from "@/app/config/nav/admin"; // ← ekle

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-100 flex">
      <Sidebar nav={adminNav} />   {/* ← nav verildi */}
      <div className="flex-1">
        <Header title="Yüksi Panel" />
        <main className="px-4 py-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
