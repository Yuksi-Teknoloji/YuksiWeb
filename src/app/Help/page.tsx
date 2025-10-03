//src/app/Help/page.tsx
"use client";

import Link from "next/link";
import Navbar from "../../components/UI/Navbar";
import { useState } from "react";
import Footer from "@/components/UI/Footer";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Gönderiler Güvenli mi?",
      answer:
        "Evet, tüm gönderiler izlenir ve güvenliği sağlamak için sıkı güvenlik kurallarına tabidir.",
    },
    {
      question: "Taşıyıcı Tipleri",
      answer:
        "Aynı gün teslimat, ekspres, minivan ve kamyon dahil olmak üzere birçok taşıyıcı türünü destekliyoruz.",
    },
    {
      question: "Sistem Nasıl Çalışıyor?",
      answer:
        "Sistem, teslimat taleplerini yakındaki mevcut taşıyıcılarla eşleştirerek hızlı ve verimli hizmet sağlar.",
    },
    {
      question: "Taşıyıcıları Nasıl Onaylarız",
      answer:
        "Taşıyıcılar, onaylanmadan önce kimlik kontrolleri, araç kontrolleri ve geçmiş incelemesi dahil olmak üzere bir doğrulama sürecinden geçerler.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* 1. Page Banner */}
      <div
        className="page-banner-area py-24 bg-cover bg-center bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="page-banner-content text-center">
            <h1 className="text-4xl font-semibold text-black">Yardım</h1>

            <ul className="ps-0 mb-0 list-unstyled inline-flex gap-2 justify-center mt-4">
              <li>
                <Link href="/" className="text-gray-700 hover:underline">
                  Ana Sayfa
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-700">Sık Sorulan Sorular</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl md:max-w-7xl mx-auto px-4 sm:px-6">
          

          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-orange-500 rounded-lg overflow-hidden shadow-md"
              >
                {/* Accordion Button */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className={`w-full flex justify-between items-center px-6 py-5 text-left text-lg font-semibold transition rounded-lg ${
                    openIndex === index
                      ? "bg-orange-600 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {faq.question}
                  <span className="ml-2 text-xl">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>

                {/* Accordion Body */}
                {openIndex === index && (
                  <div className="bg-yellow-50 text-gray-700 px-6 py-5">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
            <Footer />
    </div>
  );
}
