// src/app/Main/Communication/page.tsx
'use client';

import React, { useState } from 'react';
import Navbar from '@/components/UI/Navbar';
import Link from 'next/link';
import Footer from '@/components/UI/Footer';

type ContactPayload = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://40.90.226.14:8080').replace(/\/+$/, '');

export default function CommunicationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setOkMsg(null);
    setErrMsg(null);

    const payload: ContactPayload = {
      fullName: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/Contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const text = await res.text();
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch { /* ignore parse error */ }

      if (!res.ok) {
        const msg = json?.message || json?.title || `Gönderilemedi (HTTP ${res.status})`;
        throw new Error(msg);
      }

      setOkMsg('Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağız.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setErrMsg(err?.message || 'Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Page Banner */}
      <div className="page-banner-area py-24 bg-cover bg-center bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="page-banner-content text-center">
            <h1 className="text-4xl font-semibold text-black">İletişim</h1>
            <ul className="ps-0 mb-0 list-unstyled inline-flex gap-2 justify-center mt-4">
              <li>
                <Link href="/" className="text-gray-700 hover:underline">
                  Ana Sayfa
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-700">İletişim</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <section className="bg-white py-16">
        <div className="flex justify-center px-4">
          <div className="bg-gray-100 p-4 rounded-xl shadow-md w-full max-w-5xl">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              Görüşlerinizi bizimle <span className="text-red-500">info@yuksi.com.tr</span>
            </h3>
            <h3 className="text-lg text-gray-700 mb-6">
              üzerinden ya da iletişim formu ile görüşlerinizi bizimle paylaşabilirsiniz
            </h3>

            {/* Status messages */}
            {okMsg && (
              <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                {okMsg}
              </div>
            )}
            {errMsg && (
              <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                {errMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Adınız & Soyadınız"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-md p-3 w-full focus:ring-2 focus:ring-orange-500 text-gray-700"
                />
                <span className="absolute right-3 top-3 text-orange-600 font-bold">**</span>
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="E-Posta Adresiniz"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-md p-3 w-full focus:ring-2 focus:ring-orange-500 text-gray-700"
                />
                <span className="absolute right-3 top-3 text-orange-600 font-bold">**</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  placeholder="Telefon Numaranız"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-md p-3 w-full focus:ring-2 focus:ring-orange-500 text-gray-700"
                />
                <span className="absolute right-3 top-3 text-orange-600 font-bold">**</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="subject"
                  placeholder="Mesajınızın Konusu"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 rounded-md p-3 w-full focus:ring-2 focus:ring-orange-500 text-gray-700"
                />
                <span className="absolute right-3 top-3 text-orange-600 font-bold">**</span>
              </div>

              <div className="relative">
                <textarea
                  name="message"
                  placeholder="Mesajınızı Yazın."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="border border-gray-300 rounded-md p-3 w-full focus:ring-2 focus:ring-orange-500 text-gray-700"
                />
                <span className="absolute right-3 top-3 text-orange-600 font-bold">**</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-orange-500 text-white py-3 px-6 rounded-md w-full font-medium text-lg hover:bg-orange-600 transition ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
