//src/app/config/nav.ts
import type { Role } from "@/types/roles";
import type { NavGroup as SidebarNavGroup } from "@/types/roles";

// path tabanlı tanım
export type RawNavItem = { label: string; path: string };
export type RawNavGroup = { title: string; items: RawNavItem[] };

// Proje dosya yapına göre path’ler:
// - admin sayfaları: /dashboards/[role]/admin/...
// - restaurant sayfaları: /dashboards/[role]/restaurants/...
export const NAV: Record<Role, RawNavGroup[]> = {
  admin: [
    {
    title: "Ayarlar",
    items: [
      { label: "Ana",            path: "admin" },
      { label: "Genel Ayarlar",  path: "admin/settings" },
      { label: "Şehir Fiyatları", path: "admin/city-prices" },
    ],
  },
  {
    title: "Nakliyeler",
    items: [
      { label: "Taşıma Listesi", path: "admin/shipments/shipping-list" },
      { label: "Yeni Taşıma",    path: "admin/shipments/new" },
    ],
  },
  {
    title: "Taşıyıcılar",
    items: [
      { label: "Taşıyıcı Listesi", path: "admin/carriers/carrier-list" },
      { label: "Yük Oluştur",      path: "admin/carriers/create-load" },
      { label: "Haritalar",        path: "admin/carriers/maps" },
    ],
  },
  {
    title: "Restoranlar",
    items: [
      { label: "Restoran Listesi", path: "admin/restaurants/restaurant-list" },
      { label: "Restoran Oluştur",      path: "admin/restaurants/create-restaurant" }
    ],
  },
  {
    title: "Bayiler",
    items: [
      { label: "Bayi Listesi", path: "admin/dealers/dealer-list" },
      { label: "Bayi Oluştur", path: "admin/dealers/create-dealer" },
    ],
  },
  {
    title: "Şirketler",
    items: [
      { label: "Şirket Oluştur",   path: "admin/companies/create-company" },
      { label: "Şirket Listesi",   path: "admin/companies/company-list" },
      { label: "Yetkili Kişiler",  path: "admin/companies/authorized-person" },
      { label: "Km Talepleri",     path: "admin/companies/km-prices" }, // kök sayfanız buysa böyle bırakın
    ],
  },
  {
    title: "Kullanıcılar",
    items: [
      { label: "Kullanıcı Listesi", path: "admin/user-list" },
      { label: "Roller & İzinler",  path: "admin/users/roles" },
    ],
  },
  {
    title: "İçerikler",
    items: [
      { label: "Sayfa Listesi",         path: "admin/contents/page-list" },
      { label: "Sözleşme Metinleri",    path: "admin/contents/contract-texts" },
      { label: "Destek Metinleri",      path: "admin/contents/support-texts" },
      { label: "Web Site Referansları", path: "admin/contents/referances" },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Taşıyıcı Tipleri",  path: "admin/system/carrier-types" },
      { label: "Araç Tipleri",      path: "admin/system/vehicle-types" },
      { label: "Yük Tipleri",       path: "admin/system/load-types" },
      { label: "Ek Fiyatlar",       path: "admin/system/additional-costs" },
      { label: "Taşıma Paketleri",  path: "admin/system/transport-packages" },
      { label: "Km Fiyatları",      path: "admin/system/km-prices" },
      { label: "Kampanya Kodları",  path: "admin/system/add-campaign" },
      { label: "Bildirim Gönder",   path: "admin/system/send-notification" },
      { label: "Parametreler",      path: "admin/system/parameters" },
    ],
  },
],

  bayi: [
    {
      title: "Siparişler",
      items: [
        { label: "Ana",        path: "bayi" },
        { label: "Siparişler", path: "bayi/orders" },
        { label: "Faturalar",  path: "bayi/invoices" },
      ],
    },
  ],

  corporate: [
    {
      title: "Kurumsal",
      items: [{ label: "Ana", path: "corporate" }],
    },
  ],

  marketing: [
    {
      title: "Pazarlama",
      items: [{ label: "Ana", path: "marketing" }],
    },
  ],

  restaurant: [
    {
      title: "Restoran",
      items: [
        { label: "Ana",                  path: "restaurants" },
        { label: "Profil Yönetimi",                  path: "restaurants/profile" },
        { label: "Canlı Takip",                  path: "restaurants/follow-live" },
        { label: "Paket Satın Al",                  path: "restaurants/buy-package" },
        { label: "Yük Oluştur",                  path: "restaurants/create-load" },
        { label: "Kurye Puanlamaları",                  path: "restaurants/courier/courier-ratings" },
        { label: "Kurye Ekle",                  path: "restaurants/courier/add-courier" },
        { label: "Kurye Listesi",                  path: "restaurants/courier/list-courier" },
        { label: "Sipariş Geçmişi",                  path: "restaurants/order-history" },
        { label: "Destek",                  path: "restaurants/supports" },
        { label: "Fatura ve Ödemeler",  path: "restaurants/invoices" },
        { label: "Bildirimler",                  path: "restaurants/notifications" },
        { label: "Sık Sorulan Sorular(SSS)",                  path: "restaurants/questions" },
      ],
    },
  ],
};

/** Sidebar için href’e çevir: path -> `/${path}`  */
export function navForRole(role: Role): SidebarNavGroup[] | undefined {
  const raw = NAV[role];
  if (!raw) return undefined;

  return raw.map((g) => ({
    title: g.title,
    items: g.items.map((it) => ({
      label: it.label,
      // Sidebar zaten `/dashboards/${role}${href}` yapıyor.
      // Bu yüzden href burada `/admin/...` veya `/restaurants/...` şeklinde olmalı.
      href: "/" + it.path.replace(/^\/+/, ""),
    })),
  }));
}
