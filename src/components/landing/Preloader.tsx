import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const layer1 = useRef<HTMLDivElement>(null);
  const layer2 = useRef<HTMLDivElement>(null);
  const layer3 = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ onComplete });

    // Spinner continuous rotation
    gsap.to(spinnerRef.current, {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: 'linear'
    });

    const counter = { value: 0 };

    // Progress counting animation
    tl.to(counter, {
      value: 100,
      duration: 1.8,
      ease: 'power3.inOut',
      onUpdate: () => {
        setProgress(Math.round(counter.value));
      }
    });

    // Fade out content
    tl.to(contentRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: 'power2.inOut'
    }, '+=0.1');

    // Multi-layer wipe up
    tl.to(layer1.current, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' });
    tl.to(layer2.current, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '-=0.65');
    tl.to(layer3.current, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '-=0.65');

  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden" role="status" aria-live="polite" aria-label="Carregando">
      <div ref={layer3} className="absolute inset-0 bg-emerald-400" />
      <div ref={layer2} className="absolute inset-0 bg-emerald-700" />
      <div ref={layer1} className="absolute inset-0 bg-emerald-950 flex items-center justify-center">
        <div ref={contentRef} className="flex flex-col items-center gap-8">
          
          <div className="relative flex items-center justify-center w-48 h-48">
            <svg ref={spinnerRef} className="absolute inset-0 w-full h-full text-emerald-500/30" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="20 10" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 20" />
              <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" />
            </svg>
            <div className="flex items-baseline">
              <span className="font-display font-black text-7xl text-emerald-50 tracking-tighter">
                {progress}
              </span>
              <span className="text-emerald-500 text-2xl font-bold ml-1">%</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-emerald-400 font-mono text-xs tracking-[0.3em] uppercase">
              Inicializando Nodus
            </span>
            <div className="w-40 h-[2px] bg-emerald-900 relative overflow-hidden rounded-none">
              <div 
                className="absolute top-0 left-0 h-full bg-emerald-400 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
