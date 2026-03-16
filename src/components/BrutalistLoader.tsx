import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface BrutalistLoaderProps {
    message?: string;
    progress?: number;
    subtext?: string;
}

export default function BrutalistLoader({
    message = 'Carregando...',
    progress = 75,
    subtext = 'NODUS v2.4 • ENGINE LOAD'
}: BrutalistLoaderProps) {
    return (
        <div className="fixed inset-0 bg-[#f0f0f0] z-[9999] flex items-center justify-center p-6">
            <div className="bg-white border-2 border-[#1a1a1a] p-10 shadow-[0_4px_0_0_#1a1a1a] w-full max-w-sm relative overflow-hidden">
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-black flex items-center justify-center rotate-45 translate-x-6 -translate-y-6">
                    <Plus size={16} className="text-white -rotate-45" />
                </div>

                <div className="flex flex-col items-center">
                    {/* Brutalist Logo */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="px-4 py-2 bg-black text-white text-3xl font-medium uppercase tracking-tighter transform -rotate-1 shadow-[0_4px_0_0_#97cd7a]">
                            Nodus
                        </div>
                        <div className="h-1.5 w-12 bg-black mt-3"></div>
                    </div>

                    {/* Status Label */}
                    <div className="w-full mb-2 flex justify-between items-end">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-black">
                            {message}
                        </span>
                        {progress !== undefined && (
                            <span className="text-[12px] font-medium tabular-nums">{progress}%</span>
                        )}
                    </div>

                    {/* Brutalist Progress Bar Container */}
                    <div className="w-full h-8 border-2 border-[#1a1a1a] bg-white relative overflow-hidden shadow-[0_3px_0_0_#1a1a1a]">
                        {/* Progress Fill */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-[#97cd7a] border-r-2 border-[#1a1a1a]"
                        />

                        {/* Texture Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '4px 4px' }}>
                        </div>
                    </div>

                    {/* Decorative Footer Text */}
                    <p className="mt-8 text-[8px] font-medium text-black/30 uppercase tracking-[0.4em] text-center w-full border-t border-[#1a1a1a]/10 pt-4">
                        {subtext}
                    </p>
                </div>
            </div>

            {/* Background Floating Elements */}
            <div className="absolute top-10 left-10 w-24 h-24 border-2 border-[#1a1a1a]/5 rounded-full animate-ping opacity-20"></div>
            <div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-[#1a1a1a]/5 rotate-12 opacity-10"></div>
        </div>
    );
}
