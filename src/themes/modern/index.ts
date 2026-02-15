
import { Theme } from '../../types';

export const modernThemes: Theme[] = [
    // 1. Minimalist (Darker Text)
    {
        id: 'modern-minimalist',
        name: 'Minimalist',
        backgroundClass: 'bg-white',
        buttonClass: 'bg-white text-black border border-gray-200 hover:border-gray-400 hover:shadow-md hover:scale-[1.01] transition-all duration-200 w-full rounded-lg py-4 px-6 flex items-center justify-between font-medium',
        buttonHex: '#FFFFFF',
        textHex: '#000000',
        textClass: 'text-black font-sans font-semibold tracking-tight',
        avatarBorder: 'rounded-full border border-gray-300 p-1',
        fontFamily: "'Inter', sans-serif",
        category: 'creative',
        isPro: true
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
        isPro: false
    },
    // 5. Dark Elegant (Gold/White Text)
    {
        id: 'modern-dark-elegant',
        name: 'Dark Elegant',
        backgroundClass: 'bg-[#121212]',
        // "Selected" look: Gold background with black text
        buttonClass: 'bg-[#D4AF37] text-black border-2 border-[#D4AF37] hover:bg-[#B8860B] transition-all duration-300 w-full rounded-sm py-4 px-6 flex items-center justify-between shadow-[0_0_30px_rgba(212,175,55,0.25)] font-serif font-black tracking-widest uppercase',
        buttonHex: '#D4AF37',
        textHex: '#F5F5F5',
        textClass: 'text-white font-serif tracking-[0.2em] uppercase font-bold drop-shadow-sm',
        avatarBorder: 'rounded-full border-2 border-[#D4AF37] p-2 shadow-2xl',
        fontFamily: "'Playfair Display', serif",
        category: 'creative',
        isPro: true
    },
    // 6. Industrial (High Contrast E-Ink)
    {
        id: 'modern-industrial',
        name: 'Industrial',
        backgroundClass: 'bg-[#262626]',
        // "Selected" look: solid white with black text
        buttonClass: 'bg-white text-black border-4 border-white hover:bg-gray-200 transition-colors duration-150 w-full rounded-none py-4 px-6 flex items-center justify-between font-mono uppercase font-black tracking-tighter',
        buttonHex: '#ffffff',
        textHex: '#ffffff',
        textClass: 'text-white font-mono tracking-tighter uppercase font-black',
        avatarBorder: 'rounded-full border-4 border-white grayscale',
        fontFamily: "'Roboto Mono', monospace",
        category: 'creative',
        isPro: true
    },
    // 7. Retro-Futurist
    {
        id: 'modern-retro',
        name: 'Retro Futurist',
        backgroundClass: 'bg-[#240046]',
        buttonClass: 'bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white hover:brightness-110 hover:-translate-y-1 transition-transform duration-200 w-full rounded-md py-4 px-6 flex items-center justify-between shadow-[4px_4px_0px_rgba(0,0,0,0.5)]',
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
        isPro: false
    },
    // 9. High-Contrast
    {
        id: 'modern-high-contrast',
        name: 'High Contrast',
        backgroundClass: 'bg-white',
        buttonClass: 'bg-black text-white hover:bg-white hover:text-black hover:ring-4 hover:ring-black transition-all duration-200 w-full rounded-none py-4 px-6 flex items-center justify-between font-bold border-2 border-black',
        buttonHex: '#000000',
        textHex: '#000000',
        textClass: 'text-black font-sans font-black tracking-tight',
        avatarBorder: 'rounded-full border-[6px] border-black',
        fontFamily: "'Archivo Black', sans-serif",
        category: 'creative',
        isPro: true
    },
    // 10. Royal Gold
    {
        id: 'modern-royal-gold',
        name: 'Royal Gold',
        backgroundClass: 'bg-[#2A0A10]',
        buttonClass: 'bg-gradient-to-b from-[#FFD700] to-[#B8860B] text-[#2A0A10] border-2 border-[#FFD700] hover:brightness-110 transition-all duration-300 w-full rounded-sm py-4 px-6 flex items-center justify-between shadow-lg font-serif font-bold',
        buttonHex: '#FFD700',
        textHex: '#FFD700',
        textClass: 'text-[#FFD700] font-serif uppercase tracking-widest',
        avatarBorder: 'rounded-full border-[3px] border-[#FFD700] shadow-[0_0_15px_#FFD700]',
        fontFamily: "'Cinzel', serif",
        category: 'creative',
        isPro: true
    }
];
