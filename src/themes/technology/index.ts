import { Theme } from '../../types';

// 1. Neural Grid (Chamfered/Cut Corners)
export const technologyNeuralTheme: Theme = {
    id: 'technology-neural',
    name: 'Neural Grid',
    backgroundClass: 'bg-[#0F0F1A]',
    solidColor: '#0F0F1A',
    buttonClass: 'bg-[#0F0F1A]/80 backdrop-blur-md text-cyan-400 border border-cyan-500/30 rounded-none [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all font-mono px-6',
    cardClass: 'bg-[#0F0F1A]/90 backdrop-blur-md border border-cyan-500/20 [clip-path:polygon(20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px)] text-cyan-50',
    textClass: 'text-cyan-50 font-mono tracking-wide',
    avatarBorder: 'border-2 border-cyan-500 [clip-path:polygon(30%_0,70%_0,100%_30%,100%_70%,70%_100%,30%_100%,0_70%,0_30%)]',
    isPro: true,
    buttonHex: '#0F0F1A',
    textHex: '#ecfeff',
    category: 'technology',
    fontFamily: "'Share Tech Mono', monospace"
};

// 2. Brutalist Tech (Hard 3D Shadow + Outline)
export const technologyBrutalistTheme: Theme = {
    id: 'technology-brutalist',
    name: 'Brutalist Tech',
    backgroundClass: 'bg-[#f0f0f0]',
    solidColor: '#f0f0f0',
    buttonClass: 'bg-white text-black border-2 border-[#1a1a1a] rounded-none shadow-[0_6px_0_0_rgba(26,26,26,1)] hover:shadow-[0_2px_0_0_rgba(26,26,26,1)] hover:translate-y-[4px] transition-all font-bold uppercase tracking-wider px-6',
    cardClass: 'bg-white border-2 border-[#1a1a1a] rounded-none shadow-[0_10px_0_0_rgba(26,26,26,1)] text-black',
    textClass: 'text-black font-bold uppercase tracking-tighter',
    avatarBorder: 'border-4 border-[#1a1a1a] rounded-none',
    isPro: true,
    buttonHex: '#ffffff',
    textHex: '#000000',
    category: 'technology',
    fontFamily: "'Space Grotesk', sans-serif"
};

// 3. Cyberpunk Corporate (Skewed/Parallelogram)
export const technologyCyberpunkTheme: Theme = {
    id: 'technology-cyberpunk',
    name: 'Cyberpunk Corp',
    backgroundClass: 'bg-black',
    solidColor: '#000000',
    buttonClass: 'bg-black/80 text-purple-400 border-l-[6px] border-r-2 border-y-0 border-purple-500/50 skew-x-[-12deg] hover:bg-purple-900/20 hover:border-purple-400 hover:shadow-[0_0_20px_#a855f7] hover:skew-x-[-6deg] transition-all font-light tracking-widest uppercase hover:text-white',
    cardClass: 'bg-black/90 border-l-[4px] border-purple-500/50 skew-x-[-2deg] text-purple-100',
    textClass: 'text-purple-100 font-light tracking-widest uppercase shadow-purple-500 skew-x-[-2deg]',
    avatarBorder: 'border-2 border-purple-500 rounded-none skew-x-[-10deg]',
    isPro: true,
    buttonHex: '#000000',
    textHex: '#d8b4fe',
    category: 'technology',
    fontFamily: "'Rajdhani', sans-serif"
};

// 4. Minimal SaaS (Inset Shadow / Neumorphic feel)
export const technologySaasTheme: Theme = {
    id: 'technology-saas',
    name: 'Minimal SaaS',
    backgroundClass: 'bg-slate-50',
    solidColor: '#f8fafc',
    buttonClass: 'bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-slate-100 transition-all hover:-translate-y-1 font-medium',
    cardClass: 'bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm text-slate-600',
    textClass: 'text-slate-800 font-medium tracking-tight',
    avatarBorder: 'border-[6px] border-white shadow-xl rounded-full',
    isPro: true,
    buttonHex: '#ffffff',
    textHex: '#1e293b',
    category: 'technology',
    fontFamily: "'Inter', sans-serif"
};

// 5. Terminal Dev (Block + Left Indicator)
export const technologyTerminalTheme: Theme = {
    id: 'technology-terminal',
    name: 'Terminal Dev',
    backgroundClass: 'bg-[#0d0d0d]',
    solidColor: '#0d0d0d',
    buttonClass: 'bg-[#1a1a1a] text-green-500 hover:bg-[#222] rounded-r-md border-l-[6px] border-l-green-600 hover:border-l-green-400 border-y border-r border-[#333] text-left px-5 font-mono before:content-[">"] before:mr-3 before:text-green-600 transition-all font-bold',
    cardClass: 'bg-[#121212] border border-[#222] border-l-4 border-l-green-800/50 rounded-r-lg text-green-400 font-mono',
    textClass: 'text-green-500 font-mono tracking-tight',
    avatarBorder: 'border-2 border-green-800 rounded-md',
    isPro: true,
    buttonHex: '#1a1a1a',
    textHex: '#22c55e',
    category: 'technology',
    fontFamily: "'Fira Code', monospace"
};

