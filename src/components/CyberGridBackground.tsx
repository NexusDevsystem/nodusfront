
import React from 'react';

const CyberGridBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#050510] perspective-[1000px]">
            <style>{`
                @keyframes grid-move {
                    0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-100px); }
                    100% { transform: perspective(500px) rotateX(60deg) translateY(50px) translateZ(-100px); }
                }
                @keyframes sun-glow {
                    0%, 100% { box-shadow: 0 0 50px 20px rgba(255, 0, 255, 0.4); }
                    50% { box-shadow: 0 0 70px 30px rgba(255, 0, 255, 0.6); }
                }
            `}</style>

            {/* Retro Sun */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-t from-fuchsia-600 to-yellow-400 opacity-20 blur-[80px] animate-[sun-glow_4s_infinite_ease-in-out]" />

            {/* Grid Floor */}
            <div
                className="absolute inset-[-100%] w-[300%] h-[300%] bg-[linear-gradient(rgba(219,39,119,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(219,39,119,0.3)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30 origin-bottom"
                style={{
                    animation: 'grid-move 3s linear infinite',
                    transformStyle: 'preserve-3d'
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-[#050510]/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050510_100%)] opacity-80" />
        </div>
    );
};

export default CyberGridBackground;
