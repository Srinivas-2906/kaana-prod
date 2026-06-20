"use client";

import { useSiteEffects } from "@/hooks/useSiteEffects";
import AboutSection from "./AboutSection";
import AiChatWidget from "./AiChatWidget";
import AiDemoSection from "./AiDemoSection";
import BackToTop from "./BackToTop";
import CareersModal from "./CareersModal";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import GlobalOverlays from "./GlobalOverlays";
import Header from "./Header";
import HeroSection from "./HeroSection";
import MobileMenu from "./MobileMenu";
import ProcessSection from "./ProcessSection";
import SolutionsSection from "./SolutionsSection";
import TestimonialsSection from "./TestimonialsSection";
import WorkSection from "./WorkSection";

export default function SitePage() {
  useSiteEffects();

  return (
    <>
      <GlobalOverlays />
      <Header />
      <MobileMenu />
      <CareersModal />
      <main>
        <HeroSection />
        <SolutionsSection />
        <AiDemoSection />
        <ProcessSection />
        <WorkSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
      <AiChatWidget />
    </>
  );
}
