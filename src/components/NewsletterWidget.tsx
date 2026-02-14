import React, { useState } from 'react';
import { Mail, Check, ArrowRight, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { THEMES } from '../constants';
import { apiClient } from '../services/apiClient';

interface NewsletterWidgetProps {
    profile: UserProfile;
}

export default function NewsletterWidget({ profile }: NewsletterWidgetProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        try {
            // Save to API
            if (!profile.id) {
                throw new Error('Profile ID is required');
            }
            await apiClient.createLead(profile.id, email);

            setStatus('success');
            setEmail('');

            // Reset after 3 seconds
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to save lead:', error);
            alert('Erro ao cadastrar email. Tente novamente.');
            setStatus('idle');
        }
    };


    const isGlass = currentTheme.id === 'glass';
    const hasCustomBg = !!profile.customBackground;

    // Determine text colors based on theme/background
    const isDarkContext = hasCustomBg || isGlass || currentTheme.id.includes('dark') || currentTheme.id.includes('black') || currentTheme.textClass.includes('white');
    const customTextColorStyle = (profile.themeId === 'custom' && profile.customTextColor) ? { color: profile.customTextColor } : {};
    const textColor = (profile.themeId === 'custom' && profile.customTextColor) ? '' : (isDarkContext ? 'text-white' : 'text-slate-800');
    const subTextColor = (profile.themeId === 'custom' && profile.customTextColor) ? '' : (isDarkContext ? 'text-white/70' : 'text-slate-500');
    const inputBg = isDarkContext ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white';
    const customButtonColorStyle = (profile.themeId === 'custom' && profile.customButtonColor) ? { backgroundColor: profile.customButtonColor } : {};
    const customButtonTextColorStyle = profile.customButtonTextColor ? { color: profile.customButtonTextColor } : {};
    const buttonBg = (profile.themeId === 'custom' && profile.customButtonColor) ? 'shadow-sm' : 'bg-white text-black hover:bg-white/90 shadow-sm';

    const roundedClass = profile.buttonRoundness === 'square' ? 'rounded-none' :
        profile.buttonRoundness === 'round' ? 'rounded-lg' :
            profile.buttonRoundness === 'rounder' ? 'rounded-2xl' :
                profile.buttonRoundness === 'full' ? 'rounded-full' :
                    'rounded-3xl';

    if (status === 'success') {
        return (
            <div className={`w-full mx-auto my-6 p-6 ${roundedClass} animate-fade-in text-center flex flex-col items-center justify-center gap-3 ${isGlass
                ? 'bg-white/10 backdrop-blur-md border border-white/20'
                : hasCustomBg ? 'bg-black/40 backdrop-blur-md border border-white/10' : 'bg-white shadow-lg border border-slate-100'
                }`}>
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mb-1 shadow-lg shadow-green-500/30">
                    <Check size={24} strokeWidth={3} />
                </div>
                <h3 className={`font-bold text-lg ${textColor}`} style={customTextColorStyle}>Inscrito com sucesso!</h3>
                <p className={`text-sm ${subTextColor}`} style={customTextColorStyle}>Obrigado por acompanhar.</p>
            </div>
        );
    }

    return (
        <div className={`w-full mx-auto my-6 p-1 ${roundedClass} transition-all duration-300 relative group overflow-hidden ${isGlass
            ? 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10'
            : hasCustomBg ? 'bg-black/30 backdrop-blur-sm border border-white/10 hover:bg-black/40' : 'bg-white shadow-sm hover:shadow-md border border-slate-100'
            }`}>
            {/* Optional Glow Effect for premium feel */}
            {isDarkContext && <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>}

            <div className="p-5 flex flex-col items-center text-center relative z-10" style={{ fontFamily: profile.fontFamily }}>
                <div className={`w-10 h-10 mb-3 ${profile.buttonRoundness === 'square' ? 'rounded-none' : 'rounded-2xl'} flex items-center justify-center ${isDarkContext ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Mail size={20} />
                </div>

                <h3 className={`font-bold text-lg mb-1 ${textColor}`} style={customTextColorStyle}>Fique por dentro</h3>
                <p className={`text-xs mb-4 max-w-[200px] leading-relaxed ${subTextColor}`} style={customTextColorStyle}>
                    Receba novidades e conteúdos exclusivos diretamente no seu e-mail.
                </p>

                <form onSubmit={handleSubmit} className="w-full relative">
                    <input
                        type="email"
                        placeholder="seu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-4 pr-12 py-3.5 ${profile.buttonRoundness === 'square' ? 'rounded-none' : 'rounded-xl'} outline-none border transition-all text-sm font-medium ${inputBg}`}
                        style={{ fontFamily: profile.fontFamily }}
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className={`absolute right-1.5 top-1.5 bottom-1.5 aspect-square ${profile.buttonRoundness === 'square' ? 'rounded-none' : 'rounded-lg'} flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed ${buttonBg}`}
                        style={{ ...customButtonColorStyle, ...customButtonTextColorStyle, fontFamily: profile.fontFamily }}
                    >
                        {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} style={customButtonTextColorStyle} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
