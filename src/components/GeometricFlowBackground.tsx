
import React from 'react';

const GeometricFlowBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#fffdf5]">
            <style>{`
                @keyframes shape-flow {
                    0% { transform: translateY(110vh) rotate(0deg) scale(0.8); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(-10vh) rotate(360deg) scale(1.2); opacity: 0; }
                }
            `}</style>

            {/* Flowing Shapes */}
            {[...Array(12)].map((_, i) => {
                const size = 50 + Math.random() * 150;
                const left = Math.random() * 100;
                const delay = Math.random() * 20;
                const duration = 15 + Math.random() * 20;
                const color = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'][Math.floor(Math.random() * 8)];

                return (
                    <div
                        key={i}
                        className="absolute rounded-full mix-blend-multiply filter blur-xl"
                        style={{
                            width: size,
                            height: size,
                            left: `${left}%`,
                            backgroundColor: color,
                            animation: `shape-flow ${duration}s linear infinite`,
                            animationDelay: `-${delay}s`
                        }}
                    />
                );
            })}

            {/* Constant Grain */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none" />
        </div>
    );
};

export default GeometricFlowBackground;
