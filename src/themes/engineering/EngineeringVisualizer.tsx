import React from 'react';

const ENG_STYLES = `
@keyframes rotate360 {
  from { transform: rotate(0deg) translateZ(0); }
  to { transform: rotate(360deg) translateZ(0); }
}
@keyframes rotate360Rev {
  from { transform: rotate(0deg) translateZ(0); }
  to { transform: rotate(-360deg) translateZ(0); }
}
@keyframes cloudFloatLeft {
  from { transform: translateX(0vw) translateZ(0); }
  to { transform: translateX(140vw) translateZ(0); }
}
@keyframes jibPivot {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
@keyframes trolleyMove {
  0%, 100% { transform: translateX(-20px); }
  50% { transform: translateX(-180px); }
}
@keyframes cableStretch {
  0%, 100% { transform: scaleY(0.529); }
  50% { transform: scaleY(1); }
}
@keyframes hookDropTransform {
  0%, 100% { transform: translate(-10px, 120px); }
  50% { transform: translate(-10px, 200px); }
}
@keyframes blueprintScroll {
  from { background-position: 0px 0px; }
  to { background-position: 100px 100px; }
}
@keyframes flashSymbol1 {
  0%, 100% { opacity: 0; transform: scale(0.8) translateZ(0); }
  50% { opacity: 0.5; transform: scale(1) translateZ(0); }
}
@keyframes flashSymbol2 {
  0%, 100% { opacity: 0; transform: scale(0.9) translateZ(0); }
  50% { opacity: 0.4; transform: scale(1.1) translateZ(0); }
}
@keyframes circuitH {
  from { transform: translateX(0vw); }
  to { transform: translateX(120vw); }
}
@keyframes circuitV {
  from { transform: translateY(0vh); }
  to { transform: translateY(120vh); }
}
@keyframes neonGridScroll {
  from { background-position: 0px 0px; }
  to { background-position: 0px 50px; }
}
`;

const StyleTag = React.memo(() => <style>{ENG_STYLES}</style>);

interface EngineeringVisualizerProps {
    variant: 'crane-sky' | 'blueprint-motion' | 'circuit-flow' | 'industrial-gears' | 'neon-grid';
}

