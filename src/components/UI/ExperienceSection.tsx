"use client";

import { FaSmile, FaLanguage, FaDesktop } from "react-icons/fa";
import React from "react";

interface Stat {
  id: number;
  icon: React.ElementType;
  number: string;
  label: string;
}

const stats: Stat[] = [
  { id: 1, icon: FaSmile,   number: "5.000+",   label: "Mutlu Kullanıcılar" },
  { id: 2, icon: FaLanguage,number: "350.000+", label: "Onaylanan İlanlar" },
  { id: 3, icon: FaDesktop, number: "65.000+",  label: "Başarıyla tamamlanan iş sayısı" },
];

export default function ExperienceSection() {
  return (
    <section className="py-24 text-white bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left */}
          <div>
            <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              Tecrübeli Taşıyıcılar
            </h3>
            <div className="h-[3px] w-16 bg-white/80 rounded mt-4 mb-5" />
            <p className="text-base lg:text-lg text-white/90">
              Sisteme Kayıtlı Tüm İşletmeleri Onaylıyoruz.
            </p>
          </div>

          {/* Right */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            {stats.map(({ id, icon: Icon, number, label }) => (
              <div key={id} className="flex flex-col items-center">
                <div className="group inline-grid place-items-center w-16 h-16 lg:w-20 lg:h-20
                                rounded-full ring-2 ring-white/80 bg-white/10 backdrop-blur-[1px]
                                transition-all duration-300 hover:bg-white/20 hover:ring-white">
                  <Icon className="text-white text-3xl lg:text-4xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105" />
                </div>

                <div className="mt-4 text-2xl lg:text-3xl font-extrabold">
                  {number}
                </div>
                <p className="mt-1 text-xs lg:text-sm text-orange-100 leading-snug">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
