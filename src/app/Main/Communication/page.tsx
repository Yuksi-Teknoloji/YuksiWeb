"use client";

import React, { useState } from "react";
import Navbar from "../../../components/UI/Navbar";
import Link from "next/link";
import Footer from "@/components/UI/Footer";

export default function CommunicationPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            alert("Form submitted!");
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            setIsSubmitting(false);
        }, 2000);
    };

    return (
        <div className="bg-white min-h-screen overflow-x-hidden">
            {/* Navbar */}
            <Navbar />

            {/* Page Banner */}
            <div
                className="page-banner-area py-24 bg-cover bg-center bg-gray-100">
                <div className="container mx-auto px-4">
                    <div className="page-banner-content text-center">
                        <h1 className="text-4xl font-semibold text-black">
                            İletişim
                        </h1>
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
                    {/* Form container with gray background, wider than before */}
                    <div className="bg-gray-100 p-4 rounded-xl shadow-md w-full max-w-5xl">
                        {/* Headings aligned left */}
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                            Görüşlerinizi bizimle {" "}
                            <span className="text-red-500">info@yuksi.com.tr</span>
                        </h3>
                        <h3 className="text-lg text-gray-700 mb-10">
                            üzerinden ya da iletişim formu ile görüşlerinizi bizimle paylaşabilirsiniz
                        </h3>

                        {/* Contact Form */}
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                            {/* Name */}
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
                                <span className="absolute right-3 top-3 text-orange-600 font-bold">
                                    **
                                </span>
                            </div>

                            {/* Email */}
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
                                <span className="absolute right-3 top-3 text-orange-600 font-bold">
                                    **
                                </span>
                            </div>

                            {/* Phone */}
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
                                <span className="absolute right-3 top-3 text-orange-600 font-bold">
                                    **
                                </span>
                            </div>

                            {/* Subject */}
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
                                <span className="absolute right-3 top-3 text-orange-600 font-bold">
                                    **
                                </span>
                            </div>

                            {/* Message */}
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
                                <span className="absolute right-3 top-3 text-orange-600 font-bold">
                                    **
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`bg-orange-500 text-white py-3 px-6 rounded-md w-full font-medium text-lg hover:bg-orange-600 transition ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                                    }`}
                            >
                                {isSubmitting ? "Gönderiliyor..." : "Gönder"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
            {/* Footer */}
            <Footer />
        </div>
    );
}
