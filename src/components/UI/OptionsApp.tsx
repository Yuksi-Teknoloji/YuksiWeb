// components/UI/OptionsApp.tsx
"use client";

import Image from "next/image";

export default function OptionsApp() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-black mb-12">
          ÜCRETSİZ YÜKSİ MOBİL UYGULAMAMIZI İNDİR!
        </h2>

        {/* App Store Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-12">
          {/* Google Play */}
          <a
            href="https://play.google.com/store/apps/details?id=com.yuksiapp.net"
            target="_blank"
            className="block w-60 h-28 relative"
          >
            <Image
              src="/icons/google.png"
              alt="Google Play Store"
              fill
              className="object-contain"
              priority
            />
          </a>

          {/* Apple Store */}
          <a
            href="https://play.google.com/store/apps/details?id=com.yuksiapp.net"
            target="_blank"
            className="block w-60 h-28 relative"
          >
            <Image
              src="/icons/apple.png"
              alt="Apple App Store"
              fill
              className="object-contain"
              priority
            />
          </a>
        </div>
      </div>
    </section>
  );
}
