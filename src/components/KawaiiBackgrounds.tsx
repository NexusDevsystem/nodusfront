import React from 'react';
import { motion } from 'framer-motion';

// --- COMPONENTS ---

// 1. Sweet Clouds
export const KawaiiCloudsBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#ffedfa] overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        x: [i % 2 === 0 ? -100 : 400, i % 2 === 0 ? 400 : -100],
                        y: [Math.random() * 800, Math.random() * 800]
                    }}
                    transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                    className="absolute opacity-60"
                >
                    <svg width="120" height="80" viewBox="0 0 120 80">
                        <path d="M30 40a20 20 0 0140 0 20 20 0 0140 0 20 20 0 01-20 20H30a20 20 0 010-40z" fill="white" />
                        <circle cx="50" cy="45" r="2" fill="#ffb7e1" />
                        <circle cx="70" cy="45" r="2" fill="#ffb7e1" />
                        <path d="M55 52q5 4 10 0" stroke="#ffb7e1" fill="none" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </motion.div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
    );
};

// 2. Happy Stars
export const KawaiiStarsBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#f3e8ff] overflow-hidden">
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.8, 0.3],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`
                    }}
                    className="absolute"
                >
                    <svg width="30" height="30" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fde047" />
                        <circle cx="10" cy="11" r="1" fill="#8b5cf6" />
                        <circle cx="14" cy="11" r="1" fill="#8b5cf6" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

// 3. Cute Garden
export const KawaiiGardenBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#f0fdf4] overflow-hidden">
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }}
                    transition={{ duration: 4 + Math.random() * 2, repeat: Infinity }}
                    style={{
                        bottom: `${Math.random() * 30}%`,
                        left: `${Math.random() * 100}%`
                    }}
                    className="absolute"
                >
                    <svg width="60" height="60" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="10" fill="#facc15" />
                        {[0, 60, 120, 180, 240, 300].map(deg => (
                            <circle key={deg} cx={30 + Math.cos(deg * Math.PI / 180) * 15} cy={30 + Math.sin(deg * Math.PI / 180) * 15} r="8" fill="#f472b6" />
                        ))}
                        <circle cx="26" cy="28" r="1.5" fill="#3f6212" />
                        <circle cx="34" cy="28" r="1.5" fill="#3f6212" />
                        <path d="M27 34q3 3 6 0" stroke="#3f6212" fill="none" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

// 4. Peach Dream
export const KawaiiPeachBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#fff1f2] overflow-hidden">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        rotate: [0, 360],
                        y: [0, Math.random() * 800 - 400]
                    }}
                    transition={{ duration: 25 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`
                    }}
                    className="absolute opacity-40"
                >
                    <svg width="50" height="50" viewBox="0 0 50 50">
                        <path d="M25 45c-10 0-18-8-18-18s8-18 18-18 18 8 18 18-8 18-18 18z" fill="#fda4af" />
                        <path d="M25 10c0-5 5-5 5 0s-5 5-5 0" fill="#4ade80" />
                        <circle cx="18" cy="25" r="2" fill="#be123c" />
                        <circle cx="32" cy="25" r="2" fill="#be123c" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

// 5. Milk & Honey
export const KawaiiMilkBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#fffbeb] overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ y: [Math.random() * 900, -100] }}
                    transition={{ duration: 15 + Math.random() * 5, repeat: Infinity, ease: "linear" }}
                    style={{ left: `${Math.random() * 100}%` }}
                    className="absolute"
                >
                    <svg width="40" height="60" viewBox="0 0 40 60">
                        <rect x="5" y="15" width="30" height="40" rx="5" fill="white" />
                        <path d="M5 25h30v10H5z" fill="#fef3c7" />
                        <circle cx="15" cy="40" r="1.5" fill="#d97706" />
                        <circle cx="25" cy="40" r="1.5" fill="#d97706" />
                        <path d="M18 45q2 2 4 0" stroke="#d97706" fill="none" strokeWidth="1" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

// 6. Pastel Rainbow
export const KawaiiRainbowBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#f0f9ff] overflow-hidden">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 0.6, 0.3], x: [-20, 20, -20] }}
                    transition={{ duration: 5 + i, repeat: Infinity }}
                    style={{
                        top: `${20 * i}%`,
                        left: `${Math.random() * 60}%`
                    }}
                    className="absolute"
                >
                    <svg width="150" height="80" viewBox="0 0 150 80">
                        <path d="M10 70 A 60 60 0 0 1 130 70" fill="none" stroke="#fecaca" strokeWidth="8" strokeLinecap="round" />
                        <path d="M20 70 A 50 50 0 0 1 120 70" fill="none" stroke="#fef08a" strokeWidth="8" strokeLinecap="round" />
                        <path d="M30 70 A 40 40 0 0 1 110 70" fill="none" stroke="#bbf7d0" strokeWidth="8" strokeLinecap="round" />
                        <path d="M40 70 A 30 30 0 0 1 100 70" fill="none" stroke="#bae6fd" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

