import React from 'react';
import { motion } from 'framer-motion';

interface BrutalistLoaderProps {
    message?: string;
    progress?: number;
    subtext?: string;
}

export default function BrutalistLoader({
    message = 'Carregando...',
    progress = 0
}: BrutalistLoaderProps) {
    return (
        <div className="fixed inset-0 bg-[#fdfcf0] z-[9999] flex items-center justify-center p-6">
            <div className="flex flex-col items-center w-full max-w-[200px]">
                {/* Minimalist Logo */}
                <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-2xl font-black tracking-tighter text-black mb-4 italic"
                >
                    NODUS
                </motion.div>

                {/* Ultra-thin progress line */}
                <div className="w-full h-[1px] bg-black/5 relative overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                        className="h-full bg-black"
                    />
                </div>

                {/* Subtle percentage or message */}
                <div className="mt-3 flex justify-between w-full">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/30">
                        {message}
                    </span>
                    <span className="text-[9px] font-bold text-black/40 tabular-nums">
                        {progress}%
                    </span>
                </div>
            </div>
        </div>
    );
}
