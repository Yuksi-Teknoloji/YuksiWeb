import Navbar from "@/components/UI/Navbar";
import Hero from "@/components/UI/Hero";
import Footer from "@/components/UI/Footer";
import TransportationServices from "@/components/UI/TransportationServices";
import AboutSection from "@/components/UI/AboutSection";
import ExperienceSection from "@/components/UI/ExperienceSection";
import MobileAppFeatures from "@/components/UI/MobileAppFeatures";
import OptionsApp from "@/components/UI/OptionsApp"; 
import PartnersCarousel from "@/components/UI/partnerscarousel";


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TransportationServices/>
      <AboutSection/>
      <ExperienceSection/>
      <MobileAppFeatures/>
      <OptionsApp/>
      <PartnersCarousel/>
      <Footer />
      
    </>
  );
}
