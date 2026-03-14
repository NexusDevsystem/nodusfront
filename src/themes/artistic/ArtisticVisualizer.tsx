import React from 'react';
import Grainient from '../../components/Grainient';

interface ArtisticVisualizerProps {
    variant: 'sketchbook' | 'line-art' | 'pop-art' | 'abstract' | 'bauhaus';
}

const ArtisticVisualizer: React.FC<ArtisticVisualizerProps> = ({ variant }) => {
    switch (variant) {
        case 'sketchbook':
            return (
                <div className="absolute inset-0 bg-[#fdfaf5] overflow-hidden">
                    {/* Paper Texture Noise */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />
                    {/* Hand drawn decorative elements */}
                    <div className="absolute top-10 left-[-50px] w-40 h-40 border-2 border-dashed border-[#2c2c2c] rounded-full opacity-10 animate-wobble" style={{ animationDuration: '20s' }} />
                    <div className="absolute bottom-20 right-[-30px] w-60 h-60 border-2 border-dashed border-[#2c2c2c] rounded-full opacity-10 animate-wobble" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2c2c2c" strokeWidth="0.5" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                </div>
            );

        case 'line-art':
            return (
                <div className="absolute inset-0 bg-white overflow-hidden text-black">
                    <div className="absolute inset-0 opacity-[0.03]">
                        <svg width="100%" height="100%">
                            <pattern id="lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="0" x2="40" y2="40" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                            <rect x="0" y="0" width="100%" height="100%" fill="url(#lines)" />
                        </svg>
                    </div>
                    {/* Floating abstract lines */}
                    <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] border-[1px] border-[#1a1a1a]/5 rounded-full animate-spin-slow" style={{ animationDuration: '60s' }} />
                    <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] border-[1px] border-[#1a1a1a]/5 rounded-full animate-spin-slow" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
                </div>
            );

        case 'pop-art':
            return (
                <div className="absolute inset-0 bg-[#FFF200] overflow-hidden">
                    {/* Halftone Pattern */}
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2.5px)',
                            backgroundSize: '20px 20px'
                        }}
                    />
                    {/* Animated Shapes */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00AEEF] rounded-full mix-blend-multiply opacity-80 animate-bounce-slow" />
                    <div className="absolute top-40 -left-10 w-32 h-32 bg-[#EC008C] rounded-full mix-blend-multiply opacity-80 animate-pulse-slow" />
                    <div className="absolute bottom-20 right-20 w-40 h-40 bg-black clip-star opacity-10 animate-spin-slow" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                </div>
            );

        case 'abstract':
            return (
                <Grainient
                    color1="#ff9a9e"
                    color2="#fad0c4"
                    color3="#a18cd1"
                    className="absolute inset-0"
                    grainAmount={0.05}
                    warpStrength={2.0}
                    warpSpeed={0.5}
                />
            );

        case 'bauhaus':
            return (
                <div className="absolute inset-0 bg-[#f4f1ea] overflow-hidden">
                    {/* Geometric Primitives */}
                    <div className="absolute top-[10%] left-[10%] w-0 h-0 border-l-[50px] border-l-transparent border-b-[86px] border-b-[#D22630]/20 border-r-[50px] border-r-transparent animate-float" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-[40%] right-[10%] w-24 h-24 bg-[#005A9C]/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
                    <div className="absolute bottom-[20%] left-[20%] w-20 h-20 bg-[#F0AB00]/20 animate-float" style={{ animationDelay: '4s' }} />
                    <div className="absolute top-[60%] left-[50%] w-4 p-40 border-4 border-[#1a1a1a]/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-[#1a1a1a]/5 rounded-bl-full" />
                </div>
            );

        default:
            return <div className="absolute inset-0 bg-white" />;
    }
};

export default ArtisticVisualizer;
