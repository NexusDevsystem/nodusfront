import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, AlertCircle, Globe, Link as LinkIcon, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

// Safe localStorage setter that handles quota errors
const safeSetItem = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, clearing snapshots...');
            localStorage.removeItem('nodus_profile_snapshot');
            localStorage.removeItem('nodus_links_snapshot');
            localStorage.removeItem('nodus_products_snapshot');
            try {
                localStorage.setItem(key, value);
            } catch (retryError) {
                console.error('Failed to save even after cleanup:', retryError);
            }
        }
    }
};

/**
 * OnboardingPage v2.1.2 - Color consistency and icon fix
 */
export default function OnboardingPage() {
    const { user, setProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [userCategory, setUserCategory] = useState<'creator' | 'personal' | 'business' | null>(null);
    const [referralSource, setReferralSource] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check availability as user types
    useEffect(() => {
        if (username.length < 3) {
            setAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setChecking(true);
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('id')
                    .eq('username', username.toLowerCase());

                if (error) throw error;
                setAvailable(data.length === 0);
            } catch (err) {
                console.error('Availability check failed:', err);
                setAvailable(false); // Assume unavailable on error as a safety measure
            } finally {
                setChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username]);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1 && !available) return;
        if (step === 2 && !userCategory) return;
        setStep(step + 1);
    };

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!available || !user?.email || !userCategory) return;

        setLoading(true);
        setError('');

        try {
            // 1. Update Profile with all onboarding data
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    username: username.toLowerCase(),
                    onboarding_completed: true,
                    user_category: userCategory,
                    referral_source: referralSource || 'Não informado'
                })
                .eq('email', user.email);

            if (updateError) throw updateError;

            // 2. Fetch fresh profile data
            const { data: updatedProfile, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('email', user.email)
                .single();

            if (fetchError) throw fetchError;

            // 3. Update Global Context
            setProfile(updatedProfile);

            // 4. Navigate to admin
            navigate('/admin');

        } catch (err: any) {
            console.error('Finalization error:', err);
            setError(err.message || 'Ocorreu um erro ao finalizar seu perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans overflow-hidden">


            {/* Left Side: Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 relative border-b-2 lg:border-b-0 lg:border-r-2 border-black z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-16">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 font-bold text-sm uppercase hover:text-[#97cd7a] transition-colors"
                    >
                        <div className="w-8 h-8 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
                            <LinkIcon size={16} />
                        </div>
                        Voltar
                    </button>
                    <div className="font-black text-2xl tracking-tighter uppercase">NODUS</div>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="mb-12">
                        {step === 1 && (
                            <h1 className="text-6xl lg:text-7xl font-black uppercase leading-[0.9] mb-6">
                                Escolha seu <br /> Link Único.
                            </h1>
                        )}
                        {step === 2 && (
                            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-6">
                                Como você <br /> vai usar?
                            </h1>
                        )}
                        {step === 3 && (
                            <h1 className="text-6xl lg:text-7xl font-black uppercase leading-[0.9] mb-6">
                                Quase <br /> lá.
                            </h1>
                        )}
                        <p className="font-medium text-lg text-black/70 border-l-4 border-[#ffdf00] pl-4">
                            {step === 1 && "Você poderá alterá-lo depois se precisar."}
                            {step === 2 && "Isso nos ajuda a personalizar sua experiência."}
                            {step === 3 && "Por onde nos conheceu?"}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleNextStep} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-black uppercase tracking-widest pl-1">Claim your username</label>
                                <div className="group relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                                        className={`
                                            w-full bg-white border-2 border-black py-6 pl-[110px] pr-12 text-xl font-black
                                            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                            focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] 
                                            transition-all duration-200
                                            ${available === true ? 'border-[#97cd7a]' :
                                                available === false ? 'border-red-500' :
                                                    'border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                                        `}
                                        placeholder="você"
                                        required
                                    />
                                    <div className="absolute left-5 inset-y-0 flex items-center gap-1 text-black font-black text-xl select-none pointer-events-none z-10 
                                        group-focus-within:text-[#97cd7a] group-focus-within:translate-x-[2px] group-focus-within:translate-y-[2px]
                                        group-hover:translate-x-[1px] group-hover:translate-y-[1px]
                                        transition-all duration-200">
                                        noduscc<span className="opacity-30">/</span>
                                    </div>
                                    <div className="absolute right-5 inset-y-0 flex items-center gap-3 bg-white pl-2 z-10
                                        group-focus-within:translate-x-[2px] group-focus-within:translate-y-[2px]
                                        group-hover:translate-x-[1px] group-hover:translate-y-[1px]
                                        transition-all duration-200">
                                        {checking && <Loader2 className="animate-spin text-black" size={24} />}
                                        {!checking && available === true && <Check className="text-[#97cd7a]" size={24} strokeWidth={4} />}
                                        {!checking && available === false && <X className="text-red-500" size={24} strokeWidth={4} />}
                                    </div>
                                </div>
                                <div className="h-6 mt-2">
                                    {available === true && (
                                        <div className="bg-[#97cd7a]/10 border-2 border-[#97cd7a] text-[#5b8c41] px-3 py-1 text-[10px] font-black uppercase tracking-tight inline-block shadow-[2px_2px_0px_0px_#97cd7a]">
                                            Link disponível!
                                        </div>
                                    )}
                                    {available === false && username && !checking && (
                                        <div className="bg-red-50 border-2 border-red-500 text-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-tight inline-block shadow-[2px_2px_0px_0px_#ef4444]">
                                            Indisponível :(
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!available || loading || checking}
                                className={`
                                    w-full h-20 border-2 border-black font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300
                                    ${available && !loading && !checking
                                        ? 'bg-[#ffdf00] text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                {checking ? <Loader2 className="animate-spin" size={24} /> : 'Continuar'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {[
                                { id: 'creator', label: 'Criador de Conteúdo', description: 'Influenciadores, YouTubers e Criadores.' },
                                { id: 'business', label: 'Corporativo', description: 'Para minha empresa e negócios.' },
                                { id: 'personal', label: 'Uso Pessoal', description: 'Agrupar links e projetos pessoais.' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setUserCategory(cat.id as any)}
                                    className={`
                                        w-full p-6 border-2 text-left transition-all duration-200 relative group
                                        ${userCategory === cat.id
                                            ? 'border-black bg-[#97cd7a] translate-x-[2px] translate-y-[2px] shadow-none'
                                            : 'border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
                                    `}
                                >
                                    <h3 className={`font-black uppercase text-xl ${userCategory === cat.id ? 'text-black' : 'text-black'}`}>{cat.label}</h3>
                                    <p className={`text-sm font-bold ${userCategory === cat.id ? 'text-black/60' : 'text-black/40'}`}>{cat.description}</p>
                                    {userCategory === cat.id && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-black flex items-center justify-center">
                                            <Check className="text-black" size={18} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={() => setStep(3)}
                                disabled={!userCategory}
                                className={`
                                    w-full h-20 border-2 border-black font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 mt-6
                                    ${userCategory
                                        ? 'bg-[#ffdf00] text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                Continuar
                            </button>
                            <button onClick={() => setStep(1)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">Voltar</button>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleFinalize} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-black uppercase tracking-widest pl-1">Sua resposta</label>
                                <input
                                    type="text"
                                    value={referralSource}
                                    onChange={(e) => setReferralSource(e.target.value)}
                                    className="w-full bg-white border-2 border-black py-6 px-6 text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all duration-200"
                                    placeholder="Ex: Instagram, Amigo, Google..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!referralSource || loading}
                                className={`
                                    w-full h-20 border-2 border-black font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300
                                    ${referralSource && !loading
                                        ? 'bg-[#97cd7a] text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                                        : 'bg-white text-black/20 cursor-not-allowed opacity-50 shadow-none'}
                                `}
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : 'Finalizar Perfil'}
                            </button>
                            <button type="button" onClick={() => setStep(2)} className="w-full text-black/40 text-xs font-black uppercase tracking-widest hover:text-black transition-colors pt-4">Voltar</button>
                        </form>
                    )}

                    {error && <p className="mt-4 text-red-500 text-sm font-medium text-center">{error}</p>}
                </div>

                <div className="mt-auto pt-8 flex justify-between items-end border-t-2 border-black/10">
                    <div className="text-xs font-bold text-black/30 uppercase">
                        V 2.0.0
                    </div>
                    <div className="text-xs font-bold text-black/30 uppercase">
                        Secure Onboarding
                    </div>
                </div>
            </div>

            {/* Right Side: Visual Banner */}
            <div className="hidden lg:flex w-1/2 bg-[#ffdf00] relative overflow-hidden items-center justify-center p-12">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
                </div>

                {/* Big Visual Element */}
                <div className="relative w-full max-w-lg aspect-square">
                    {/* Circle Background */}
                    <div className="absolute inset-0 bg-white rounded-full border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"></div>

                    {/* Premium Phone Frame */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="relative w-auto h-[85%] aspect-[9/19] bg-slate-950 rounded-[2.5rem] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-[6px] border-black ring-1 ring-white/10 transition-transform hover:scale-[1.02] duration-500 animate-float">
                            <img
                                src="/mockup.jpeg"
                                alt="Mockup Preview"
                                className="w-full h-full object-cover"
                            />
                            {/* Mobile Notch Bar */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-5 bg-black rounded-b-xl z-20"></div>
                        </div>
                    </div>

                    {/* Brutalist Floating elements */}
                    {/* 1. Status */}
                    <div className="absolute top-0 left-0 bg-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transform -rotate-3 z-20 animate-float">
                        <div className="w-8 h-8 bg-[#97cd7a] border-2 border-black rounded-full flex items-center justify-center">
                            <Check className="text-black" size={16} strokeWidth={4} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-black/40 font-black uppercase tracking-widest leading-none">Status</span>
                            <span className="font-black text-black text-xs uppercase">Perfil Ativo</span>
                        </div>
                    </div>

                    {/* 2. Analytics */}
                    <div className="absolute top-[20%] -right-8 bg-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-2 transform rotate-6 z-20 animate-float-delayed w-36">
                        <div className="flex justify-between items-center">
                            <div className="w-6 h-6 border-2 border-black bg-blue-400 flex items-center justify-center">
                                <LinkIcon size={12} className="text-white" />
                            </div>
                            <span className="text-[10px] font-black bg-[#97cd7a] text-black px-1.5 border-2 border-black">+12%</span>
                        </div>
                        <div className="text-2xl font-black text-black">2.840</div>
                        <div className="text-[9px] font-black text-black/30 uppercase tracking-tighter">Cliques Totais</div>
                    </div>

                    {/* 3. Theme */}
                    <div className="absolute bottom-[10%] -left-8 bg-black text-white border-2 border-black p-4 shadow-[6px_6px_0px_0px_#ffdf00] flex items-center gap-3 transform rotate-2 z-20 animate-float">
                        <div className="grid grid-cols-2 gap-1">
                            <div className="w-2 h-2 bg-[#97cd7a] border-[1px] border-white/20"></div>
                            <div className="w-2 h-2 bg-white/10 border-[1px] border-white/20"></div>
                            <div className="w-2 h-2 bg-white/10 border-[1px] border-white/20"></div>
                            <div className="w-2 h-2 bg-white/10 border-[1px] border-white/20"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-white/40 font-black uppercase tracking-widest leading-none mb-1">Theme</span>
                            <span className="font-black text-white text-[10px] uppercase">Brutalism</span>
                        </div>
                    </div>

                    {/* 4. Realtime Badge */}
                    <div className="absolute -bottom-4 right-10 bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-[10px] font-black uppercase flex items-center gap-2 z-20">
                        <div className="w-3 h-3 bg-red-500 border-2 border-black animate-pulse"></div>
                        Live Preview
                    </div>
                </div>
            </div>
        </div>
    );
}
