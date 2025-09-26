//TODO  ---IT WILL BE CHANGE

// src/config/nav/market.ts
import type { NavGroup } from "@/types/roles";
const nav: NavGroup[] = [
  { title: "Siparişler", items: [
    { label: "Ana", href: "/bayi" },
    { label: "Siparişlerim", href: "/bayi/orders" },
    { label: "Faturalar", href: "/bayi/invoices" },
  ]},
];
export default nav;
