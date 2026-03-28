import React, { useEffect } from 'react';
import { PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess: React.FC = () => {
    useEffect(() => {
        // Tenta fechar a aba após 3 segundos
        const timer = setTimeout(() => {
            try {
                window.close();
            } catch (e) {
                console.error("Não foi possível fechar a aba automaticamente:", e);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center select-none font-['Inter',system-ui,sans-serif]">
            <div className="relative mb-8">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="w-24 h-24 bg-[#ffdf00] border-4 border-black shadow-[0_6px_0_0_#000] flex items-center justify-center"
                >
                    <PartyPopper size={48} className="text-black" strokeWidth={2.5} />
                </motion.div>
                <div className="absolute -top-4 -right-4 w-4 h-4 bg-red-500 border-2 border-black rotate-12" />
                <div className="absolute -bottom-2 -left-3 w-3 h-3 bg-blue-500 border-2 border-black -rotate-12" />
            </div>

            <h1 className="text-4xl font-black text-black uppercase tracking-tighter mb-4 leading-none">
                PAGAMENTO CONFIRMADO!
            </h1>
            
            <p className="text-xs font-black uppercase tracking-[0.2em] bg-black text-[#97cd7a] px-4 py-2 inline-block mb-10 shadow-[0_4px_0_0_#97cd7a]">
                SUA CONTA FOI UPGRADADA
            </p>

            <div className="max-w-xs mx-auto">
                <p className="text-sm font-bold text-gray-500 mb-8 leading-relaxed">
                    Você já pode fechar esta aba e voltar para o Nodus Studio. Sua experiência Pro já começou!
                </p>

                <button 
                    onClick={() => window.close()}
                    className="group relative px-8 py-3 bg-[#1a1a1a] border-2 border-[#1a1a1a] font-black text-[11px] text-white uppercase tracking-widest transition-all hover:-translate-y-1 active:translate-y-0"
                >
                    FECHAR ABA AGORA
                    <div className="absolute inset-0 bg-[#97cd7a] translate-y-1 translate-x-1 -z-10 group-hover:translate-y-2 group-hover:translate-x-2 transition-transform" />
                </button>
                
                <p className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                    Fechando automaticamente em 3 segundos...
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
