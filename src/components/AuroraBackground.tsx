import React from 'react';

const AuroraBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
            <style>{`
        @keyframes aurora-1 {
          0%, 100% { transform: translate(-10%, -10%) scale(1); }
          50% { transform: translate(10%, 10%) scale(1.1); }
        }
        @keyframes aurora-2 {
          0%, 100% { transform: translate(10%, -10%) scale(1.1); }
          50% { transform: translate(-10%, 10%) scale(1); }
        }
        @keyframes aurora-3 {
          0%, 100% { transform: translate(-10%, 10%) scale(1.2); }
          50% { transform: translate(10%, -10%) scale(1); }
        }
        .aurora-blur {
          filter: blur(80px);
          opacity: 0.5;
        }
      `}</style>
            <div
                className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-cyan-500/30 aurora-blur"
                style={{ animation: 'aurora-1 15s ease-in-out infinite' }}
            />
            <div
                className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-500/30 aurora-blur"
                style={{ animation: 'aurora-2 20s ease-in-out infinite' }}
            />
            <div
                className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 aurora-blur"
                style={{ animation: 'aurora-3 18s ease-in-out infinite' }}
            />
            <div className="absolute inset-0 bg-black/20" />
        </div>
    );
};

export default AuroraBackground;
