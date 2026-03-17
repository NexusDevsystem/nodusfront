import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from './translations';
import i18n from '../../../i18n';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.pt;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to get saved language or browser language
  const getInitialLang = (): Language => {
    const saved = localStorage.getItem('nodus-lang');
    if (saved === 'en') return 'en';
    if (saved?.startsWith('pt')) return 'pt';
    
    // Fallback to browser lang
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt';
    return 'en';
  };

  const [lang, setLangState] = useState<Language>(getInitialLang());
  const t = translations[lang];

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('nodus-lang', newLang === 'pt' ? 'pt-BR' : 'en');
    
    // Sync with i18next system
    if (i18n) {
      i18n.changeLanguage(newLang === 'pt' ? 'pt-BR' : 'en');
    }
  };

  // Sync state if localStorage changes in another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nodus-lang') {
        const val = e.newValue;
        if (val === 'en') setLangState('en');
        else if (val?.startsWith('pt')) setLangState('pt');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
