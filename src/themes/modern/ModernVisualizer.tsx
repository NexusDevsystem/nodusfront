
import React from 'react';
import { motion } from 'framer-motion';

interface ModernVisualizerProps {
    variant: 'minimalist' | 'cyberpunk' | 'glassmorphism' | 'pastel' | 'dark-elegant' | 'industrial' | 'retro-futurist' | 'nature' | 'high-contrast' | 'royal-gold';
}

// Pre-calculated static values — avoids Math.random() on each render
const ROYAL_GOLD_PARTICLES = [
    { left: '8%', top: '72%', dur: 7.2, del: 0.0 },
    { left: '23%', top: '55%', dur: 8.8, del: 1.2 },
    { left: '41%', top: '80%', dur: 6.5, del: 2.4 },
    { left: '57%', top: '34%', dur: 9.1, del: 0.8 },
    { left: '69%', top: '61%', dur: 7.7, del: 3.1 },
    { left: '14%', top: '20%', dur: 8.3, del: 1.9 },
    { left: '82%', top: '45%', dur: 6.9, del: 0.5 },
    { left: '36%', top: '10%', dur: 9.4, del: 4.0 },
    { left: '91%', top: '78%', dur: 7.1, del: 2.7 },
    { left: '48%', top: '92%', dur: 8.0, del: 1.5 },
    { left: '3%', top: '50%', dur: 6.3, del: 3.8 },
    { left: '75%', top: '25%', dur: 9.7, del: 0.3 },
    { left: '62%', top: '88%', dur: 7.5, del: 2.1 },
    { left: '19%', top: '38%', dur: 8.6, del: 4.5 },
    { left: '87%', top: '15%', dur: 6.8, del: 1.0 },
];

// CSS keyframe string injected once
const VISUALIZER_STYLES = `
@keyframes goldFloat { 0%,100%{transform:translateY(0) scale(1);opacity:0} 20%{opacity:.6} 80%{opacity:.6} 100%{transform:translateY(-80px) scale(.8);opacity:0} }
@keyframes scanline { 0%{transform:translateY(0)} 100%{transform:translateY(100vh)} }
@keyframes bgpan { 0%{background-position:0 0} 100%{background-position:100px 100px} }
@keyframes breathe { 0%,100%{opacity:.3} 50%{opacity:.6} }
@keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }
@keyframes floatDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(40px)} }
@keyframes pulseO { 0%,100%{opacity:.2} 50%{opacity:.4} }
@keyframes rotateSlow { 0%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.1) rotate(5deg)} 100%{transform:scale(1) rotate(0deg)} }
`;

const VisualizerStyleTag = React.memo(() => <style>{VISUALIZER_STYLES}</style>);

