
import React from 'react';

const GradientMeshBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-slate-900">
            <style>{`
                @keyframes mesh-move {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(10%, 10%) rotate(5deg); }
                    66% { transform: translate(-5%, 15%) rotate(-5deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes mesh-pulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
            `}</style>

            <div className="absolute inset-[-50%] opacity-60 mix-blend-screen filter blur-[100px]">
                <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] rounded-full bg-rose-500 animate-[mesh-move_20s_infinite_ease-in-out]" />
                <div className="absolute top-1/3 right-1/4 w-[35%] h-[35%] rounded-full bg-violet-600 animate-[mesh-move_25s_infinite_ease-in-out_reverse]" />
                <div className="absolute bottom-1/4 left-1/3 w-[45%] h-[45%] rounded-full bg-orange-400 animate-[mesh-move_22s_infinite_ease-in-out_1s]" />
                <div className="absolute bottom-1/3 right-1/3 w-[30%] h-[30%] rounded-full bg-cyan-400 animate-[mesh-move_18s_infinite_ease-in-out_2s]" />
            </div>

            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-transparent to-slate-950/20" />
        </div>
    );
};

export default GradientMeshBackground;
