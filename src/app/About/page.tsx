"use client";

import Link from "next/link";
import Navbar from "../../components/UI/Navbar"; 
import Image from "next/image"; // keep for local images like /Brand/1.png

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* 1. Page Banner */}
      <div
        className="page-banner-area py-24 bg-cover bg-center bg-gray-100"
        style={{
          backgroundImage: "url('/assets/images/shapes/page-banner-bg.jpg')",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="page-banner-content text-center">
            <h1 className="text-4xl font-semibold text-black">About Us</h1>

            <ul className="ps-0 mb-0 list-unstyled inline-flex gap-2 justify-center mt-4">
              <li>
                <Link href="/" className="text-gray-700 hover:underline">
                  Home Page
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-700">About Us</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. About Area */}
      <section className="pt-24 pb-0 bg-white">
            <div className="w-full">
              {/* --- First Block (Text Left, Image Right) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
                {/* Text */}
                <div className="flex flex-col justify-center px-6 lg:px-20 py-12">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-4">
                    Short & Long Distance <br />
                    Join us for transport opportunities
                  </h2>
                  <p className="text-base lg:text-lg text-gray-600">
                    Work with verified carriers for safe and reliable deliveries.
                  </p>
                </div>
      
                {/* Image (fills column completely) */}
                <div className="relative w-full h-[350px] lg:h-[450px]">
                  <Image
                    src="/icons/handshake.jpg"
                    alt="Transport Services"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
      
              {/* --- Second Block (Image Left, Text Right) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
                {/* Image (fills column completely) */}
                <div className="relative w-full h-[350px] lg:h-[450px]">
                  <Image
                    src="/icons/alternate handshake.jpg"
                    alt="Transport Location Services"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                  />
                </div>
      
                {/* Text */}
                <div className="flex flex-col justify-center px-6 lg:px-20 py-12">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-4">
                    Transport Ads Based on Your Location
                  </h2>
                  <p className="text-base lg:text-lg text-gray-600">
                    Discover tailored transport offers near you and connect with
                    carriers who can meet your specific needs.
                  </p>
                </div>
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
              <h4 className="text-lg font-bold text-black mb-4">Bilgi ve Sözleşmeler</h4>
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
