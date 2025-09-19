// src/components/dashboard/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavGroup } from "@/types/roles";
import { ChevronDown, ChevronRight, PanelLeftOpen, PanelLeftClose } from "lucide-react";

export default function Sidebar({ nav = [] as NavGroup[] }: { nav?: NavGroup[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <aside className={`h-dvh sticky top-0 bg-[#0F172A] text-white transition-all ${collapsed ? "w-[68px]" : "w-64"}`}>
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
        <div className={`font-semibold ${collapsed ? "opacity-0 pointer-events-none w-0" : ""}`}>PANEL</div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-md hover:bg-white/10">
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="p-2">
        {nav.map((g) => {
          const isOpen = open[g.title] ?? true;
          return (
            <div key={g.title} className="mb-2">
              <button
                onClick={() => setOpen((s) => ({ ...s, [g.title]: !isOpen }))}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/10"
              >
                {!collapsed && <span className="flex-1 text-sm font-medium">{g.title}</span>}
                {!collapsed && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </button>

              <div className={`${collapsed || !isOpen ? "hidden" : "mt-1 pl-3"}`}>
                {g.items.map((it) => {
                  const active = pathname === it.href;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={`block text-sm rounded-md px-2 py-1.5 mb-1 ${
                        active ? "bg-white text-[#0F172A] font-semibold" : "text-white/85 hover:bg-white/10"
                      }`}
                    >
                      {it.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
