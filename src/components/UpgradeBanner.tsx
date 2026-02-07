import React from 'react';
import { Zap, Sparkles } from 'lucide-react';

interface UpgradeBannerProps {
    onUpgradeClick: () => void;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ onUpgradeClick }) => {
    return (
        <div className="w-full bg-[#1A1C23] h-10 px-4 flex items-center justify-center relative z-50 animate-fade-in border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 max-w-7xl w-full justify-between sm:justify-center">
                {/* Left Icon (Hidden on very small mobile to save space) */}
                <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-md bg-brand-500/20 text-brand-400">
                    <Sparkles size={14} />
                </div>

                {/* Centered Text */}
                <p className="text-[11px] sm:text-xs font-medium text-slate-300 tracking-tight text-center flex-1 sm:flex-none">
                    <span className="font-bold text-white mr-1">Experimente o Pro grátis</span>
                    <span className="opacity-60">— nosso plano mais popular para criadores e empresas.</span>
                </p>

                {/* Upgrade Button */}
                <button
                    onClick={onUpgradeClick}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 hover:border-brand-500/50 transition-all text-[11px] font-bold shadow-[0_0_15px_rgba(var(--brand-500-rgb),0.1)] group"
                >
                    <Zap size={12} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                    Fazer Upgrade
                </button>
            </div>
        </div>
    );
};

export default UpgradeBanner;
