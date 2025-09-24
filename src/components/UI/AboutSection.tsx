// components/UI/AboutSection.tsx
"use client";

import Image from "next/image";
import * as React from "react";

/** Basit görünümde animasyon: görünce yukarı kaydır + fade-in */
function RevealOnScroll({
  children,
  delay = 0,
  threshold = 0.2,
}: {
  children: React.ReactNode;
  delay?: number;       // ms
  threshold?: number;   // görünüm yüzdesi
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // küçük gecikme opsiyonu
            const t = window.setTimeout(() => setVisible(true), delay);
            // bir kez tetiklensin
            obs.unobserve(e.target);
            return () => window.clearTimeout(t);
          }
        });
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={[
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function AboutSection() {
  return (
    <section className="pt-24 pb-0 bg-white">
      <div className="w-full">
        {/* --- First Block (Text Left, Image Right) --- */}
        <RevealOnScroll /* ilk blok hemen animelansın */>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
            {/* Text */}
            <div className="flex flex-col justify-center px-6 lg:px-20 py-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-4">
                KISA VE UZUN MESAFE <br />
                Taşıma ilanları için aramıza katılın
              </h2>
              <p className="text-base lg:text-lg text-gray-600">
                Onaylanmış Taşıyıcılar ile İşler Yapın
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
        </RevealOnScroll>

        {/* --- Second Block (Image Left, Text Right) --- */}
        <RevealOnScroll delay={120}> {/* ikinci blok biraz gecikmeli, aşağı indikçe devreye girer */}
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
                KONUMUNUZA GÖRE TAŞIMA İLANLARI
              </h2>
              <p className="text-base lg:text-lg text-gray-600">
                Bulunduğunuz Lokasyonda Yeni işler Bulun
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
