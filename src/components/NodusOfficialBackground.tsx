import React from 'react';

const NodusOfficialBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[#0f1f1a]">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f1f1a] via-[#1a332a] to-[#0f1f1a]"></div>

            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(172,200,162,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(172,200,162,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] animate-pulse-slow"></div>

            {/* Floating Orbs/Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#acc8a2]/20 rounded-full blur-[100px] animate-float-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#acc8a2]/10 rounded-full blur-[100px] animate-float-delayed"></div>

            {/* Digital Rain / Matrix-like effect (Simplified) */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#acc8a2] to-transparent animate-rain-1"></div>
                <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-[#acc8a2] to-transparent animate-rain-2"></div>
                <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-[#acc8a2] to-transparent animate-rain-3"></div>
            </div>

            {/* Tech HUD Elements */}
            <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-[#acc8a2]/30 rounded-tl-3xl opacity-50"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-[#acc8a2]/30 rounded-br-3xl opacity-50"></div>

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, 20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-30px, -20px); }
                }
                @keyframes rain-1 {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                @keyframes rain-2 {
                    0% { transform: translateY(-100%); animation-delay: 1s; }
                    100% { transform: translateY(100%); animation-delay: 1s; }
                }
                 @keyframes rain-3 {
                    0% { transform: translateY(-100%); animation-delay: 2s; }
                    100% { transform: translateY(100%); animation-delay: 2s; }
                }
                .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 18s ease-in-out infinite; }
                 .animate-rain-1 { animation: rain-1 8s linear infinite; }
                 .animate-rain-2 { animation: rain-2 12s linear infinite; }
                 .animate-rain-3 { animation: rain-3 10s linear infinite; }
            `}</style>
        </div>
    );
};

export default NodusOfficialBackground;
