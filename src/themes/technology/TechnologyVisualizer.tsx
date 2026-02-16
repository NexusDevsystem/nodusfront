import React from 'react';
import { motion } from 'framer-motion';

interface TechnologyVisualizerProps {
    variant:
    | 'neural-grid'
    | 'brutalist-tech'
    | 'cyberpunk-corp'
    | 'minimal-saas'
    | 'terminal-dev'
    | 'holographic-glass'
    | 'matrix-code'
    | 'ai-gradient'
    | 'dark-corp'
    | 'startup-launch';
}

const TechnologyVisualizer: React.FC<TechnologyVisualizerProps> = ({ variant }) => {

    // 1. Neural Grid (Dark, Connected Lines)
    if (variant === 'neural-grid') {
        const points = Array.from({ length: 20 });
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#0F0F1A]">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#4f4f4f 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* Connecting Lines Animation */}
                <svg className="absolute inset-0 w-full h-full opacity-30">
                    <motion.path
                        d="M0,50 Q400,200 800,50 T1600,50"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.path
                        d="M0,300 Q400,100 800,300 T1600,300"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 1 }}
                    />
                </svg>

                {/* Pulsing Nodes */}
                {points.map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-cyan-500 rounded-full blur-[2px]"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`
                        }}
                        animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
                        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                    />
                ))}
            </div>
        );
    }

    // 2. Brutalist Tech (Raw, Minimal, Bold)
    if (variant === 'brutalist-tech') {
        return (
            <div className="absolute inset-0 bg-[#f0f0f0] overflow-hidden">
                {/* Raw Grid */}
                <div className="absolute inset-0 border-l border-r border-black/10 w-full max-w-4xl mx-auto" />
                <div className="absolute inset-0"
                    style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 40px', opacity: 0.1 }}
                />

                {/* Floating Geometric Primitives */}
                <motion.div
                    className="absolute top-20 -left-10 w-40 h-40 border-4 border-black bg-transparent"
                    animate={{ rotate: 90 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute bottom-40 -right-10 w-32 h-32 bg-black"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        );
    }

    // 3. Cyberpunk Corporate (Deep Black, Purple Neon, Scanlines)
    if (variant === 'cyberpunk-corp') {
        return (
            <div className="absolute inset-0 bg-black overflow-hidden">
                {/* Purple Glow */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-purple-900/20 blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-full h-1/2 bg-blue-900/20 blur-[100px]" />

                {/* Scanlines */}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-10"
                    style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />

                {/* Floating Particles */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-purple-500 rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`
                        }}
                        animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: Math.random() * 5 + 5, repeat: Infinity }}
                    />
                ))}
            </div>
        );
    }

    // 4. Minimal SaaS (Clean, Soft Gradients)
    if (variant === 'minimal-saas') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white">
                <motion.div
                    className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-100 blur-[80px]"
                    animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-50 blur-[80px]"
                    animate={{ scale: [1, 1.2, 1], y: [0, -30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        );
    }

    // 5. Terminal Dev (Black, Monospace)
    if (variant === 'terminal-dev') {
        return (
            <div className="absolute inset-0 bg-[#0d0d0d] font-mono text-green-500/20 text-xs p-4 overflow-hidden select-none">
                {/* Static Background Code */}
                <div className="opacity-10">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i}>{`> system_check --n ${i * 1}00`}<br />{`  [OK] module_${i} loaded`}</div>
                    ))}
                </div>
                {/* Blinking Cursor Overlay */}
                <motion.div
                    className="absolute bottom-10 left-10 w-3 h-5 bg-green-500"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            </div>
        );
    }

    // 6. Holographic Glass (Vision Pro Style)
    if (variant === 'holographic-glass') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#1c1c1e]">
                {/* Aurora Background */}
                <motion.div
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-50"
                    style={{ background: 'conic-gradient(from 0deg at 50% 50%, #ff0080, #7928ca, #ff0080)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 bg-[#1c1c1e]/80 backdrop-blur-3xl" /> {/* Blur overlay */}
            </div>
        );
    }

    // 7. Matrix Code (Digital Rain)
    if (variant === 'matrix-code') {
        // Simplified Matrix Effect
        return (
            <div className="absolute inset-0 bg-black overflow-hidden font-mono text-green-500/40 text-sm leading-none">
                {Array.from({ length: 15 }).map((_, col) => (
                    <motion.div
                        key={col}
                        className="absolute top-0 text-center w-4 break-words"
                        style={{ left: `${col * 7}%` }}
                        initial={{ y: -500 }}
                        animate={{ y: 1000 }}
                        transition={{
                            duration: Math.random() * 5 + 3,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                    >
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i}>{String.fromCharCode(0x30A0 + Math.random() * 96)}</div>
                        ))}
                    </motion.div>
                ))}
            </div>
        );
    }

    // 8. AI Gradient (Vibrant Morphing)
    if (variant === 'ai-gradient') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#111]">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4ecdc4, #45b7d1)',
                        backgroundSize: '400% 400%'
                    }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Dark noise overlay for texture */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            </div>
        );
    }

    // 9. Dark Corporate Premium (Subtle, Elegant)
    if (variant === 'dark-corp') {
        return (
            <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950" />
                {/* Very subtle slow moving light */}
                <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent"
                    animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        );
    }

    // 10. Startup Launch (Light, Conversion Focused)
    if (variant === 'startup-launch') {
        return (
            <div className="absolute inset-0 bg-orange-50/50 overflow-hidden">
                {/* Confetti or upward movement symbols */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-orange-200"
                        style={{ left: `${Math.random() * 100}%`, top: '100%' }}
                        animate={{ top: '-10%', rotate: 360 }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                    >
                        {['▲', '●', '■'][i % 3]}
                    </motion.div>
                ))}
            </div>
        );
    }

    return null;
}

export default TechnologyVisualizer;
