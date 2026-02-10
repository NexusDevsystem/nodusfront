import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, Star } from 'lucide-react';
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
        <div className="min-h-screen w-full flex flex-col md:flex-row font-sans bg-white selection:bg-black selection:text-[#ffdf00]">

            {/* Left Side: Login Form */}
            <div className="w-full md:w-1/2 flex flex-col p-8 md:p-12 relative border-b-2 md:border-b-0 md:border-r-2 border-black">
                {/* Header */}
                <div className="flex justify-between items-center mb-16">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 font-bold text-sm uppercase hover:text-[#97cd7a] transition-colors"
                    >
                        <div className="w-8 h-8 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
                            <ArrowLeft size={16} />
                        </div>
                        Voltar
                    </button>
                    <div className="font-black text-2xl tracking-tighter uppercase">NODUS</div>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="mb-12">
                        <h1 className="text-6xl md:text-7xl font-black uppercase leading-[0.9] mb-6">
                            Boas <br /> Vindas.
                        </h1>
                        <p className="font-medium text-lg text-black/70 border-l-4 border-[#ffdf00] pl-4">
                            Entre no seu painel e continue construindo seu império digital.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={() => login()}
                            disabled={loading}
                            className="w-full h-20 bg-white border-2 border-black flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path fill="#000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="#000" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="font-black text-xl uppercase tracking-wide group-hover:underline decoration-2 underline-offset-4">Continuar com Google</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold text-sm text-center shadow-[4px_4px_0px_0px_#ef4444]">
                                {error}
                            </div>
                        )}

                        <p className="text-xs font-bold text-center text-black/40 uppercase tracking-widest mt-8">
                            Ao continuar, você aceita nossos <a href="#" className="underline text-black hover:text-[#97cd7a]">Termos de Uso</a>.
                        </p>
                    </div>
                </div>

                <div className="mt-auto pt-8 flex justify-between items-end border-t-2 border-black/10">
                    <div className="text-xs font-bold text-black/30 uppercase">
                        V 2.0.0
                    </div>
                    <div className="text-xs font-bold text-black/30 uppercase">
                        Secure Auth
                    </div>
                </div>
            </div>

            {/* Right Side: Visual */}
            <div className="hidden md:flex w-1/2 bg-[#ffdf00] relative overflow-hidden items-center justify-center p-12">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
                </div>

                {/* Big Visual Element */}
                <div className="relative w-full max-w-lg aspect-square">
                    {/* Circle Background */}
                    <div className="absolute inset-0 bg-white rounded-full border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"></div>

                    {/* Floating Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center animate-float">
                        <img
                            src="/icons/logo sem fundo.png"
                            alt="Nodus"
                            className="w-1/2 h-1/2 object-contain"
                        />
                    </div>

                    {/* Orbiting Elements */}
                    <div className="absolute top-0 right-10 bg-black text-[#ffdf00] p-4 border-4 border-black shadow-[8px_8px_0px_0px_#fff] transform rotate-12 animate-float-delayed">
                        <Star size={32} fill="#ffdf00" />
                    </div>

                    <div className="absolute bottom-10 left-0 bg-[#97cd7a] text-black px-6 py-3 border-4 border-black shadow-[8px_8px_0px_0px_#000] transform -rotate-6 font-black uppercase text-xl animate-float">
                        Power Users
                    </div>
                </div>
            </div>

        </div>
    );
}
