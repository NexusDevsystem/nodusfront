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
  const [footerHeight, setFooterHeight] = useState(0);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

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
    <LanguageProvider>
      <div className="landing-page-root">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
        
        {/* Main Content "Stack" */}
        <div className="relative z-10 bg-bg shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
          <Navbar />
          <main>
            <Hero />
            <Marquee />
            <BentoGrid />
            <FeaturesList />
            <HowItWorks />
            <Comparison />
            <FAQ />
          </main>
          {/* Bottom border/finish for the stack */}
          <div className="h-4 bg-dark"></div>
        </div>

        {/* Spacer that creates the 'scroll room' for the reveal */}
        <div style={{ height: footerHeight }} className="pointer-events-none" />

        {/* The Footer fixed behind the stack */}
        <div 
          ref={footerRef}
          className="fixed bottom-0 left-0 w-full z-0"
        >
          <Footer />
        </div>
      </div>
    </LanguageProvider>
  );
}
