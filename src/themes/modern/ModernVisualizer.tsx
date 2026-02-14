
import React from 'react';
import { motion } from 'framer-motion';

interface ModernVisualizerProps {
    variant: 'minimalist' | 'cyberpunk' | 'glassmorphism' | 'pastel' | 'dark-elegant' | 'industrial' | 'retro-futurist' | 'nature' | 'high-contrast' | 'royal-gold';
}

const ModernVisualizer: React.FC<ModernVisualizerProps> = ({ variant }) => {

    // 1. Minimalist (Breathing Gradient)
    if (variant === 'minimalist') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white">
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50"
                />
            </div>
        );
    }

    // 2. Cyberpunk (Digital Scanlines)
    if (variant === 'cyberpunk') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#050505]">
                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />

                {/* Moving Glitch Line */}
                <motion.div
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-[2px] bg-cyan-500/50 shadow-[0_0_10px_cyan]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff00ff]/5 to-transparent opacity-30" />
            </div>
        );
    }

    // 3. Glassmorphism (Mesh Gradient)
    if (variant === 'glassmorphism') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-blue-400/30 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, -20, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-400/30 rounded-full blur-[100px]"
                />
            </div>
        );
    }

    // 4. Pastel Soft (Floating Shapes)
    if (variant === 'pastel') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#FDF2F8] (pink-50)">
                <motion.div
                    animate={{ y: [0, -30, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] left-[20%] w-32 h-32 bg-[#fff1f2] rounded-full blur-xl"
                />
                <motion.div
                    animate={{ y: [0, 40, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[30%] right-[20%] w-48 h-48 bg-[#f0tgff] rounded-full blur-2xl opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#ecfccb]/20 to-[#cffafe]/20 mix-blend-multiply" />
            </div>
        );
    }

    // 5. Dark Elegant (Smoke/Silk)
    if (variant === 'dark-elegant') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#121212]">
                <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black opacity-60"
                />
                {/* Subtle noise */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 mix-blend-overlay" />
            </div>
        );
    }

    // 6. Industrial (Concrete)
    if (variant === 'industrial') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#262626]">
                {/* Concrete Texture Simulation */}
                <div className="absolute inset-0 opacity-10" style={{ filter: 'contrast(150%)', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E")' }} />
                {/* Technical lines */}
                <div className="absolute top-10 left-10 w-20 h-20 border-l border-t border-white/10" />
                <div className="absolute bottom-10 right-10 w-20 h-20 border-r border-b border-white/10" />
            </div>
        );
    }

    // 7. Retro-Futurist (Synth Sun)
    if (variant === 'retro-futurist') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#240046] to-[#10002b]">
                {/* Sun */}
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-t from-[#ff9e00] to-[#ff006e] blur-md opacity-80" />
                {/* Horizon Grid */}
                <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent z-10" />
            </div>
        );
    }

    // 8. Nature Organic (Leaves)
    if (variant === 'nature') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#F1F8E9]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-5" />
                <motion.div
                    animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-20 -bottom-20 text-[#33691E]/5 text-[20rem]"
                >
                    🌿
                </motion.div>
            </div>
        );
    }

    // 9. High-Contrast (B&W Geometric)
    if (variant === 'high-contrast') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
                <div className="absolute right-0 top-0 w-1/2 h-full bg-black skew-x-12 opacity-5" />
            </div>
        );
    }

    // 10. Royal Gold (Golden Particles)
    if (variant === 'royal-gold') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#2A0A10] (Burgundy)">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [-20, -100],
                            opacity: [0, 0.6, 0]
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        className="absolute w-1 h-1 bg-[#FFD700] rounded-full shadow-[0_0_5px_#FFD700]"
                    />
                ))}
            </div>
        );
    }

    return null;
};

export default ModernVisualizer;
