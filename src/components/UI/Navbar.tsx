"use client";
import { useState } from "react";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <nav className="bg-orange-500 shadow-lg relative z-10">
      <div className="container mx-auto flex items-center justify-between px-6 py-4"> {/* moderate height */}
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img
            src="/Brand/logo.png"
            alt="Yuksi Logo"
            className="h-20 w-auto" // adjusted logo height
          />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8 text-white font-medium relative z-10">
          {/* Home Page */}
          <a href="/" className="hover:text-black transition-colors">
            Anasayfa
          </a>

          {/* About Us with Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("about")}
              className="hover:text-black transition-colors"
            >
               Hakkımızda
            </button>
            {openMenu === "about" && (
              <div className="absolute left-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-50">
                <a href="/about/company" className="block px-4 py-2 hover:bg-gray-100">
                  Şirket
                </a>
                <a href="/about/team" className="block px-4 py-2 hover:bg-gray-100">
                  Takım
                </a>
              </div>
            )}
          </div>

          {/* Services */}
          <a href="/services" className="hover:text-black transition-colors">
            Hizmetler
          </a>

          {/* Help */}
          <a href="/help" className="hover:text-black transition-colors">
            Yardım
          </a>

          {/* Communication with Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("communication")}
              className="hover:text-black transition-colors"
            >
              İletişim
            </button>
            {openMenu === "communication" && (
              <div className="absolute left-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-50">
                <a href="/contact/email" className="block px-4 py-2 hover:bg-gray-100">
                  Mail
                </a>
                <a href="/contact/support" className="block px-4 py-2 hover:bg-gray-100">
                  Destek
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