// 7. Bouncy Jelly
export const KawaiiJellyBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#ecfeff] overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        scaleY: [1, 0.8, 1.2, 1],
                        y: [0, -100, 0]
                    }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        bottom: '0',
                        left: `${15 * i + 5}%`
                    }}
                    className="absolute origin-bottom"
                >
                    <div
                        className="w-16 h-20 rounded-t-full shadow-lg"
                        style={{ backgroundColor: ['#22d3ee', '#818cf8', '#f472b6'][i % 3] }}
                    >
                        <div className="flex justify-center pt-6 gap-2">
                            <div className="w-2 h-2 bg-white rounded-full" />
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// 8. Kawaii Bakery
export const KawaiiBakeryBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#fff7ed] overflow-hidden">
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`
                    }}
                    className="absolute opacity-30"
                >
                    <svg width="50" height="50" viewBox="0 0 50 50">
                        <rect x="10" y="15" width="30" height="30" rx="4" fill="#fdba74" />
                        <path d="M10 15h30v5H10z" fill="#9a3412" />
                        <circle cx="18" cy="28" r="1.5" fill="#431407" />
                        <circle cx="32" cy="28" r="1.5" fill="#431407" />
                        <path d="M22 35q3 2 6 0" stroke="#431407" fill="none" strokeWidth="1" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

// 9. Astro Hamster
export const KawaiiSpaceBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#0f172a] overflow-hidden">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        rotate: [0, 360],
                        scale: [0.8, 1, 0.8],
                        x: [Math.random() * 400, Math.random() * -400]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`
                    }}
                    className="absolute"
                >
                    <svg width="60" height="60" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="25" fill="white" opacity="0.2" />
                        <ellipse cx="30" cy="35" rx="15" ry="12" fill="#d6d3d1" />
                        <circle cx="22" cy="25" r="5" fill="#d6d3d1" />
                        <circle cx="38" cy="25" r="5" fill="#d6d3d1" />
                        <circle cx="25" cy="35" r="1.5" fill="black" />
                        <circle cx="35" cy="35" r="1.5" fill="black" />
                        <path d="M28 38q2 2 4 0" stroke="black" fill="none" strokeWidth="1" />
                    </svg>
                </motion.div>
            ))}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
        </div>
    );
};

// 10. Matcha Relax
export const KawaiiMatchaBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#f0fdf4] overflow-hidden">
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 w-full h-[60%] bg-[#86efac]/30 rounded-t-[100px]"
            />
            <motion.div
                animate={{ y: [0, 30, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-0 w-full h-[40%] bg-[#4ade80]/20 rounded-t-[150px]"
            />
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ y: [900, -100], x: [0, 20, -20, 0] }}
                    transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
                    style={{ left: `${Math.random() * 100}%` }}
                    className="absolute"
                >
                    <circle cx="10" cy="10" r="5" fill="#22c55e" opacity="0.3" />
                </motion.div>
            ))}
        </div>
    );
};
// 11. Sakura Dreams
export const KawaiiSakuraBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-[#fff5f7] overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => {
                // Random deterministic-ish values
                const startX = Math.random() * 120 - 10; // -10 to 110
                const startY = Math.random() * 120 - 10;
                const duration = 15 + Math.random() * 20;

                return (
                    <motion.div
                        key={i}
                        initial={{
                            left: `${startX}%`,
                            top: `${startY}%`,
                            rotate: Math.random() * 360,
                            scale: 0.3 + Math.random() * 0.6,
                            opacity: 0
                        }}
                        animate={{
                            left: [`${startX}%`, `${startX + 100}%`],
                            top: [`${startY}%`, `${startY + 50}%`],
                            rotate: [0, 180, 360, 540, 720],
                            opacity: [0, 0.8, 0.8, 0]
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * -0.8 // Distribute them in time
                        }}
                        className="absolute"
                    >
                        <svg width="18" height="24" viewBox="0 0 20 28" fill="none">
                            <path
                                d="M10 2C10 2 2 8 2 16C2 24 10 26 10 26C10 26 18 24 18 16C18 8 10 2 10 2Z"
                                fill={i % 3 === 0 ? "#ffb7c5" : i % 3 === 1 ? "#fcc2d7" : "#ffc9d7"}
                            />
                            <path
                                d="M10 2C10 2 14 8 14 12"
                                stroke="white"
                                strokeWidth="0.5"
                                strokeLinecap="round"
                                opacity="0.4"
                            />
                        </svg>
                    </motion.div>
                );
            })}
            <div className="absolute inset-0 bg-gradient-to-r from-[#ffb7c5]/5 to-transparent pointer-events-none" />
        </div>
    );
};

// 12. Sakura Foreground (Overlay petals)
export const KawaiiSakuraForeground: React.FC = () => {
    return (
        <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => {
                const startX = Math.random() * 120 - 10;
                const startY = Math.random() * 120 - 10;
                const duration = 10 + Math.random() * 15;

                return (
                    <motion.div
                        key={i}
                        initial={{
                            left: `${startX}%`,
                            top: `${startY}%`,
                            rotate: Math.random() * 360,
                            scale: 0.6 + Math.random() * 0.4, // Slightly larger
                            opacity: 0
                        }}
                        animate={{
                            left: [`${startX}%`, `${startX + 100}%`],
                            top: [`${startY}%`, `${startY + 50}%`],
                            rotate: [0, 360, 720],
                            opacity: [0, 0.9, 0.9, 0]
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * -1.5
                        }}
                        className="absolute"
                    >
                        <svg width="24" height="32" viewBox="0 0 20 28" fill="none">
                            <path
                                d="M10 2C10 2 2 8 2 16C2 24 10 26 10 26C10 26 18 24 18 16C18 8 10 2 10 2Z"
                                fill={i % 2 === 0 ? "#ffb7c5" : "#fcc2d7"}
                                fillOpacity="1"
                            />
                        </svg>
                    </motion.div>
                );
            })}
        </div>
    );
};
