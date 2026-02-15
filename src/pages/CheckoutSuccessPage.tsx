import React, { useEffect } from 'react';
import { PartyPopper, CheckCircle2, X } from 'lucide-react';

export default function CheckoutSuccessPage() {
    useEffect(() => {
        // 1. Notify the opener window to refresh
        if (window.opener) {
            window.opener.postMessage('stripe-payment-success', '*');
        }

        // 2. Auto-close after a few seconds
        const timer = setTimeout(() => {
            window.close();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        window.close();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-emerald-500/10 p-10 text-center animate-scale-in border border-emerald-50 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>

                <div className="relative z-10">
                    <div className="w-24 h-24 bg-emerald-50 text-[#32a800] rounded-[32px] flex items-center justify-center mb-8 mx-auto shadow-xl shadow-emerald-500/10 rotate-3">
                        <PartyPopper size={48} />
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                        Pagamento Concluído!
                    </h1>

                    <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">
                        Sua assinatura foi processada com sucesso. Você já pode aproveitar todos os recursos Pro.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="bg-emerald-50 text-[#32a800] px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3">
                            <CheckCircle2 size={20} />
                            Janela fechando em instantes...
                        </div>

                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-600 font-bold text-sm uppercase tracking-widest transition-colors py-2"
                        >
                            Fechar Agora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
