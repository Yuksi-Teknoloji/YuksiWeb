"use client";

import Link from "next/link";
import Navbar from "../../components/UI/Navbar";
import Image from "next/image";

const services = [
  {
    title: "Kurye",
    href: "#/hizmetler/6859021d687ba463a85cd069",
    img: "/icons/1.jpg",
  },
  {
    title: "Minivan",
    href: "#/hizmetler/6859024c687ba463a85cd06d",
    img: "/icons/2.jpg",
  },
  {
    title: "Panelvan",
    href: "#/hizmetler/6859028a687ba463a85cd075",
    img: "/icons/3.jpg",
  },
  {
    title: "Kamyonet",
    href: "#/hizmetler/68590322687ba463a85cd079",
    img: "/icons/4.jpg",
  },
  {
    title: "Kamyon",
    href: "#/hizmetler/68590354687ba463a85cd085",
    img: "/icons/5.jpg",
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Page Banner */}
      <div
        className="page-banner-area py-24 bg-cover bg-center bg-gray-100"
        style={{
          backgroundImage: "url('/assets/images/shapes/page-banner-bg.jpg')",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="page-banner-content text-center">
            <h1 className="text-4xl font-semibold text-black">Services</h1>

            <ul className="ps-0 mb-0 list-unstyled inline-flex gap-2 justify-center mt-4">
              <li>
                <Link href="/" className="text-gray-700 hover:underline">
                  Home Page
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-700">Services</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div className="text-center">
                  <Link href={service.href}>
                    <Image
                      src={service.img}
                      alt={service.title}
                      width={320}
                      height={200}
                      className="rounded-lg mx-auto object-cover"
                    />
                  </Link>
                  <h3 className="mt-3 text-lg font-semibold text-gray-800">
                    <Link href={service.href}>{service.title}</Link>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 relative pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Logo */}
            <div className="footer-widget">
              <a href="/" className="inline-block mb-4">
                <Image src="/Brand/1.png" alt="logo" width={200} height={60} />
              </a>
            </div>

            {/* Info */}
            <div className="footer-widget">
              <h4 className="text-lg font-bold text-black mb-4">
                Bilgi ve Sözleşmeler
              </h4>
              <ul className="list-disc list-inside text-black space-y-2">
                <li>Yüksi Hakkımızda</li>
                <li>Kurye Gizlilik Sözleşmesi</li>
                <li>Kurye Taşıyıcı Sözleşmesi</li>
                <li>Gizlilik Sözleşmesi</li>
                <li>Kullanıcı Sözleşmesi</li>
              </ul>
            </div>

            {/* YÜKSİ */}
            <div className="footer-widget">
              <h4 className="text-lg font-bold text-black mb-4">YÜKSİ</h4>
              <ul className="list-disc list-inside text-black space-y-2">
                <li>Anasayfa</li>
                <li>İletişim</li>
                <li>info@yuksi.com.tr</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500">&copy; 2025 Tüm hakları saklıdır @Yüksi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
