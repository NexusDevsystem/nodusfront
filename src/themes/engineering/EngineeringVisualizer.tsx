
import React from 'react';
import { motion } from 'framer-motion';

interface EngineeringVisualizerProps {
    variant: 'crane-sky' | 'blueprint-motion' | 'circuit-flow' | 'industrial-gears' | 'neon-grid';
}

const EngineeringVisualizer: React.FC<EngineeringVisualizerProps> = ({ variant }) => {

    // 1. Sky Crane 🏗️
    if (variant === 'crane-sky') {
        const cloudPath = "M25 10 C 25 10, 15 10, 10 20 C 5 30, 15 40, 25 40 C 35 40, 45 30, 40 20 C 40 20, 35 10, 25 10 Z";

        return (
            <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#38bdf8] to-[#bae6fd]">
                {/* Sun */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute top-10 right-10 w-24 h-24 bg-yellow-400 rounded-full blur-xl opacity-80"
                />
                <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full opacity-90 shadow-lg" />

                {/* Animated Clouds - SVG for better shape */}
                {[
                    { top: '10%', scale: 1.5, opacity: 0.6, duration: 60, delay: 0 },
                    { top: '25%', scale: 1.0, opacity: 0.4, duration: 45, delay: 10 },
                    { top: '15%', scale: 0.8, opacity: 0.3, duration: 70, delay: 20 },
                    { top: '5%', scale: 1.2, opacity: 0.5, duration: 55, delay: -15 }
                ].map((cloud, i) => (
                    <motion.svg
                        key={i}
                        viewBox="0 0 50 50"
                        className="absolute text-white"
                        style={{
                            top: cloud.top,
                            width: 100 * cloud.scale,
                            opacity: cloud.opacity,
                            filter: 'blur(1px)' // Soft cloud edges
                        }}
                        initial={{ left: '-20%' }}
                        animate={{ left: '120%' }}
                        transition={{ duration: cloud.duration, repeat: Infinity, ease: "linear", delay: cloud.delay }}
                    >
                        <path d={cloudPath} fill="currentColor" />
                    </motion.svg>
                ))}

                {/* Detailed Tower Crane SVG Construction */}
                <div className="absolute bottom-0 right-10 w-[300px] h-[500px] pointer-events-none origin-bottom-right">
                    <svg viewBox="0 0 300 500" className="w-full h-full drop-shadow-lg">
                        <defs>
                            <pattern id="trussPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M0 20 L20 0 M0 0 L20 20" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
                                <rect width="20" height="20" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
                            </pattern>
                            <linearGradient id="craneYellow" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#eab308" /> {/* Yellow-500 */}
                                <stop offset="50%" stopColor="#facc15" /> {/* Yellow-400 (Highlight) */}
                                <stop offset="100%" stopColor="#ca8a04" /> {/* Yellow-600 (Shadow) */}
                            </linearGradient>
                        </defs>

                        {/* Mast (Vertical Tower) - Made Taller */}
                        <g transform="translate(260, 50)">
                            <rect x="0" y="0" width="30" height="450" fill="url(#craneYellow)" stroke="#a16207" strokeWidth="1" />
                            <rect x="0" y="0" width="30" height="450" fill="url(#trussPattern)" />
                        </g>

                        {/* Jib (Horizontal Arm) - Animated Group - Raised */}
                        <motion.g
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [-2, 2, -2] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            style={{ originX: '275px', originY: '60px' }} // Pivot point at connection (Raised)
                        >
                            {/* Counter Jib (Back part) */}
                            <g transform="translate(180, 50)">
                                <rect x="0" y="0" width="80" height="20" fill="#a16207" />
                                {/* Counterweights (Concrete Blocks) */}
                                <rect x="10" y="-15" width="20" height="15" fill="#525252" />
                                <rect x="35" y="-15" width="20" height="15" fill="#525252" />
                                <path d="M0 0 L80 0 L20 -40 Z" fill="none" stroke="#713f12" strokeWidth="2" /> {/* Cables to tower top */}
                            </g>

                            {/* Main Jib (Front Arm) */}
                            <g transform="translate(290, 50)">
                                <path d="M0 0 L-250 0 L-250 20 L0 20 Z" fill="url(#craneYellow)" stroke="#a16207" strokeWidth="1" transform="scale(-1, 1)" />
                                {/* Fix direction: Start at 290, go LEFT (negative X) */}
                                {/* Actually easier to draw normally from 0 to -something */}
                                <rect x="-240" y="0" width="240" height="20" fill="url(#craneYellow)" stroke="#a16207" />
                                <rect x="-240" y="0" width="240" height="20" fill="url(#trussPattern)" />

                                {/* Trolley (Carriage that moves) */}
                                <motion.g
                                    animate={{ x: [-20, -180, -20] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <rect x="-20" y="20" width="20" height="10" fill="#4b5563" />

                                    {/* Cable Down */}
                                    <motion.line
                                        x1="-10" y1="30" x2="-10" y2="120"
                                        stroke="#1f2937" strokeWidth="2"
                                        animate={{ y2: [120, 200, 120] }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                    />

                                    {/* Hook Block */}
                                    <motion.g
                                        transform="translate(-10, 0)" // Center X on cable
                                        animate={{ y: [120, 200, 120] }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <circle cx="0" cy="0" r="5" fill="#eab308" stroke="#000" />
                                        <path d="M-3 5 Q0 12 3 5" fill="none" stroke="#000" strokeWidth="2" />
                                    </motion.g>
                                </motion.g>
                            </g>

                            {/* Operator Cab */}
                            <g transform="translate(250, 30)">
                                <rect x="0" y="20" width="25" height="30" fill="#eab308" stroke="#a16207" />
                                <rect x="5" y="25" width="15" height="15" fill="#bae6fd" stroke="#7dd3fc" /> {/* Window */}
                            </g>

                            {/* Tower Top (Pointy bit) */}
                            <g transform="translate(275, 0)">
                                <polygon points="0,0 -15,50 15,50" fill="#ca8a04" />
                                {/* Cables from Top to Jibs */}
                                <line x1="0" y1="0" x2="-120" y2="50" stroke="#4b5563" strokeWidth="1.5" /> {/* To Front */}
                                <line x1="0" y1="0" x2="60" y2="50" stroke="#4b5563" strokeWidth="1.5" /> {/* To Back */}
                            </g>
                        </motion.g>
                    </svg>
                </div>
            </div>
        );
    }

    // 2. Blueprint Motion 📏
    if (variant === 'blueprint-motion') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#1e40af] (Blue-800)">
                {/* Grid */}
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Scrolling Technical Lines */}
                <motion.div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}
                    animate={{ backgroundPosition: ["0px 0px", "100px 100px"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                {/* Floating Symbols */}
                <motion.div
                    animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-white/20 rounded-full flex items-center justify-center text-white/20 font-mono text-xs"
                >
                    SECTION A-A
                </motion.div>
                <motion.div
                    animate={{ opacity: [0, 0.4, 0], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                    className="absolute bottom-1/3 right-1/4 w-40 h-20 border border-white/20 flex items-center justify-center text-white/20 font-mono text-xs"
                >
                    DETAIL VIEW
                </motion.div>
            </div>
        );
    }

    // 3. Circuit Flow 🔌
    if (variant === 'circuit-flow') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#022c22] (Emerald-950)">
                {/* PCB Traces - Static SVG Background */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80h-80z' fill='none' stroke='%234ade80' stroke-width='2'/%3E%3Ccircles cx='20' cy='20' r='2' fill='%234ade80'/%3E%3C/svg%3E")`,
                    backgroundSize: '100px 100px'
                }} />

                {/* Flowing Electrons */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-[#4ade80] rounded-full shadow-[0_0_8px_#4ade80]"
                        style={{ top: `${15 + i * 12}%`, left: '-5%' }}
                        animate={{ left: '105%' }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                    />
                ))}

                {/* Vertical Flows */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                        key={`v-${i}`}
                        className="absolute w-1.5 h-1.5 bg-[#4ade80] rounded-full shadow-[0_0_8px_#4ade80]"
                        style={{ left: `${20 + i * 18}%`, top: '-5%' }}
                        animate={{ top: '105%' }}
                        transition={{
                            duration: Math.random() * 4 + 3,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </div>
        );
    }

    // 4. Industrial Gears ⚙️
    if (variant === 'industrial-gears') {
        const Gear = ({ size, speed, clockwise, position }: any) => (
            <motion.div
                className={`absolute text-gray-700/20 ${position}`}
                style={{ fontSize: size }}
                animate={{ rotate: clockwise ? 360 : -360 }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
            >
                ⚙️
            </motion.div>
        );

        return (
            <div className="absolute inset-0 overflow-hidden bg-[#404040]">
                {/* Concrete Texture */}
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")' }} />

                <Gear size="300px" speed={20} clockwise={true} position="-top-20 -left-20" />
                <Gear size="200px" speed={15} clockwise={false} position="top-[30%] -right-10" />
                <Gear size="400px" speed={40} clockwise={true} position="-bottom-40 left-[20%]" />
            </div>
        );
    }

    // 5. Neon Grid (Structural) 🌐
    if (variant === 'neon-grid') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#0f172a] perspective-origin-center" style={{ perspective: '800px' }}>
                <motion.div
                    className="absolute inset-0 w-[200%] h-[200%] -left-[50%] -top-[50%]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        transform: 'rotateX(60deg)'
                    }}
                    animate={{ backgroundPosition: ["0px 0px", "0px 50px"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* Glowing Nodes */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
        );
    }

    return null;
};

export default EngineeringVisualizer;
