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
        <div className={`flex border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${className || ''}`}>
            <button
                onClick={() => switchTo('pt-BR')}
                className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${currentLang === 'pt-BR'
                        ? 'bg-black text-[#97cd7a]'
                        : 'bg-white text-black hover:bg-black/5'
                    }`}
            >
                PT
            </button>
            <button
                onClick={() => switchTo('en')}
                className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border-l-2 border-black transition-all ${currentLang === 'en'
                        ? 'bg-black text-[#97cd7a]'
                        : 'bg-white text-black hover:bg-black/5'
                    }`}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageToggle;
