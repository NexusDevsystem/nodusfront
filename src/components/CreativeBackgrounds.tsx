import React from 'react';
import { motion } from 'framer-motion';

// 7. Retro Pixel Vibe
export const PixelBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#2d1b4e] overflow-hidden">
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />
            <div className="absolute bottom-[20%] w-full h-px bg-white/20 shadow-[0_0_20px_white]" />
            <motion.div
                animate={{ x: [0, -100] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-0 flex gap-40"
            >
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-16 h-8 bg-white/10 rounded-sm relative">
                        <div className="absolute -top-4 left-4 w-8 h-4 bg-white/10 rounded-sm" />
                    </div>
                ))}
            </motion.div>
            <div className="absolute top-[10%] right-[10%] w-24 h-24 rounded-full bg-yellow-200/20 blur-xl animate-pulse" />
        </div>
    );
};
