// src/config/nav.ts
import type { Role } from "@/types/auth";

export type NavItem = { label: string; path: string };          // path: role'a göre prefix'lenir
export type NavGroup = { title: string; items: NavItem[] };

export const NAV: Record<Role, NavGroup[]> = {
  admin: [
    { title: "Ayarlar", items: [
      { label: "Ana", path: "" },
      { label: "Genel Ayarlar", path: "settings" },
    ]},
    { title: "Nakliyeler", items: [{ label: "Gönderiler", path: "shipments" }]},
    { title: "Bayiler", items: [{ label: "Bayi Listesi", path: "dealers" }]},
    { title: "Şirketler", items: [{ label: "Şirket Listesi", path: "companies" }]},
  ],
  dealer: [
    { title: "Siparişler", items: [
      { label: "Ana", path: "" },
      { label: "Siparişlerim", path: "orders" },
      { label: "Faturalar", path: "invoices" },
    ]},
  ],
  carrier: [
    { title: "Görevler", items: [
      { label: "Ana", path: "" },
      { label: "Aktif İşler", path: "jobs" },
    ]},
  ],
};

/** path'i role ile birleştirir: "" -> "/admin", "settings" -> "/admin/settings" */
export function hrefFor(role: Role, path: string) {
  const cleaned = path.replace(/^\/+/, "");
  return `/${role}${cleaned ? `/${cleaned}` : ""}`;
}
