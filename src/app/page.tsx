// src/app/page.tsx (Server Component)
import Navbar from "@/components/UI/Navbar";
import Footer from "@/components/UI/Footer";
import TransportationServices from "@/components/UI/TransportationServices";
import AboutSection from "@/components/UI/AboutSection";
import ExperienceSection from "@/components/UI/ExperienceSection";
import MobileAppFeatures from "@/components/UI/MobileAppFeatures";
import OptionsApp from "@/components/UI/OptionsApp";
import PartnersCarousel from "@/components/UI/partnerscarousel";

import { fetchBanners } from "@/services/banner";
import HeroCarousel from "@/components/UI/Hero"; // ← yeni

export default async function Home() {
  // API: [{ id, src, title, link }]
  const apiSlides = await fetchBanners();
  // HeroCarousel Slide tipine map’le
  const slides = apiSlides.map(s => ({
    src: s.src,
    link: s.link,
    alt: s.title,
    title: s.title,        
    description: s.description
  }));

  return (
    <>
      <Navbar />
      {/* slider burada, AYRI SECTION açmadan */}
      <HeroCarousel slides={slides} />

      <TransportationServices />
      <AboutSection />
      <ExperienceSection />
      <MobileAppFeatures />
      <OptionsApp />
      <PartnersCarousel />
      <Footer />
    </>
  );
}
