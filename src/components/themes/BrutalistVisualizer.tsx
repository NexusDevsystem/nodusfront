
import React from 'react';
import { UserProfile, Theme } from '../../types';

interface BrutalistVisualizerProps {
    profile: UserProfile;
    currentTheme: Theme;
    className?: string;
}

export default function BrutalistVisualizer({ currentTheme, className = "" }: BrutalistVisualizerProps) {
    const renderPattern = () => {
        switch (currentTheme.id) {
            case 'brutalist-bauhaus':
                return (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Bauhaus Geometric Shapes */}
                        <div className="absolute top-[-5%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff3b30] opacity-20 transform -rotate-12"></div>
                        <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[30%] bg-[#007aff] opacity-15 transform rotate-6"></div>
                        <div className="absolute top-[40%] right-[15%] w-[20%] h-[20%] border-[10px] border-[#ffcc00] opacity-20 rounded-lg"></div>
                        <div className="absolute bottom-[-5%] left-[10%] w-[30%] h-[10%] bg-black opacity-10"></div>
                    </div>
                );
            case 'brutalist-halftone':
                return (
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)',
                            backgroundSize: '24px 24px',
                            opacity: 0.15
                        }}>
                    </div>
                );
            case 'brutalist-swiss':
                return (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                        {/* Huge Typographic Watermark */}
                        <span className="text-[40rem] font-black opacity-5 leading-none select-none pointer-events-none transform -rotate-12 translate-x-[-10%]">
                            N
                        </span>
                    </div>
                );
            case 'brutalist-schematic':
                return (
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, rgba(26,26,26,0.05) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(26,26,26,0.05) 1px, transparent 1px)
                             `,
                            backgroundSize: '40px 40px'
                        }}>
                    </div>
                );
            case 'brutalist-marker':
                return (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Hand-drawn look vector strokes */}
                        <svg className="absolute w-full h-full opacity-10" viewBox="0 0 400 800" preserveAspectRatio="none">
                            <path d="M-20,100 Q150,80 420,120" stroke="black" strokeWidth="8" fill="none" strokeLinecap="round" />
                            <path d="M-50,650 Q200,680 450,630" stroke="black" strokeWidth="12" fill="none" strokeLinecap="round" />
                            <circle cx="350" cy="200" r="40" stroke="black" strokeWidth="6" fill="none" />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`absolute inset-0 z-0 ${className}`}>
            {renderPattern()}
        </div>
    );
}
