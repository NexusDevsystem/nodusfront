import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { useLanguage } from './i18n/LanguageContext';
import { Menu, X, Bell } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const location = window.location.pathname;

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    const isHomePage = location === '/' || location === '';
    
    if (isHomePage) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        // Offset for the fixed header
        const offset = 100;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const checkNewPosts = async () => {
      try {
        const posts = await apiClient.getPublicBlogPosts();
        const lastSeen = localStorage.getItem('nodus_blog_last_seen');
        const lastSeenTime = lastSeen ? parseInt(lastSeen) : 0;
        
        // Count posts published after last seen
        const news = posts.filter((p: any) => {
          const pubTime = new Date(p.publishedAt || p.createdAt).getTime();
          return pubTime > lastSeenTime;
        }).length;

        setNewPostsCount(news);
      } catch (err) {
        console.error('Failed to check for new posts:', err);
      }
    };

    checkNewPosts();
  }, []);

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
          <Link 
            to="/#features" 
            onClick={(e) => scrollToSection(e, 'features')}
            className="hover:text-brand transition-colors text-base tracking-tight"
          >
            {t.nav.features}
          </Link>
          <Link 
            to="/#how-it-works" 
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className="hover:text-brand transition-colors text-base tracking-tight"
          >
            {t.nav.howItWorks}
          </Link>
          <Link to="/blog" className="hover:text-brand transition-colors text-base tracking-tight relative group">
            {t.nav.blog}
            <AnimatePresence>
              {newPostsCount > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-3 -right-5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-dark shadow-[2px_2px_0_0_#000] min-w-[20px] text-center"
                >
                  {newPostsCount > 9 ? '9+' : newPostsCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex bg-white border-2 border-dark rounded-2xl overflow-hidden font-bold shadow-[0_4px_0_0_#000]">
            <button 
              onClick={() => setLang('pt')}
              className={`px-4 py-1.5 transition-colors ${lang === 'pt' ? 'bg-[#a5e6ab] text-dark' : 'text-dark/40 hover:bg-gray-100'}`}
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
          <Link to="/login" className="hidden md:flex">
            <Button variant="primary" size="sm" className="rounded-2xl px-8 py-2 shadow-[0_4px_0_0_#000] bg-[#a5e6ab] border-2 text-dark font-black tracking-tight hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#000]">
              {t.nav.create}
            </Button>
          </Link>
          <button 
            className="md:hidden p-2 text-dark" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={28} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={28} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden overflow-hidden border-t-2 border-dark flex flex-col gap-6 font-black text-center mt-4 pb-4"
          >
            <Link 
              to="/#features" 
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-brand transition-colors uppercase text-sm"
            >
              {t.nav.features}
            </Link>
            <Link 
              to="/#how-it-works" 
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-brand transition-colors uppercase text-sm"
            >
              {t.nav.howItWorks}
            </Link>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="hover:text-brand transition-colors uppercase text-sm flex items-center justify-center gap-2">
              {t.nav.blog}
              {newPostsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full border-2 border-dark shadow-[2px_2px_0_0_#000]">
                  {newPostsCount}
                </span>
              )}
            </Link>
            <div className="flex justify-center bg-white border-2 border-dark rounded-2xl overflow-hidden font-bold shadow-[0_4px_0_0_#000] mx-auto w-fit">
              <button 
                onClick={() => setLang('pt')}
                className={`px-5 py-2 text-xs transition-colors ${lang === 'pt' ? 'bg-[#a5e6ab] text-dark' : 'text-dark/40 hover:bg-gray-100'}`}
              >
                PT
              </button>
              <div className="w-[1.5px] bg-dark"></div>
              <button 
                onClick={() => setLang('en')}
                className={`px-5 py-2 text-xs transition-colors ${lang === 'en' ? 'bg-[#a5e6ab] text-dark' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                EN
              </button>
            </div>
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-6">
              <Button variant="primary" size="sm" className="w-full rounded-2xl py-3 shadow-[0_4px_0_0_#000] bg-[#a5e6ab] border-2 text-dark font-black tracking-tight text-sm">
                {t.nav.create}
              </Button>
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
