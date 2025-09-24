"use client";

import React from "react";
import Image from "next/image";
import {
  FaMobileAlt,
  FaCog,
  FaEdit,
  FaClipboardList,
  FaCode,
  FaFolderOpen,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";

interface Feature {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
}

const leftFeatures: Feature[] = [
  { id: 1, icon: FaMobileAlt, title: "İlan Oluştur", description: "Hemen Yeni Bir İlan Oluştur" },
  { id: 2, icon: FaCog, title: "Taşıma Talepleri", description: "Gelen Taşıma Taleplerini Gör" },
  { id: 3, icon: FaEdit, title: "Konum Bazlı İlanlar", description: "Lokasyona Göre ilanlar" },
  { id: 4, icon: FaClipboardList, title: "Randevulu İşlemler", description: "İleri Tarihli Taşıma Talepleri Oluştur" },
];

const rightFeatures: Feature[] = [
  { id: 5, icon: FaCode, title: "Otomatik Bildirimler", description: "Yeni İlanlar ve Talepler için Bildirimler" },
  { id: 6, icon: FaFolderOpen, title: "Mesajlaşma", description: "İlan Sahipleri İle İletişime Geç" },
  { id: 7, icon: FaShieldAlt, title: "Güvenli İlanlar", description: "Onaylı İşverenlere Kolayca Ulaş" },
  { id: 8, icon: FaTruck, title: "Araçlara Göre İlanlar", description: "Araç Tipine Uygun Araçlar" },
];

export default function MobileAppFeatures() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Heading */}
        <h2 className="text-3xl lg:text-4xl font-bold text-black text-center mb-12">
          YÜKSİ Mobil Uygulaması
        </h2>

        {/* Main Container */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 relative">
          {/* Left Features */}
          <div className="flex flex-col justify-between h-[440px] lg:h-[500px]">
            {leftFeatures.map(({ id, icon: Icon, title, description }) => (
              <div key={id} className="group flex items-center gap-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full
                    border-2 text-2xl lg:text-3xl
                    bg-black border-black text-white
                    transition-colors duration-300
                    group-hover:bg-orange-500 group-hover:border-orange-500">
                  <Icon />
                </div>
                <div className="text-left">
                  <h4 className="text-black text-lg font-semibold">{title}</h4>
                  <p className="text-gray-600 text-sm lg:text-base">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Image */}
          <div className="relative w-[220px] h-[440px] lg:w-[280px] lg:h-[500px]">
            <Image
              src="/icons/mobileImg.png"
              alt="Mobile App"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Right Features */}
          <div className="flex flex-col justify-between h-[440px] lg:h-[500px]">
            {rightFeatures.map(({ id, icon: Icon, title, description }) => (
              <div key={id} className="group flex items-center gap-4 flex-row-reverse text-right">
                <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full
                    border-2 text-2xl lg:text-3xl
                    bg-black border-black text-white
                    transition-colors duration-300
                    group-hover:bg-orange-500 group-hover:border-orange-500">
                  <Icon />
                </div>
                <div>
                  <h4 className="text-black text-lg font-semibold">{title}</h4>
                  <p className="text-gray-600 text-sm lg:text-base">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
