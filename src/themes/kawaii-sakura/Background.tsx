import React, { useMemo } from 'react';

const SAKURA_STYLES = `
@keyframes SakuraFall {
    0% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 0.8;
    }
    50% {
        transform: translateY(50vh) translateX(50px) rotate(180deg);
        opacity: 0.9;
    }
    90% {
        opacity: 0.8;
    }
    100% {
        transform: translateY(110vh) translateX(100px) rotate(360deg);
        opacity: 0;
    }
}
`;

const StyleTag = React.memo(() => <style>{SAKURA_STYLES}</style>);

const Background: React.FC = () => {
    // Generate static particles configuration to avoid re-renders
    const particles = useMemo(() => {
        return [...Array(35)].map((_, i) => ({
            id: i,
            x: Math.random() * 110 - 5, // Start slightly wider
            y: -10 - Math.random() * 20, // Start above screen
            size: 8 + Math.random() * 12,
            duration: 10 + Math.random() * 15, // Slower fall
            delay: Math.random() * -25, // Negative delay for instant populate
            color: i % 4 === 0 ? "#FFB7C5" : i % 4 === 1 ? "#FFC4D0" : i % 4 === 2 ? "#FFD1DC" : "#FFE4E1"
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-b from-[#FFF0F5] via-[#FFF5F7] to-[#FFE4E1]" style={{ contain: 'strict' }}>
            <StyleTag />

            {/* Soft Sun/Glow Effect - Optimized with radial-gradient instead of blur */}
            <div
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(255,209,220,0.8) 0%, transparent 70%)',
                    transform: 'translateZ(0)'
                }}
            />
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-10"
                style={{
                    background: 'radial-gradient(circle, rgba(255,183,197,0.8) 0%, transparent 70%)',
                    transform: 'translateZ(0)'
                }}
            />

            {/* Falling Petals */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        animation: `SakuraFall ${p.duration}s linear ${p.delay}s infinite`,
                        willChange: 'transform, opacity'
                    }}
                >
                    <SakuraPetal color={p.color} size={p.size} />
                </div>
            ))}

            {/* Subtle Overlay Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-multiply" />
        </div>
    );
};

// Custom SVG Petal Shape
const SakuraPetal = ({ color, size }: { color: string, size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>
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
