import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, CreditCard } from 'lucide-react';

interface UpgradeBannerProps {
    onUpgradeClick: () => void;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ onUpgradeClick }) => {
    const { t } = useTranslation();
    return (
        <div className="w-full bg-[#ffdf00] h-10 px-4 flex items-center justify-center relative z-30 animate-fade-in shrink-0 border-b border-black">
            <div className="flex items-center gap-3 sm:gap-6 max-w-7xl w-full justify-between sm:justify-center relative z-10">
                {/* Left Icon (Minimalist) */}
                <div className="hidden sm:flex text-black/50">
                    <Sparkles size={14} />
                </div>

                {/* Centered Text */}
                <p className="text-[11px] sm:text-xs font-black text-black tracking-widest text-center flex-1 sm:flex-none uppercase relative z-10">
                    <span className="mr-2">{t('upgradeBanner.title')}</span>
                    <span className="opacity-50 hidden sm:inline">{t('upgradeBanner.subtitle')}</span>
                </p>

                {/* Upgrade Button (Minimalist) */}
                <button
                    onClick={onUpgradeClick}
                    className="flex items-center gap-1.5 px-3 py-1 bg-black text-white hover:bg-white hover:text-black transition-all text-[9px] font-black uppercase tracking-widest relative z-10 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                >
                    <CreditCard size={12} strokeWidth={3} />
                    {t('upgradeBanner.button')}
                </button>
            </div>
        </div>
    );
};

export default UpgradeBanner;
