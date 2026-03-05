import React from 'react';

// CSS keyframes globally injected
const TECH_STYLES = `
@keyframes pathDraw {
  0% { stroke-dasharray: 0, 2000; opacity: 0; }
  10% { opacity: 1; }
  100% { stroke-dasharray: 2000, 2000; opacity: 1; }
}
@keyframes pulseCyan {
  0% { opacity: 0.2; transform: scale(1) translateZ(0); }
  50% { opacity: 0.8; transform: scale(1.5) translateZ(0); }
  100% { opacity: 0.2; transform: scale(1) translateZ(0); }
}
@keyframes rotate90 {
  from { transform: rotate(0deg) translateZ(0); }
  to { transform: rotate(90deg) translateZ(0); }
}
@keyframes floatY {
  0% { transform: translateY(0) translateZ(0); }
  50% { transform: translateY(-20px) translateZ(0); }
  100% { transform: translateY(0) translateZ(0); }
}
@keyframes floatParticle {
  0% { transform: translateY(0) translateZ(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100px) translateZ(0); opacity: 0; }
}
@keyframes pulseScale {
  0% { transform: scale(1) translateX(0) translateZ(0); }
  50% { transform: scale(1.1) translateX(20px) translateZ(0); }
  100% { transform: scale(1) translateX(0) translateZ(0); }
}
@keyframes pulseScaleY {
  0% { transform: scale(1) translateY(0) translateZ(0); }
  50% { transform: scale(1.2) translateY(-30px) translateZ(0); }
  100% { transform: scale(1) translateY(0) translateZ(0); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes rotate360 {
  from { transform: rotate(0deg) translateZ(0); }
  to { transform: rotate(360deg) translateZ(0); }
}
@keyframes matrixRain {
  from { transform: translateY(-500px) translateZ(0); }
  to { transform: translateY(1000px) translateZ(0); }
}
@keyframes gradShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes subtleRotateScale {
  0% { transform: rotate(0deg) scale(1) translateZ(0); }
  50% { transform: rotate(5deg) scale(1.05) translateZ(0); }
  100% { transform: rotate(0deg) scale(1) translateZ(0); }
}
@keyframes floatUpRotate {
  from { transform: translateY(100vh) rotate(0deg) translateZ(0); }
  to { transform: translateY(-20vh) rotate(360deg) translateZ(0); }
}
`;

const StyleTag = React.memo(() => <style>{TECH_STYLES}</style>);

interface TechnologyVisualizerProps {
    variant:
    | 'neural-grid'
    | 'brutalist-tech'
    | 'cyberpunk-corp'
    | 'minimal-saas'
    | 'terminal-dev'
    | 'holographic-glass'
    | 'matrix-code'
    | 'ai-gradient'
    | 'dark-corp'
    | 'startup-launch';
}

