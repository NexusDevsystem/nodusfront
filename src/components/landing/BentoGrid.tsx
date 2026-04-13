import React, { useState } from 'react';
import { Palette, BarChart3, Link as LinkIcon, QrCode } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

export function BentoGrid() {
  const [hovered, setHovered] = useState<number>(0);
  const { t } = useLanguage();

  const features = [
    { 
      title: t.bento.f1Title, 
      desc: t.bento.f1Desc, 
      color: "bg-brand",
      visual: (
        <div className="w-full max-w-[200px] h-24 bg-[#fdfcf0] border-[3px] border-dark flex flex-col justify-between p-2 shadow-[4px_4px_0_0_#000] rotate-2 overflow-hidden mx-auto md:mx-0">
          <div className="flex gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-pink border border-dark"></div>
            <div className="w-4 h-4 rounded-full bg-yellow border border-dark"></div>
          </div>
          <div className="h-4 w-full bg-dark"></div>
          <div className="h-2 w-3/4 bg-gray-300 mt-1"></div>
        </div>
      )
    },
    { 
      title: t.bento.f2Title, 
      desc: t.bento.f2Desc, 
      color: "bg-pink",
      visual: (
        <div className="w-full max-w-[200px] h-24 bg-white border-[3px] border-dark flex items-end justify-around py-2 px-3 shadow-[4px_4px_0_0_#000] -rotate-1 mx-auto md:mx-0">
           <div className="w-3 bg-dark h-[40%]"></div>
           <div className="w-3 bg-yellow border-2 border-dark h-[70%]"></div>
           <div className="w-3 bg-brand border-2 border-dark h-[90%]"></div>
           <div className="w-3 bg-dark h-[30%]"></div>
           <div className="w-3 bg-pink border-2 border-dark h-[60%]"></div>
        </div>
      )
    },
    { 
      title: t.bento.f3Title, 
      desc: t.bento.f3Desc, 
      color: "bg-yellow",
      visual: (
        <div className="w-full max-w-[200px] flex flex-col gap-2 relative rotate-1 mx-auto md:mx-0">
            <div className="w-full h-8 bg-white border-[2px] border-dark shadow-[4px_4px_0_0_#000] flex items-center px-2">
                <div className="w-4 h-4 bg-brand border border-dark mr-2"></div>
                <div className="h-2 w-1/2 bg-gray-200"></div>
            </div>
            <div className="w-[90%] self-end h-8 bg-brand border-[2px] border-dark shadow-[4px_4px_0_0_#000] flex items-center px-2">
                 <div className="h-2 w-1/2 bg-dark"></div>
            </div>
            <div className="absolute -top-3 -right-3 text-dark animate-pulse"><LinkIcon size={24} strokeWidth={4} /></div>
        </div>
      )
    },
    { 
      title: t.bento.f4Title, 
      desc: t.bento.f4Desc, 
      color: "bg-white",
      visual: (
        <div className="w-full max-w-[200px] aspect-square max-h-[100px] bg-white border-[4px] border-dark flex items-center justify-center p-2 shadow-[6px_6px_0_0_#000] -rotate-2 mx-auto md:mx-0 relative">
           {/* QR Block shapes mockups */}
           <div className="absolute top-2 left-2 w-4 h-4 border-[3px] border-dark"></div>
           <div className="absolute top-2 right-2 w-4 h-4 border-[3px] border-dark"></div>
           <div className="absolute bottom-2 left-2 w-4 h-4 border-[3px] border-dark"></div>
           <div className="w-6 h-6 bg-brand"></div>
           <div className="absolute bottom-2 right-2 flex flex-wrap w-5 h-5 gap-0.5">
               <div className="w-2 h-2 bg-dark"></div><div className="w-2 h-2 bg-pink"></div>
               <div className="w-2 h-2 bg-transparent"></div><div className="w-2 h-2 bg-dark"></div>
           </div>
        </div>
      )
    }
  ];

  return (
    <section id="features" className="min-h-screen flex flex-col md:flex-row border-t-4 border-dark overflow-hidden bg-bg relative z-10">
      {features.map((f, i) => (
        <div
          key={i}
          onMouseEnter={() => setHovered(i)}
          className={`relative border-b-4 md:border-b-0 md:border-r-4 border-dark ${f.color} transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-between p-6 md:p-12 cursor-crosshair overflow-hidden ${hovered === i ? 'md:flex-[2.5] flex-[2]' : 'md:flex-1 flex-1'}`}
        >
          <div className={`transition-all duration-500 w-full mb-8 ${hovered === i ? 'scale-100 opacity-100' : 'md:scale-75 md:opacity-50'}`}>
            {f.visual}
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
