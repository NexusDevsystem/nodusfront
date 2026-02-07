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
    const [userCategory, setUserCategory] = useState<'creator' | 'corporate' | 'personal' | null>(null);
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
                    .eq('username', username.toLowerCase())
                    .maybeSingle();

                if (error) throw error;
                setAvailable(!data);
            } catch (err) {
                console.error('Availability check failed:', err);
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

            {/* Background elements synchronized with LoginPage */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,#f4f6f3_0%,#ffffff_60%)] opacity-70 pointer-events-none z-0"></div>
            {/* Background Radial Gradient */}
            <div className="fixed -bottom-20 -left-20 w-[600px] h-[600px] bg-[#1a2517] rounded-full blur-[150px] opacity-10 pointer-events-none z-0"></div>

            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative z-10">
                <div className="w-full max-w-sm">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 mb-12">
                        <div className="h-10 relative flex items-center justify-start min-w-[200px]">
                            <img
                                src="/icons/logo sem fundo.png"
                                alt="Nodus Logo"
                                className="absolute top-1/2 -translate-y-1/2 left-0 h-40 w-auto object-contain max-w-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 mb-10">
                        {step === 1 && <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Escolha seu link único.</h1>}
                        {step === 2 && <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Como você pretende usar o Nodus?</h1>}
                        {step === 3 && <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Por onde nos conheceu?</h1>}
                        <p className="text-slate-500 font-medium">
                            {step === 1 && "Você poderá alterá-lo depois se precisar."}
                            {step === 2 && "Isso nos ajuda a personalizar sua experiência."}
                            {step === 3 && "Sua resposta é fundamental para nosso crescimento."}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={handleNextStep} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Claim your username</label>
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none group-focus-within:text-[#acc8a2] transition-colors">
                                        noduscc/
                                    </span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                                        className={`
                                            w-full bg-white border-2 rounded-[22px] py-5 pl-[100px] pr-12 text-lg font-bold
                                            focus:outline-none focus:ring-4 transition-all duration-300
                                            ${available === true ? 'border-[#acc8a2] focus:ring-[#acc8a2]/10' :
                                                available === false ? 'border-red-400 focus:ring-red-400/10' :
                                                    'border-slate-100 hover:border-slate-200 focus:border-[#acc8a2] focus:ring-[#acc8a2]/10'}
                                        `}
                                        placeholder="voce"
                                        required
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                        {checking && <Loader2 className="animate-spin text-slate-300" size={20} />}
                                        {!checking && available === true && <Check className="text-[#acc8a2]" size={22} strokeWidth={3} />}
                                        {!checking && available === false && <X className="text-red-400" size={22} strokeWidth={3} />}
                                    </div>
                                </div>
                                <div className="h-6">
                                    {available === true && (
                                        <p className="text-[#acc8a2] text-xs font-bold mt-2 ml-4 animate-in fade-in slide-in-from-top-1">Link de usuário disponível!</p>
                                    )}
                                    {available === false && username && !checking && (
                                        <p className="text-red-400 text-xs font-bold mt-2 ml-4 animate-in fade-in slide-in-from-top-1">Este link já está sendo usado.</p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!available || loading}
                                className={`
                                    w-full h-16 rounded-[22px] font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
                                    ${available && !loading
                                        ? 'bg-slate-900 text-white shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                                `}
                            >
                                Continuar
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {[
                                { id: 'creator', label: 'Criador de Conteúdo', description: 'Influenciadores, YouTubers e Criadores.' },
                                { id: 'corporate', label: 'Corporativo / Negócio', description: 'Empresas, Agências e Marcas.' },
                                { id: 'personal', label: 'Uso Pessoal', description: 'Agrupar links e projetos pessoais.' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setUserCategory(cat.id as any)}
                                    className={`
                                        w-full p-6 rounded-[24px] border-2 text-left transition-all duration-300 relative group
                                        ${userCategory === cat.id
                                            ? 'border-[#acc8a2] bg-[#f4f6f3]'
                                            : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm'}
                                    `}
                                >
                                    <h3 className={`font-bold text-lg ${userCategory === cat.id ? 'text-slate-900' : 'text-slate-700'}`}>{cat.label}</h3>
                                    <p className="text-sm text-slate-400 font-medium">{cat.description}</p>
                                    {userCategory === cat.id && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#acc8a2] rounded-full flex items-center justify-center">
                                            <Check className="text-white" size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={() => setStep(3)}
                                disabled={!userCategory}
                                className={`
                                    w-full h-16 rounded-[22px] font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 mt-6
                                    ${userCategory
                                        ? 'bg-slate-900 text-white shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                                `}
                            >
                                Continuar
                            </button>
                            <button onClick={() => setStep(1)} className="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">Voltar</button>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleFinalize} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sua resposta</label>
                                <input
                                    type="text"
                                    value={referralSource}
                                    onChange={(e) => setReferralSource(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-[22px] py-5 px-6 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#acc8a2]/10 focus:border-[#acc8a2] transition-all duration-300"
                                    placeholder="Ex: Instagram, Amigo, Google..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!referralSource || loading}
                                className={`
                                    w-full h-16 rounded-[22px] font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
                                    ${referralSource && !loading
                                        ? 'bg-slate-900 text-white shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                                `}
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : 'Finalizar Perfil'}
                            </button>
                            <button type="button" onClick={() => setStep(2)} className="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">Voltar</button>
                        </form>
                    )}

                    {error && <p className="mt-4 text-red-500 text-sm font-medium text-center">{error}</p>}
                </div>
            </div>

            {/* Right Side: Visual Banner */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative p-12">
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {/* Pattern de Background Sutil com transição suave */}
                    <div
                        className="absolute inset-x-[-100px] inset-y-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"
                        style={{
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                        }}
                    ></div>

                    {/* Premium Phone Frame */}
                    <div className="relative w-auto h-full max-h-[80vh] aspect-[9/19] bg-slate-950 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.25)] overflow-hidden border-[8px] border-slate-900 ring-1 ring-white/10 z-10 transition-transform hover:scale-[1.02] duration-500">
                        {/* Internal Image Background */}
                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <img
                                src="/mockup.jpeg"
                                alt="Mockup Preview"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        {/* Mobile Notch Bar */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-6 bg-slate-900 rounded-b-2xl"></div>
                    </div>

                    {/* Floating Elements for "Wow" Factor */}

                    {/* 1. Verified Badge */}
                    <div className="absolute top-[15%] left-0 lg:-left-6 bg-white rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-3 border border-slate-100 animate-float z-20">
                        <div className="w-10 h-10 bg-[#acc8a2] rounded-full flex items-center justify-center shadow-lg shadow-[#acc8a2]/20">
                            <Check className="text-white" size={20} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Status</span>
                            <span className="font-bold text-slate-800">Perfil Ativo</span>
                        </div>
                    </div>

                    {/* 2. Mini Analytics Card */}
                    <div className="absolute top-[40%] right-0 lg:-right-4 bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/50 w-[180px] animate-float-delayed z-20">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <span className="text-blue-500 text-xs font-bold">↗</span>
                            </div>
                            <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[11px] text-slate-400 font-medium">Cliques Totais</span>
                            <div className="text-2xl font-black text-slate-800">2.840</div>
                        </div>
                        <div className="mt-4 flex gap-1 items-end h-8">
                            {[40, 70, 45, 90, 65, 80].map((h, i) => (
                                <div key={i} className="flex-1 bg-[#acc8a2]/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Design Selection Badge */}
                    <div className="absolute bottom-[20%] left-0 lg:-left-10 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-white/10 flex items-center gap-4 animate-float z-20">
                        <div className="grid grid-cols-2 gap-1.5">
                            <div className="w-3 h-3 bg-[#acc8a2] rounded-full"></div>
                            <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                            <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                            <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Tema</span>
                            <span className="font-bold text-sm">Glassmorphism</span>
                        </div>
                    </div>

                    {/* Floating tag refined */}
                    <div className="absolute bottom-4 right-12 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-100 shadow-xl text-slate-500 text-[11px] font-bold flex items-center gap-2 z-20">
                        <div className="w-2 h-2 bg-[#acc8a2] rounded-full animate-pulse"></div>
                        PREVIEW EM TEMPO REAL
                    </div>
                </div>
            </div>
        </div>
    );
}
