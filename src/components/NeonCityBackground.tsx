
import React from 'react';

const NeonCityBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#0d0221]">
            <style>{`
                @keyframes city-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes car-move {
                    0% { left: -10%; }
                    100% { left: 110%; }
                }
                @keyframes star-blink {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
            `}</style>

            {/* Stars */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            top: `${Math.random() * 50}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `star-blink ${2 + Math.random() * 3}s infinite`
                        }}
                    />
                ))}
            </div>

            {/* Moon */}
            <div className="absolute top-[10%] right-[15%] w-24 h-24 rounded-full bg-gradient-to-tr from-fuchsia-600 to-yellow-400 shadow-[0_0_50px_rgba(232,121,249,0.4)]" />

            {/* Moving City Silhouette 1 (Back) */}
            <div
                className="absolute bottom-0 left-0 w-[200%] h-[40%] bg-indigo-950/50 flex items-end opacity-60"
                style={{ animation: 'city-scroll 60s linear infinite' }}
            >
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="w-[5%] bg-[#1e1b4b] mx-1"
                        style={{ height: `${20 + Math.random() * 40}%` }}
                    />
                ))}
            </div>

            {/* Moving City Silhouette 2 (Front) */}
            <div
                className="absolute bottom-0 left-0 w-[200%] h-[30%] flex items-end"
                style={{ animation: 'city-scroll 30s linear infinite' }}
            >
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="w-[8%] bg-[#2e1065] mx-[1%] relative group"
                        style={{ height: `${30 + Math.random() * 60}%` }}
                    >
                        {/* Windows */}
                        <div className="absolute top-[10%] left-[20%] w-[20%] h-[5%] bg-yellow-200/50 animate-pulse" />
                        <div className="absolute top-[30%] right-[20%] w-[20%] h-[5%] bg-cyan-200/50 animate-pulse delay-700" />
                    </div>
                ))}
            </div>

            {/* Neon Fog */}
            <div className="absolute bottom-0 w-full h-[50%] bg-gradient-to-t from-fuchsia-900/50 to-transparent pointer-events-none" />
        </div>
    );
};

export default NeonCityBackground;