// 6. Holographic Glass (Faceted Gem)
export const technologyHoloTheme: Theme = {
    id: 'technology-holo',
    name: 'Holographic',
    backgroundClass: 'bg-[#1c1c1e]',
    solidColor: '#1c1c1e',
    buttonClass: 'bg-white/5 backdrop-blur-2xl text-white border border-white/20 [clip-path:polygon(10px_0,calc(100%-10px)_0,100%_50%,calc(100%-10px)_100%,10px_100%,0_50%)] hover:bg-white/10 hover:border-white/40 transition-all shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] px-8',
    cardClass: 'bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] text-white',
    textClass: 'text-white font-normal tracking-wide',
    avatarBorder: 'border border-white/30 rounded-full',
    isPro: true,
    buttonHex: '#3f3f46',
    textHex: '#ffffff',
    category: 'technology',
    fontFamily: "'Outfit', sans-serif"
};

// 7. Matrix Code (Brackets)
export const technologyMatrixTheme: Theme = {
    id: 'technology-matrix',
    name: 'The Matrix',
    backgroundClass: 'bg-black',
    solidColor: '#000000',
    buttonClass: 'bg-transparent text-[#00FF41] border-x-[3px] border-[#00FF41] border-y-0 rounded-none hover:bg-[#00FF41]/10 hover:tracking-[0.2em] transition-all duration-300 font-mono uppercase font-bold relative before:content-["["] before:absolute before:left-2 before:opacity-0 hover:before:opacity-100 after:content-["]"] after:absolute after:right-2 after:opacity-0 hover:after:opacity-100',
    cardClass: 'bg-black/80 border border-[#003B00] rounded-none text-[#00FF41]',
    textClass: 'text-[#00FF41] font-mono shadow-[0_0_2px_#00FF41]',
    avatarBorder: 'border-2 border-dashed border-[#00FF41] p-1 rounded-full',
    isPro: true,
    buttonHex: '#000000',
    textHex: '#00FF41',
    category: 'technology',
    fontFamily: "'VT323', monospace"
};

// 8. AI Gradient (Floating Orb/Pill)
export const technologyAiTheme: Theme = {
    id: 'technology-ai',
    name: 'AI Gradient',
    backgroundClass: 'bg-[#111]',
    solidColor: '#111111',
    buttonClass: 'bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl text-white border border-white/10 rounded-full hover:scale-105 hover:border-white/30 transition-all duration-300 font-medium shadow-[0_4px_30px_rgba(0,0,0,0.1)]',
    cardClass: 'bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[32px] text-white',
    textClass: 'text-white font-medium tracking-normal',
    avatarBorder: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 p-[2px] rounded-full',
    isPro: true,
    buttonHex: '#171717',
    textHex: '#ffffff',
    category: 'technology',
    fontFamily: "'Satoshi', sans-serif"
};

// 9. Dark Corporate Premium (Underline / Minimal)
export const technologyDarkTheme: Theme = {
    id: 'technology-dark',
    name: 'Dark Premium',
    backgroundClass: 'bg-[#0a0a0a]',
    solidColor: '#0a0a0a',
    buttonClass: 'bg-transparent text-gray-300 border-b border-gray-700 hover:border-white hover:text-white rounded-none hover:pl-4 transition-all duration-300 font-light tracking-widest text-left px-0 py-4 h-auto',
    cardClass: 'bg-[#0a0a0a] border border-[#262626] rounded-none text-gray-400',
    textClass: 'text-gray-200 font-light tracking-wide',
    avatarBorder: 'border border-[#333] rounded-full grayscale opacity-80',
    isPro: true,
    buttonHex: '#0a0a0a',
    textHex: '#e5e5e5',
    category: 'technology',
    fontFamily: "'Inter', sans-serif"
};

// 10. Startup Launch (3D Push Button)
export const technologyStartupTheme: Theme = {
    id: 'technology-startup',
    name: 'Startup Launch',
    backgroundClass: 'bg-orange-50',
    solidColor: '#fff7ed',
    buttonClass: 'bg-white text-slate-900 border-2 border-b-[6px] border-slate-900 rounded-xl hover:translate-y-[2px] hover:border-b-[4px] active:translate-y-[4px] active:border-b-[2px] transition-all font-black text-lg tracking-tight',
    cardClass: 'bg-white border-2 border-slate-100 rounded-3xl shadow-lg text-slate-800',
    textClass: 'text-slate-900 font-black tracking-tight',
    avatarBorder: 'border-4 border-slate-900 rounded-full',
    isPro: true,
    buttonHex: '#ffffff',
    textHex: '#0f172a',
    category: 'technology',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
};

export const technologyThemes = [
    technologyNeuralTheme,
    technologyBrutalistTheme,
    technologyCyberpunkTheme,
    technologySaasTheme,
    technologyTerminalTheme,
    technologyHoloTheme,
    technologyMatrixTheme,
    technologyAiTheme,
    technologyDarkTheme,
    technologyStartupTheme
];
