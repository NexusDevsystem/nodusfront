import React, { useRef } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Marquee() {
  const { t } = useLanguage();
  const container = useRef<HTMLElement>(null);
  const ribbon1 = useRef<HTMLDivElement>(null);
  const ribbon2 = useRef<HTMLDivElement>(null);

  // Smaller base set of items
  const items1 = [t.marquee.create, t.marquee.brutal, '★'];
  const items2 = [t.marquee.share, t.marquee.sell, '★'];

  // Duplicate items twice to ensure it overflows the screen and remains seamless
  // 10 reps is enough to fill any screen twice
  const content1 = Array(20).fill(items1).flat();
  const content2 = Array(20).fill(items2).flat();

  useGSAP(() => {
    // Ribbon 1 (Green) moves LEFT infinitely
    gsap.to(ribbon1.current, {
      xPercent: -50,
      ease: "none",
      duration: 60,
      repeat: -1
    });

    // Ribbon 2 (Pink) moves RIGHT infinitely
    gsap.to(ribbon2.current, {
      xPercent: 0,
      ease: "none",
      duration: 60,
      repeat: -1
    });
  }, { scope: container });

  return (
    <section ref={container} className="w-full relative z-30 -mt-24 -mb-24 md:-mt-32 md:-mb-32 pointer-events-none overflow-hidden py-24">
      <div className="flex flex-col gap-0">
        {/* Ribbon 1: Green */}
        <div 
            className="relative h-20 md:h-24 bg-brand border-y-4 border-dark flex items-center overflow-hidden rotate-[-2deg] scale-[1.2] shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
          style={{ willChange: 'transform' }}
        >
          <div ref={ribbon1} className="flex whitespace-nowrap translate-x-0">
            {content1.map((item, i) => (
              <span key={i} className="inline-flex items-center px-10 font-display font-black text-4xl md:text-6xl uppercase tracking-tighter text-dark">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Ribbon 2: Pink */}
        <div 
            className="relative h-20 md:h-24 bg-pink border-y-4 border-dark flex items-center overflow-hidden rotate-[2deg] scale-[1.2] -mt-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
          style={{ willChange: 'transform' }}
        >
          <div ref={ribbon2} className="flex whitespace-nowrap translate-x-[-50%]">
            {content2.map((item, i) => (
              <span key={i} className="inline-flex items-center px-10 font-display font-black text-4xl md:text-6xl uppercase tracking-tighter text-dark">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

