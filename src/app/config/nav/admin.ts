// src/app/config/nav/admin.ts
import type { NavGroup } from "@/types/roles";

const adminNav: NavGroup[] = [
  { 
    title: "Genel",
    items: [
      { label: "Ayarlar", href: "/admin/settings" },
      { label: "Şehir Fiyatları", href: "/admin/city-prices" },
    ],

  },
  {
    title: "Nakliyeler",
    items: [
      { label: "Taşıma Listesi", href: "/admin/shipments/shipping-list" },
      { label: "Yeni Taşıma", href: "/admin/shipments/new" },
    ],
  },
  {
    title: "Taşıyıcılar",
    items: [
      { label: "Taşıyıcı Listesi", href: "/admin/carriers/carrier-list" },
      { label: "Yük Oluştur", href: "/admin/carriers/create-load" },
      { label: "Haritalar", href: "/admin/carriers/maps" },
    ],
  },
  {
    title: "Bayiler",
    items: [
      { label: "Bayi Listesi", href: "/admin/dealers/dealer-list" },
      { label: "Bayi Oluştur", href: "/admin/dealers/create-dealer" },
    ],
  },
  {
    title: "Şirketler",
    items: [
      { label: "Şirket Oluştur", href: "/admin/companies/create-company" },
      { label: "Şirket Listesi", href: "/admin/companies/company-list" },
      { label: "Yetkili Kişiler", href: "/admin/companies/authorized-person" },
      { label: "Km Talepleri", href: "/admin/companies/" },
    ],
  },
  {
    title: "Kullanıcılar",
    items: [
      { label: "Kullanıcı Listesi", href: "/admin/user-list" },
      { label: "Roller & İzinler", href: "/admin/users/roles" },
    ],
  },
  {
    title: "İçerikler",
    items: [
      { label: "Sayfa Listesi", href: "/admin/contents/page-list" },
      { label: "Sözleşme Metinleri", href: "/admin/contents/contract-texts" },
      { label: "Destek Metinleri", href: "/admin/contents/support-texts" },
      { label: "Web Site Referansları", href: "/admin/contents/referances" },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Taşıyıcı Tipleri", href: "/admin/system/carrier-types" },
      { label: "Araç Tipleri", href: "/admin/system/vehicle-types" },
      { label: "Yük Tipleri", href: "/admin/system/load-types" },
      { label: "Ek Fiyatlar", href: "/admin/system/additional-costs" },
      { label: "Taşıma Paketleri", href: "/admin/system/transport-packages" },
      { label: "Km Fiyatları", href: "/admin/system/km-prices" },
      { label: "Kampanya Kodları", href: "/admin/system/add-campaign" },
      { label: "Bildirim Gönder", href: "/admin/system/send-notification" },
      { label: "Parametreler", href: "/admin/system/parameters" },
    ],
  },
];

export default adminNav;  // ← mutlaka default export
