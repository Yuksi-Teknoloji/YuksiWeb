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
  { id: 1, icon: FaMobileAlt, title: "Create Listing", description: "Easily create a new transport listing." },
  { id: 2, icon: FaCog, title: "Transport Requests", description: "View incoming transport requests instantly." },
  { id: 3, icon: FaEdit, title: "Location-Based Ads", description: "Browse listings tailored to your location." },
  { id: 4, icon: FaClipboardList, title: "Scheduled Orders", description: "Set up transport requests for future dates." },
];

const rightFeatures: Feature[] = [
  { id: 5, icon: FaCode, title: "Automatic Notifications", description: "Receive alerts for new listings and requests." },
  { id: 6, icon: FaFolderOpen, title: "Messaging", description: "Communicate directly with listing owners." },
  { id: 7, icon: FaShieldAlt, title: "Secure Listings", description: "Easily reach verified employers." },
  { id: 8, icon: FaTruck, title: "Vehicle-Based Listings", description: "Find listings matching your vehicle type." },
];

export default function MobileAppFeatures() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Heading */}
        <h2 className="text-3xl lg:text-4xl font-bold text-black text-center mb-12">
          YÜKSİ Mobile App
        </h2>

        {/* Main Container */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 relative">
          {/* Left Features */}
          <div className="flex flex-col justify-between h-[440px] lg:h-[500px]">
            {leftFeatures.map(({ id, icon: Icon, title, description }) => (
              <div key={id} className="flex items-center gap-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full bg-black border-2 border-black text-white text-2xl lg:text-3xl">
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
              <div key={id} className="flex items-center gap-4 flex-row-reverse text-right">
                <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full bg-black border-2 border-black text-white text-2xl lg:text-3xl">
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
