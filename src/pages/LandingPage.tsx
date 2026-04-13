import React, { useEffect, useState, useRef } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Marquee } from '../components/landing/Marquee';
import { BentoGrid } from '../components/landing/BentoGrid';
import { FeaturesList } from '../components/landing/FeaturesList';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Comparison } from '../components/landing/Comparison';
import { FAQ } from '../components/landing/FAQ';
import { Footer } from '../components/landing/Footer';
import { Preloader } from '../components/landing/Preloader';
import { LanguageProvider } from '../components/landing/i18n/LanguageContext';
import Lenis from 'lenis';

// Import local landing styles
import '../components/landing/landing.css';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only enable smooth scroll on desktop
    if (window.innerWidth < 768) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="landing-page-root">
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      
      {/* Main Content Stack */}
      <div className="relative z-10 bg-bg shadow-[0_20px_50px_rgba(0,0,0,0.2)] pb-12">
        <Navbar />
        <main>
          <Hero />
          <BentoGrid />
          <FeaturesList />
          <HowItWorks />
          <Comparison />
          <FAQ />
          <Footer />
        </main>
        {/* Bottom border/finish for the stack */}
        <div className="h-4 bg-dark"></div>
      </div>
      
      {/* Bottom Safety Spacer */}
      <div className="h-1 bg-black w-full" />
    </div>
  );
}
