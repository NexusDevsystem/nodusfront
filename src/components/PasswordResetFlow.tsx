import React, { useState } from 'react';
import { Mail, Key, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface PasswordResetFlowProps {
    onBack: () => void;
    initialEmail?: string;
}

type Step = 'email' | 'code' | 'reset' | 'success';

export default function PasswordResetFlow({ onBack, initialEmail = '' }: PasswordResetFlowProps) {
    const [step, setStep] = useState<Step>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetToken, setResetToken] = useState('');

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiClient.requestPasswordReset(email);
            setStep('code');
        } catch (err: any) {
            setError(err.message || 'Erro ao solicitar código.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await apiClient.verifyResetCode(email, code);
            setResetToken(data.resetToken);
            setStep('reset');
        } catch (err: any) {
            setError(err.message || 'Código inválido.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiClient.resetPassword(resetToken, newPassword);
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Header / Back */}
            {step !== 'success' && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 mb-6 font-bold text-[10px] uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                >
                    <ArrowLeft size={14} />
                    Voltar para Login
                </button>
            )}

            <div className="mb-8">
                <h2 className="text-3xl font-black uppercase leading-tight mb-2">
                    {step === 'email' && 'Recuperar\nAcesso.'}
                    {step === 'code' && 'Validar\nCódigo.'}
                    {step === 'reset' && 'Nova\nSenha.'}
                    {step === 'success' && 'Senha\nAlterada.'}
                </h2>
                <div className="h-1.5 w-12 bg-[#97cd7a] mb-4"></div>
                <p className="font-medium text-xs text-black/60">
                    {step === 'email' && 'Enviaremos um código de 6 dígitos para o seu e-mail cadastrado.'}
                    {step === 'code' && `Insira o código enviado para ${email}.`}
                    {step === 'reset' && 'Quase lá! Escolha sua nova senha de acesso.'}
                    {step === 'success' && 'Sua senha foi redefinida com sucesso. Agora você já pode entrar na sua conta.'}
                </p>
            </div>

            {step === 'email' && (
                <form onSubmit={handleRequestCode} className="space-y-4">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">
                            <Mail size={16} strokeWidth={3} />
                        </div>
                        <input
                            type="email"
                            placeholder="Seu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 border-2 border-[#1a1a1a] text-sm font-bold placeholder:text-black/30 focus:outline-none focus:border-[#97cd7a] focus:shadow-[4px_4px_0px_0px_rgba(151,205,122,0.5)] transition-all bg-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full py-4 bg-black text-[#97cd7a] border-2 border-[#1a1a1a] font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Enviar Código'}
                    </button>
                </form>
            )}

            {step === 'code' && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">
                            <Key size={16} strokeWidth={3} />
                        </div>
                        <input
                            type="text"
                            placeholder="Código de 6 dígitos"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full pl-11 pr-4 py-4 border-2 border-[#1a1a1a] text-2xl tracking-[0.5em] font-black placeholder:text-black/30 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-[#97cd7a] transition-all bg-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="w-full py-4 bg-black text-[#97cd7a] border-2 border-[#1a1a1a] font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verificar Código'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="w-full text-center text-[10px] uppercase font-black tracking-widest text-black/30 hover:text-black mt-2"
                    >
                        Não recebeu? Tente novamente
                    </button>
                </form>
            )}

            {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">
                            <Lock size={16} strokeWidth={3} />
                        </div>
                        <input
                            type="password"
                            placeholder="Nova senha (min. 6 chars)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 border-2 border-[#1a1a1a] text-sm font-bold placeholder:text-black/30 focus:outline-none focus:border-[#97cd7a] transition-all bg-white"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || newPassword.length < 6}
                        className="w-full py-4 bg-black text-[#97cd7a] border-2 border-[#1a1a1a] font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Redefinir Senha'}
                    </button>
                </form>
            )}

            {step === 'success' && (
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-[#97cd7a] border-4 border-[#1a1a1a] flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                            <CheckCircle2 size={40} strokeWidth={3} />
                        </div>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-full py-4 bg-black text-[#97cd7a] border-2 border-[#1a1a1a] font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                        Ir para Login
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-5 bg-white border-2 border-[#1a1a1a] text-black p-4 font-bold text-xs text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] uppercase tracking-widest">
                    {error}
                </div>
            )}
        </div>
    );
}
