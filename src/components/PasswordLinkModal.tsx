import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface PasswordLinkModalProps {
    linkId: string;
    linkTitle: string;
    onClose: () => void;
    apiBaseUrl: string;
}

export default function PasswordLinkModal({ linkId, linkTitle, onClose, apiBaseUrl }: PasswordLinkModalProps) {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus after animation
        const timer = setTimeout(() => inputRef.current?.focus(), 150);
        return () => clearTimeout(timer);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!password.trim()) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${apiBaseUrl}/api/links/${linkId}/verify-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok && data.url) {
                window.open(data.url, '_blank', 'noopener,noreferrer');
                onClose();
            } else {
                setError(data.error || t('passwordLink.wrongPassword') || 'Senha incorreta. Tente novamente.');
                setPassword('');
                inputRef.current?.focus();
            }
        } catch {
            setError(t('passwordLink.wrongPassword') || 'Erro ao verificar senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                key="overlay"
                className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    className="relative w-full sm:max-w-md mx-4 bg-white border-t-4 border-x-4 sm:border-4 border-black sm:shadow-[0_12px_0_0_#000] rounded-t-[40px] sm:rounded-[32px] overflow-hidden pointer-events-auto"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-black/5 px-6 py-6 md:px-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl shadow-[3px_3px_0_0_#97cd7a]">
                                <Lock size={18} strokeWidth={3} className="text-[#97cd7a]" />
                            </div>
                            <span className="text-[14px] font-black uppercase tracking-tighter text-black italic">
                                {t('passwordLink.modalTitle') || 'Conteúdo Exclusivo'}
                            </span>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded-md group"
                        >
                            <X size={24} strokeWidth={4} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                        <p className="text-[11px] text-black/70 uppercase tracking-widest leading-relaxed">
                            {t('passwordLink.modalSubtitle') || 'Este link está protegido. Digite a senha para acessar.'}
                        </p>

                        {linkTitle && (
                            <div className="px-3 py-2 bg-black/5 border border-[#1a1a1a]/20">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-black truncate block">{linkTitle}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    placeholder={t('passwordLink.placeholder') || 'Digite a senha...'}
                                    className="w-full border-2 border-[#1a1a1a] px-3 py-3 pr-10 text-[12px] font-medium tracking-widest text-black bg-white outline-none focus:bg-[#fffde7] transition-colors shadow-[0_2px_0_0_#1a1a1a]"
                                    autoComplete="off"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={14} strokeWidth={2.5} /> : <Eye size={14} strokeWidth={2.5} />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-[10px] font-bold uppercase tracking-widest text-red-600"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading || !password.trim()}
                                className="w-full py-3 bg-white border-2 border-[#1a1a1a] text-black shadow-[0_4px_0_0_#1a1a1a]  border-2 border-[#1a1a1a] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#97cd7a] hover:text-black transition-all shadow-[0_4px_0_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 size={14} strokeWidth={3} className="animate-spin" />
                                ) : (
                                    <Lock size={14} strokeWidth={3} />
                                )}
                                {loading ? '...' : (t('passwordLink.unlock') || 'Desbloquear')}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
