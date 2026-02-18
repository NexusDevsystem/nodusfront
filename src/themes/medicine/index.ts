
import { Theme } from '../../types';
import MedicineVisualizer from './MedicineVisualizer';

// 1. Clinical Clean 🧬
export const medicineClinicalTheme: Theme = {
    id: 'medicine-clinical',
    name: 'Clinical Clean',
    backgroundClass: 'bg-white', // Fallback
    solidColor: '#f8fafc',
    buttonClass: 'bg-[#0ea5e9] text-white hover:bg-[#0284c7] rounded-full font-sans font-medium shadow-sm px-6 border border-transparent transition-all hover:shadow-md',
    cardClass: 'bg-white/80 backdrop-blur-md border border-slate-100 rounded-xl shadow-sm text-slate-600',
    textClass: 'text-slate-700 font-sans tracking-tight',
    avatarBorder: 'border-[3px] border-[#0ea5e9] rounded-full p-1 bg-white',
    isPro: false,
    buttonHex: '#0ea5e9',
    textHex: '#334155',
    category: 'medicine',
    fontFamily: "'Inter', sans-serif"
};

// 2. Cardio Pulse ❤️
export const medicineCardioTheme: Theme = {
    id: 'medicine-cardio',
    name: 'Cardio Pulse',
    backgroundClass: 'bg-rose-50', // Fallback
    solidColor: '#fff1f2',
    buttonClass: 'bg-[#f43f5e] text-white hover:bg-[#e11d48] rounded-xl font-sans font-bold shadow-[0_4px_14px_0_rgba(244,63,94,0.39)] px-6 transition-all hover:scale-105',
    cardClass: 'bg-white/90 backdrop-blur-sm border border-rose-100 rounded-xl shadow-sm text-rose-900',
    textClass: 'text-rose-950 font-sans font-medium',
    avatarBorder: 'ring-4 ring-rose-100 ring-offset-2 ring-offset-white rounded-full',
    isPro: true,
    buttonHex: '#f43f5e',
    textHex: '#881337',
    category: 'medicine',
    fontFamily: "'Lato', sans-serif"
};

// 3. Bio Lab 🧪
export const medicineBioTheme: Theme = {
    id: 'medicine-biolab',
    name: 'Bio Lab',
    backgroundClass: 'bg-teal-900', // Fallback
    solidColor: '#0f766e',
    buttonClass: 'bg-[#ccfbf1] text-[#0f766e] hover:bg-white rounded-lg font-mono font-bold border border-[#5eead4] px-6 transition-all shadow-[0_0_15px_rgba(94,234,212,0.2)]',
    cardClass: 'bg-[#115e59]/80 backdrop-blur-md border border-[#2dd4bf]/30 rounded-lg text-[#ccfbf1]',
    textClass: 'text-[#ccfbf1] font-mono tracking-wide',
    avatarBorder: 'border-2 border-[#5eead4] border-dashed rounded-full',
    isPro: true,
    buttonHex: '#ccfbf1',
    textHex: '#ccfbf1',
    category: 'medicine',
    fontFamily: "'Space Mono', monospace"
};

// 4. Neuro Mind 🧠
export const medicineNeuroTheme: Theme = {
    id: 'medicine-neuro',
    name: 'Neuro Mind',
    backgroundClass: 'bg-indigo-950', // Fallback
    solidColor: '#1e1b4b',
    buttonClass: 'bg-transparent text-violet-300 hover:bg-violet-900/30 rounded-2xl font-sans font-light border border-violet-500/50 px-6 transition-all hover:border-violet-300 hover:shadow-[0_0_20px_rgba(167,139,250,0.3)]',
    cardClass: 'bg-[#2e1065]/60 backdrop-blur-xl border border-violet-500/20 rounded-2xl text-violet-100',
    textClass: 'text-violet-100 font-light tracking-wider',
    avatarBorder: 'ring-2 ring-violet-500/50 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)]',
    isPro: true,
    buttonHex: '#4c1d95',
    textHex: '#ddd6fe',
    category: 'medicine',
    fontFamily: "'Outfit', sans-serif"
};

// 5. Radiology Dark 🦴
export const medicineRadiologyTheme: Theme = {
    id: 'medicine-radiology',
    name: 'Radiology',
    backgroundClass: 'bg-black', // Fallback
    solidColor: '#000000',
    buttonClass: 'bg-[#1e293b] text-blue-400 hover:bg-[#334155] rounded-sm font-mono font-medium border-l-4 border-blue-500 px-6 transition-all',
    cardClass: 'bg-black/80 backdrop-blur-sm border border-slate-800 rounded-sm text-slate-300',
    textClass: 'text-slate-200 font-mono tracking-normal',
    avatarBorder: 'border border-blue-900 rounded-none',
    isPro: false,
    buttonHex: '#1e293b',
    textHex: '#e2e8f0',
    category: 'medicine',
    fontFamily: "'Fira Code', monospace"
};

export const medicineThemes = [
    medicineClinicalTheme,
    medicineCardioTheme,
    medicineBioTheme,
    medicineNeuroTheme,
    medicineRadiologyTheme
];
