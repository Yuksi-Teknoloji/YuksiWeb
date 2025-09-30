// src/components/UI/HeroCarousel.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export type Slide = {
  src: string;
  link?: string;
  alt?: string;
  title?: string;        // <- eklendi
  description?: string;  // <- eklendi
};

export default function HeroCarousel({ slides = [] }: { slides?: Slide[] }) {
  // İstersen statikler kalsın; yoksa [] yap
  const staticImages: Slide[] = [
    { src: "/icons/b2.png", alt: "static-1", title: "Statik Başlık 1", description: "Statik açıklama 1" },
    { src: "/icons/b3.png", alt: "static-2", title: "Statik Başlık 2", description: "Statik açıklama 2" },
  ];

  // dışarıdan gelen + statik olanları birleştir
  const images = useMemo<Slide[]>(
    () => (slides?.length ? [...slides, ...staticImages] : staticImages),
    [slides]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const interval = 4000;

  const prevSlide = () =>
    setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1));
  const nextSlide = () => setCurrentIndex((p) => (p + 1) % images.length);

  useEffect(() => {
    const t = setInterval(nextSlide, interval);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] xl:h-[580px]">
        {images.map((img, index) => {
          const imageEl = (
            <img
              key={index}
              src={img.src}
              alt={img.alt ?? `Slide ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-700 ${
                index === currentIndex ? "opacity-100" : "opacity-0 absolute inset-0"
              }`}
              loading="eager"
            />
          );

          return (
            <div
              key={`wrap-${index}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 -z-10"
              }`}
            >
              {img.link ? (
                <a href={img.link} target="_blank" rel="noreferrer" className="block w-full h-full">
                  {imageEl}
                </a>
              ) : (
                imageEl
              )}

              {/* Başlık & açıklama overlay */}
              {(img.title || img.description) && (
                <div className="absolute inset-0 flex items-end">
                  <div className="w-full p-4 sm:p-6 md:p-8 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    {img.title && (
                      <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-semibold drop-shadow">
                        {img.title}
                      </h2>
                    )}
                    {img.description && (
                      <p className="mt-2 text-white/90 text-sm sm:text-base md:text-lg leading-snug drop-shadow">
                        {img.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* oklar */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 text-white drop-shadow hover:text-orange-400 transition z-20"
          aria-label="Önceki"
        >
          <FiChevronLeft size={36} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-white drop-shadow hover:text-orange-400 transition z-20"
          aria-label="Sonraki"
        >
          <FiChevronRight size={36} />
        </button>

        {/* noktalar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
