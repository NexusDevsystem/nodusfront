import React, { useRef } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Marquee() {
  const { t } = useLanguage();
  const container = useRef<HTMLElement>(null);
  const textPath1 = useRef<SVGTextPathElement>(null);
  const textPath2 = useRef<SVGTextPathElement>(null);

  // Reduced repeat count from 30 to 12 for better performance while still covering the screen
  const text1 = `${t.marquee.create} ${t.marquee.brutal} ★ `.repeat(12);
  const text2 = `${t.marquee.share} ${t.marquee.sell} ★ `.repeat(12);

  useGSAP(() => {
    // Animate the first ribbon to move left as you scroll down
    gsap.to(textPath1.current, {
      attr: { startOffset: "-50%" },
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5, // Reduced scrub time for snappier, less CPU-intensive updates
      }
    });

    // Animate the second ribbon to move right as you scroll down
    gsap.to(textPath2.current, {
      attr: { startOffset: "0%" },
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      }
    });
  }, { scope: container });

  return (
    <section ref={container} className="w-full relative z-30 -mt-24 -mb-24 md:-mt-32 md:-mb-32 pointer-events-none">
      <div className="w-full overflow-hidden flex flex-col items-center justify-center py-12">
        <div className="w-[150vw] md:w-[120vw] max-w-none ml-[-25vw] md:ml-[-10vw]">
          {/* Removed expensive CSS drop-shadow, using SVG paths for shadows instead */}
          <svg viewBox="0 0 2000 600" className="w-full h-auto" preserveAspectRatio="xMidYMid slice">
          
          {/* Ribbon 1 Shadow (Fake shadow for performance) */}
          <path d="M -500,250 Q 250,50 1000,250 T 2500,250" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="100" strokeLinecap="round" transform="translate(0, 20)" />
          {/* Ribbon 1 Background (Black Border) */}
          <path d="M -500,250 Q 250,50 1000,250 T 2500,250" fill="none" stroke="#000000" strokeWidth="104" strokeLinecap="round" />
          {/* Ribbon 1 Fill */}
          <path id="curve1" d="M -500,250 Q 250,50 1000,250 T 2500,250" fill="none" stroke="#97cd7a" strokeWidth="84" strokeLinecap="round" />

          {/* Ribbon 2 Shadow (Fake shadow for performance) */}
          <path d="M -500,370 Q 250,170 1000,370 T 2500,370" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="100" strokeLinecap="round" transform="translate(0, 20)" />
          {/* Ribbon 2 Background (Black Border) */}
          <path d="M -500,370 Q 250,170 1000,370 T 2500,370" fill="none" stroke="#000000" strokeWidth="104" strokeLinecap="round" />
          {/* Ribbon 2 Fill */}
          <path id="curve2" d="M -500,370 Q 250,170 1000,370 T 2500,370" fill="none" stroke="#FFA6F6" strokeWidth="84" strokeLinecap="round" />

          {/* Text 1 */}
          <text className="font-display uppercase tracking-wider" fontSize="56" fontWeight="900" fill="#000000" dy="20" style={{ stroke: '#000000', strokeWidth: '1.5px', paintOrder: 'stroke fill' }}>
            <textPath ref={textPath1} href="#curve1" startOffset="0%">
              {text1}
            </textPath>
          </text>

          {/* Text 2 */}
          <text className="font-display uppercase tracking-wider" fontSize="56" fontWeight="900" fill="#000000" dy="20" style={{ stroke: '#000000', strokeWidth: '1.5px', paintOrder: 'stroke fill' }}>
            <textPath ref={textPath2} href="#curve2" startOffset="-50%">
              {text2}
            </textPath>
          </text>
        </svg>
        </div>
      </div>
    </section>
  );
}

