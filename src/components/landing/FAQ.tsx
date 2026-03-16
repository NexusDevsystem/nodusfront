import React, { useState } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { Plus, Minus } from 'lucide-react';

export function FAQ() {
  const [active, setActive] = useState(0);
  const { t } = useLanguage();

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 }
  ];

  return (
    <section id="faq" className="bg-white text-dark border-t-4 border-dark">
      <div className="flex flex-col lg:flex-row">
        {/* Left: Questions */}
        <div className="lg:w-1/2 border-b-4 lg:border-b-0 lg:border-r-4 border-dark flex flex-col">
          <div className="p-8 md:p-12 border-b-4 border-dark bg-brand">
            <h2 className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter">{t.faq.title}</h2>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b-4 border-dark last:border-b-0 flex flex-col">
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(active === i ? -1 : i)}
                className={`w-full text-left p-6 md:p-12 transition-all duration-300 focus:outline-none flex justify-between items-center ${active === i ? 'bg-yellow shadow-none translate-x-[4px] translate-y-[4px]' : 'bg-white hover:bg-bg shadow-brutal'}`}
              >
                <span className="font-display font-black text-2xl md:text-4xl uppercase leading-none tracking-tighter pr-4">{faq.q}</span>
                <div className={`lg:hidden flex-shrink-0 w-10 h-10 rounded-none border-2 border-dark flex items-center justify-center transition-transform duration-300 ${active === i ? 'bg-dark text-white rotate-180' : 'bg-white text-dark'}`}>
                  {active === i ? <Minus size={20} strokeWidth={4} /> : <Plus size={20} strokeWidth={4} />}
                </div>
              </button>
              
              {/* Mobile Accordion Content */}
              <div 
                className={`lg:hidden grid transition-all duration-300 ease-in-out ${active === i ? 'grid-rows-[1fr] border-t-4 border-dark/20 bg-bg' : 'grid-rows-[0fr] bg-white'}`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 text-lg font-medium leading-relaxed text-dark/80">
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Right: Sticky Answer (Desktop Only) */}
        <div className="lg:w-1/2 hidden lg:block relative bg-bg">
          <div className="sticky top-0 h-screen flex flex-col justify-center p-16 overflow-hidden">
            <div className="text-brand font-display font-black text-[20rem] leading-none opacity-10 absolute -top-10 -right-10 pointer-events-none">?</div>
            <div className="relative z-10 transition-all duration-500" key={active}>
              {active >= 0 && faqs[active] && (
                <>
                  <h3 className="font-display font-black text-5xl uppercase mb-8 tracking-tighter leading-none">{faqs[active].q}</h3>
                  <p className="text-2xl font-medium leading-relaxed">{faqs[active].a}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
