// src/app/(app)/layout.tsx
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
// Eğer her rol için aynı menü ise tek config kullan; farklıysa Sidebar'a rol'e göre nav verilir.

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-100 flex">
      <Sidebar />                 {/* solda sabit */}
      <div className="flex-1">
        <Header title="Yüksi Panel" />  {/* üstte sabit */}
        <main className="px-4 py-6">
          <div className="max-w-7xl mx-auto">{children}</div>  {/* ortada değişen içerik */}
        </main>
      </div>
    </div>
  );
}
