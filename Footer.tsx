"use client";

import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-100 relative pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

          {/* Logo & Social Links */}
          <div className="footer-widget">
            <a href="/" className="inline-block mb-4">
              <Image src="/Brand/1.png" alt="logo" width={200} height={60} />
            </a>
            <p className="text-gray-600"></p>
            <ul className="flex space-x-4 list-none p-0 m-0">
              {/* Add social icons here if needed */}
            </ul>
          </div>

          {/* Information & Agreements */}
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

          {/* YÜKSİ Links */}
          <div className="footer-widget">
            <h4 className="text-lg font-bold text-black mb-4">YÜKSİ</h4>
            <ul className="list-disc list-inside text-black space-y-2">
              <li>Anasayfa</li>
              <li>İletişim</li>
              <li>info@yuksi.com.tr</li>
              <li>
                <a
                  href="https://yuksi.com.tr/resellerv8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Bayi Girişi
                </a>
              </li>
              <li>
                <a
                  href="https://yuksi.com.tr/restaurantv1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Restaurant Girişi
                </a>
              </li>
              <li>
                <a
                  href="https://yuksi.com.tr/companyv1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Şirket Girişi
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
<div className="mt-12 text-center">
  <p className="text-gray-500">&copy; 2025 Tüm hakları saklıdır @Yüksi</p>
</div>

        </div>
      
    </footer>
  );
}
