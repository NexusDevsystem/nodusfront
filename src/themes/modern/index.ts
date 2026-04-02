
import { Theme } from '../../types';

export const modernThemes: Theme[] = [
    // 1. Minimalist (Darker Text)
    {
        id: 'modern-minimalist',
        name: 'Minimalist',
        backgroundClass: 'bg-white',
        buttonClass: 'bg-white text-black border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-200 w-full rounded-lg py-4 px-6 flex items-center justify-between font-medium',
        buttonHex: '#FFFFFF',
        textHex: '#000000',
        textClass: 'text-black font-sans font-semibold tracking-tight',
        avatarBorder: 'rounded-full border border-gray-300 p-1',
        fontFamily: "'Inter', sans-serif",
        category: 'creative',
        isPro: false
    },
    // 2. Cyberpunk (Brighter Text)
    {
        id: 'modern-cyberpunk',
        name: 'Cyberpunk',
        backgroundClass: 'bg-[#050505]',
        // "Selected" look: solid cyan with black text
        buttonClass: 'bg-[#00f3ff] text-black border-2 border-[#00f3ff] hover:bg-[#00f3ff]/90 hover:shadow-[0_0_30px_#00f3ff] transition-all duration-200 w-full rounded-none py-4 px-6 flex items-center justify-between uppercase tracking-widest font-black',
        buttonHex: '#00f3ff',
        textHex: '#00f3ff',
        textClass: 'text-[#00f3ff] font-mono uppercase tracking-widest drop-shadow-[0_0_8px_#00f3ff]',
        avatarBorder: 'rounded-full border-2 border-[#ff00ff] shadow-[0_0_15px_#ff00ff]',
        fontFamily: "'Orbitron', sans-serif",
        category: 'creative',
        isPro: true
    },
    // 3. Glassmorphism (Dark Text for Light BG)
    {
        id: 'modern-glassmorphism',
        name: 'Glassmorphism',
        backgroundClass: 'bg-white',
        // "Glass" look: subtle transparency, blur, white border, dark text for legibility
        buttonClass: 'bg-white/10 backdrop-blur-md text-slate-800 border border-white/40 hover:bg-white/20 transition-all duration-300 w-full rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg shadow-black/5',
        buttonHex: '#ffffff40', // Semi-transparent for logic
        textHex: '#0f172a',
        textClass: 'text-slate-900 font-sans font-bold tracking-wide',
        avatarBorder: 'rounded-2xl border-2 border-white/50 backdrop-blur-md shadow-xl',
        fontFamily: "'Montserrat', sans-serif",
        category: 'creative',
        isPro: true
    },
    // 4. Pastel Soft (Softer Dark Text)
    {
        id: 'modern-pastel',
        name: 'Pastel Soft',
        backgroundClass: 'bg-[#FDF2F8]',
        // "Selected" look: solid purple with white text
        buttonClass: 'bg-[#4c1d95] text-white border-2 border-[#4c1d95] shadow-[0_10px_20px_-5px_rgba(76,29,149,0.3)] transition-all duration-300 w-full rounded-[2rem] py-4 px-6 flex items-center justify-between font-black',
        buttonHex: '#4c1d95',
        textHex: '#4c1d95',
        textClass: 'text-[#4c1d95] font-sans font-black',
        avatarBorder: 'rounded-[30px] border-4 border-white shadow-md',
        fontFamily: "'Quicksand', sans-serif",
        category: 'kawaii',
        isPro: true
    },
    // 5. Retro-Futurist
    {
        id: 'modern-retro',
        name: 'Retro Futurist',
        backgroundClass: 'bg-[#240046]',
        buttonClass: 'bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white hover:brightness-110 hover:-translate-y-1 transition-transform duration-200 w-full rounded-md py-4 px-6 flex items-center justify-between shadow-[0_4px_0_0_rgba(0,0,0,0.5)]',
        buttonHex: '#ff006e',
        textHex: '#ffffff',
        textClass: 'text-white font-sans italic tracking-wide',
        avatarBorder: 'rounded-full border-4 border-[#ffbe0b] shadow-[0_0_20px_#ffbe0b]',
        fontFamily: "'Russo One', sans-serif",
        category: 'creative',
        isPro: true
    },
    // 8. Nature Organic
    {
        id: 'modern-nature',
        name: 'Nature Organic',
        backgroundClass: 'bg-[#F1F8E9]',
        buttonClass: 'bg-[#33691E] text-[#F1F8E9] hover:bg-[#558B2F] transition-colors duration-300 w-full rounded-tl-[20px] rounded-tr-[5px] rounded-br-[20px] rounded-bl-[5px] py-4 px-6 flex items-center justify-between shadow-sm',
        buttonHex: '#33691E',
        textHex: '#1B5E20',
        textClass: 'text-[#1B5E20] font-serif',
        avatarBorder: 'rounded-full border-2 border-[#558B2F] p-1',
        fontFamily: "'Lora', serif",
        category: 'creative',
        isPro: true
    },
    // 9. High-Contrast
    {
        id: 'modern-high-contrast',
        name: 'High Contrast',
        backgroundClass: 'bg-white',
        buttonClass: 'bg-black text-white hover:bg-white hover:text-black hover:ring-4 hover:ring-[#1a1a1a] transition-all duration-200 w-full rounded-none py-4 px-6 flex items-center justify-between font-bold border-2 border-[#1a1a1a]',
        buttonHex: '#1a1a1a',
        textHex: '#1a1a1a',
        textClass: 'text-black font-sans font-black tracking-tight',
        avatarBorder: 'rounded-full border-[6px] border-[#1a1a1a]',
        fontFamily: "'Archivo Black', sans-serif",
        category: 'creative',
        isPro: true
    },
    // 11. Velvet Night (Free, Unique Ring Effect)
    {
        id: 'modern-velvet-night',
        name: 'Velvet Night',
        backgroundClass: 'bg-[#1a0a2e]',
        solidColor: '#1a0a2e',
        buttonClass: 'bg-[#2d1b4e] text-white border border-[#7c3aed]/60 ring-2 ring-[#7c3aed]/20 ring-offset-2 ring-offset-[#1a0a2e] rounded-2xl hover:border-[#a78bfa] hover:ring-[#7c3aed]/50 hover:shadow-[0_0_24px_rgba(124,58,237,0.35)] hover:-translate-y-0.5 transition-all duration-300 w-full py-4 px-6 flex items-center justify-between font-medium',
        buttonHex: '#2d1b4e',
        textHex: '#e9d5ff',
        textClass: 'text-[#e9d5ff] font-sans font-medium tracking-wide',
        avatarBorder: 'rounded-2xl border-2 border-[#7c3aed]/60 ring-2 ring-[#7c3aed]/30 ring-offset-2 ring-offset-[#1a0a2e]',
        fontFamily: "'DM Sans', sans-serif",
        category: 'modern',
        isPro: false
    },
    // 15. Paper Memo (Free, Asymmetric Editorial)
    {
        id: 'modern-paper-memo',
        name: 'Paper Memo',
        backgroundClass: 'bg-[#FAFAF7]',
        solidColor: '#FAFAF7',
        buttonClass: 'bg-white text-[#1a1a1a] border border-[#e5e5e5] border-l-[6px] border-l-[#1a1a1a] rounded-r-xl rounded-l-none shadow-sm hover:border-l-[#ea580c] hover:shadow-md hover:translate-x-0.5 transition-all duration-300 w-full py-4 px-6 flex items-center justify-between font-semibold text-left',
        buttonHex: '#ffffff',
        textHex: '#1a1a1a',
        textClass: 'text-[#1a1a1a] font-serif font-semibold tracking-tight',
        avatarBorder: 'rounded-xl border-l-[5px] border-l-[#1a1a1a] border border-[#e5e5e5]',
        fontFamily: "'Lora', serif",
        category: 'modern',
        isPro: false
    },
    // 16. Aqua Depth (Free, Underwater Glass)
    {
        id: 'modern-aqua-depth',
        name: 'Aqua Depth',
        backgroundClass: 'bg-gradient-to-b from-[#0f3460] to-[#0a1628]',
        solidColor: '#0f3460',
        buttonClass: 'bg-white/8 backdrop-blur-md text-white border-0 border-b-[3px] border-[#22d3ee] hover:bg-white/15 hover:border-b-[4px] hover:border-[#67e8f9] rounded-none transition-all duration-400 w-full py-4 px-6 flex items-center justify-between font-light tracking-[0.12em]',
        buttonHex: '#0f3460',
        textHex: '#e0f7fa',
        textClass: 'text-[#e0f7fa] font-sans font-light tracking-widest',
        avatarBorder: 'rounded-full border-2 border-[#22d3ee]/50 ring-4 ring-[#22d3ee]/10',
        fontFamily: "'Inter', sans-serif",
        category: 'modern',
        isPro: false
    }
];
