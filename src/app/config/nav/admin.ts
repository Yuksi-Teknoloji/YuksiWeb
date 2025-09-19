// src/app/config/nav/admin.ts
import type { NavGroup } from "@/types/roles";

const adminNav: NavGroup[] = [
  {
    title: "Nakliyeler",
    items: [
      { label: "Gönderiler", href: "/admin/shipments" },
      { label: "Yeni Taşıma", href: "/admin/shipments/new" },
    ],
  },
  {
    title: "Taşıyıcılar",
    items: [
      { label: "Taşıyıcı Listesi", href: "/admin/carriers" },
      { label: "Atamalar", href: "/admin/carriers/assignments" },
    ],
  },
  {
    title: "Bayiler",
    items: [
      { label: "Bayi Listesi", href: "/admin/dealers" },
      { label: "Bayi Oluştur", href: "/admin/dealers/new" },
    ],
  },
  {
    title: "Şirketler",
    items: [
      { label: "Şirket Listesi", href: "/admin/companies" },
      { label: "Şirket Oluştur", href: "/admin/companies/new" },
    ],
  },
  {
    title: "Kullanıcılar",
    items: [
      { label: "Yetkililer", href: "/admin/users" },
      { label: "Roller & İzinler", href: "/admin/users/roles" },
    ],
  },
  {
    title: "İçerikler",
    items: [
      { label: "Bannerlar", href: "/admin/content/banners" },
      { label: "Duyurular", href: "/admin/content/announcements" },
      { label: "Sayfalar", href: "/admin/content/pages" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Taşıyıcı Tipleri", href: "/admin/system/carrier-types" },
      { label: "Araç Tipleri", href: "/admin/system/vehicle-types" },
      { label: "Parametreler", href: "/admin/system/parameters" },
    ],
  },
];

export default adminNav;  // ← mutlaka default export
