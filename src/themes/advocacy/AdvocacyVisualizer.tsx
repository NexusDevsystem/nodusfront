import React from 'react';
import { motion } from 'framer-motion';

interface AdvocacyVisualizerProps {
    variant: 'juris-classic' | 'modern-law' | 'verdict' | 'equity' | 'justice-scale';
}

const AdvocacyVisualizer: React.FC<AdvocacyVisualizerProps> = ({ variant }) => {

    // 1. Juris Classic (Vintage Justice - Dark Brown & Antique Gold)
    if (variant === 'juris-classic') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#1a120b] flex items-center justify-center">
                {/* Deep Radial Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(44,32,24,0.4)_0%,#1a120b_80%)]" />

                {/* Subtle Paper/Leather Texture */}
                <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-leather.png")' }} />

                {/* High-Fidelity Vintage Scale Watermark */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 0.25, scale: 1, y: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute z-0 w-[90%] max-w-[500px] text-[#b48a5f] drop-shadow-[0_0_15px_rgba(180,138,95,0.2)]"
                >
                    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Central Pillar - Ornate Base */}
                        <path d="M85 145 H115 V150 Q115 155 100 155 Q85 155 85 150 Z" fill="currentColor" />
                        <path d="M92 135 H108 L110 145 H90 Z" fill="currentColor" opacity="0.8" />

                        {/* Main Column */}
                        <rect x="97" y="35" width="6" height="100" rx="1" fill="currentColor" />
                        <circle cx="100" cy="35" r="5" fill="currentColor" />
                        <circle cx="100" cy="70" r="3" fill="currentColor" opacity="0.6" />

                        {/* Ornate Crossbar */}
                        <path d="M30 45 Q100 25 170 45 L170 48 Q100 28 30 48 Z" fill="currentColor" />
                        <circle cx="30" cy="46" r="2" fill="currentColor" />
                        <circle cx="170" cy="46" r="2" fill="currentColor" />
                        <path d="M90 35 H110 V40 H90 Z" fill="currentColor" />

                        {/* Left Pan Chains */}
                        <line x1="30" y1="46" x2="10" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                        <line x1="30" y1="46" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                        <line x1="28" y1="48" x2="30" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.5" />

                        {/* Left Pan */}
                        <path d="M10 100 Q30 115 50 100 Q50 95 30 95 Q10 95 10 100 Z" fill="currentColor" opacity="0.7" />
                        <path d="M10 100 Q30 110 50 100" stroke="currentColor" strokeWidth="1" fill="none" />

                        {/* Right Pan Chains */}
                        <line x1="170" y1="46" x2="150" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                        <line x1="170" y1="46" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                        <line x1="172" y1="48" x2="170" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.5" />

                        {/* Right Pan */}
                        <path d="M150 100 Q170 115 190 100 Q190 95 170 95 Q150 95 150 100 Z" fill="currentColor" opacity="0.7" />
                        <path d="M150 100 Q170 110 190 100" stroke="currentColor" strokeWidth="1" fill="none" />

                        {/* Engraving texture/Hatching simulation */}
                        <g opacity="0.3">
                            <line x1="98" y1="50" x2="102" y2="50" stroke="black" strokeWidth="0.5" />
                            <line x1="98" y1="60" x2="102" y2="60" stroke="black" strokeWidth="0.5" />
                            <line x1="98" y1="80" x2="102" y2="80" stroke="black" strokeWidth="0.5" />
                        </g>
                    </svg>
                </motion.div>

                {/* Subtle Dust Particles */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            </div>
        );
    }

    // 2. Modern Bubble (Royal Blue Deep Sea)
    if (variant === 'modern-law') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#0f172a]">
                {/* Deep Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a] to-[#0f172a]" />

                {/* Floating Bubbles */}
                <motion.div
                    animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] left-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/30 to-transparent blur-md border border-white/10"
                />
                <motion.div
                    animate={{ y: [0, -30, 0], x: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[30%] right-[15%] w-48 h-48 rounded-full bg-gradient-to-tl from-cyan-500/20 to-transparent blur-xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-[100px]"
                />
            </div>
        );
    }

    // 3. Verdict (Deep Emerald Library)
    if (variant === 'verdict') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#022c22]">
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />

                {/* Green Glow (Library Lamp feel) */}
                <motion.div
                    animate={{ opacity: [0.5, 0.7, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-[#059669] blur-[150px] opacity-20"
                />

                {/* Grain Texture */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-felt.png")' }} />
            </div>
        );
    }

    // 4. Equity (Kept as requested)
    if (variant === 'equity') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#e7e5e4]"> {/* Warm Stone */}
                {/* Soft Light Leak */}
                <motion.div
                    animate={{
                        opacity: [0.4, 0.6, 0.4],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[50%] -left-[20%] w-[150%] h-[150%] bg-gradient-to-br from-[#d6d3d1] via-transparent to-[#a8a29e] opacity-50 blur-3xl"
                />

                {/* Texture */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />
            </div>
        );
    }

    // 5. Justice Scale (Matte Black & Red)
    if (variant === 'justice-scale') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#000000]">
                {/* Dark Noise */}
                <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-dark.png")' }} />

                {/* Red Pulse from Bottom */}
                <motion.div
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                        scaleY: [1, 1.2, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-20%] left-0 right-0 h-[50%] bg-[#991b1b] blur-[120px]"
                />
            </div>
        );
    }

    return null;
};

export default AdvocacyVisualizer;
