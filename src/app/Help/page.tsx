"use client";

import Link from "next/link";
import Navbar from "../../components/UI/Navbar";
import Image from "next/image";
import { useState } from "react";

export default function AboutPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Are Posts Safe?",
      answer:
        "Yes, all posts are monitored and follow strict security guidelines to ensure safety.",
    },
    {
      question: "Carrier Types",
      answer:
        "We support multiple carrier types, including same-day delivery, express, minivans, and trucks.",
    },
    {
      question: "How the System Works?",
      answer:
        "The system matches delivery requests with available carriers nearby, ensuring fast and efficient service.",
    },
    {
      question: "How We Approve Carriers",
      answer:
        "Carriers go through a verification process, including ID checks, vehicle checks, and background review before approval.",
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
        className="page-banner-area py-24 bg-cover bg-center bg-gray-100"
        style={{
          backgroundImage: "url('/assets/images/shapes/page-banner-bg.jpg')",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="page-banner-content text-center">
            <h1 className="text-4xl font-semibold text-black">Help</h1>

            <ul className="ps-0 mb-0 list-unstyled inline-flex gap-2 justify-center mt-4">
              <li>
                <Link href="/" className="text-gray-700 hover:underline">
                  Home Page
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-700">Help Topics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          

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
      <footer className="bg-gray-100 relative pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Logo */}
            <div className="footer-widget">
              <a href="/" className="inline-block mb-4">
                <Image src="/Brand/1.png" alt="logo" width={200} height={60} />
              </a>
            </div>

            {/* Info */}
            <div className="footer-widget">
              <h4 className="text-lg font-bold text-black mb-4">
                Bilgi ve Sözleşmeler
              </h4>
              <ul className="list-disc list-inside text-black space-y-2">
                <li>Yüksi Hakkımızda</li>
                <li>Kurye Gizlilik Sözleşmesi</li>
                <li>Kurye Taşıyıcı Sözleşmesi</li>
                <li>Gizlilik Sözleşmesi</li>
                <li>Kullanıcı Sözleşmesi</li>
              </ul>
            </div>

            {/* YÜKSİ */}
            <div className="footer-widget">
              <h4 className="text-lg font-bold text-black mb-4">YÜKSİ</h4>
              <ul className="list-disc list-inside text-black space-y-2">
                <li>Anasayfa</li>
                <li>İletişim</li>
                <li>info@yuksi.com.tr</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500">&copy; 2025 Tüm hakları saklıdır @Yüksi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
