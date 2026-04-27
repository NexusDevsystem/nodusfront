import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import PasswordResetFlow from '../components/PasswordResetFlow';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../components/LanguageToggle';
import { motion } from 'framer-motion';

type AuthMode = 'login' | 'register' | 'reset';

function LoginPage() {
    const location = useLocation();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const rawError: string = location.state?.error || '';
    const [error, setError] = useState(rawError);
    const [mode, setMode] = useState<AuthMode>('login');

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signInWithProfile, signInWithEmail, registerWithEmail } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const queryMode = searchParams.get('mode') as AuthMode;
        if (queryMode && ['login', 'register', 'reset'].includes(queryMode)) {
            setMode(queryMode);
        }
    }, [location.search]);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleProfile = await res.json();
                const { error: authError } = await signInWithProfile(googleProfile, tokenResponse.access_token);
                if (authError) throw authError;
                navigate('/editor');
            } catch (err: any) {
                setError(err.message || 'Erro ao autenticar com o Google');
                setLoading(false);
            }
        },
    });

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
                const tempUsername = 'user_' + Math.random().toString(36).slice(2, 10);
                const { error: authError } = await registerWithEmail(email, password, name, tempUsername);
                if (authError) throw authError;
            }
            navigate('/editor');
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-['Outfit'] bg-[#f8f9fa] selection:bg-[#ffdf00] selection:text-black">
            {/* Header / Logo */}
            <div className="p-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tighter text-[#1a1a1a]">NODUS</span>
                </div>
                <LanguageToggle />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="max-w-[480px] w-full pt-8">
                    
                    {/* Centralized Form Content */}
                    <div className="w-full">
                        
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                                {mode === 'login' ? 'Boas-vindas!' : 'Criar conta'}
                            </h1>
                            <p className="text-gray-600 text-[15px]">
                                {mode === 'login' 
                                    ? 'Comece a gerenciar todos os seus links em minutos, não dias.' 
                                    : 'Junte-se à Nodus e crie sua página bio profissional hoje.'}
                            </p>
                        </div>

                        {/* Form Container (White Card) */}
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                            
                            {mode === 'reset' ? (
                                <PasswordResetFlow onBack={() => setMode('login')} initialEmail={email} />
                            ) : (
                                <div className="space-y-6">
                                    {/* Google Button (Brutalist) */}
                                    <button
                                        onClick={() => googleLogin()}
                                        disabled={loading}
                                        className="w-full py-3.5 bg-[#ffdf00] border-2 border-black rounded-lg flex items-center justify-center gap-3 shadow-[4px_4px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-bold text-[#1a1a1a]"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Entrar com Google
                                    </button>

                                    {/* Separator */}
                                    <div className="flex items-center gap-4 py-2">
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">ou</span>
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                    </div>

                                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                                        {mode === 'register' && (
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-500 block">Seu nome</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                                    placeholder="Como quer ser chamado?"
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-500 block">Seu email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                                placeholder="exemplo@email.com"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-medium text-gray-500 block">Sua senha</label>
                                                {mode === 'login' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setMode('reset')}
                                                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        Esqueceu a senha?
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>

                                        {error && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                                className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium text-center"
                                            >
                                                {error}
                                            </motion.div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3.5 mt-2 bg-[#ffdf00] border-2 border-black rounded-lg flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-bold text-[#1a1a1a]"
                                        >
                                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (mode === 'login' ? 'Entrar na conta' : 'Criar minha conta')}
                                        </button>
                                    </form>

                                    <div className="pt-4 text-center">
                                        <p className="text-sm text-gray-600">
                                            {mode === 'login' ? "Não tem uma conta?" : "Já tem uma conta?"}{' '}
                                            <button 
                                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                                className="font-bold text-black hover:underline"
                                            >
                                                {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer text */}
                        <div className="mt-8 text-xs text-gray-500 leading-relaxed">
                            Ao {mode === 'login' ? 'entrar' : 'se cadastrar'} você concorda com nossos{' '}
                            <a href="#" className="text-blue-600 hover:underline">Termos de Uso</a> e{' '}
                            <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>.<br/>
                            Você entrará na sua conta instantaneamente.
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(LoginPage);
