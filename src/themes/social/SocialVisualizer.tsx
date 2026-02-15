import React from 'react';

interface SocialVisualizerProps {
    variant: 'tiktok' | 'twitch' | 'youtube';
}

const SocialVisualizer: React.FC<SocialVisualizerProps> = ({ variant }) => {
    switch (variant) {
        case 'tiktok':
            return (
                <div className="absolute inset-0 bg-[#121212] overflow-hidden">
                    {/* Modern Aurora Effect (Cyan/Pink) */}
                    <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-[#00f2ea] rounded-full mix-blend-screen opacity-20 blur-[120px] animate-pulse-slow" />
                    <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] bg-[#ff0050] rounded-full mix-blend-screen opacity-20 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

                    {/* Subtle Noise Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] animate-noise"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
                    />
                </div>
            );

        case 'twitch':
            return (
                <div className="absolute inset-0 bg-[#0e0e10] overflow-hidden">
                    {/* Hexagonal Pattern - Subtle & Technical */}
                    <div className="absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239146FF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Deep Purple Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#9146FF]/10 via-transparent to-transparent" />
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full h-[300px] bg-[#9146FF] opacity-10 blur-[100px]" />
                </div>
            );

        case 'youtube':
            return (
                <div className="absolute inset-0 bg-[#0f0f0f] overflow-hidden">
                    {/* Studio Ambient Light - Elegant Red */}
                    <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-radial-gradient from-[#FF0000]/5 to-transparent blur-[80px] opacity-40 translate-x-[30%] -translate-y-[30%]"
                        style={{ background: 'radial-gradient(circle, rgba(255,0,0,0.15) 0%, rgba(0,0,0,0) 70%)' }}
                    />
                    <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-radial-gradient from-[#FF0000]/5 to-transparent blur-[80px] opacity-30 -translate-x-[30%] translate-y-[30%]"
                        style={{ background: 'radial-gradient(circle, rgba(255,0,0,0.1) 0%, rgba(0,0,0,0) 70%)' }}
                    />

                    {/* Subtle Dot Matrix */}
                    <div className="absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }}
                    />
                </div>
            );

        default:
            return <div className="absolute inset-0 bg-white" />;
    }
};

export default SocialVisualizer;
