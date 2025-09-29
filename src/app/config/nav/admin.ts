// src/config/nav/admin.ts
import type { NavGroup } from "@/types/roles";
const nav: NavGroup[] = [
  { title: "Ayarlar", items: [
    { label: "Ana", href: "/admin" },
    { label: "Genel Ayarlar", href: "/admin/settings" },
  ]},
  { title: "Nakliyeler", items: [{ label: "Gönderiler", href: "/admin/shipments" }]},
  { title: "Bayiler", items: [{ label: "Bayi Listesi", href: "/admin/dealers" }]},
  { title: "Şirketler", items: [{ label: "Şirket Listesi", href: "/admin/companies" }]},
];
export default nav;
