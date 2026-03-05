import React from "react";

const MUSIC_STYLES = `
@keyframes spinLeft { 100% { transform: rotate(-360deg); } }
@keyframes spinRight { 100% { transform: rotate(360deg); } }
@keyframes panLeft { 0%, 100% { transform: translateX(-50%); } 50% { transform: translateX(0%); } }
@keyframes pulseBright { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.05); } }
@keyframes swayScale { 0%, 100% { transform: skewX(0deg) scaleY(1); } 25% { transform: skewX(5deg) scaleY(1.1); } 75% { transform: skewX(-5deg) scaleY(1); } }
@keyframes floatNote { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } }
@keyframes eqBar { 0%, 100% { height: 5%; } 25% { height: 60%; } 50% { height: 20%; } 75% { height: 90%; } }
`;

const StyleTag = React.memo(() => <style>{MUSIC_STYLES}</style>);

interface MusicVisualizerProps {
  variant:
    | "sinfonia-mecanica"
    | "fita-analogica"
    | "sopro-de-ouro"
    | "batida-botanica"
    | "grave-urbano"
    | "hino-de-vitral"
    | "jardim-zen-sonoro"
    | "harpa-cosmica"
    | "horizonte-neon"
    | "orquestra-origami";
}

const MusicVisualizer: React.FC<MusicVisualizerProps> = ({ variant }) => {
  switch (variant) {
    case "sinfonia-mecanica":
      return (
        <div
          className="absolute inset-0 bg-[#1a0f0a] overflow-hidden"
          style={{ contain: "strict" }}
        >
          <StyleTag />
          <div className="absolute inset-0 opacity-20 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute border-2 border-[#b87333]/40 rounded-full flex items-center justify-center"
                style={{
                  width: 100 + i * 80,
                  height: 100 + i * 80,
                  animation:
                    (i % 2 === 0 ? "spinRight" : "spinLeft") +
                    " " +
                    (10 + i * 5) +
                    "s linear infinite",
                  willChange: "transform",
                }}
              >
                <div className="absolute top-0 w-4 h-4 bg-[#b87333] rounded-sm transform rotate-45 -translate-y-1/2" />
                <div className="absolute bottom-0 w-4 h-4 bg-[#b87333] rounded-sm transform rotate-45 translate-y-1/2" />
              </div>
            ))}
          </div>
          {/* Clockwork center */}
          <div
            className="absolute bottom-[-100px] right-[-100px] opacity-10 scale-150 origin-center"
            style={{
              animation: "spinRight 60s linear infinite",
              willChange: "transform",
            }}
          >
            <svg width="400" height="400" viewBox="0 0 100 100" fill="#b87333">
              <path d="M50 0 L55 10 L65 10 L70 0 L80 5 L75 15 L80 25 L90 20 L95 30 L85 35 L85 45 L95 50 L90 60 L80 55 L75 65 L80 75 L70 80 L65 70 L55 70 L50 80 L40 75 L45 65 L40 55 L30 60 L25 50 L35 45 L35 35 L25 30 L30 20 L40 25 L45 15 L40 5 Z" />
            </svg>
          </div>
        </div>
      );

    case "fita-analogica":
      return (
        <div
          className="absolute inset-0 bg-[#121212] overflow-hidden flex items-center justify-center"
          style={{ contain: "strict" }}
        >
          <StyleTag />
          <div className="relative w-full h-full">
            {/* Tape reels */}
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2">
              <div
                className="w-64 h-64 border-8 border-neutral-800 rounded-full flex items-center justify-center opacity-30"
                style={{
                  animation: "spinRight 10s linear infinite",
                  willChange: "transform",
                }}
              >
                <div className="w-1 h-full bg-neutral-700 pointer-events-none" />
                <div className="w-full h-1 bg-neutral-700 absolute pointer-events-none" />
              </div>
            </div>
            <div className="absolute right-1/4 top-1/2 -translate-y-1/2">
              <div
                className="w-64 h-64 border-8 border-neutral-800 rounded-full flex items-center justify-center opacity-30"
                style={{
                  animation: "spinRight 10s linear infinite",
                  willChange: "transform",
                }}
              >
                <div className="w-1 h-full bg-neutral-700 pointer-events-none" />
                <div className="w-full h-1 bg-neutral-700 absolute pointer-events-none" />
              </div>
            </div>
            {/* Tape line */}
            <div
              className="absolute top-1/2 left-0 w-[200%] h-12 bg-neutral-900 border-y border-neutral-700 -translate-y-1/2 z-0 opacity-20 pointer-events-none"
              style={{
                animation: "panLeft 5s linear infinite",
                willChange: "transform",
              }}
            />
          </div>
        </div>
      );

    case "sopro-de-ouro":
      return (
        <div
          className="absolute inset-0 bg-black overflow-hidden"
          style={{ contain: "strict" }}
        >
          <StyleTag />
          <div className="absolute inset-0 opacity-10 grid grid-cols-4 gap-4 p-8">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="border-t border-r border-[#ffd700] rounded-tr-[50px] aspect-square"
                style={{
                  animation: `pulseBright 5s ease-in-out ${i * 0.2}s infinite`,
                  willChange: "opacity, transform",
                }}
              />
            ))}
          </div>
          {/* Art Deco centerpiece */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
            <svg
              width="400"
              height="400"
              viewBox="0 0 100 100"
              className="fill-none stroke-[#ffd700] stroke-[0.5]"
            >
              {[...Array(10)].map((_, i) => (
                <ellipse
                  key={i}
                  cx="50"
                  cy="50"
                  rx={10 + i * 4}
                  ry={25 + i * 6}
                  transform={`rotate(${36 * i} 50 50)`}
                />
              ))}
            </svg>
          </div>
        </div>
      );

    case "batida-botanica":
      return (
        <div
          className="absolute inset-0 bg-[#061c10] overflow-hidden"
          style={{ contain: "strict" }}
        >
          <StyleTag />
          <div className="absolute inset-0 flex justify-around items-end opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-[#10b981] relative origin-bottom"
                style={{
                  height: "70%",
                  animation: `swayScale 4s ease-in-out ${i}s infinite`,
                  willChange: "transform",
                }}
              >
                {[...Array(15)].map((_, j) => (
                  <div
                    key={j}
                    className="absolute w-4 h-2 bg-[#10b981] rounded-[50%_0_50%_0]"
                    style={{
                      top: `${j * 6}%`,
                      left: j % 2 === 0 ? "-14px" : "4px",
                      animation: `floatNote 3s ease-in-out ${j * 0.1}s infinite`,
                      willChange: "transform",
                    }}
                  >
                    <span className="absolute -top-2 left-0 text-[10px] opacity-40">
                      ♫
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    case "grave-urbano":
      return (
        <div
          className="absolute inset-0 bg-[#1c1917] overflow-hidden"
          style={{ contain: "strict" }}
        >
          <StyleTag />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall-2.png')] pointer-events-none" />
          </div>
          {/* Visualizer bars like a boombox EQ */}
          <div className="absolute bottom-0 w-full h-full flex items-end justify-center px-8 pb-32 space-x-2">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-[#f97316] opacity-30 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                style={{
                  animation: `eqBar ${0.5 + (i % 5) * 0.1}s ease-in-out ${i * 0.05}s infinite alternate`,
                  willChange: "height",
                }}
              />
            ))}
          </div>
        </div>
      );

    case "hino-de-vitral":
      return (
        <div
          className="absolute inset-0 bg-[#0f172a] overflow-hidden"
          style={{ contain: "strict" }}
        >
          <StyleTag />
          <div className="absolute inset-0 opacity-30 grid grid-cols-6 grid-rows-8 gap-1 p-2">
            {[...Array(48)].map((_, i) => (
              <div
                key={i}
                className="w-full h-full flex items-center justify-center"
                style={{
                  backgroundColor: ["#6366f1", "#a855f7", "#ec4899", "#3b82f6"][
                    i % 4
                  ],
                  clipPath:
                    i % 2 === 0
                      ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                      : "polygon(0% 0%, 100% 0%, 50% 100%)",
                  animation: `pulseBright 4s ease-in-out ${i * 0.1}s infinite`,
                  willChange: "opacity",
                }}
              >
                <div className="text-[10px] text-white opacity-20">
                  {["∮", "♮", "♯", "♭"][i % 4]}
                </div>
              </div>
            ))}
          </div>
          {/* central ray */}
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none"
            style={{
              animation: "pulseBright 5s ease-in-out infinite alternate",
              willChange: "opacity",
            }}
          />
        </div>
      );

    case "jardim-zen-sonoro":
      return (
        <div
          className="absolute inset-0 bg-[#e7e5e4] overflow-hidden"
          style={{ contain: "strict" }}
        >
          {/* Simplified to static lines, animating SVG paths requires JS or heavy morphing */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg width="100%" height="100%">
              {[...Array(20)].map((_, i) => (
                <path
                  key={i}
                  d={`M 0 ${i * 50} Q 200 ${i * 50 + 20} 400 ${i * 50} T 800 ${i * 50} T 1200 ${i * 50}`}
                  stroke="#44403c"
                  strokeWidth="1"
                  fill="none"
                />
              ))}
            </svg>
          </div>
        </div>
      );

    case "harpa-cosmica":
      return (
        <div
          className="absolute inset-0 bg-[#020617] overflow-hidden"
          style={{ contain: "strict" }}
        >
          <StyleTag />
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[120%] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                style={{
                  top: `${10 + i * 6}%`,
                  rotate: i % 2 === 0 ? "-5deg" : "5deg",
                  animation: `pulseBright ${4 + i * 0.2}s ease-in-out infinite`,
                  willChange: "opacity, transform",
                }}
              />
            ))}
          </div>
          {/* Pulsing stars */}
          {[...Array(40)].map((_, i) => (
            <div
              key={`s-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulseBright ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 5}s infinite`,
                willChange: "opacity, transform",
              }}
            />
          ))}
        </div>
      );

    case "horizonte-neon":
      return (
        <div
          className="absolute inset-0 bg-black overflow-hidden"
          style={{ contain: "strict" }}
        >
          <StyleTag />
          {/* Grid */}
          <div
            className="absolute bottom-0 w-full h-1/2 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(transparent, #f472b6 1px, transparent 1px), linear-gradient(90deg, transparent, #f472b6 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
              transform: "perspective(500px) rotateX(60deg) scale(2)",
              transformOrigin: "top",
            }}
          />
          {/* Sun (Disk) */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-[#f472b6] to-transparent rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(244,114,182,0.4)] pointer-events-none"
            style={{
              animation: "pulseBright 5s ease-in-out infinite",
              willChange: "transform, opacity",
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-black/40"
                style={{ top: `${15 + i * 15}%` }}
              />
            ))}
          </div>
        </div>
      );

    case "orquestra-origami":
      return (
        <div
          className="absolute inset-0 bg-[#f5f5f4] overflow-hidden"
          style={{ contain: "strict" }}
        >
          <StyleTag />
          <div className="absolute inset-0 opacity-10 flex flex-wrap gap-12 p-12">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-24 h-32 border border-[#44403c] relative flex items-center justify-center"
                style={{
                  animation: `swayScale 6s ease-in-out ${i * 0.5}s infinite`,
                  transformOrigin: "bottom",
                  willChange: "transform",
                }}
              >
                <div className="absolute inset-0 border-r border-[#44403c]/30 transform skew-12 origin-left" />
                <span className="absolute bottom-2 right-2 text-xs">♭</span>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="absolute inset-0 bg-neutral-900" />;
  }
};

export default MusicVisualizer;
