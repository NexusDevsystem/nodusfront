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
                <button
                    onClick={() => navigate('/')}
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 group"
                >
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

                {/* Right Side: System Reference (Network Visualization) */}
                <div className="hidden lg:flex flex-1 items-center justify-center relative h-full min-h-[500px]">
                    <div className="relative w-[600px] h-[600px] flex items-center justify-center">
                        {/* Central Node (Nodus) */}
                        <div className="relative z-20 w-32 h-32 bg-white rounded-full shadow-[0_0_50px_rgba(172,200,162,0.4)] flex items-center justify-center border-4 border-slate-50 animate-pulse">
                            <img
                                src="/icons/logo sem fundo.png"
                                alt="Nodus System"
                                className="w-20 h-20 object-contain"
                            />
                        </div>

                        {/* Orbiting Nodes (Socials) */}
                        {/* Node 1: Instagram */}
                        <div className="absolute top-20 right-20 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100 animate-float z-10">
                            <svg className="w-8 h-8 text-[#E1306C]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </div>

                        {/* Node 2: YouTube */}
                        <div className="absolute top-40 left-10 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100 animate-float-delayed z-10">
                            <svg className="w-6 h-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                            </svg>
                        </div>

                        {/* Node 3: LinkedIn */}
                        <div className="absolute bottom-20 left-32 w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center border border-slate-100 animate-float z-10">
                            <svg className="w-6 h-6 text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </div>

                        {/* Node 4: Website/Link */}
                        <div className="absolute bottom-40 right-10 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100 animate-float-delayed z-10">
                            <svg className="w-6 h-6 text-[#acc8a2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </div>

                        {/* Connecting Lines (SVG Overlay) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {/* Line to Instagram */}
                            <line x1="50%" y1="50%" x2="78%" y2="28%" stroke="#acc8a2" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                            {/* Line to Youtube */}
                            <line x1="50%" y1="50%" x2="25%" y2="40%" stroke="#acc8a2" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                            {/* Line to LinkedIn */}
                            <line x1="50%" y1="50%" x2="35%" y2="75%" stroke="#acc8a2" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                            {/* Line to Website */}
                            <line x1="50%" y1="50%" x2="80%" y2="70%" stroke="#acc8a2" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                        </svg>

                        {/* Decorative Rings */}
                        <div className="absolute inset-0 border border-slate-100 rounded-full scale-75 opacity-50"></div>
                        <div className="absolute inset-0 border border-[#acc8a2]/20 rounded-full scale-100 opacity-40 animate-pulse"></div>
                        <div className="absolute inset-0 border border-slate-50 rounded-full scale-125 opacity-30"></div>
                    </div>

                    {/* Floating Cards (Glassmorphism) */}
                    <div className="absolute top-10 right-10 p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 animate-float-delayed">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">+127%</div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Cliques</p>
                                <p className="text-sm font-bold text-slate-800">Crescimento</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-20 left-10 p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 animate-float">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Analytics</p>
                                <p className="text-sm font-bold text-slate-800">Tempo Real</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
