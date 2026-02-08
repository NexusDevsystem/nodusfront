
import React from 'react';

const FloatingShapesBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden bg-slate-50">
            <style>{`
                @keyframes float-rotate {
                    0% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                    100% { transform: translateY(0) rotate(360deg); }
                }
                @keyframes drift-1 {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(100px, -100px); }
                }
            `}</style>

            {/* Soft Ambient Light */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80" />

            {/* Geometric Shapes */}
            <div className="absolute top-[15%] left-[10%] w-32 h-32 border-[20px] border-indigo-200/40 rounded-full blur-sm animate-[float-rotate_15s_linear_infinite]" />
            <div className="absolute top-[60%] right-[15%] w-48 h-48 border-[30px] border-purple-200/40 rotate-45 blur-sm animate-[float-rotate_20s_linear_infinite_reverse]" />
            <div className="absolute bottom-[10%] left-[20%] w-24 h-24 bg-rose-200/20 rounded-2xl rotate-12 blur-md animate-[float-rotate_12s_ease-in-out_infinite]" />

            {/* Dotted Pattern Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 mix-blend-multiply" />
        </div>
    );
};

export default FloatingShapesBackground;
