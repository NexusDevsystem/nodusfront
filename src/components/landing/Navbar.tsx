import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { useLanguage } from './i18n/LanguageContext';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide if scrolling down and past 80px, show if scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-8 left-1/2 z-[100] bg-[#fdfdf6] border-2 border-dark rounded-2xl shadow-[0_8px_0_0_#000] w-[95%] max-w-6xl px-6 sm:px-10 py-2.5 transition-all duration-300 ${
        isVisible 
          ? '-translate-x-1/2 translate-y-0 opacity-100' 
          : '-translate-x-1/2 -translate-y-[200%] opacity-0'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-display font-black text-2xl md:text-3xl tracking-tighter text-dark">NODUS</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-12 font-bold whitespace-nowrap text-dark">
          <a href="#features" className="hover:text-brand transition-colors text-base tracking-tight">{t.nav.features}</a>
          <a href="#how-it-works" className="hover:text-brand transition-colors text-base tracking-tight">{t.nav.howItWorks}</a>
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex bg-white border-2 border-dark rounded-2xl overflow-hidden font-bold shadow-[0_4px_0_0_#000]">
            <button 
              onClick={() => setLang('pt')}
              className={`px-4 py-1.5 transition-colors ${lang === 'pt' ? 'bg-[#a5e6ab] text-dark' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              PT
            </button>
            <div className="w-[1.5px] bg-dark"></div>
            <button 
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 transition-colors ${lang === 'en' ? 'bg-[#a5e6ab] text-dark' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              EN
            </button>
          </div>
          <Link to="/login">
            <Button variant="primary" size="sm" className="hidden sm:flex rounded-2xl px-8 py-2 shadow-[0_4px_0_0_#000] bg-[#a5e6ab] border-2 text-dark font-black tracking-tight hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#000]">
              {t.nav.create}
            </Button>
          </Link>
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden mt-4 pt-4 border-t-2 border-dark flex flex-col gap-4 font-bold text-center">
          <a href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-brand transition-colors">{t.nav.features}</a>
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="hover:text-brand transition-colors">{t.nav.howItWorks}</a>
          <div className="flex justify-center gap-2 bg-white border-2 border-dark rounded-none overflow-hidden font-bold shadow-brutal-sm mx-auto w-fit">
            <button 
              onClick={() => setLang('pt')}
              className={`px-3 py-1 transition-colors ${lang === 'pt' ? 'bg-brand text-dark' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              PT
            </button>
            <div className="w-[2px] bg-dark"></div>
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 transition-colors ${lang === 'en' ? 'bg-brand text-dark' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              EN
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
