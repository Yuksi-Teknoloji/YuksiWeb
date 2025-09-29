"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <nav className="bg-orange-500 shadow-lg relative z-10">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img
            src="/Brand/logo.png"
            alt="Yuksi Logo"
            className="h-20 w-auto"
          />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8 text-white font-medium relative z-10">
          <Link href="/" className="hover:text-black transition-colors">
            Home Page
          </Link>

          {/* About Us */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("about")}
              className="hover:text-black transition-colors"
            >
              About Us
            </button>
            {openMenu === "about" && (
              <div className="absolute left-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-50">
                <Link href="/about/company" className="block px-4 py-2 hover:bg-gray-100">
                  Company
                </Link>
                <Link href="/about/team" className="block px-4 py-2 hover:bg-gray-100">
                  Team
                </Link>
              </div>
            )}
          </div>

          {/* Services */}
          <Link href="/services" className="hover:text-black transition-colors">
            Services
          </Link>

          {/* Help */}
          <Link href="/help" className="hover:text-black transition-colors">
            Help
          </Link>

          {/* Communication */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("communication")}
              className="hover:text-black transition-colors"
            >
              Communication
            </button>
            {openMenu === "communication" && (
              <div className="absolute left-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-50">
                <Link href="/contact/email" className="block px-4 py-2 hover:bg-gray-100">
                  Email
                </Link>
                <Link href="/contact/support" className="block px-4 py-2 hover:bg-gray-100">
                  Support
                </Link>
              </div>
            )}
          </div>

          {/* ✅ Join Us */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("join")}
              className="hover:text-black transition-colors"
            >
              Join Us
            </button>
            {openMenu === "join" && (
              <div className="absolute left-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-50">
                <Link href="/auth/Login" className="block px-4 py-2 hover:bg-gray-100">
                  Sign In
                </Link>
                <Link href="/auth/Register" className="block px-4 py-2 hover:bg-gray-100">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
