import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Background: React.FC = () => {
    // Generate static particles configuration to avoid re-renders
    const particles = useMemo(() => {
        return [...Array(35)].map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10 - Math.random() * 20, // Start above screen
            size: 10 + Math.random() * 15,
            duration: 8 + Math.random() * 12,
            delay: Math.random() * -20, // Negative delay for instant populate
            rotation: Math.random() * 360,
            color: i % 4 === 0 ? "#FFB7C5" : i % 4 === 1 ? "#FFC4D0" : i % 4 === 2 ? "#FFD1DC" : "#FFE4E1"
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-b from-[#FFF0F5] via-[#FFF5F7] to-[#FFE4E1]">
            {/* Soft Sun/Glow Effect */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFD1DC]/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFB7C5]/10 blur-[80px] rounded-full" />

            {/* Falling Petals */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute"
                    initial={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        opacity: 0,
                        rotate: p.rotation,
                        scale: 0
                    }}
                    animate={{
                        top: ['0%', '110%'],
                        left: [`${p.x}%`, `${p.x + (Math.random() * 20 - 10)}%`], // Horizontal sway
                        rotate: [p.rotation, p.rotation + 360 + Math.random() * 180],
                        opacity: [0, 0.9, 0.9, 0],
                        scale: [0, 1, 0.8, 0.5]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                        times: [0, 1]
                    }}
                >
                    <SakuraPetal color={p.color} size={p.size} />
                </motion.div>
            ))}

            {/* Subtle Overlay Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-multiply" />
        </div>
    );
};

// Custom SVG Petal Shape
const SakuraPetal = ({ color, size }: { color: string, size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(255,183,197,0.3))' }}>
        <path
            d="M12 2C12 2 4 8 4 15C4 20 8 22 12 22C16 22 20 20 20 15C20 8 12 2 12 2Z"
            fill={color}
        />
        <path
            d="M12 2C12 2 12 12 12 16"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

export default Background;
