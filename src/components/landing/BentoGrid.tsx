import React, { useState } from 'react';
import { Palette, BarChart3, Link as LinkIcon, QrCode } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

export function BentoGrid() {
  const [hovered, setHovered] = useState<number>(0);
  const { t } = useLanguage();

  const features = [
    { title: t.bento.f1Title, desc: t.bento.f1Desc, icon: <Palette className="w-10 h-10 md:w-16 md:h-16" />, color: "bg-brand" },
    { title: t.bento.f2Title, desc: t.bento.f2Desc, icon: <BarChart3 className="w-10 h-10 md:w-16 md:h-16" />, color: "bg-pink" },
    { title: t.bento.f3Title, desc: t.bento.f3Desc, icon: <LinkIcon className="w-10 h-10 md:w-16 md:h-16" />, color: "bg-yellow" },
    { title: t.bento.f4Title, desc: t.bento.f4Desc, icon: <QrCode className="w-10 h-10 md:w-16 md:h-16" />, color: "bg-white" }
  ];

  return (
    <section id="features" className="min-h-screen flex flex-col md:flex-row border-t-4 border-dark overflow-hidden bg-bg relative z-10">
      {features.map((f, i) => (
        <div
          key={i}
          onMouseEnter={() => setHovered(i)}
          className={`relative border-b-4 md:border-b-0 md:border-r-4 border-dark ${f.color} transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-between p-6 md:p-12 cursor-crosshair overflow-hidden ${hovered === i ? 'md:flex-[2.5] flex-[2]' : 'md:flex-1 flex-1'}`}
        >
          <div className={`transition-all duration-500 ${hovered === i ? 'scale-100 opacity-100' : 'md:scale-75 md:opacity-50'}`}>
            {f.icon}
          </div>
          <div className="mt-auto flex flex-col justify-end h-full">
            <div className={`transition-all duration-500 origin-bottom-left flex items-end ${hovered === i ? 'md:rotate-0' : 'md:-rotate-90 md:mb-12'}`}>
              <h3 className={`font-display font-black uppercase leading-none tracking-tighter whitespace-nowrap ${hovered === i ? 'text-4xl md:text-7xl mb-4 whitespace-normal' : 'text-3xl md:text-5xl'}`}>
                {f.title}
              </h3>
            </div>
            <div className={`overflow-hidden transition-all duration-500 ${hovered === i ? 'max-h-40 opacity-100' : 'md:max-h-0 md:opacity-0'}`}>
              <p className="font-bold text-lg md:text-2xl leading-tight max-w-md">{f.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
