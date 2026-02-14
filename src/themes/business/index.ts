import { Theme } from '../../types';

// 1. Executive Blue 👔
export const executiveBlueTheme: Theme = {
    id: 'executive-blue',
    name: 'Executive Blue',
    backgroundClass: 'bg-slate-900',
    solidColor: '#0f172a',
    buttonClass: 'bg-white text-slate-900 hover:bg-slate-100 rounded-md font-medium shadow-sm px-6 border border-slate-200 transition-all hover:-translate-y-0.5',
    cardClass: 'bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-sm hover:bg-slate-800/70 transition-all text-white',
    textClass: 'text-white font-medium tracking-normal',
    avatarBorder: 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 rounded-full',
    isPro: true,
    buttonHex: '#ffffff',
    category: 'solid',
    fontFamily: "'Inter', sans-serif"
};

// 2. Onyx Elite 💎
export const onyxEliteTheme: Theme = {
    id: 'onyx-elite',
    name: 'Onyx Elite',
    backgroundClass: 'bg-black',
    solidColor: '#000000',
    buttonClass: 'bg-gradient-to-r from-[#C5A059] to-[#D4AF37] text-black hover:brightness-110 rounded-sm font-serif font-bold shadow-[0_2px_15px_-3px_rgba(197,160,89,0.3)] px-8 border border-[#E5C079] transition-all',
    cardClass: 'bg-neutral-950/80 backdrop-blur-md border border-[#C5A059]/30 rounded-sm shadow-md hover:border-[#C5A059]/50 transition-all text-[#E5E5E5]',
    textClass: 'text-[#E5E5E5] font-serif tracking-wide',
    avatarBorder: 'border-2 border-[#C5A059] shadow-[0_0_15px_-4px_rgba(197,160,89,0.4)] rounded-full',
    isPro: true,
    buttonHex: '#C5A059',
    category: 'solid',
    fontFamily: "'Playfair Display', serif"
};

// 3. Tech Minimal 💻
export const techMinimalTheme: Theme = {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    backgroundClass: 'bg-slate-50',
    solidColor: '#f8fafc',
    buttonClass: 'bg-transparent text-slate-900 hover:bg-slate-100 rounded-none font-mono font-semibold shadow-none px-6 border-2 border-slate-900 hover:border-blue-600 hover:text-blue-600 transition-colors',
    cardClass: 'bg-white border border-slate-200 rounded-none shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all text-slate-800',
    textClass: 'text-slate-900 font-mono tracking-tight',
    avatarBorder: 'border-2 border-slate-900 rounded-none',
    isPro: true,
    buttonHex: '#0f172a',
    category: 'solid',
    fontFamily: "'Space Grotesk', sans-serif"
};

// 4. Nature Corp 🌿
export const natureCorpTheme: Theme = {
    id: 'nature-corp',
    name: 'Nature Corp',
    backgroundClass: 'bg-[#F5F5DC]', // Bege/Areia
    solidColor: '#F5F5DC',
    buttonClass: 'bg-[#4A5D23] text-[#F5F5DC] hover:bg-[#3B4A1C] rounded-xl font-medium shadow-md px-6 border-none transition-transform hover:scale-[1.02]',
    cardClass: 'bg-[#E8E8D0] border border-[#4A5D23]/10 rounded-xl shadow-sm hover:bg-[#E0E0C0] transition-all text-[#2C3815]',
    textClass: 'text-[#2C3815] font-medium tracking-normal',
    avatarBorder: 'border-4 border-[#4A5D23] rounded-full',
    isPro: true,
    buttonHex: '#4A5D23',
    category: 'solid',
    fontFamily: "'DM Sans', sans-serif"
};

// 5. Crimson Strategy ♟️
export const crimsonStrategyTheme: Theme = {
    id: 'crimson-strategy',
    name: 'Crimson Strategy',
    backgroundClass: 'bg-[#450a0a]',
    solidColor: '#450a0a',
    buttonClass: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] rounded-sm font-bold uppercase tracking-wider shadow-lg px-8 border border-red-500 transition-all',
    cardClass: 'bg-black/40 backdrop-blur-sm border-l-4 border-red-600 rounded-r-sm shadow-md hover:bg-black/60 transition-all text-gray-100',
    textClass: 'text-white font-bold uppercase tracking-wide',
    avatarBorder: 'border-2 border-red-600 rounded-sm',
    isPro: true,
    buttonHex: '#dc2626',
    category: 'solid',
    fontFamily: "'Oswald', sans-serif"
};

export const businessThemes = [
    executiveBlueTheme,
    onyxEliteTheme,
    techMinimalTheme,
    natureCorpTheme,
    crimsonStrategyTheme
];
