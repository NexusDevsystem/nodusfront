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
    textHex: '#ffffff',
    buttonHex: '#ffffff',
    category: 'business',
    fontFamily: "'Inter', sans-serif"
};

// 2. Onyx Elite 💎
export const onyxEliteTheme: Theme = {
    id: 'onyx-elite',
    name: 'Onyx Elite',
    backgroundClass: 'bg-black',
    solidColor: '#000000',
    buttonClass: 'bg-gradient-to-r from-[#C5A059] to-[#D4AF37] text-black hover:brightness-110 rounded-sm font-serif font-bold shadow-[0_2px_15px_-3px_rgba(197,160,89,0.3)] px-8 border border-[#E5C079] transition-all',
    cardClass: 'bg-neutral-950/80 backdrop-blur-md border border-[#C5A059]/30 rounded-sm shadow-md hover:border-[#C5A059]/50 transition-all text-white',
    textClass: 'text-white font-serif tracking-wide',
    avatarBorder: 'border-2 border-[#C5A059] shadow-[0_0_15px_-4px_rgba(197,160,89,0.4)] rounded-full',
    textHex: '#ffffff',
    isPro: true,
    buttonHex: '#C5A059',
    category: 'business',
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
    avatarBorder: 'border-2 border-slate-900 rounded-full',
    isPro: true,
    buttonHex: '#0f172a',
    category: 'business',
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
    category: 'business',
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
    avatarBorder: 'border-2 border-red-600 rounded-full',
    textHex: '#ffffff',
    isPro: true,
    buttonHex: '#dc2626',
    category: 'business',
    fontFamily: "'Oswald', sans-serif"
};

// 6. Nordic Trust 🏔️
export const nordicTrustTheme: Theme = {
    id: 'nordic-trust',
    name: 'Nordic Trust',
    backgroundClass: 'bg-white',
    solidColor: '#ffffff',
    buttonClass: 'bg-[#334155] text-white hover:bg-[#475569] rounded-lg font-medium shadow-sm px-6 border-none transition-all hover:-translate-y-0.5',
    cardClass: 'bg-slate-50 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all text-slate-600',
    textClass: 'text-slate-600 font-medium tracking-tight',
    avatarBorder: 'ring-4 ring-slate-100 rounded-full',
    isPro: true,
    buttonHex: '#334155',
    category: 'business',
    fontFamily: "'Inter', sans-serif"
};

// 7. Global Finance 🌍
export const globalFinanceTheme: Theme = {
    id: 'global-finance',
    name: 'Global Finance',
    backgroundClass: 'bg-[#064e3b]', // Forest Green
    solidColor: '#064e3b',
    buttonClass: 'bg-[#D4AF37] text-[#064e3b] hover:bg-[#E5C079] rounded-sm font-serif font-bold shadow-lg px-8 border border-[#FCD34D] transition-transform hover:scale-105',
    cardClass: 'bg-[#065f46] border border-[#D4AF37]/20 rounded-sm shadow-md text-[#ecfdf5]',
    textClass: 'text-[#ecfdf5] font-serif tracking-wide',
    avatarBorder: 'border-2 border-[#D4AF37] rounded-full',
    isPro: true,
    buttonHex: '#D4AF37',
    textHex: '#ecfdf5',
    category: 'business',
    fontFamily: "'Playfair Display', serif"
};

// 8. Legal Authority ⚖️
export const legalAuthorityTheme: Theme = {
    id: 'legal-authority',
    name: 'Legal Authority',
    backgroundClass: 'bg-[#0f172a]', // Navy Blue
    solidColor: '#0f172a',
    buttonClass: 'bg-transparent text-white hover:bg-white/10 rounded-none font-serif font-medium border-2 border-[#94a3b8] px-8 transition-colors uppercase tracking-widest text-xs',
    cardClass: 'bg-[#1e293b] border-t-2 border-[#94a3b8] rounded-none shadow-none text-slate-300',
    textClass: 'text-slate-300 font-serif tracking-normal',
    avatarBorder: 'border-2 border-[#94a3b8] rounded-full',
    isPro: true,
    buttonHex: '#0f172a', // Keeps visible dark button context for logic
    textHex: '#ffffff',
    category: 'business',
    fontFamily: "'Merriweather', serif"
};

// 9. Tech Innovator (Corporate) 🚀
export const techInnovatorTheme: Theme = {
    id: 'tech-innovator',
    name: 'Tech Innovator',
    backgroundClass: 'bg-[#18181b]', // Zinc 950
    solidColor: '#18181b',
    buttonClass: 'bg-[#27272a] text-white hover:bg-[#3f3f46] rounded-xl font-sans font-bold border border-[#8b5cf6]/30 hover:border-[#8b5cf6] shadow-[0_0_15px_-5px_rgba(139,92,246,0.3)] transition-all',
    cardClass: 'bg-[#27272a]/50 backdrop-blur-md border border-white/10 rounded-xl text-zinc-300',
    textClass: 'text-zinc-300 font-sans tracking-tight',
    avatarBorder: 'ring-2 ring-[#8b5cf6] ring-offset-2 ring-offset-[#18181b] rounded-2xl',
    isPro: true,
    buttonHex: '#27272a',
    textHex: '#e4e4e7',
    category: 'business',
    fontFamily: "'Outfit', sans-serif"
};

// 10. Modern Agency 🎨
export const modernAgencyTheme: Theme = {
    id: 'modern-agency',
    name: 'Modern Agency',
    backgroundClass: 'bg-white',
    solidColor: '#ffffff',
    buttonClass: 'bg-black text-white hover:bg-[#ff4d00] rounded-full font-bold uppercase tracking-tighter px-8 border-none transition-colors duration-300',
    cardClass: 'bg-slate-50 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all text-black',
    textClass: 'text-black font-black uppercase tracking-tighter',
    avatarBorder: 'border-4 border-black rounded-full',
    isPro: true,
    buttonHex: '#000000',
    category: 'business',
    fontFamily: "'Syne', sans-serif"
};

export const businessThemes = [
    executiveBlueTheme,
    onyxEliteTheme,
    techMinimalTheme,
    natureCorpTheme,
    crimsonStrategyTheme,
    nordicTrustTheme,
    globalFinanceTheme,
    legalAuthorityTheme,
    techInnovatorTheme,
    modernAgencyTheme
];
