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

  const items1 = [t.marquee.create, t.marquee.brutal, '★'];
  const items2 = [t.marquee.share, t.marquee.sell, '★'];

  // Duplicate items for enough length
  const content1 = Array(15).fill(items1).flat();
  const content2 = Array(15).fill(items2).flat();

  useGSAP(() => {
    // Ribbon 1 (Green) moves LEFT on scroll - Slowed down for readability
    gsap.to(ribbon1.current, {
      x: "-20%",
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      }
    });

    // Ribbon 2 (Pink) moves RIGHT on scroll - Slowed down for readability
    gsap.to(ribbon2.current, {
      x: "-15%",
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      }
    });
  }, { scope: container });

  return (
    <section ref={container} className="w-full relative z-30 -mt-24 -mb-24 md:-mt-32 md:-mb-32 pointer-events-none overflow-hidden py-24">
      <div className="flex flex-col gap-0">
        {/* Ribbon 1: Green */}
        <div 
          className="relative h-20 md:h-24 bg-[#97cd7a] border-y-4 border-black flex items-center overflow-hidden rotate-[-2deg] scale-[1.2] shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
          style={{ willChange: 'transform' }}
        >
          <div ref={ribbon1} className="flex whitespace-nowrap translate-x-0">
            {content1.map((item, i) => (
              <span key={i} className="inline-flex items-center px-10 font-display font-black text-4xl md:text-6xl uppercase tracking-tighter text-black">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Ribbon 2: Pink */}
        <div 
          className="relative h-20 md:h-24 bg-[#FFA6F6] border-y-4 border-black flex items-center overflow-hidden rotate-[2deg] scale-[1.2] -mt-6 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
          style={{ willChange: 'transform' }}
        >
          <div ref={ribbon2} className="flex whitespace-nowrap translate-x-[-35%]">
            {content2.map((item, i) => (
              <span key={i} className="inline-flex items-center px-10 font-display font-black text-4xl md:text-6xl uppercase tracking-tighter text-black">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

