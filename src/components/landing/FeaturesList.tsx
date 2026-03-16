import React, { useRef } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Instagram, 
  Youtube, 
  PlaySquare, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Music, 
  Clock, 
  DownloadCloud, 
  FolderTree, 
  ShoppingCart, 
  Lock, 
  BarChart,
  MoveRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function FeaturesList() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const colors = ["bg-pink", "bg-yellow", "bg-white", "bg-brand"];

  const features = [
    { icon: Instagram, title: t.featuresList.f1Title, desc: t.featuresList.f1Desc },
    { icon: Youtube, title: t.featuresList.f2Title, desc: t.featuresList.f2Desc },
    { icon: PlaySquare, title: t.featuresList.f3Title, desc: t.featuresList.f3Desc },
    { icon: Briefcase, title: t.featuresList.f4Title, desc: t.featuresList.f4Desc },
    { icon: MapPin, title: t.featuresList.f5Title, desc: t.featuresList.f5Desc },
    { icon: Calendar, title: t.featuresList.f6Title, desc: t.featuresList.f6Desc },
    { icon: Music, title: t.featuresList.f7Title, desc: t.featuresList.f7Desc },
    { icon: Clock, title: t.featuresList.f8Title, desc: t.featuresList.f8Desc },
    { icon: DownloadCloud, title: t.featuresList.f9Title, desc: t.featuresList.f9Desc },
    { icon: FolderTree, title: t.featuresList.f10Title, desc: t.featuresList.f10Desc },
    { icon: ShoppingCart, title: t.featuresList.f11Title, desc: t.featuresList.f11Desc },
    { icon: Lock, title: t.featuresList.f12Title, desc: t.featuresList.f12Desc },
    { icon: BarChart, title: t.featuresList.f13Title, desc: t.featuresList.f13Desc }
  ];

  useGSAP(() => {
    const track = trackRef.current;
    if (!track) return;

    // Only enable GSAP on desktop
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="h-[100svh] bg-bg border-y-2 border-dark overflow-hidden relative">
      
      <div ref={trackRef} className="flex flex-col md:flex-row h-full w-max">
        
        {/* Intro Panel */}
        <div className="w-screen md:w-[50vw] h-full flex flex-col justify-center p-8 md:p-16 border-r-4 border-dark bg-bg text-dark shrink-0 relative">
          <h2 className="font-display font-black text-6xl md:text-8xl lg:text-[100px] uppercase tracking-tighter leading-[0.85] mb-6">
            {t.featuresList.title}
          </h2>
          <p className="text-2xl md:text-3xl font-medium text-dark/70 max-w-xl">
            {t.featuresList.subtitle}
          </p>
          
          <div className="absolute bottom-12 left-8 md:left-16 flex items-center gap-4 text-brand animate-pulse">
            <MoveRight className="w-12 h-12" />
          </div>
        </div>

        {/* Feature Panels */}
        {features.map((feature, i) => {
          const colorClass = colors[i % colors.length];
          
          return (
            <div 
              key={i} 
              className={`w-[85vw] md:w-[400px] lg:w-[500px] h-full flex flex-col justify-between p-8 md:p-12 border-r-2 border-dark shrink-0 ${colorClass}`}
            >
              {/* Top: Number & Icon */}
              <div className="flex justify-between items-start">
                <span className="font-display font-black text-6xl md:text-8xl text-dark/20 leading-none">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-4 border-dark flex items-center justify-center shadow-brutal shrink-0">
                  {React.createElement(feature.icon, { className: "w-10 h-10 md:w-12 md:h-12 text-dark" })}
                </div>
              </div>
              
              {/* Bottom: Text Content */}
              <div>
                <h3 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter text-dark mb-4 leading-[0.9]">
                  {feature.title}
                </h3>
                <p className="text-xl md:text-2xl font-medium text-dark/80 leading-snug">
                  {feature.desc}
                </p>
              </div>
            </div>
          );
        })}
        
        {/* Outro Panel (Optional padding at the end) */}
        <div className="w-[10vw] h-full bg-dark shrink-0"></div>

      </div>
      
    </section>
  );
}