const ModernVisualizer: React.FC<ModernVisualizerProps> = ({ variant }) => {

    // 1. Minimalist (Breathing Gradient) — CSS animation, no JS
    if (variant === 'minimalist') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white" style={{ contain: 'strict' }}>
                <VisualizerStyleTag />
                <div
                    className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50"
                    style={{ animation: 'breathe 8s ease-in-out infinite', willChange: 'opacity' }}
                />
            </div>
        );
    }

    // 2. Cyberpunk (Digital Scanlines) — scanline via CSS transform
    if (variant === 'cyberpunk') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#050505]" style={{ contain: 'strict' }}>
                <VisualizerStyleTag />
                {/* Static scanlines pattern — no animation needed */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
                {/* Moving Glitch Line — CSS only */}
                <div
                    className="absolute w-full h-[2px] bg-cyan-500/50 shadow-[0_0_10px_cyan]"
                    style={{ animation: 'scanline 5s linear infinite', willChange: 'transform', top: 0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff00ff]/5 to-transparent opacity-30" />
            </div>
        );
    }

    // 3. Glassmorphism — blur replaced by static gradient blobs (blur on motion = perf killer)
    if (variant === 'glassmorphism') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white" style={{ contain: 'strict' }}>
                <VisualizerStyleTag />
                {/* Fixed performance: replaced CSS filter: blur() with SVG radial gradients */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(96,165,250,0.3) 0%, rgba(96,165,250,0) 70%)',
                        animation: 'rotateSlow 20s ease-in-out infinite',
                        willChange: 'transform',
                        contain: 'layout relative',
                        transform: 'translateZ(0)' // Force HW accel without blur
                    }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(167,139,250,0) 70%)',
                        animation: 'rotateSlow 25s ease-in-out infinite reverse',
                        willChange: 'transform',
                        contain: 'layout relative',
                        transform: 'translateZ(0)' // Force HW accel without blur
                    }}
                />
            </div>
        );
    }

    // 4. Pastel Soft — CSS transform animations
    if (variant === 'pastel') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#FDF2F8]" style={{ contain: 'strict' }}>
                <VisualizerStyleTag />
                <div
                    className="absolute top-[20%] left-[20%] w-32 h-32 bg-[#fff1f2] rounded-full blur-xl"
                    style={{ animation: 'floatUp 6s ease-in-out infinite', willChange: 'transform' }}
                />
                <div
                    className="absolute bottom-[30%] right-[20%] w-48 h-48 bg-pink-200/40 rounded-full blur-2xl opacity-60"
                    style={{ animation: 'floatDown 8s ease-in-out infinite', willChange: 'transform' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#ecfccb]/20 to-[#cffafe]/20 mix-blend-multiply" />
            </div>
        );
    }

    // 5. Dark Elegant — CSS opacity animation (no scale, no JS)
    if (variant === 'dark-elegant') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#121212]" style={{ contain: 'strict' }}>
                <VisualizerStyleTag />
                <div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black opacity-60"
                    style={{ animation: 'pulseO 15s linear infinite', willChange: 'opacity' }}
                />
            </div>
        );
    }

    // 6. Industrial (Concrete) — fully static, no animations needed
    if (variant === 'industrial') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#262626]" style={{ contain: 'strict' }}>
                <div className="absolute inset-0 opacity-10" style={{ filter: 'contrast(150%)', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E")' }} />
                <div className="absolute top-10 left-10 w-20 h-20 border-l border-t border-white/10" />
                <div className="absolute bottom-10 right-10 w-20 h-20 border-r border-b border-white/10" />
            </div>
        );
    }

    // 7. Retro-Futurist — static sun + gradient, no animation (already looks great)
    if (variant === 'retro-futurist') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#240046] to-[#10002b]" style={{ contain: 'strict' }}>
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-t from-[#ff9e00] to-[#ff006e] blur-md opacity-80" />
                <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent z-10" />
            </div>
        );
    }

    // 8. Nature Organic — CSS translation animation
    if (variant === 'nature') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#F1F8E9]" style={{ contain: 'strict' }}>
                <VisualizerStyleTag />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-5" />
                <div
                    className="absolute -right-20 -bottom-20 text-[#33691E]/5 text-[20rem]"
                    style={{ animation: 'floatUp 10s ease-in-out infinite', willChange: 'transform' }}
                >
                    🌿
                </div>
            </div>
        );
    }

    // 9. High-Contrast — static, no animation
    if (variant === 'high-contrast') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-white" style={{ contain: 'strict' }}>
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
                <div className="absolute right-0 top-0 w-1/2 h-full bg-black skew-x-12 opacity-5" />
            </div>
        );
    }

    // 10. Royal Gold — CSS keyframe animations with static pre-calc positions (no Math.random on render)
    if (variant === 'royal-gold') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#2A0A10]" style={{ contain: 'strict' }}>
                <VisualizerStyleTag />
                {ROYAL_GOLD_PARTICLES.map((p, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#FFD700] rounded-full shadow-[0_0_5px_#FFD700]"
                        style={{
                            left: p.left,
                            top: p.top,
                            animation: `goldFloat ${p.dur}s ease-in-out ${p.del}s infinite`,
                            willChange: 'transform, opacity',
                        }}
                    />
                ))}
            </div>
        );
    }

    return null;
};

export default React.memo(ModernVisualizer);
