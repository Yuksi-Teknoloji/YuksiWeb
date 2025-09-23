// components/TransportationServices.tsx
"use client";
import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "Kurye",
    href: "#/hizmetler/6859021d687ba463a85cd069",
    img: "/icons/1.jpg",
  },
  {
    title: "Minivan",
    href: "#/hizmetler/6859024c687ba463a85cd06d",
    img: "/icons/2.jpg",
  },
  {
    title: "Panelvan",
    href: "#/hizmetler/6859028a687ba463a85cd075",
    img: "/icons/3.jpg",
  },
  {
    title: "Kamyonet",
    href: "#/hizmetler/68590322687ba463a85cd079",
    img: "/icons/4.jpg",
  },
  {
    title: "Kamyon",
    href: "#/hizmetler/68590354687ba463a85cd085",
    img: "/icons/5.jpg",
  },
];

export default function TransportationServices() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Heading */}
        <div className="pt-20 mb-8">  {/* 👈 added padding-top here instead of margin */}
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-left">
            Talepte Bulunabileceğiniz Taşıma Hizmetleri
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="text-center">
                <Link href={service.href}>
                  <Image
                    src={service.img}
                    alt={service.title}
                    width={320}
                    height={200}
                    className="rounded-lg mx-auto object-cover"
                  />
                </Link>
                <h3 className="mt-3 text-lg font-semibold text-gray-800">
                  <Link href={service.href}>{service.title}</Link>
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
