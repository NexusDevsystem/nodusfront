import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Camera, 
    Link, 
    Copy, 
    Check,
    Rocket,
    ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../services/apiClient';
import { UserProfile, LinkItem } from '../types';

interface CompactOnboardingCardProps {
    profile: UserProfile;
    links?: LinkItem[];
    onUpdate?: (updates: Partial<UserProfile>) => void;
    onNavigate?: (tab: string) => void;
}

export default function CompactOnboardingCard({ profile, links = [], onUpdate, onNavigate }: CompactOnboardingCardProps) {
    const isPT = true;

    // Source of truth for each step
    const hasPhoto = !!(profile.hasProfilePic || profile.avatarUrl);
    const hasLink = !!(profile.hasFirstLink || links.some(l => l.isActive && l.type !== 'header'));
    const hasCopied = !!profile.hasCopiedUrl;

    const currentProgress = useMemo(() => {
        let score = 25; // Base for account creation
        if (hasPhoto) score += 25;
        if (hasLink) score += 25;
        if (hasCopied) score += 25;
        return score;
    }, [hasPhoto, hasLink, hasCopied]);

    const isComplete = currentProgress === 100;

    // Persist completion state to backend so it never reappears
    React.useEffect(() => {
        if (isComplete && !profile.onboardingDismissed) {
            apiClient.dismissOnboarding().then(() => {
                onUpdate?.({ onboardingDismissed: true });
            }).catch(err => console.error('Failed to persist onboarding completion', err));
        }
    }, [isComplete, profile.onboardingDismissed]);

    const celebrate = () => {
        confetti({
            particleCount: 100,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#ffdf00', '#000000', '#ffffff', '#97cd7a']
        });
    };

    const handleCopy = async () => {
        const url = `nodus.cc/${profile.username}`;
        try {
            await navigator.clipboard.writeText(url);
            await apiClient.markUrlCopied();
            onUpdate?.({ hasCopiedUrl: true });
            if (currentProgress === 75) celebrate();
        } catch (e) {
            console.error('Failed to copy or mark URL', e);
        }
    };

    if (profile.onboardingDismissed || isComplete) return null;

    // Circular Progress Constants
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (currentProgress / 100) * circumference;

    return (
        <div className="px-3 mb-4">
            <div className="bg-[#fdfcf0] border-2 border-[#1a1a1a] rounded-2xl p-4 shadow-[0_4px_0_0_#1a1a1a] relative overflow-hidden group">
                
                <div className="flex flex-col gap-4">
                    {/* Top Row: Circular Progress & Header */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center shrink-0">
                            <svg className="w-12 h-12 transform -rotate-90">
                                <circle
                                    cx="24"
                                    cy="24"
                                    r={radius}
                                    fill="transparent"
                                    stroke="rgba(0,0,0,0.05)"
                                    strokeWidth="5"
                                />
                                <motion.circle
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: offset }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="24"
                                    cy="24"
                                    r={radius}
                                    fill="transparent"
                                    stroke={isComplete ? "#97cd7a" : "#ffdf00"}
                                    strokeWidth="5"
                                    strokeDasharray={circumference}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {isComplete ? (
                                    <div className="w-6 h-6 bg-[#97cd7a] rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
                                        <Check size={12} strokeWidth={4} className="text-[#1a1a1a]" />
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-black">{currentProgress}%</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 ">
                                <Rocket size={10} className={isComplete ? "text-[#97cd7a]" : "text-black/40"} />
                                <h4 className="text-[9px] font-black uppercase tracking-tight truncate">
                                    {isComplete ? (isPT ? 'Perfil Pronto!' : 'Finished!') : (isPT ? 'Faltam Detalhes' : 'Almost ready!')}
                                </h4>
                            </div>
                            <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest mt-0.5 leading-tight">
                                {isComplete ? (isPT ? 'Decolagem autorizada' : 'All set up') : (isPT ? 'Complete abaixo' : 'Finish profile')}
                            </p>
                        </div>
                    </div>

                    {/* Bottom Column: Detailed Action Items */}
                    <div className="flex flex-col gap-2">
                        {/* Task 1: Profile Photo */}
                        <button 
                            onClick={() => onNavigate?.('profile')}
                            disabled={hasPhoto}
                            className={`w-full group flex items-center justify-between p-2 rounded-lg border-2 transition-all ${
                                hasPhoto 
                                ? 'bg-[#97cd7a]/10 border-[#97cd7a]/20 text-[#97cd7a]/50 cursor-default' 
                                : 'bg-white border-[#1a1a1a] hover:bg-[#ffdf00] hover:shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[1px] active:shadow-none'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 ${
                                    hasPhoto ? 'border-[#97cd7a]/20' : 'border-[#1a1a1a]'
                                }`}>
                                    {hasPhoto ? <Check size={12} strokeWidth={4} /> : <Camera size={12} strokeWidth={2.5} />}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight">
                                    {isPT ? 'Foto de Perfil' : 'Profile Photo'}
                                </span>
                            </div>
                            {!hasPhoto && <ExternalLink size={10} className="text-black/20 group-hover:text-black" />}
                        </button>

                        {/* Task 2: First Link */}
                        <button 
                            onClick={() => onNavigate?.('links')}
                            disabled={hasLink}
                            className={`w-full group flex items-center justify-between p-2 rounded-lg border-2 transition-all ${
                                hasLink 
                                ? 'bg-[#97cd7a]/10 border-[#97cd7a]/20 text-[#97cd7a]/50 cursor-default' 
                                : 'bg-white border-[#1a1a1a] hover:bg-[#ffdf00] hover:shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[1px] active:shadow-none'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 ${
                                    hasLink ? 'border-[#97cd7a]/20' : 'border-[#1a1a1a]'
                                }`}>
                                    {hasLink ? <Check size={12} strokeWidth={4} /> : <Link size={12} strokeWidth={2.5} />}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight">
                                    {isPT ? 'Primeiro Link' : 'First Link'}
                                </span>
                            </div>
                            {!hasLink && <ExternalLink size={10} className="text-black/20 group-hover:text-black" />}
                        </button>

                        {/* Task 3: Share/Copy Link */}
                        <button 
                            onClick={handleCopy}
                            className={`w-full group flex items-center justify-between p-2 rounded-lg border-2 transition-all ${
                                hasCopied 
                                ? 'bg-[#97cd7a]/10 border-[#97cd7a]/20 text-[#97cd7a]/50' 
                                : 'bg-white border-[#1a1a1a] hover:bg-[#ffdf00] hover:shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[1px] active:shadow-none'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 ${
                                    hasCopied ? 'border-[#97cd7a]/20' : 'border-[#1a1a1a]'
                                }`}>
                                    {hasCopied ? <Check size={12} strokeWidth={4} /> : <Copy size={12} strokeWidth={2.5} />}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight">
                                    {isPT ? 'Copiar seu link' : 'Copy your link'}
                                </span>
                            </div>
                            {!hasCopied && <ExternalLink size={10} className="text-black/20 group-hover:text-black" />}
                        </button>
                    </div>
                </div>

                {/* Subtitle celebration hint */}
                {isComplete && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-[#97cd7a]/5 pointer-events-none"
                    />
                )}
            </div>
        </div>
    );
}
