// components/UI/AboutSection.tsx
"use client";

import Image from "next/image";

export default function AboutSection() {
  return (
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
  );
}
