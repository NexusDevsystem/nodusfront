import React from 'react';

export default function ChainSeparator() {
    return (
        <div className="w-full h-24 bg-[#97cd7a] border-y-2 border-black overflow-hidden relative flex items-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '16px 16px' }}>
            </div>

            {/* Seamless Chain Pattern */}
            <div className="flex w-[200%] animate-slide-chain">
                {/* We repeat the pattern block to ensure seamless looping */}
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex shrink-0">
                        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                            {/* Link Body (Black Border) */}
                            <path
                                d="M15 30C15 18.9543 23.9543 10 35 10H85C96.0457 10 105 18.9543 105 30C105 41.0457 96.0457 50 85 50H35C23.9543 50 15 41.0457 15 30Z"
                                stroke="black"
                                strokeWidth="8"
                                className="fill-white"
                            />
                            {/* Inner Hole (See-through) */}
                            <path
                                d="M35 22H85C89.4183 22 93 25.5817 93 30C93 34.4183 89.4183 38 85 38H35C30.5817 38 27 34.4183 27 30C27 25.5817 30.5817 22 35 22Z"
                                fill="black"
                                fillOpacity="0.1"
                                stroke="black"
                                strokeWidth="4"
                            />
                        </svg>
                        {/* Connector Link (Interlocking illusion) */}
                        <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="-ml-6 relative z-10">
                            <rect x="5" y="20" width="30" height="20" rx="4" fill="black" />
                            <rect x="10" y="22" width="20" height="16" rx="2" fill="#555" />
                        </svg>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slide-chain {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-slide-chain {
                    animation: slide-chain 10s linear infinite;
                }
            `}</style>
        </div>
    );
}
