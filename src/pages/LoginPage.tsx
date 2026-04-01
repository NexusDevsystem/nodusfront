import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, Star, Eye, EyeOff, Mail, Lock, User, AtSign, Check, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import PasswordResetFlow from '../components/PasswordResetFlow';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../components/LanguageToggle';
import { apiClient } from '../services/apiClient';

type AuthMode = 'login' | 'register' | 'reset';

function LoginPage() {
    const location = useLocation();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const rawError: string = location.state?.error || '';
    const TOKEN_ERRORS = ['no authorization token', 'token', 'unauthorized', 'jwt', 'bearer'];
    const isTokenError = TOKEN_ERRORS.some(k => rawError.toLowerCase().includes(k));
    const [error, setError] = useState(isTokenError ? '' : rawError);
    const [mode, setMode] = useState<AuthMode>('login');
    const [showPassword, setShowPassword] = useState(false);

    // Sync mode with query params
    React.useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const queryMode = searchParams.get('mode') as AuthMode;
        if (queryMode && ['login', 'register', 'reset'].includes(queryMode)) {
            setMode(queryMode);
        }
    }, [location.search]);

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const { signInWithProfile, signInWithEmail, registerWithEmail } = useAuth();
    const navigate = useNavigate();


    // Google login
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleProfile = await res.json();
                const { error: authError } = await signInWithProfile(googleProfile, tokenResponse.access_token);
                if (authError) throw authError;
                navigate('/admin');
            } catch (err: any) {
                setError(err.message || 'Erro ao autenticar com o Google');
                setLoading(false);
            }
        },
        onError: () => {
            setError(t('login.googleFail'));
        }
    });

    // Email/Password submit
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const { error: authError } = await signInWithEmail(email, password);
                if (authError) throw authError;
            } else {
                if (!name.trim()) {
                    setError(t('login.nameRequired'));
                    setLoading(false);
                    return;
                }
                // Generate a temporary username — the real one is set during onboarding
                const tempUsername = 'user_' + Math.random().toString(36).slice(2, 10);
                const { error: authError } = await registerWithEmail(email, password, name, tempUsername);
                if (authError) throw authError;
            }
            navigate('/admin');
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
            setLoading(false);
        }
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setError('');
        setEmail('');
        setPassword('');
        setName('');
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row font-sans bg-white selection:bg-black selection:text-[#97cd7a]">

            {/* Left Side: Login Form */}
            <div className="w-full md:w-1/2 flex flex-col p-8 md:p-12 relative border-b-2 md:border-b-0 md:border-r-2 border-[#1a1a1a] flex-1">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 font-bold text-sm uppercase hover:text-[#97cd7a] transition-colors"
                    >
                        <div className="w-8 h-8 border-2 border-[#1a1a1a] flex items-center justify-center bg-white shadow-[0_2px_0_0_#1a1a1a] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
                            <ArrowLeft size={16} />
                        </div>
                        {t('login.back')}
                    </button>
                    <div className="flex items-center gap-3">
                        <LanguageToggle />
                        <div className="font-black text-2xl tracking-tighter uppercase">NODUS</div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="text-5xl md:text-6xl font-black uppercase leading-[0.9] mb-4" style={{ whiteSpace: 'pre-line' }}>
                            {mode === 'login' ? t('login.welcome') : t('login.createAccount')}
                        </h1>
                        <p className="font-medium text-sm text-black/60 border-l-4 border-[#97cd7a] pl-3">
                            {mode === 'login'
                                ? t('login.subtitleLogin')
                                : mode === 'register'
                                    ? t('login.subtitleRegister')
                                    : t('login.subtitleReset')}
                        </p>
                    </div>

                    {mode === 'reset' ? (
                        <PasswordResetFlow
                            onBack={() => setMode('login')}
                            initialEmail={email}
                        />
                    ) : (
                        <>
                            {/* Mode Toggle */}
                            <div className="flex border-2 border-[#1a1a1a] shadow-[0_6px_0_0_rgba(26,26,26,1)] mb-8 rounded-md overflow-hidden">
                                <button
                                    onClick={() => switchMode('login')}
                                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-[#ffdf00] text-black' : 'bg-white text-black hover:bg-[#ffdf00]/5'}`}
                                >
                                    {t('login.signIn')}
                                </button>
                                <button
                                    onClick={() => switchMode('register')}
                                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest border-l-2 border-[#1a1a1a] transition-all ${mode === 'register' ? 'bg-[#ffdf00] text-black' : 'bg-white text-black hover:bg-[#ffdf00]/5'}`}
                                >
                                    {t('login.register')}
                                </button>
                            </div>

                            {/* Email/Password Form */}
                            <form onSubmit={handleEmailSubmit} className="space-y-4 mb-3">
                                {mode === 'register' && (
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">
                                            <User size={16} strokeWidth={3} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={t('login.namePlaceholder')}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-4 border-2 border-[#1a1a1a] text-sm font-bold placeholder:text-black/30 focus:outline-none focus:border-[#97cd7a] focus:shadow-[0_4px_0_0_rgba(151,205,122,0.5)] transition-all bg-white rounded-md"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">
                                        <Mail size={16} strokeWidth={3} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder={t('login.emailPlaceholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 border-2 border-[#1a1a1a] text-sm font-bold placeholder:text-black/30 focus:outline-none focus:border-[#97cd7a] focus:shadow-[0_4px_0_0_rgba(151,205,122,0.5)] transition-all bg-white rounded-md"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">
                                        <Lock size={16} strokeWidth={3} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={mode === 'register' ? t('login.passwordMinPlaceholder') : t('login.passwordPlaceholder')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-4 border-2 border-[#1a1a1a] text-sm font-bold placeholder:text-black/30 focus:outline-none focus:border-[#97cd7a] focus:shadow-[0_4px_0_0_rgba(151,205,122,0.5)] transition-all bg-white rounded-md"
                                        required
                                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} strokeWidth={3} /> : <Eye size={16} strokeWidth={3} />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[#ffdf00] text-black border-2 border-[#1a1a1a] font-black text-sm uppercase tracking-widest shadow-[0_6px_0_0_#1a1a1a] rounded-md hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#1a1a1a] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : (mode === 'login' ? t('login.enterAccount') : t('login.createMyAccount'))}
                                </button>
                            </form>

                            {mode === 'login' && (
                                <div className="mb-6 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setMode('reset')}
                                        className="text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors"
                                    >
                                        {t('login.forgotPassword')}
                                    </button>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="relative flex items-center gap-4 mb-6">
                                <div className="flex-1 h-[2px] bg-black/10"></div>
                                <span className="text-[10px] font-black text-black/30 uppercase tracking-widest shrink-0">{t('login.orContinueWith')}</span>
                                <div className="flex-1 h-[2px] bg-black/10"></div>
                            </div>

                            {/* Google Button */}
                            <button
                                onClick={() => googleLogin()}
                                disabled={loading}
                                className="w-full h-14 bg-white border-2 border-[#1a1a1a] flex items-center justify-center gap-3 shadow-[0_6px_0_0_rgba(26,26,26,1)] rounded-md hover:translate-y-[2px] hover:shadow-[0_4px_0_0_rgba(26,26,26,1)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#000" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="font-black text-sm uppercase tracking-widest">Google</span>
                            </button>
                        </>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-5 bg-white border-2 border-[#1a1a1a] text-black p-4 font-bold text-xs text-center shadow-[0_6px_0_0_rgba(26,26,26,1)] rounded-md uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    <p className="text-[10px] font-bold text-center text-black/30 uppercase tracking-widest mt-6">
                        {t('login.termsNotice')} <a href="#" className="underline text-black hover:text-[#97cd7a]">{t('login.termsLink')}</a>.
                    </p>
                </div>

            </div>

            {/* Right Side: Visual */}
            <div className="hidden md:flex w-1/2 bg-[#97cd7a] relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
                </div>

                <div className="relative w-full max-w-lg aspect-square">
                    <div className="absolute inset-0 bg-white rounded-full border-4 border-[#1a1a1a] shadow-[0_20px_0_0_#1a1a1a]"></div>

                    <div className="absolute inset-0 flex items-center justify-center animate-float overflow-hidden rounded-full">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-[92%] h-[92%] object-contain"
                        >
                            <source src="/icons/Anime_mascot_fixed_white_background_delpmaspu_.mp4" type="video/mp4" />
                        </video>
                    </div>

                    <div className="absolute top-0 right-10 bg-[#ffdf00] text-black p-4 border-4 border-[#1a1a1a] shadow-[0_8px_0_0_#fff] transform rotate-12 animate-float-delayed">
                        <Star size={32} fill="currentColor" />
                    </div>

                    <div className="absolute bottom-10 left-0 bg-[#97cd7a] text-black px-6 py-3 border-4 border-[#1a1a1a] shadow-[0_8px_0_0_#fff] transform -rotate-6 font-black uppercase text-xl animate-float">
                        {mode === 'login' ? t('login.welcomeLabel') : t('login.joinLabel')}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default React.memo(LoginPage);
