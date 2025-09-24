// src/app/dashboards/[role]/layout.tsx
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import adminNav from "@/app/config/nav/admin"; // ← ekle
import "@/styles/soft-ui.css";   

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-100 flex ">
      <Sidebar nav={adminNav} />   {/* ← nav verildi */}
      <div className="flex-1 orange-ui">
        <Header title="Yüksi Panel" headerClass="bg-orange-500 border-orange-400 text-white"   titleClass="font-extrabold" />
        <main className="px-4 py-6 ">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
