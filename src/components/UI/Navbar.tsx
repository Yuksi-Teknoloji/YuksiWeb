"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="navbar-area bg-orange-500 shadow-md">
      <div className="container-fluid">
        <nav className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="navbar-brand">
            <img src="/Brand/logo.png" alt="logo" className="h-12" />
          </Link>

          {/* Mobile Toggle Button */}
          <button
            type="button"
            className="navbar-toggler md:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="burger-menu flex flex-col space-y-1">
              <span className="top-bar w-6 h-0.5 bg-white"></span>
              <span className="middle-bar w-6 h-0.5 bg-white"></span>
              <span className="bottom-bar w-6 h-0.5 bg-white"></span>
            </span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 text-white font-medium">
            <Link href="/" className="nav-link hover:text-black">
              Home Page
            </Link>
            <Link href="/About" className="nav-link hover:text-black">
              About Us
            </Link>
            <Link href="/Services" className="nav-link hover:text-black">
              Services
            </Link>
            <Link href="/Help" className="nav-link hover:text-black">
              Help
            </Link>
            <Link href="/Communication" className="nav-link hover:text-black">
              Communication
            </Link>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden px-6 pb-4">
            <ul className="flex flex-col space-y-3 text-white font-medium">
              <li>
                <Link href="/" className="nav-link hover:text-black">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/About" className="nav-link hover:text-black">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/Services" className="nav-link hover:text-black">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/Help" className="nav-link hover:text-black">
                  Help
                </Link>
              </li>
              <li>
                <Link href="/Communication" className="nav-link hover:text-black">
                  Communication
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
