// src/components/UI/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  // Masaüstü dropdown’lar için
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // Mobil genel menü için
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const closeAll = () => {
    setOpenMenu(null);
    setIsMobileOpen(false);
  };

  return (
    <nav className="bg-orange-500 shadow-lg sticky top-0 z-[100]">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="inline-flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Brand/logo.png"
              alt="Yuksi Logo"
              className="h-20 w-auto"
            />
          </Link>
        </div>

        {/* Hamburger (mobil) */}
        <button
          type="button"
          className="md:hidden focus:outline-none"
          onClick={() => setIsMobileOpen((s) => !s)}
          aria-label="Menüyü aç/kapat"
        >
          <span className="flex flex-col space-y-1">
            <span className="w-6 h-0.5 bg-white"></span>
            <span className="w-6 h-0.5 bg-white"></span>
            <span className="w-6 h-0.5 bg-white"></span>
          </span>
        </button>

        {/* Masaüstü menü */}
        <div className="hidden md:flex space-x-8 text-white font-medium relative z-10">
          <Link href="/" className="hover:text-black transition-colors">
            Anasayfa
          </Link>

          {/* Hakkımızda dropdown */}
          <Link href="/Main/About" className="hover:text-black transition-colors">
            Hakkımızda
          </Link>

          <Link href="/Main/Services" className="hover:text-black transition-colors">
            Hizmetler
          </Link>

          <Link href="/Main/Help" className="hover:text-black transition-colors">
            Yardım
          </Link>

          {/* İletişim dropdown */}
          <Link href="/Main/Communication" className="hover:text-black transition-colors">
            İletişim
          </Link>

          {/* Aramıza Katıl dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("login")}
              className="hover:text-black transition-colors"
            >
              Aramıza Katıl
            </button>
            {openMenu === "login" && (
              <div className="absolute left-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-50">
                <Link href="/auth/Login" className="block px-4 py-2 hover:bg-gray-100">
                  Giriş Yap
                </Link>
                <Link href="/auth/Register" className="block px-4 py-2 hover:bg-gray-100">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobil menü */}
      {isMobileOpen && (
        <div className="md:hidden px-6 pb-4 text-white font-medium border-t border-white/10">
          <ul className="flex flex-col">
            <li>
              <Link href="/" className="block py-2 hover:text-black" onClick={closeAll}>
                Anasayfa
              </Link>
            </li>

            {/* Hakkımızda (mobilde akordeon) */}
            <li className="border-t border-white/10">
              <Link href="/Main/About" className="block py-2 hover:text-black" onClick={closeAll}>
                Yardım
              </Link>
            </li>

            <li className="border-t border-white/10">
              <Link href="/Main/Services" className="block py-2 hover:text-black" onClick={closeAll}>
                Hizmetler
              </Link>
            </li>

            <li className="border-t border-white/10">
              <Link href="/Main/Help" className="block py-2 hover:text-black" onClick={closeAll}>
                Yardım
              </Link>
            </li>

            {/* İletişim (mobil akordeon) */}
            <li className="border-t border-white/10">
              <button
                className="w-full text-left py-2 hover:text-black"
                onClick={() =>
                  setOpenMenu(openMenu === "communication" ? null : "communication")
                }
              >
                İletişim
              </button>
              {openMenu === "communication" && (
                <div className="pl-4 pb-2 space-y-1">
                  <Link href="/Main/Communication" className="block py-1 hover:text-black" onClick={closeAll}>
                    Destek
                  </Link>
                </div>
              )}
            </li>

            {/* Aramıza Katıl (mobil akordeon) */}
            <li className="border-t border-white/10">
              <button
                className="w-full text-left py-2 hover:text-black"
                onClick={() => setOpenMenu(openMenu === "login" ? null : "login")}
              >
                Aramıza Katıl
              </button>
              {openMenu === "login" && (
                <div className="pl-4 pb-2 space-y-1">
                  <Link href="/auth/Login" className="block py-1 hover:text-black" onClick={closeAll}>
                    Giriş Yap
                  </Link>
                  <Link href="/auth/Register" className="block py-1 hover:text-black" onClick={closeAll}>
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
