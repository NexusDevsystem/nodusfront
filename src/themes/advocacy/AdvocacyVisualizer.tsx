import React from 'react';

const ADV_STYLES = `
@keyframes fadeScaleIn {
  from { opacity: 0; transform: scale(0.9) translateY(10px) translateZ(0); }
  to { opacity: 0.25; transform: scale(1) translateY(0) translateZ(0); }
}
@keyframes floatBubble1 {
  0%, 100% { transform: translateY(0) translateZ(0); opacity: 0.3; }
  50% { transform: translateY(-20px) translateZ(0); opacity: 0.6; }
}
@keyframes floatBubble2 {
  0%, 100% { transform: translate(0, 0) translateZ(0); opacity: 0.2; }
  50% { transform: translate(10px, -30px) translateZ(0); opacity: 0.5; }
}
@keyframes pulseGlow {
  0%, 100% { transform: translate(-50%, -50%) scale(1) translateZ(0); opacity: 0.1; }
  50% { transform: translate(-50%, -50%) scale(1.1) translateZ(0); opacity: 0.3; }
}
@keyframes pulseGlowSimple {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.7; }
}
@keyframes rotatePulse {
  0%, 100% { opacity: 0.4; transform: rotate(0deg) translateZ(0); }
  50% { opacity: 0.6; transform: rotate(5deg) translateZ(0); }
}
@keyframes pulseBottom {
  0%, 100% { opacity: 0.1; transform: scaleY(1) translateZ(0); }
  50% { opacity: 0.3; transform: scaleY(1.2) translateZ(0); }
}
`;

const StyleTag = React.memo(() => <style>{ADV_STYLES}</style>);

interface AdvocacyVisualizerProps {
    variant: 'juris-classic' | 'modern-law' | 'verdict' | 'equity' | 'justice-scale';
}

const AdvocacyVisualizer: React.FC<AdvocacyVisualizerProps> = ({ variant }) => {

    // 1. Juris Classic (Vintage Justice - Dark Brown & Antique Gold)
    if (variant === 'juris-classic') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#1a120b] flex items-center justify-center" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Deep Radial Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(44,32,24,0.4)_0%,#1a120b_80%)] pointer-events-none" />

                {/* Subtle Paper/Leather Texture */}
                <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-leather.png")' }} />

                {/* High-Fidelity Vintage Scale Watermark */}
                <div
                    className="absolute z-0 w-[90%] max-w-[500px] text-[#b48a5f] drop-shadow-[0_0_15px_rgba(180,138,95,0.2)] pointer-events-none"
                    style={{
                        animation: 'fadeScaleIn 2s ease-out forwards',
                        willChange: 'transform, opacity'
                    }}
                >
                    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M85 145 H115 V150 Q115 155 100 155 Q85 155 85 150 Z" fill="currentColor" />
                        <path d="M92 135 H108 L110 145 H90 Z" fill="currentColor" opacity="0.8" />
                        <rect x="97" y="35" width="6" height="100" rx="1" fill="currentColor" />
                        <circle cx="100" cy="35" r="5" fill="currentColor" />
                        <circle cx="100" cy="70" r="3" fill="currentColor" opacity="0.6" />
                        <path d="M30 45 Q100 25 170 45 L170 48 Q100 28 30 48 Z" fill="currentColor" />
                        <circle cx="30" cy="46" r="2" fill="currentColor" />
                        <circle cx="170" cy="46" r="2" fill="currentColor" />
                        <path d="M90 35 H110 V40 H90 Z" fill="currentColor" />
                        <line x1="30" y1="46" x2="10" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                        <line x1="30" y1="46" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                        <line x1="28" y1="48" x2="30" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.5" />
                        <path d="M10 100 Q30 115 50 100 Q50 95 30 95 Q10 95 10 100 Z" fill="currentColor" opacity="0.7" />
                        <path d="M10 100 Q30 110 50 100" stroke="currentColor" strokeWidth="1" fill="none" />
                        <line x1="170" y1="46" x2="150" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                        <line x1="170" y1="46" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                        <line x1="172" y1="48" x2="170" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.5" />
                        <path d="M150 100 Q170 115 190 100 Q190 95 170 95 Q150 95 150 100 Z" fill="currentColor" opacity="0.7" />
                        <path d="M150 100 Q170 110 190 100" stroke="currentColor" strokeWidth="1" fill="none" />
                        <g opacity="0.3">
                            <line x1="98" y1="50" x2="102" y2="50" stroke="black" strokeWidth="0.5" />
                            <line x1="98" y1="60" x2="102" y2="60" stroke="black" strokeWidth="0.5" />
                            <line x1="98" y1="80" x2="102" y2="80" stroke="black" strokeWidth="0.5" />
                        </g>
                    </svg>
                </div>

                {/* Subtle Dust Particles */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            </div>
        );
    }

    // 2. Modern Bubble (Royal Blue Deep Sea)
    if (variant === 'modern-law') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#0f172a]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Deep Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] pointer-events-none" />

                {/* Floating Bubbles */}
                <div
                    className="absolute top-[20%] left-[10%] w-32 h-32 rounded-full border border-white/10 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(96,165,250,0.4) 0%, transparent 70%)',
                        animation: 'floatBubble1 6s ease-in-out infinite',
                        willChange: 'transform, opacity'
                    }}
                />
                <div
                    className="absolute bottom-[30%] right-[15%] w-48 h-48 rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
                        animation: 'floatBubble2 8s ease-in-out infinite 1s',
                        willChange: 'transform, opacity'
                    }}
                />
                <div
                    className="absolute top-[50%] left-[50%] w-[80%] h-[80%] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
                        animation: 'pulseGlow 10s ease-in-out infinite',
                        willChange: 'transform, opacity'
                    }}
                />
            </div>
        );
    }

    // 3. Verdict (Deep Emerald Library)
    if (variant === 'verdict') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#022c22]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80 pointer-events-none" />

                {/* Green Glow (Library Lamp feel) using Radial Gradient instead of blur */}
                <div
                    className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(5,150,105,0.3) 0%, transparent 70%)',
                        animation: 'pulseGlowSimple 8s ease-in-out infinite',
                        willChange: 'opacity'
                    }}
                />

                {/* Grain Texture */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-felt.png")' }} />
            </div>
        );
    }

    // 4. Equity (Kept as requested)
    if (variant === 'equity') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#e7e5e4]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Soft Light Leak */}
                <div
                    className="absolute -top-[50%] -left-[20%] w-[150%] h-[150%] opacity-50 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(214,211,209,0.8) 0%, transparent 70%)',
                        animation: 'rotatePulse 12s ease-in-out infinite',
                        willChange: 'transform, opacity'
                    }}
                />

                {/* Texture */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />
            </div>
        );
    }

    // 5. Justice Scale (Matte Black & Red)
    if (variant === 'justice-scale') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#000000]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Dark Noise */}
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-dark.png")' }} />

                {/* Red Pulse from Bottom - using radial gradient */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-none transform origin-bottom"
                    style={{
                        background: 'radial-gradient(ellipse at bottom, rgba(153,27,27,0.4) 0%, transparent 80%)',
                        animation: 'pulseBottom 4s ease-in-out infinite',
                        willChange: 'transform, opacity'
                    }}
                />
            </div>
        );
    }

    return null;
};

export default AdvocacyVisualizer;
