import React from 'react';
import { Zap, Sparkles } from 'lucide-react';

interface UpgradeBannerProps {
    onUpgradeClick: () => void;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ onUpgradeClick }) => {
    return (
        <div className="w-full bg-[#0D0E12] h-10 px-4 flex items-center justify-center relative z-50 animate-fade-in shrink-0 overflow-hidden">
            <div className="flex items-center gap-3 sm:gap-6 max-w-7xl w-full justify-between sm:justify-center relative z-10">
                {/* Left Icon (Minimalist) */}
                <div className="hidden sm:flex text-brand-400 opacity-80">
                    <Sparkles size={14} />
                </div>

                {/* Centered Text */}
                <p className="text-[11px] sm:text-xs font-medium text-slate-300 tracking-tight text-center flex-1 sm:flex-none">
                    <span className="text-white mr-1 opacity-90">Experimente o Pro grátis</span>
                    <span className="opacity-40 font-normal">— o segredo dos maiores criadores e empresas.</span>
                </p>

                {/* Upgrade Button (Minimalist) */}
                <button
                    onClick={onUpgradeClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-brand-400 hover:text-brand-300 hover:bg-white/5 transition-all text-[11px] font-bold group"
                >
                    <Zap size={13} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                    Fazer Upgrade
                </button>
            </div>
        </div>
    );
};

export default UpgradeBanner;
