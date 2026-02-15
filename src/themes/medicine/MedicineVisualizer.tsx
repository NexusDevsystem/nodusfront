
import React from 'react';
import { motion } from 'framer-motion';

interface MedicineVisualizerProps {
    variant: 'clinical-clean' | 'cardio-pulse' | 'bio-lab' | 'neuro-mind' | 'radiology-dark';
}

const MedicineVisualizer: React.FC<MedicineVisualizerProps> = ({ variant }) => {

    // 1. Clinical Clean (DNA Twist - High Definition) 🧬
    if (variant === 'clinical-clean') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-white via-cyan-50 to-blue-50">
                {/* Microscopic Grid */}
                <div className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: 'radial-gradient(#bae6fd 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {/* Main DNA Helix - SVG Representation */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40 mix-blend-multiply">
                    <svg viewBox="0 0 200 600" className="h-[120%] w-auto" preserveAspectRatio="xMidYMid slice">
                        {/* Back Strand */}
                        <motion.path
                            d="M60,0 Q140,150 60,300 Q-20,450 60,600"
                            fill="none" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round" opacity="0.4"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "easeInOut" }}
                        />
                        {/* Front Strand */}
                        <motion.path
                            d="M140,0 Q60,150 140,300 Q220,450 140,600"
                            fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" opacity="0.6"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
                        />

                        {/* Connecting Base Pairs - Dynamic */}
                        {Array.from({ length: 15 }).map((_, i) => (
                            <motion.line
                                key={i}
                                x1="60" y1={40 * i + 20} x2="140" y2={40 * i + 20}
                                stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4"
                                animate={{ opacity: [0.2, 0.8, 0.2] }}
                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </svg>
                </div>

                {/* Floating Medical Crosses */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-blue-200 opacity-40 text-4xl font-bold"
                        style={{ left: `${Math.random() * 80 + 10}%`, top: `${Math.random() * 80 + 10}%` }}
                        animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        +
                    </motion.div>
                ))}
            </div>
        );
    }

    // 2. Cardio Pulse (EKG - Realistic Monitor) ❤️
    if (variant === 'cardio-pulse') {
        const pathData = "M0,50 L20,50 L25,40 L30,50 L40,50 L45,60 L50,10 L55,80 L60,50 L70,50 L80,45 L90,50 L100,50";
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#fff0f3] (Rose-50)">
                {/* Monitor Grid */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(#fb7185 1px, transparent 1px), linear-gradient(90deg, #fb7185 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Main EKG Trace - Repeating SVG */}
                <div className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 flex">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="flex-shrink-0 w-screen h-full"
                            initial={{ x: 0 }}
                            animate={{ x: '-100%' }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                                <path d={pathData} fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                            </svg>
                        </motion.div>
                    ))}
                </div>

                {/* Heart Glow Background */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vh] h-[30vh] bg-rose-500/10 rounded-full blur-[80px]"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        );
    }

    // 3. Bio Lab (Hexagonal Lattice - Chemical Structure) 🧪
    if (variant === 'bio-lab') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#115e59] (Teal-800)">
                {/* Background wash */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#042f2e] to-[#134e4a] opacity-90" />

                {/* Floating Molecule Structures - SVG Group */}
                <motion.svg
                    viewBox="0 0 800 800"
                    className="absolute inset-0 w-full h-full opacity-30 text-[#5eead4]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                >
                    {/* Central Hexagon Group */}
                    <g transform="translate(400, 400)">
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <g key={i} transform={`rotate(${angle}) translate(100, 0)`}>
                                <path d="M-30,-52 L30,-52 L60,0 L30,52 L-30,52 L-60,0 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                                <circle cx="0" cy="0" r="10" fill="currentColor" opacity="0.5" />
                                <line x1="60" y1="0" x2="100" y2="0" stroke="currentColor" strokeWidth="2" />
                            </g>
                        ))}
                        <path d="M-30,-52 L30,-52 L60,0 L30,52 L-30,52 L-60,0 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                    </g>
                </motion.svg>

                {/* Bubbles / Particles */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-4 h-4 bg-[#ccfbf1] rounded-full blur-sm opacity-40 shadow-[0_0_10px_#ccfbf1]"
                        style={{ left: `${Math.random() * 100}%`, bottom: '-10%' }}
                        animate={{ bottom: '110%', opacity: [0, 0.5, 0] }}
                        transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: i * 2 }}
                    />
                ))}
            </div>
        );
    }

    // 4. Neuro Mind (Neural Network Constellation) 🧠
    if (variant === 'neuro-mind') {
        const nodes = Array.from({ length: 12 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100
        }));

        return (
            <div className="absolute inset-0 overflow-hidden bg-[#1e1b4b] (Indigo-950)">
                {/* Synaptic Web SVG */}
                <svg className="absolute inset-0 w-full h-full">
                    {nodes.map((node, i) => (
                        nodes.map((target, j) => {
                            if (i >= j) return null; // Avoid duplicates
                            const dist = Math.hypot(node.x - target.x, node.y - target.y);
                            if (dist > 40) return null; // Only connect close nodes

                            return (
                                <motion.line
                                    key={`${i}-${j}`}
                                    x1={`${node.x}%`} y1={`${node.y}%`}
                                    x2={`${target.x}%`} y2={`${target.y}%`}
                                    stroke="#8b5cf6"
                                    strokeWidth="1"
                                    opacity="0.3"
                                    initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
                                    animate={{ strokeDashoffset: ["100", "0", "-100"] }}
                                    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: "linear" }}
                                />
                            );
                        })
                    ))}
                    {nodes.map((node, i) => (
                        <g key={i}>
                            <circle cx={`${node.x}%`} cy={`${node.y}%`} r="3" fill="#a78bfa" opacity="0.8" />
                            <motion.circle
                                cx={`${node.x}%`} cy={`${node.y}%`} r="3"
                                stroke="#c4b5fd" strokeWidth="1" fill="none"
                                animate={{ r: [3, 15], opacity: [0.8, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                            />
                        </g>
                    ))}
                </svg>

                {/* Background Nebula */}
                <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-transparent via-violet-900 to-transparent mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
            </div>
        );
    }

    // 5. Radiology Dark (Skeletal Scan) 🦴
    if (variant === 'radiology-dark') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
                {/* Skeletal Hint SVG - Abstract Ribcage/Spine */}
                <svg viewBox="0 0 200 400" className="h-[90%] w-auto opacity-30" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id="boneGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0" />
                            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Spine */}
                    <path d="M100,20 L100,380" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                    {/* Ribs */}
                    {Array.from({ length: 10 }).map((_, i) => (
                        <g key={i} transform={`translate(0, ${60 + i * 25})`}>
                            <path d="M100,0 Q150,-10 180,20" fill="none" stroke="#475569" strokeWidth="3" opacity="0.6" />
                            <path d="M100,0 Q50,-10 20,20" fill="none" stroke="#475569" strokeWidth="3" opacity="0.6" />
                        </g>
                    ))}

                    {/* Pelvis Hint */}
                    <path d="M50,320 Q100,380 150,320" fill="none" stroke="#475569" strokeWidth="4" opacity="0.5" />
                </svg>

                {/* Scanning Beam */}
                <motion.div
                    className="absolute w-full h-[5px] bg-blue-500 shadow-[0_0_20px_#3b82f6]"
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Data Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10 mix-blend-overlay" />

                <div className="absolute top-4 left-4 font-mono text-xs text-blue-500 opacity-80">
                    STATUS: ACQUIRING<br />
                    RES: 512x512
                </div>
            </div>
        );
    }

    return null;
};

export default MedicineVisualizer;