const TechnologyVisualizer: React.FC<TechnologyVisualizerProps> = ({ variant }) => {
    // 1. Neural Grid (Dark, Connected Lines)
    if (variant === 'neural-grid') {
        const points = Array.from({ length: 20 });
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#0F0F1A]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#4f4f4f 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* Connecting Lines Animation */}
                <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                    <path
                        d="M0,50 Q400,200 800,50 T1600,50"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        style={{
                            animation: 'pathDraw 5s linear infinite',
                            willChange: 'opacity, stroke-dasharray'
                        }}
                    />
                    <path
                        d="M0,300 Q400,100 800,300 T1600,300"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        style={{
                            animation: 'pathDraw 7s linear infinite 1s',
                            willChange: 'opacity, stroke-dasharray'
                        }}
                    />
                </svg>

                {/* Pulsing Nodes */}
                {points.map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-cyan-500 rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `pulseCyan ${Math.random() * 3 + 2}s infinite`,
                            willChange: 'transform, opacity',
                            boxShadow: '0 0 4px rgba(6,182,212,0.8)'
                        }}
                    />
                ))}
            </div>
        );
    }

    // 2. Brutalist Tech (Raw, Minimal, Bold)
    if (variant === 'brutalist-tech') {
        return (
            <div className="absolute inset-0 bg-[#f0f0f0] overflow-hidden" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Raw Grid */}
                <div className="absolute inset-0 border-l border-r border-black/10 w-full max-w-4xl mx-auto pointer-events-none" />
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 40px', opacity: 0.1 }}
                />

                {/* Floating Geometric Primitives */}
                <div
                    className="absolute top-20 -left-10 w-40 h-40 border-4 border-black bg-transparent"
                    style={{
                        animation: 'rotate90 20s linear infinite',
                        willChange: 'transform'
                    }}
                />
                <div
                    className="absolute bottom-40 -right-10 w-32 h-32 bg-black"
                    style={{
                        animation: 'floatY 5s ease-in-out infinite',
                        willChange: 'transform'
                    }}
                />
            </div>
        );
    }

    // 3. Cyberpunk Corporate (Deep Black, Purple Neon, Scanlines)
    if (variant === 'cyberpunk-corp') {
        return (
            <div className="absolute inset-0 bg-black overflow-hidden" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Purple Glow - Radial Grandient replacing Blur */}
                <div className="absolute top-0 left-0 w-full h-[80%] pointer-events-none" style={{ background: 'radial-gradient(circle at top left, rgba(88,28,135,0.2) 0%, transparent 70%)', transform: 'translateZ(0)' }} />
                <div className="absolute bottom-0 right-0 w-full h-[80%] pointer-events-none" style={{ background: 'radial-gradient(circle at bottom right, rgba(30,58,138,0.2) 0%, transparent 70%)', transform: 'translateZ(0)' }} />

                {/* Scanlines */}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-10"
                    style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />

                {/* Floating Particles */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-purple-500 rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `floatParticle ${Math.random() * 5 + 5}s infinite`,
                            willChange: 'transform, opacity'
                        }}
                    />
                ))}
            </div>
        );
    }

    // 4. Minimal SaaS (Clean, Soft Gradients)
    if (variant === 'minimal-saas') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Gradients using radial replacing blur */}
                <div
                    className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(224,231,255,0.8) 0%, rgba(0,0,0,0) 70%)',
                        animation: 'pulseScale 10s ease-in-out infinite',
                        willChange: 'transform'
                    }}
                />
                <div
                    className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(239,246,255,0.8) 0%, rgba(0,0,0,0) 70%)',
                        animation: 'pulseScaleY 15s ease-in-out infinite',
                        willChange: 'transform'
                    }}
                />
            </div>
        );
    }

    // 5. Terminal Dev (Black, Monospace)
    if (variant === 'terminal-dev') {
        return (
            <div className="absolute inset-0 bg-[#0d0d0d] font-mono text-green-500/20 text-xs p-4 overflow-hidden select-none" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Static Background Code */}
                <div className="opacity-10 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i}>{`> system_check --n ${i * 1}00`}<br />{`  [OK] module_${i} loaded`}</div>
                    ))}
                </div>
                {/* Blinking Cursor Overlay */}
                <div
                    className="absolute bottom-10 left-10 w-3 h-5 bg-green-500 pointer-events-none"
                    style={{
                        animation: 'blink 0.8s infinite',
                        willChange: 'opacity'
                    }}
                />
            </div>
        );
    }

    // 6. Holographic Glass (Vision Pro Style)
    if (variant === 'holographic-glass') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#1c1c1e]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Aurora Background */}
                <div
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-50 pointer-events-none"
                    style={{
                        background: 'conic-gradient(from 0deg at 50% 50%, #ff0080, #7928ca, #ff0080)',
                        animation: 'rotate360 20s linear infinite',
                        willChange: 'transform'
                    }}
                />
                <div className="absolute inset-0 bg-[#1c1c1e]/80" /> {/* Replaced blur with simple overlay since blur is heavy */}
            </div>
        );
    }

    // 7. Matrix Code (Digital Rain)
    if (variant === 'matrix-code') {
        // Simplified Matrix Effect using pure CSS
        return (
            <div className="absolute inset-0 bg-black overflow-hidden font-mono text-green-500/40 text-sm leading-none" style={{ contain: 'strict' }}>
                <StyleTag />
                {Array.from({ length: 15 }).map((_, col) => (
                    <div
                        key={col}
                        className="absolute top-0 text-center w-4 break-words pointer-events-none"
                        style={{
                            left: `${col * 7}%`,
                            animation: `matrixRain ${Math.random() * 5 + 3}s linear ${Math.random() * 5}s infinite`,
                            willChange: 'transform'
                        }}
                    >
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i}>{String.fromCharCode(0x30A0 + Math.random() * 96)}</div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    // 8. AI Gradient (Vibrant Morphing)
    if (variant === 'ai-gradient') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#111]" style={{ contain: 'strict' }}>
                <StyleTag />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4ecdc4, #45b7d1)',
                        backgroundSize: '400% 400%',
                        animation: 'gradShift 15s ease-in-out infinite',
                        willChange: 'background-position'
                    }}
                />
                {/* Dark noise overlay for texture */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
            </div>
        );
    }

    // 9. Dark Corporate Premium (Subtle, Elegant)
    if (variant === 'dark-corp') {
        return (
            <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden" style={{ contain: 'strict' }}>
                <StyleTag />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950 pointer-events-none" />
                {/* Very subtle slow moving light */}
                <div
                    className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"
                    style={{
                        animation: 'subtleRotateScale 20s ease-in-out infinite',
                        willChange: 'transform'
                    }}
                />
            </div>
        );
    }

    // 10. Startup Launch (Light, Conversion Focused)
    if (variant === 'startup-launch') {
        return (
            <div className="absolute inset-0 bg-orange-50/50 overflow-hidden" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Confetti or upward movement symbols */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-orange-200 pointer-events-none"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animation: `floatUpRotate ${Math.random() * 5 + 5}s linear ${Math.random() * 5}s infinite`,
                            willChange: 'transform'
                        }}
                    >
                        {['▲', '●', '■'][i % 3]}
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

export default TechnologyVisualizer;
