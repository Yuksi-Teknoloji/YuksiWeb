"use client";

import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function HeroCarousel() {
  const images = ["/icons/b2.png", "/icons/b3.png"]; // your 2 images
  const [currentIndex, setCurrentIndex] = useState(0);
  const interval = 3000; // 3 seconds

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, interval);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] xl:h-[580px]">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index + 1}`}
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              index === currentIndex
                ? "opacity-100"
                : "opacity-0 absolute top-0 left-0"
            }`}
          />
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 text-white hover:text-orange-500 transition"
        >
          <FiChevronLeft size={32} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:text-orange-500 transition"
        >
          <FiChevronRight size={32} />
        </button>
      </div>
    </section>
  );
}
