import React from 'react';

interface SocialVisualizerProps {
    variant: 'tiktok' | 'twitch' | 'youtube';
}

const SocialVisualizer: React.FC<SocialVisualizerProps> = ({ variant }) => {
    switch (variant) {
        case 'tiktok':
            return (
                <div className="absolute inset-0 bg-[#121212] overflow-hidden" style={{ contain: 'strict' }}>
                    {/* Modern Aurora Effect (Cyan/Pink) using Radial Gradients instead of Blur */}
                    <div
                        className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full mix-blend-screen animate-pulse-slow pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(0,242,234,0.2) 0%, transparent 70%)', transform: 'translateZ(0)', willChange: 'opacity, transform' }}
                    />
                    <div
                        className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full mix-blend-screen animate-pulse-slow pointer-events-none"
                        style={{ animationDelay: '2s', background: 'radial-gradient(circle, rgba(255,0,80,0.2) 0%, transparent 70%)', transform: 'translateZ(0)', willChange: 'opacity, transform' }}
                    />

                    {/* Subtle Noise Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] animate-noise pointer-events-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
                    />
                </div>
            );

        case 'twitch':
            return (
                <div className="absolute inset-0 bg-[#0e0e10] overflow-hidden" style={{ contain: 'strict' }}>
                    {/* Hexagonal Pattern - Subtle & Technical */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239146FF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Deep Purple Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#9146FF]/10 via-transparent to-transparent pointer-events-none" />
                    <div
                        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full h-[300px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(145,70,255,0.15) 0%, transparent 70%)', transform: 'translateZ(0)' }}
                    />
                </div>
            );

        case 'youtube':
            return (
                <div className="absolute inset-0 bg-[#0f0f0f] overflow-hidden" style={{ contain: 'strict' }}>
                    {/* Studio Ambient Light - Elegant Red utilizing radial gradient instead of blur */}
                    <div className="absolute top-0 right-0 w-[80vw] h-[80vw] opacity-40 translate-x-[30%] -translate-y-[30%] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(255,0,0,0.15) 0%, rgba(0,0,0,0) 70%)', transform: 'translateZ(0)' }}
                    />
                    <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] opacity-30 -translate-x-[30%] translate-y-[30%] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(255,0,0,0.1) 0%, rgba(0,0,0,0) 70%)', transform: 'translateZ(0)' }}
                    />

                    {/* Subtle Dot Matrix */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }}
                    />
                </div>
            );

        default:
            return <div className="absolute inset-0 bg-[#0f0f0f]" />;
    }
};

export default SocialVisualizer;
