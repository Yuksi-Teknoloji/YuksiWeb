// src/components/dashboard/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hrefFor, type NavGroup } from "../../app/config/nav";
import type { Role } from "@/types/auth";

export default function Sidebar({ nav, role }: { nav: NavGroup[]; role: Role }) {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-[#0F172A] text-white min-h-dvh sticky top-0 p-3">
      <div className="font-semibold mb-3 uppercase">{role} panel</div>
      {nav.map((g) => (
        <div key={g.title} className="mb-3">
          <div className="text-xs uppercase text-white/60 px-2 mb-1">{g.title}</div>
          {g.items.map((it) => {
            const href = hrefFor(role, it.path);
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`block px-2 py-2 rounded text-sm ${
                  active ? "bg-white text-[#0F172A] font-semibold" : "hover:bg-white/10"
                }`}
              >
                {it.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
