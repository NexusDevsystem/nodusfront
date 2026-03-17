import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
    className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.startsWith('pt') ? 'pt-BR' : 'en';

    const switchTo = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className={`flex border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] ${className || ''}`}>
            <button
                onClick={() => switchTo('pt-BR')}
                className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${currentLang === 'pt-BR'
                        ? 'bg-[#ffdf00] text-black'
                        : 'bg-white text-black hover:bg-[#ffdf00]/5'
                    }`}
            >
                PT
            </button>
            <button
                onClick={() => switchTo('en')}
                className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border-l-2 border-[#1a1a1a] transition-all ${currentLang === 'en'
                        ? 'bg-[#ffdf00] text-black'
                        : 'bg-white text-black hover:bg-[#ffdf00]/5'
                    }`}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageToggle;
