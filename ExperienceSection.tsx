"use client";

import { FaSmile, FaLanguage, FaDesktop } from "react-icons/fa";
import React from "react";

interface Stat {
  id: number;
  icon: React.ElementType;
  number: string;
  label: string;
}

const stats: Stat[] = [
  { id: 1, icon: FaSmile, number: "5,000+", label: "Happy Users" },
  { id: 2, icon: FaLanguage, number: "350,000+", label: "Approved Listings" },
  { id: 3, icon: FaDesktop, number: "65,000+", label: "Jobs Completed" },
];

export default function ExperienceSection() {
  return (
    <section className="py-28 bg-orange-500 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* --- Left Text --- */}
          <div>
            <h3 className="text-5xl font-bold mb-6">
              Experienced Carriers
            </h3>
            <p className="text-xl text-orange-100 leading-relaxed">
              We verify and approve all businesses registered in our system to
              ensure quality and trust.
            </p>
          </div>

          {/* --- Right Stats --- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            {stats.map(({ id, icon: Icon, number, label }) => (
              <div key={id} className="flex flex-col items-center space-y-5">
                {/* Larger icons */}
                <Icon className="text-6xl text-white" />

                {/* Bigger numbers */}
                <div className="text-4xl lg:text-5xl font-bold">{number}</div>
                <p className="text-orange-100 text-lg lg:text-xl">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
