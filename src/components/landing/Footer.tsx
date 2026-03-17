import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

import TextPressure from './TextPressure';

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const container = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useGSAP(() => {
    // Spin the star/circle
    gsap.to('.spin-element', {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: "linear"
    });
  }, { scope: container });

  return (
    <footer className="!bg-[#000000] !text-[#ffffff] relative overflow-x-hidden border-t-4 border-dark" ref={container}>
      {/* Links Section - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b-4 border-dark !bg-[#000000]">
        
        {/* Brand/About */}
        <div className="p-8 md:p-12 flex flex-col justify-between !bg-[#ffffff] border-b-4 md:border-r-4 lg:border-b-0 border-dark !text-[#000000]">
          <div>
            <div className="font-display font-black text-5xl tracking-tighter mb-4 !text-[#000000]">NODUS</div>
            <p className="font-bold text-gray-600 mb-8 text-lg leading-snug !text-[#000000]">© {new Date().getFullYear()} Nodus.<br/>{t.footer.rights}</p>
          </div>
          <div className="spin-element w-20 h-20 !bg-[#000000] !text-[#ffffff] rounded-full flex items-center justify-center border-2 border-dark shadow-sm">
            <span className="font-black text-3xl">✦</span>
          </div>
        </div>

        {/* Product */}
        <div className="p-8 md:p-12 !bg-[#ffffff] border-b-4 lg:border-r-4 lg:border-b-0 border-dark !text-[#000000]">
          <div className="font-display font-black text-2xl uppercase tracking-widest mb-8 !text-[#000000]">{t.footer.product}</div>
          <ul className="flex flex-col gap-6 font-bold text-xl">
            <li><a href="#" className="hover:text-brand transition-colors !text-[#000000]">{t.nav.features}</a></li>
            <li><a href="#" className="hover:text-brand transition-colors !text-[#000000]">{t.footer.templates}</a></li>
          </ul>
        </div>

        {/* Legal & Contact */}
        <div className="p-8 md:p-12 !bg-[#ffffff] border-b-4 md:border-b-0 md:border-r-4 border-dark !text-[#000000]">
          <div className="font-display font-black text-2xl uppercase tracking-widest mb-8 !text-[#000000]">{t.footer.legal}</div>
          <ul className="flex flex-col gap-6 font-bold text-xl">
            <li><a href="/privacy" className="hover:text-pink transition-colors !text-[#000000]">{t.footer.privacy}</a></li>
            <li><a href="/terms" className="hover:text-pink transition-colors !text-[#000000]">{t.footer.terms}</a></li>
            <li><a href="https://wa.me/5511910408544" target="_blank" rel="noopener noreferrer" className="hover:text-pink transition-colors !text-[#000000]">{t.footer.support}</a></li>
          </ul>
        </div>

        {/* Socials */}
        <div className="flex flex-col !bg-[#ffffff] !text-[#000000]">
          <a href="https://instagram.com/nodus.my" className="flex-1 p-8 flex items-center justify-between border-b-4 border-dark hover:bg-[#f5f5f5] transition-colors group">
            <span className="font-display font-black text-2xl uppercase tracking-widest !text-[#000000]">Instagram</span>
            <Instagram className="w-8 h-8 !text-[#000000]" />
          </a>
          <a href="https://twitter.com/joao_magn0_dev" className="flex-1 p-8 flex items-center justify-between border-b-4 border-dark hover:bg-[#f5f5f5] transition-colors group">
            <span className="font-display font-black text-2xl uppercase tracking-widest !text-[#000000]">Twitter</span>
            <Twitter className="w-8 h-8 !text-[#000000]" />
          </a>
          <a href="#" className="flex-1 p-8 flex items-center justify-between hover:bg-[#f5f5f5] transition-colors group">
            <span className="font-display font-black text-2xl uppercase tracking-widest !text-[#000000]">LinkedIn</span>
            <Linkedin className="w-8 h-8 !text-[#000000]" />
          </a>
        </div>

      </div>

    </footer>
  );
}
