//src/app/About/page.tsx


import Link from "next/link";
import Navbar from "../../..//../components/UI/Navbar"; 
import Footer from "@/components/UI/Footer";
import AboutSection from "@/components/UI/AboutSection";
import PrivacyContentPage from "./Content/page";

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* 1. Page Banner */}
      <div
        className="page-banner-area py-24 bg-cover bg-center bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="page-banner-content text-center">
            <h1 className="text-4xl font-semibold text-black">Sözleşmeler</h1>

            <ul className="ps-0 mb-0 list-unstyled inline-flex gap-2 justify-center mt-4">
              <li>
                <Link href="/" className="text-gray-700 hover:underline">
                  Ana Sayfa
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-700">Gizlilik Sözleşmesi</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* About */}
      <PrivacyContentPage />

      {/* About */}
      <AboutSection />


      {/* Footer */}
            <Footer />
    </div>
  );
}