const EngineeringVisualizer: React.FC<EngineeringVisualizerProps> = ({ variant }) => {

    // 1. Sky Crane 🏗️
    if (variant === 'crane-sky') {
        const cloudPath = "M25 10 C 25 10, 15 10, 10 20 C 5 30, 15 40, 25 40 C 35 40, 45 30, 40 20 C 40 20, 35 10, 25 10 Z";

        return (
            <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#38bdf8] to-[#bae6fd]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Sun */}
                <div
                    className="absolute top-10 right-10 w-24 h-24 bg-yellow-400 rounded-full blur-xl opacity-80 pointer-events-none"
                    style={{ animation: 'rotate360 120s linear infinite', willChange: 'transform' }}
                />
                <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full opacity-90 shadow-lg pointer-events-none" />

                {/* Animated Clouds - SVG for better shape */}
                {[
                    { top: '10%', scale: 1.5, opacity: 0.6, duration: 60, delay: 0 },
                    { top: '25%', scale: 1.0, opacity: 0.4, duration: 45, delay: 10 },
                    { top: '15%', scale: 0.8, opacity: 0.3, duration: 70, delay: 20 },
                    { top: '5%', scale: 1.2, opacity: 0.5, duration: 55, delay: -15 }
                ].map((cloud, i) => (
                    <div
                        key={i}
                        className="absolute text-white pointer-events-none"
                        style={{
                            top: cloud.top,
                            left: '-20vw',
                            width: 100 * cloud.scale,
                            opacity: cloud.opacity,
                            filter: 'blur(1px)', // Minor soft edge
                            animation: `cloudFloatLeft ${cloud.duration}s linear ${cloud.delay}s infinite`,
                            willChange: 'transform'
                        }}
                    >
                        <svg viewBox="0 0 50 50">
                            <path d={cloudPath} fill="currentColor" />
                        </svg>
                    </div>
                ))}

                {/* Detailed Tower Crane SVG Construction */}
                <div className="absolute bottom-0 right-10 w-[300px] h-[500px] pointer-events-none origin-bottom-right">
                    <svg viewBox="0 0 300 500" className="w-full h-full drop-shadow-lg">
                        <defs>
                            <pattern id="trussPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M0 20 L20 0 M0 0 L20 20" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
                                <rect width="20" height="20" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
                            </pattern>
                            <linearGradient id="craneYellow" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#eab308" />
                                <stop offset="50%" stopColor="#facc15" />
                                <stop offset="100%" stopColor="#ca8a04" />
                            </linearGradient>
                        </defs>

                        {/* Mast (Vertical Tower) */}
                        <g transform="translate(260, 50)">
                            <rect x="0" y="0" width="30" height="450" fill="url(#craneYellow)" stroke="#a16207" strokeWidth="1" />
                            <rect x="0" y="0" width="30" height="450" fill="url(#trussPattern)" />
                        </g>

                        {/* Jib (Horizontal Arm) - Animated Group - Raised */}
                        <g
                            style={{ 
                                animation: 'jibPivot 15s ease-in-out infinite', 
                                transformOrigin: '275px 60px',
                                willChange: 'transform'
                            }}
                        >
                            {/* Counter Jib (Back part) */}
                            <g transform="translate(180, 50)">
                                <rect x="0" y="0" width="80" height="20" fill="#a16207" />
                                <rect x="10" y="-15" width="20" height="15" fill="#525252" />
                                <rect x="35" y="-15" width="20" height="15" fill="#525252" />
                                <path d="M0 0 L80 0 L20 -40 Z" fill="none" stroke="#713f12" strokeWidth="2" />
                            </g>

                            {/* Main Jib (Front Arm) */}
                            <g transform="translate(290, 50)">
                                <path d="M0 0 L-250 0 L-250 20 L0 20 Z" fill="url(#craneYellow)" stroke="#a16207" strokeWidth="1" transform="scale(-1, 1)" />
                                <rect x="-240" y="0" width="240" height="20" fill="url(#craneYellow)" stroke="#a16207" />
                                <rect x="-240" y="0" width="240" height="20" fill="url(#trussPattern)" />

                                {/* Trolley (Carriage that moves) */}
                                <g
                                    style={{ animation: 'trolleyMove 20s ease-in-out infinite', willChange: 'transform' }}
                                >
                                    <rect x="-20" y="20" width="20" height="10" fill="#4b5563" />

                                    {/* Cable Down - ScaleY to extend without React ticks */}
                                    <rect 
                                        x="-11" y="30" width="2" height="170" fill="#1f2937" 
                                        style={{ animation: 'cableStretch 10s ease-in-out infinite', transformOrigin: 'top center', willChange: 'transform' }}
                                    />

                                    {/* Hook Block */}
                                    <g
                                        style={{ animation: 'hookDropTransform 10s ease-in-out infinite', willChange: 'transform' }}
                                    >
                                        <circle cx="0" cy="0" r="5" fill="#eab308" stroke="#000" />
                                        <path d="M-3 5 Q0 12 3 5" fill="none" stroke="#000" strokeWidth="2" />
                                    </g>
                                </g>
                            </g>

                            {/* Operator Cab */}
                            <g transform="translate(250, 30)">
                                <rect x="0" y="20" width="25" height="30" fill="#eab308" stroke="#a16207" />
                                <rect x="5" y="25" width="15" height="15" fill="#bae6fd" stroke="#7dd3fc" />
                            </g>

                            {/* Tower Top (Pointy bit) */}
                            <g transform="translate(275, 0)">
                                <polygon points="0,0 -15,50 15,50" fill="#ca8a04" />
                                <line x1="0" y1="0" x2="-120" y2="50" stroke="#4b5563" strokeWidth="1.5" />
                                <line x1="0" y1="0" x2="60" y2="50" stroke="#4b5563" strokeWidth="1.5" />
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
        );
    }

    // 2. Blueprint Motion 📏
    if (variant === 'blueprint-motion') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#1e40af]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Scrolling Technical Lines */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ 
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)',
                        animation: 'blueprintScroll 20s linear infinite',
                        willChange: 'background-position'
                    }}
                />

                {/* Floating Symbols */}
                <div
                    className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-white/20 rounded-full flex items-center justify-center text-white/20 font-mono text-xs pointer-events-none"
                    style={{ animation: 'flashSymbol1 8s infinite', willChange: 'opacity, transform' }}
                >
                    SECTION A-A
                </div>
                <div
                    className="absolute bottom-1/3 right-1/4 w-40 h-20 border border-white/20 flex items-center justify-center text-white/20 font-mono text-xs pointer-events-none"
                    style={{ animation: 'flashSymbol2 10s infinite 2s', willChange: 'opacity, transform' }}
                >
                    DETAIL VIEW
                </div>
            </div>
        );
    }

    // 3. Circuit Flow 🔌
    if (variant === 'circuit-flow') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#022c22]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* PCB Traces - Static SVG Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80h-80z' fill='none' stroke='%234ade80' stroke-width='2'/%3E%3Ccircles cx='20' cy='20' r='2' fill='%234ade80'/%3E%3C/svg%3E")`,
                    backgroundSize: '100px 100px'
                }} />

                {/* Flowing Electrons */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-[#4ade80] rounded-full shadow-[0_0_8px_#4ade80] pointer-events-none"
                        style={{ 
                            top: `${15 + i * 12}%`, 
                            left: `-5vw`,
                            animation: `circuitH ${Math.random() * 3 + 2}s linear ${Math.random() * 5}s infinite`,
                            willChange: 'transform'
                        }}
                    />
                ))}

                {/* Vertical Flows */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={`v-${i}`}
                        className="absolute w-1.5 h-1.5 bg-[#4ade80] rounded-full shadow-[0_0_8px_#4ade80] pointer-events-none"
                        style={{ 
                            left: `${20 + i * 18}%`, 
                            top: `-5vh`,
                            animation: `circuitV ${Math.random() * 4 + 3}s linear ${Math.random() * 5}s infinite`,
                            willChange: 'transform'
                        }}
                    />
                ))}
            </div>
        );
    }

    // 4. Industrial Gears ⚙️
    if (variant === 'industrial-gears') {
        const Gear = ({ size, speed, clockwise, position }: any) => (
            <div
                className={`absolute text-gray-700/20 ${position} pointer-events-none`}
                style={{ 
                    fontSize: size,
                    animation: `${clockwise ? 'rotate360' : 'rotate360Rev'} ${speed}s linear infinite`,
                    willChange: 'transform'
                }}
            >
                ⚙️
            </div>
        );

        return (
            <div className="absolute inset-0 overflow-hidden bg-[#404040]" style={{ contain: 'strict' }}>
                <StyleTag />
                {/* Concrete Texture */}
                <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")' }} />

                <Gear size="300px" speed={20} clockwise={true} position="-top-20 -left-20" />
                <Gear size="200px" speed={15} clockwise={false} position="top-[30%] -right-10" />
                <Gear size="400px" speed={40} clockwise={true} position="-bottom-40 left-[20%]" />
            </div>
        );
    }

    // 5. Neon Grid (Structural) 🌐
    if (variant === 'neon-grid') {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#0f172a] perspective-origin-center" style={{ perspective: '800px', contain: 'strict' }}>
                <StyleTag />
                <div
                    className="absolute inset-0 w-[200%] h-[200%] -left-[50%] -top-[50%] pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        transform: 'rotateX(60deg)',
                        animation: 'neonGridScroll 2s linear infinite',
                        willChange: 'background-position'
                    }}
                />

                {/* Glowing Nodes */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent pointer-events-none" />
            </div>
        );
    }

    return null;
};

export default EngineeringVisualizer;
