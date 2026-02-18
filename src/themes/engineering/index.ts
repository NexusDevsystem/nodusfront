
import { Theme } from '../../types';
import EngineeringVisualizer from './EngineeringVisualizer';

// 1. Sky Crane 🏗️
export const engineeringCraneTheme: Theme = {
    id: 'engineering-crane',
    name: 'Sky Crane',
    backgroundClass: 'bg-sky-300', // Fallback
    solidColor: '#7dd3fc',
    buttonClass: 'bg-yellow-500 text-black hover:bg-yellow-400 rounded-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] px-6 border-2 border-black transition-all hover:-translate-y-0.5',
    cardClass: 'bg-white/90 backdrop-blur-sm border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] text-black',
    textClass: 'text-black font-bold tracking-tight',
    avatarBorder: 'border-4 border-yellow-500 rounded-full',
    isPro: true,
    buttonHex: '#eab308',
    category: 'engineering',
    fontFamily: "'Chakra Petch', sans-serif"
};

// 2. Blueprint Motion 📏
export const engineeringBlueprintTheme: Theme = {
    id: 'engineering-blueprint',
    name: 'Blueprint Motion',
    backgroundClass: 'bg-blue-800', // Fallback
    solidColor: '#1e40af',
    buttonClass: 'bg-transparent text-white hover:bg-white/10 rounded-none font-mono font-medium border-2 border-white/50 px-6 transition-all hover:border-white',
    cardClass: 'bg-blue-900/50 backdrop-blur-md border border-white/20 rounded-none shadow-none text-blue-100',
    textClass: 'text-white font-mono tracking-wide',
    avatarBorder: 'border-2 border-white dashed rounded-full',
    isPro: false,
    buttonHex: '#1e40af',
    category: 'engineering',
    fontFamily: "'Space Mono', monospace"
};

// 3. Circuit Flow 🔌
export const engineeringCircuitTheme: Theme = {
    id: 'engineering-circuit',
    name: 'Circuit Flow',
    backgroundClass: 'bg-emerald-950', // Fallback
    solidColor: '#022c22',
    buttonClass: 'bg-[#022c22] text-[#4ade80] hover:bg-[#064e3b] rounded-md font-mono font-bold border border-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.2)] px-6 transition-all hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]',
    cardClass: 'bg-[#064e3b]/80 backdrop-blur-sm border border-[#4ade80]/30 rounded-md text-[#4ade80]',
    textClass: 'text-[#4ade80] font-mono tracking-normal shadow-[0_0_5px_rgba(74,222,128,0.4)]',
    avatarBorder: 'border-2 border-[#4ade80] rounded-lg',
    isPro: true,
    buttonHex: '#022c22',
    textHex: '#4ade80',
    category: 'engineering',
    fontFamily: "'Share Tech Mono', monospace"
};

// 4. Industrial Gears ⚙️
export const engineeringGearsTheme: Theme = {
    id: 'engineering-gears',
    name: 'Industrial Gears',
    backgroundClass: 'bg-neutral-800', // Fallback
    solidColor: '#262626',
    buttonClass: 'bg-[#404040] text-gray-200 hover:bg-[#525252] rounded-none font-sans font-black uppercase tracking-wider border-4 border-[#171717] px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-all',
    cardClass: 'bg-[#262626] border-4 border-[#171717] rounded-none text-gray-300',
    textClass: 'text-gray-300 font-sans font-bold tracking-tight',
    avatarBorder: 'border-4 border-[#171717] rounded-full grayscale',
    isPro: true,
    buttonHex: '#404040',
    category: 'engineering',
    fontFamily: "'Oswald', sans-serif"
};

// 5. Neon Grid (Structural) 🌐
export const engineeringStructureTheme: Theme = {
    id: 'engineering-structure',
    name: 'Structure Grid',
    backgroundClass: 'bg-slate-900', // Fallback
    solidColor: '#0f172a',
    buttonClass: 'bg-transparent text-cyan-400 hover:bg-cyan-950/30 rounded-none font-sans font-light border border-cyan-500/50 px-8 transition-all hover:border-cyan-400 hover:shadow-[0_0_10px_cyan]',
    cardClass: 'bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-none text-cyan-100',
    textClass: 'text-cyan-400 font-light tracking-widest uppercase',
    avatarBorder: 'border border-cyan-500 rounded-none',
    isPro: false,
    buttonHex: '#0f172a',
    textHex: '#22d3ee',
    category: 'engineering',
    fontFamily: "'Rajdhani', sans-serif"
};

export const engineeringThemes = [
    engineeringCraneTheme,
    engineeringBlueprintTheme,
    engineeringCircuitTheme,
    engineeringGearsTheme,
    engineeringStructureTheme
];
