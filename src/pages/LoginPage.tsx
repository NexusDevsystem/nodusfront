import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signInWithProfile } = useAuth();
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                // Fetch user profile info from Google
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleProfile = await res.json();

                console.log("Received Google profile:", googleProfile.email);
                const { error: authError } = await signInWithProfile(googleProfile, tokenResponse.access_token);
                if (authError) throw authError;

                navigate('/admin');
            } catch (err: any) {
                console.error('Login error:', err);
                setError(err.message || 'Erro ao autenticar com o Google');
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('Login Failed:', error);
            setError('Falha ao conectar com o Google');
        }
    });

    return (
        <div className="min-h-screen w-full bg-white relative overflow-hidden font-sans">
            {/* Background Radial Gradient */}
            <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(circle_at_bottom_left,_#acc8a2_0%,_#ffffff_60%)] opacity-30 pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-[#1a2517] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <header className="relative z-20 flex justify-between items-center p-8 lg:px-12">
                <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="h-10 relative flex items-center justify-end min-w-[200px]">
                        <img
                            src="/icons/logo sem fundo.png"
                            alt="Nodus Logo"
                            className="absolute top-1/2 -translate-y-1/2 right-0 h-40 w-auto object-contain max-w-none"
                        />
                    </div>
                </div>
            </header>

            <main className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-24 pt-4 lg:pt-0 gap-16 lg:h-[calc(100vh-160px)]">
                {/* Left Side: Login Card */}
                <div className="w-full max-w-[500px]">
                    <div className="relative">
                        {/* Stacked Cards Effect */}
                        <div className="absolute inset-x-0 -top-4 mx-12 h-20 bg-white/40 rounded-[40px] border border-slate-100 shadow-sm"></div>
                        <div className="absolute inset-x-0 -top-2 mx-6 h-20 bg-white/70 rounded-[40px] border border-slate-100 shadow-sm"></div>

                        {/* Main Card */}
                        <div className="relative bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 p-10 lg:p-14 flex flex-col items-center lg:items-start text-center lg:text-left overflow-hidden">
                            <div className="mb-8">
                                <h1 className="text-[38px] lg:text-[48px] font-bold text-slate-800 leading-[1.1] tracking-tight">
                                    Boas vindas ao <span className="text-[#65855a]">Nodus.</span>
                                </h1>
                                <p className="text-slate-500 text-base lg:text-lg mt-4 max-w-[380px] leading-relaxed">
                                    Crie sua página personalizada e conecte seu público a todos os seus links, produtos e novidades em um único lugar.
                                </p>
                            </div>

                            <div className="w-full space-y-4">
                                <button
                                    onClick={() => login()}
                                    disabled={loading}
                                    className="w-full h-[54px] flex items-center justify-center gap-4 bg-white border border-slate-200 rounded-full hover:border-[#acc8a2] hover:bg-slate-50 transition-all font-medium text-slate-700 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin text-[#acc8a2]" size={20} />
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    fill="#4285F4"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                                />
                                                <path
                                                    fill="#EA4335"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                            <span className="text-sm">Continuar com o Google</span>
                                        </>
                                    )}
                                </button>
                                {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}
                            </div>

                            <div className="mt-8 text-slate-400 text-[11px] font-medium leading-relaxed">
                                Ao continuar, você concorda com todos os nossos <a href="#" className="underline decoration-slate-300 underline-offset-4 hover:text-[#65855a] transition-colors">termos e condições.</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Dashboard Mockups */}
                <div className="hidden lg:flex flex-1 items-center justify-end relative h-full min-h-[500px]">
                    {/* Tablet/Desktop Mockup */}
                    <div className="relative w-[85%] aspect-[16/10] bg-white rounded-3xl border-[8px] border-slate-900 shadow-2xl overflow-hidden scale-110 translate-x-12 translate-y-4">
                        {/* Mockup Dashboard Content */}
                        <div className="w-full h-full bg-[#FAFBFC] flex flex-col p-4 gap-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-slate-200 rounded-md"></div>
                                    <div className="w-20 h-4 bg-slate-200 rounded-md"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-16 h-6 bg-slate-200 rounded-md"></div>
                                    <div className="w-16 h-6 bg-[#acc8a2]/20 rounded-md"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
                                    <div className="w-12 h-3 bg-slate-100 rounded"></div>
                                    <div className="w-20 h-5 bg-[#acc8a2]/10 text-[#65855a] font-bold rounded flex items-center justify-center text-[10px]">R$ 1.250,00</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
                                    <div className="w-12 h-3 bg-slate-100 rounded"></div>
                                    <div className="w-20 h-5 bg-red-50 text-red-500 font-bold rounded flex items-center justify-center text-[10px]">R$ 540,00</div>
                                </div>
                                <div className="bg-[#1a2517] p-4 rounded-xl shadow-lg space-y-2">
                                    <div className="w-12 h-3 bg-white/20 rounded"></div>
                                    <div className="w-20 h-5 bg-white/10 text-white font-bold rounded flex items-center justify-center text-[10px]">R$ 710,00</div>
                                </div>
                            </div>
                            <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                                <div className="w-full h-full bg-gradient-to-t from-slate-50 to-transparent rounded-lg relative overflow-hidden">
                                    {/* Fake Chart Lines */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                        <path d="M0,80 Q50,40 100,70 T200,30 T300,50 T400,20" fill="none" stroke="#acc8a2" strokeWidth="3" opacity="0.3" />
                                        <path d="M0,90 Q80,60 150,85 T250,45 T350,65 T400,40" fill="none" stroke="#acc8a2" strokeWidth="2" opacity="0.2" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Mockup */}
                    <div className="absolute right-[45%] top-[20%] w-[180px] aspect-[9/19] bg-white rounded-[2rem] border-[6px] border-slate-900 shadow-[0_30px_60px_rgba(0,0,0,0.15)] z-20 overflow-hidden">
                        <div className="w-full h-full bg-slate-50 flex flex-col p-3 gap-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
                                <div className="w-12 h-2.5 bg-slate-200 rounded-full"></div>
                            </div>
                            <div className="w-full h-24 bg-white rounded-xl border border-slate-100 shadow-sm p-3 space-y-2">
                                <div className="w-10 h-2 bg-slate-100 rounded"></div>
                                <div className="w-16 h-4 bg-[#acc8a2]/20 rounded"></div>
                                <div className="w-full h-1 bg-slate-50 rounded mt-auto"></div>
                                <div className="w-2/3 h-1 bg-slate-50 rounded"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 h-8 bg-[#1a2517] rounded-lg shadow-sm"></div>
                                <div className="flex-1 h-8 bg-black rounded-lg shadow-sm"></div>
                            </div>
                            <div className="w-full flex-1 bg-white rounded-xl border border-slate-100 p-2 space-y-2">
                                <div className="w-1/2 h-2 bg-slate-100 rounded"></div>
                                <div className="w-full h-2 bg-slate-50 rounded"></div>
                                <div className="w-full h-2 bg-slate-50 rounded"></div>
                            </div>
                        </div>
                        {/* Mobile Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50px] h-[14px] bg-slate-900 rounded-b-xl"></div>
                    </div>

                    {/* Marketing Tagline */}
                    <div className="absolute bottom-[-20px] right-24 text-right max-w-[340px]">
                        <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                            Personalize seu cantinho digital
                        </h2>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                            Organize seus links, impulsione suas vendas e analise seu crescimento de forma simples e rápida.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
