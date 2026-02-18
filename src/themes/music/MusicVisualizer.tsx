import React from 'react';
import { motion } from 'framer-motion';

interface MusicVisualizerProps {
    variant:
    | 'sinfonia-mecanica'
    | 'fita-analogica'
    | 'sopro-de-ouro'
    | 'batida-botanica'
    | 'grave-urbano'
    | 'hino-de-vitral'
    | 'jardim-zen-sonoro'
    | 'harpa-cosmica'
    | 'horizonte-neon'
    | 'orquestra-origami';
}

const MusicVisualizer: React.FC<MusicVisualizerProps> = ({ variant }) => {
    switch (variant) {
        case 'sinfonia-mecanica':
            return (
                <div className="absolute inset-0 bg-[#1a0f0a] overflow-hidden">
                    <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute border-2 border-[#b87333]/40 rounded-full"
                                style={{ width: 100 + i * 80, height: 100 + i * 80 }}
                                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                                transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#b87333] rounded-sm transform rotate-45" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#b87333] rounded-sm transform rotate-45" />
                            </motion.div>
                        ))}
                    </div>
                    {/* Clockwork center */}
                    <motion.div
                        className="absolute bottom-[-100px] right-[-100px] opacity-10 scale-150"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    >
                        <svg width="400" height="400" viewBox="0 0 100 100" fill="#b87333">
                            <path d="M50 0 L55 10 L65 10 L70 0 L80 5 L75 15 L80 25 L90 20 L95 30 L85 35 L85 45 L95 50 L90 60 L80 55 L75 65 L80 75 L70 80 L65 70 L55 70 L50 80 L40 75 L45 65 L40 55 L30 60 L25 50 L35 45 L35 35 L25 30 L30 20 L40 25 L45 15 L40 5 Z" />
                        </svg>
                    </motion.div>
                </div>
            );

        case 'fita-analogica':
            return (
                <div className="absolute inset-0 bg-[#121212] overflow-hidden flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Tape reels */}
                        <div className="absolute left-1/4 top-1/2 -translate-y-1/2">
                            <motion.div
                                className="w-64 h-64 border-8 border-neutral-800 rounded-full flex items-center justify-center opacity-30"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="w-1 h-full bg-neutral-700" />
                                <div className="w-full h-1 bg-neutral-700 absolute" />
                            </motion.div>
                        </div>
                        <div className="absolute right-1/4 top-1/2 -translate-y-1/2">
                            <motion.div
                                className="w-64 h-64 border-8 border-neutral-800 rounded-full flex items-center justify-center opacity-30"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="w-1 h-full bg-neutral-700" />
                                <div className="w-full h-1 bg-neutral-700 absolute" />
                            </motion.div>
                        </div>
                        {/* Tape line */}
                        <motion.div
                            className="absolute top-1/2 left-0 w-[200%] h-12 bg-neutral-900 border-y border-neutral-700 -translate-y-1/2 z-0 opacity-20"
                            animate={{ x: ['-50%', '0%'] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </div>
            );

        case 'sopro-de-ouro':
            return (
                <div className="absolute inset-0 bg-black overflow-hidden">
                    <div className="absolute inset-0 opacity-10 grid grid-cols-4 gap-4 p-8">
                        {[...Array(16)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="border-t border-r border-[#ffd700] rounded-tr-[50px] aspect-square"
                                animate={{
                                    opacity: [0.1, 0.4, 0.1],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{ duration: 5, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                    {/* Art Deco centerpiece */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                        <svg width="400" height="400" viewBox="0 0 100 100" className="fill-none stroke-[#ffd700] stroke-[0.5]">
                            {[...Array(10)].map((_, i) => (
                                <ellipse key={i} cx="50" cy="50" rx={10 + i * 4} ry={25 + i * 6} transform={`rotate(${36 * i} 50 50)`} />
                            ))}
                        </svg>
                    </div>
                </div>
            );

        case 'batida-botanica':
            return (
                <div className="absolute inset-0 bg-[#061c10] overflow-hidden">
                    <div className="absolute inset-0 flex justify-around items-end opacity-20">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-1 bg-[#10b981] relative origin-bottom"
                                style={{ height: '70%', transition: 'height 0.1s' }}
                                animate={{
                                    skewX: [0, 5, -5, 0],
                                    scaleY: [1, 1.1, 1]
                                }}
                                transition={{ duration: 4, repeat: Infinity, delay: i }}
                            >
                                {[...Array(15)].map((_, j) => (
                                    <motion.div
                                        key={j}
                                        className="absolute w-4 h-2 bg-[#10b981] rounded-[50%_0_50%_0]"
                                        style={{ top: `${j * 6}%`, left: j % 2 === 0 ? '-14px' : '4px' }}
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: j * 0.1 }}
                                    >
                                        <span className="absolute -top-2 left-0 text-[10px] opacity-40">♫</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ))}
                    </div>
                </div>
            );

        case 'grave-urbano':
            return (
                <div className="absolute inset-0 bg-[#1c1917] overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall-2.png')]" />
                    </div>
                    {/* Visualizer bars like a boombox EQ */}
                    <div className="absolute bottom-0 w-full h-full flex items-end justify-center px-8 pb-32 space-x-2">
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-full bg-[#f97316] opacity-30 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                                animate={{ height: ['5%', '60%', '20%', '90%', '10%'] }}
                                transition={{
                                    duration: 0.5 + Math.random(),
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.05
                                }}
                            />
                        ))}
                    </div>
                </div>
            );

        case 'hino-de-vitral':
            return (
                <div className="absolute inset-0 bg-[#0f172a] overflow-hidden">
                    <div className="absolute inset-0 opacity-30 grid grid-cols-6 grid-rows-8 gap-1 p-2">
                        {[...Array(48)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-full h-full"
                                style={{
                                    backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'][i % 4],
                                    clipPath: i % 2 === 0 ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'polygon(0% 0%, 100% 0%, 50% 100%)'
                                }}
                                animate={{ opacity: [0.1, 0.4, 0.1] }}
                                transition={{ duration: 4, repeat: Infinity, delay: i * 0.1 }}
                            >
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-white opacity-20">
                                    {['∮', '♮', '♯', '♭'][i % 4]}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {/* central ray */}
                    <motion.div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    />
                </div>
            );

        case 'jardim-zen-sonoro':
            return (
                <div className="absolute inset-0 bg-[#e7e5e4] overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <svg width="100%" height="100%">
                            {[...Array(20)].map((_, i) => (
                                <motion.path
                                    key={i}
                                    d={`M 0 ${i * 50} Q 200 ${i * 50 + 20} 400 ${i * 50} T 800 ${i * 50} T 1200 ${i * 50}`}
                                    stroke="#44403c"
                                    strokeWidth="1"
                                    fill="none"
                                    animate={{ d: [`M 0 ${i * 50} Q 200 ${i * 50 + 40} 400 ${i * 50} T 800 ${i * 50} T 1200 ${i * 50}`, `M 0 ${i * 50} Q 200 ${i * 50 - 40} 400 ${i * 50} T 800 ${i * 50} T 1200 ${i * 50}`, `M 0 ${i * 50} Q 200 ${i * 50 + 40} 400 ${i * 50} T 800 ${i * 50} T 1200 ${i * 50}`] }}
                                    transition={{ duration: 10 + i, repeat: Infinity, ease: "easeInOut" }}
                                />
                            ))}
                        </svg>
                    </div>
                </div>
            );

        case 'harpa-cosmica':
            return (
                <div className="absolute inset-0 bg-[#020617] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-[120%] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                                style={{ top: `${10 + i * 6}%`, rotate: i % 2 === 0 ? '-5deg' : '5deg' }}
                                animate={{ opacity: [0.1, 0.4, 0.1], y: [-5, 5, -5] }}
                                transition={{ duration: 4 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        ))}
                    </div>
                    {/* Pulsing stars */}
                    {[...Array(40)].map((_, i) => (
                        <motion.div
                            key={`s-${i}`}
                            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
                            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                            animate={{ scale: [1, 2, 1], opacity: [0.1, 0.5, 0.1] }}
                            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
                        />
                    ))}
                </div>
            );

        case 'horizonte-neon':
            return (
                <div className="absolute inset-0 bg-black overflow-hidden">
                    {/* Grid */}
                    <div
                        className="absolute bottom-0 w-full h-1/2 opacity-20"
                        style={{
                            backgroundImage: `linear-gradient(transparent, #f472b6 1px, transparent 1px), linear-gradient(90deg, transparent, #f472b6 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                            transform: 'perspective(500px) rotateX(60deg) scale(2)',
                            transformOrigin: 'top'
                        }}
                    />
                    {/* Sun (Disk) */}
                    <motion.div
                        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-[#f472b6] to-transparent rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(244,114,182,0.4)]"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="absolute w-full h-px bg-black/40" style={{ top: `${15 + i * 15}%` }} />
                        ))}
                    </motion.div>
                </div>
            );

        case 'orquestra-origami':
            return (
                <div className="absolute inset-0 bg-[#f5f5f4] overflow-hidden">
                    <div className="absolute inset-0 opacity-10 flex flex-wrap gap-12 p-12">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-24 h-32 border border-[#44403c] relative"
                                animate={{
                                    rotateY: [0, 60, 0],
                                    skewY: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 6, repeat: Infinity, delay: i * 0.5 }}
                            >
                                <div className="absolute inset-0 border-r border-[#44403c]/30 transform skew-x-12 origin-left" />
                                <span className="absolute bottom-2 right-2 text-xs">♭</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            );

        default:
            return <div className="absolute inset-0 bg-neutral-900" />;
    }
};

export default MusicVisualizer;
