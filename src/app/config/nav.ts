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
      { label: "Admin Ekle",  path: "admin/add-admin" },
      { label: "Kullanıcı Mailleri", path: "admin/user-emails" },
      { label: "Restoran Talepleri", path: "admin/restaurant-request" },
      { label: "Şehir Fiyatları", path: "admin/city-prices" },
    ],
  },
  {
    title: "Fiyatlandırmalar",
    items: [
      { label: "Restoran Fiyatlandırma", path: "admin/pricing/restaurant-packages" },
      { label: "Kurye Fiyatlandırma", path: "admin/pricing/courier-packages" }
    ],
  },
  {
    title: "Nakliyeler",
    items: [
      { label: "Lojistik Takip", path: "admin/shipments/shipping-list" },
      { label: "Restoran Yük Takip", path: "admin/shipments/restaurant-shipping-list" },
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
      { label: "Yetkili Kişiler",  path: "admin/companies/authorized-person" }, // kök sayfanız buysa böyle bırakın
    ],
  },
  {
    title: "Kullanıcılar",
    items: [
      { label: "Kullanıcı Listesi", path: "admin/user-list" }
    ],
  },
  {
    title: "İçerikler",
    items: [
      { label: "Sayfa Listesi",         path: "admin/contents/page-list" },
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
      { label: "Ödeme Durumları",  path: "admin/system/transport-packages" },
      { label: "Km Fiyatları",      path: "admin/system/km-prices" },
      { label: "Kampanya Kodları",  path: "admin/system/add-campaign" },
      { label: "Bildirim Gönder",   path: "admin/system/send-notification" },
    ],
  },
],

  dealer: [
    {
      title: "Bayi",
      items: [
        { label: "Ana",        path: "dealers" },
        { label: "Siparişler", path: "dealers/transportations" },
        { label: "Lojistik Takip",  path: "dealers/logistics-tracking" },
        { label: "Canlı Takip",  path: "dealers/follow-live" },
        { label: "Taşıyıcı Takip",  path: "dealers/carrier-list" },
        { label: "Yük Oluştur",  path: "dealers/create-load" },
        { label: "Haritalar",  path: "dealers/maps" },
        { label: "İşletme Oluştur",        path: "dealers/create-management" },
        { label: "Restoran Listesi",        path: "dealers/restaurant-list" },
        { label: "Fatura ve Ödemeler",        path: "dealers/invoices" },
        { label: "Şirket Listesi",        path: "dealers/company-list" },
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
        { label: "Kalan Paketlerim",                  path: "restaurants/list-package" },
        { label: "Yük Oluştur",                  path: "restaurants/create-load" },
        { label: "Yük Listesi",                  path: "restaurants/list-load" },
        { label: "Kurye Puanlamaları",                  path: "restaurants/courier/courier-ratings" },
        { label: "Kurye Ekle",                  path: "restaurants/courier/add-courier" },
        { label: "Siparişe Kurye Ata",                  path: "restaurants/courier/list-courier" },
        { label: "Sipariş Oluştur",                  path: "restaurants/create-order" },
        { label: "Sipariş Geçmişi",                  path: "restaurants/order-history" },
        { label: "Menü",                  path: "restaurants/menu" },
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
