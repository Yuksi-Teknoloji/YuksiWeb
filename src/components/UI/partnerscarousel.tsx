"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Partner {
  id: number;
  name: string;
  src: string; // URL or public folder path
}

const partners: Partner[] = [
  { id: 1, name: "Motosiklet", src: "/icons/1.jpg" },
  { id: 2, name: "Kamyonet", src: "/icons/2.jpg" },
  { id: 3, name: "Panelvan", src: "/icons/3.jpg" },
  { id: 4, name: "Motosiklet", src: "/icons/4.jpg" },
  { id: 5, name: "Kamyonet", src: "/icons/5.jpg" },
  { id: 6, name: "Panelvan", src: "/icons/Logistic.PNG" },
];

export default function PartnersCarousel() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading aligned left */}
        <h2 className="text-3xl font-bold text-black text-left mb-12">
          Bayilerimiz
        </h2>

        {/* Carousel */}
        <Slider {...settings}>
          {partners.map((partner, index) => {
            // Add slight vertical stagger
            const translateY = index % 2 === 0 ? "-5px" : "5px";
            return (
              <div key={partner.id} className="px-4 flex flex-col items-center">
                <div
                  className="w-56 h-40 relative rounded-lg overflow-hidden border border-transparent bg-transparent transition-transform duration-500 hover:scale-105"
                  style={{ transform: `translateY(${translateY})` }}
                >
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    fill
                    className="object-contain grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h6 className="mt-4 text-center text-gray-800 font-semibold">
                  {partner.name}
                </h6>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}
