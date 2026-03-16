import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from './i18n/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftBgRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const steps = [
    { num: "01", title: t.how.s1Title, desc: t.how.s1Desc },
    { num: "02", title: t.how.s2Title, desc: t.how.s2Desc },
    { num: "03", title: t.how.s3Title, desc: t.how.s3Desc }
  ];

  useGSAP(() => {
    // Set initial states for elements that will animate in
    gsap.set('.step-num:not(.step-num-0)', { yPercent: 100, opacity: 0 });
    gsap.set('.step-text:not(.step-text-0)', { yPercent: 100, opacity: 0 });

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=300%", // Pin for 3 viewport heights
          pin: true,
          scrub: 1, // Smooth scrubbing
        }
      });

      // Transition 0 -> 1
      tl.to('.step-num-0', { yPercent: -100, opacity: 0, duration: 1 }, 0)
        .to('.step-text-0', { yPercent: -100, opacity: 0, duration: 1 }, 0)
        .to(leftBgRef.current, { backgroundColor: '#FFB5E8', duration: 1 }, 0) // Pink
        .to('.step-num-1', { yPercent: 0, opacity: 1, duration: 1 }, 0)
        .to('.step-text-1', { yPercent: 0, opacity: 1, duration: 1 }, 0);

      // Transition 1 -> 2
      tl.to('.step-num-1', { yPercent: -100, opacity: 0, duration: 1 }, 1)
        .to('.step-text-1', { yPercent: -100, opacity: 0, duration: 1 }, 1)
        .to(leftBgRef.current, { backgroundColor: '#97cd7a', duration: 1 }, 1) // Brand Green (Official)
        .to('.step-num-2', { yPercent: 0, opacity: 1, duration: 1 }, 1)
        .to('.step-text-2', { yPercent: 0, opacity: 1, duration: 1 }, 1);

      // Small pause at the end so it doesn't unpin immediately
      tl.to({}, { duration: 0.2 });
    });
  }, { scope: containerRef });

  return (
    <section id="how-it-works" className="bg-bg text-dark border-t-2 border-dark relative flex flex-col md:flex-row md:h-screen md:overflow-hidden" ref={containerRef}>
      {/* Mobile Innovative Sticky Stack */}
      <div className="md:hidden flex flex-col w-full px-4 py-12 relative bg-bg">
        <div className="mb-10 sticky top-20 z-20 bg-bg/90 backdrop-blur-md py-4 border-b-2 border-dark inline-block self-start">
          <h2 className="font-display font-black text-5xl uppercase tracking-tighter leading-none">
            {t.how.step}
          </h2>
        </div>
        
        <div className="flex flex-col gap-24 pb-32">
          {steps.map((step, i) => {
            const bgColors = ['bg-yellow', 'bg-[#FFB5E8]', 'bg-brand'];
            const tops = ['top-40', 'top-48', 'top-56'];
            const rotations = ['-rotate-2', 'rotate-2', '-rotate-1'];
            
            return (
              <div 
                key={i} 
                className={`sticky ${tops[i]} ${bgColors[i]} ${rotations[i]} border-4 border-dark shadow-brutal-lg rounded-none p-8 flex flex-col gap-6 transition-all duration-300`}
                style={{ zIndex: i + 10 }}
              >
                <div className="flex justify-between items-center border-b-2 border-dark/20 pb-6">
                  <span className="font-display font-black text-7xl text-dark leading-none drop-shadow-[3px_3px_0px_#fff]">
                    {step.num}
                  </span>
                  <div className="w-16 h-16 rounded-none border-2 border-dark bg-white flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                    <div className="w-6 h-6 bg-dark rounded-none animate-pulse"></div>
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="font-display font-black text-4xl uppercase leading-none tracking-tighter mb-4">
                    {step.title}
                  </h3>
                  <p className="text-xl font-bold uppercase tracking-tight leading-snug text-dark/80">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Side */}
      <div className="hidden md:flex w-full h-full">
        {/* Left Side */}
        <div ref={leftBgRef} className="w-1/2 h-screen border-r-4 border-dark flex items-center justify-center relative overflow-hidden bg-yellow">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/noise/400/400')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 text-center flex flex-col items-center justify-center w-full h-full">
            <p className="font-bold text-2xl uppercase tracking-widest mb-8">{t.how.step}</p>
            <div className="relative h-[24rem] w-full flex justify-center items-center overflow-hidden">
              {steps.map((step, i) => (
                <span key={i} className={`step-num step-num-${i} absolute font-display font-black text-[20rem] leading-none tracking-tighter`}>
                  {step.num}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Right Side */}
        <div className="w-1/2 h-screen relative overflow-hidden bg-white">
          {steps.map((step, i) => (
            <div key={i} className={`step-text step-text-${i} absolute inset-0 flex flex-col justify-center p-16 bg-white`}>
              <h3 className="font-display font-black text-9xl uppercase mb-6 leading-none tracking-tighter">{step.title}</h3>
              <p className="text-4xl font-bold uppercase tracking-tight leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
