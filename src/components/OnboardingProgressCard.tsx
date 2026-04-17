import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    Circle, 
    Camera, 
    Link, 
    Copy, 
    Trophy, 
    X, 
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../services/apiClient';
import { UserProfile } from '../types';

interface OnboardingProgressCardProps {
    profile: UserProfile;
    onUpdate?: (updates: Partial<UserProfile>) => void;
    onNavigate?: (tab: string) => void;
}

export default function OnboardingProgressCard({ profile, onUpdate, onNavigate }: OnboardingProgressCardProps) {
    const isPT = true; // Hardcoded to PT as requested by general project context

    // 1. Calculate progress first so it's available for actions
    const currentProgress = useMemo(() => {
        let score = 25; // Base weight for account
        if (profile.hasProfilePic || profile.avatarUrl) score += 25;
        if (profile.hasFirstLink) score += 25;
        if (profile.hasCopiedUrl) score += 25;
        return score;
    }, [profile.hasProfilePic, profile.avatarUrl, profile.hasFirstLink, profile.hasCopiedUrl]);

    const steps = useMemo(() => [
        { 
            id: 'account', 
            label: isPT ? 'Criar conta e validar e-mail' : 'Create account & validate email', 
            completed: true, 
            weight: 25,
            icon: <CheckCircle2 className="text-green-500 w-5 h-5" />
        },
        { 
            id: 'photo', 
            label: isPT ? 'Fazer upload da Foto de Perfil' : 'Upload Profile Picture', 
            completed: !!profile.hasProfilePic || !!profile.avatarUrl, 
            weight: 25,
            icon: <Camera className="w-5 h-5" />,
            action: () => onNavigate?.('profile')
        },
        { 
            id: 'link', 
            label: isPT ? 'Adicionar o primeiro Link' : 'Add your first Link', 
            completed: !!profile.hasFirstLink, 
            weight: 25,
            icon: <Link className="w-5 h-5" />,
            action: () => onNavigate?.('links')
        },
        { 
            id: 'copy', 
            label: isPT ? 'Copiar a URL do Nodus' : 'Copy your Nodus URL', 
            completed: !!profile.hasCopiedUrl, 
            weight: 25,
            icon: <Copy className="w-5 h-5" />,
            action: async () => {
                const url = `nodus.cc/${profile.username}`;
                await navigator.clipboard.writeText(url);
                
                // Track backend
                try {
                    await apiClient.markUrlCopied();
                    onUpdate?.({ hasCopiedUrl: true });
                    
                    // If this was the last step (was at 75 and now 100), celebrate!
                    if (currentProgress === 75) {
                        celebrate();
                    }
                } catch (e) {
                    console.error('Failed to mark URL as copied', e);
                }
            }
        }
    ], [profile, onNavigate, isPT, currentProgress]);

    const isComplete = currentProgress === 100;

    const celebrate = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffdf00', '#000000', '#ffffff', '#97cd7a']
        });
    };

    const handleDismiss = async () => {
        try {
            await apiClient.dismissOnboarding();
            onUpdate?.({ onboardingDismissed: true });
        } catch (e) {
            console.error('Failed to dismiss onboarding', e);
        }
    };

    // Don't render if dismissed
    if (profile.onboardingDismissed) return null;

    const getDynamicMessage = () => {
        if (currentProgress <= 25) return isPT ? "Ótimo começo! Que tal colocar um rosto no seu perfil?" : "Great start! How about adding a face to your profile?";
        if (currentProgress <= 50) return isPT ? "Ficou bem melhor! Agora, adicione seu principal link." : "Looks much better! Now, add your primary link.";
        if (currentProgress <= 75) return isPT ? "Quase lá! Seu Nodus já está ganhando vida. Copie seu link abaixo." : "Almost there! Your Nodus is coming to life. Copy your link below.";
        return isPT ? "Parabéns! Seu Nodus está pronto. Compartilhe com o mundo!" : "Congrats! Your Nodus is ready. Share it with the world!";
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
                {/* Header with Title & Dismiss */}
                <div className="p-5 sm:p-6 border-b-2 border-black bg-[#fafafa]">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#ffdf00] border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {isComplete ? <Trophy className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">{isComplete ? (isPT ? 'RESUMO PARA VOCÊ' : 'SUMMARY FOR YOU') : (isPT ? 'COMPLETE SEU PERFIL' : 'COMPLETE YOUR PROFILE')}</h3>
                                <p className="text-[11px] font-bold text-black/60 italic leading-tight mt-0.5">
                                    {getDynamicMessage()}
                                </p>
                            </div>
                        </div>
                        
                        {isComplete && (
                            <button 
                                onClick={handleDismiss}
                                className="p-1 hover:bg-black/5 transition-colors rounded-xl group"
                                title={isPT ? "Remover card" : "Dismiss card"}
                            >
                                <X size={20} className="text-black/30 group-hover:text-black transition-colors" />
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{isPT ? 'PROGRESSO' : 'PROGRESS'}</span>
                            <span className="text-[10px] font-black">{currentProgress}%</span>
                        </div>
                        <div className="h-4 bg-slate-100 border-2 border-black rounded-full overflow-hidden p-0.5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${currentProgress}%` }}
                                className="h-full bg-[#97cd7a] border-r-2 border-black rounded-full transition-all duration-1000"
                            />
                        </div>
                    </div>
                </div>

                {/* Checklist */}
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {steps.map((step) => (
                        <button
                            key={step.id}
                            disabled={step.completed && step.id !== 'copy'}
                            onClick={step.action}
                            className={`
                                group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                                ${step.completed 
                                    ? 'bg-slate-50 border-black/10 text-black/40' 
                                    : 'bg-white border-black hover:bg-[#ffdf00] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none'
                                }
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-full border-2 border-black flex items-center justify-center shrink-0
                                ${step.completed ? 'bg-green-500/10 border-green-500/20' : 'bg-white group-hover:scale-110 transition-transform'}
                            `}>
                                {step.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : step.icon}
                            </div>
                            
                            <div className="min-w-0">
                                <span className="block text-[10px] font-black uppercase tracking-tight leading-tight">
                                    {step.label}
                                </span>
                                {!step.completed && (
                                    <span className="flex items-center gap-1 text-[8px] font-bold text-black/40 uppercase mt-1 group-hover:text-black transition-colors">
                                        {step.id === 'copy' ? (isPT ? 'Copiar link' : 'Copy link') : (isPT ? 'Clique para ir' : 'Click to go')}
                                        <ArrowRight size={10} />
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
