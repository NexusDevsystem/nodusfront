
import { Theme } from '../../types';

export const artisticThemes: Theme[] = [
    // 1. Sketchbook 📝
    {
        id: 'artistic-sketchbook',
        name: 'Sketchbook',
        backgroundClass: 'bg-[#fdfaf5]', // Creamy paper
        // Button: Dashed border, hand-drawn feel
        buttonClass: 'bg-transparent text-[#2c2c2c] border-2 border-dashed border-[#2c2c2c] hover:bg-[#2c2c2c]/5 hover:scale-[1.02] transform transition-all duration-300 w-full rounded-md py-4 px-6 flex items-center justify-between font-bold shadow-[2px_2px_0px_rgba(44,44,44,0.2)]',
        buttonHex: '#2c2c2c',
        textHex: '#2c2c2c',
        textClass: 'text-[#2c2c2c] font-sans font-bold tracking-tight',
        avatarBorder: 'rounded-full border-2 border-dashed border-[#2c2c2c] p-1.5',
        fontFamily: "'Patrick Hand', cursive", // or similar handwriting font
        category: 'creative',
        isPro: false
    },
    // 2. Line Art Minimalist ✒️
    {
        id: 'artistic-line-art',
        name: 'Line Art',
        backgroundClass: 'bg-[#ffffff]',
        // Button: Very thin elegant borders, almost invisible feel
        buttonClass: 'bg-white text-black border border-[#1a1a1a] hover:bg-black hover:text-white transition-all duration-500 w-full rounded-full py-4 px-8 flex items-center justify-between font-light tracking-[0.2em] relative overflow-hidden',
        buttonHex: '#1a1a1a',
        textHex: '#1a1a1a',
        textClass: 'text-black font-sans font-light tracking-[0.2em] uppercase',
        avatarBorder: 'rounded-full border-[1px] border-[#1a1a1a] p-2',
        fontFamily: "'Montserrat', sans-serif",
        category: 'creative',
        isPro: true
    },
    // 3. Pop Art 💥
    {
        id: 'artistic-pop-art',
        name: 'Pop Art',
        backgroundClass: 'bg-[#FFF200]', // Bright Yellow
        // Button: Bold comic style
        buttonClass: 'bg-[#00AEEF] text-white border-4 border-[#1a1a1a] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1a1a1a] active:translate-y-0 active:shadow-none transition-all duration-200 w-full rounded-none py-4 px-6 flex items-center justify-between font-black uppercase shadow-[6px_6px_0px_#1a1a1a]',
        buttonHex: '#00AEEF',
        textHex: '#1a1a1a',
        textClass: 'text-black font-sans font-black uppercase tracking-tight italic',
        avatarBorder: 'rounded-full border-4 border-[#1a1a1a] bg-[#EC008C] p-1',
        fontFamily: "'Bangers', system-ui",
        category: 'creative',
        isPro: true
    },
    // 4. Abstract Flow 🌊
    {
        id: 'artistic-abstract',
        name: 'Abstract Flow',
        backgroundClass: 'bg-[#f0f4f8]',
        // Button: Soft organic shapes, glass-ish
        buttonClass: 'bg-white/40 backdrop-blur-xl text-[#3d4c53] border border-white/60 hover:bg-white/60 transition-all duration-500 w-full rounded-[30px] rounded-tr-[10px] py-4 px-6 flex items-center justify-between font-medium shadow-sm hover:shadow-lg hover:shadow-purple-500/10',
        buttonHex: '#8e9eab',
        textHex: '#3d4c53',
        textClass: 'text-[#3d4c53] font-sans font-medium',
        avatarBorder: 'rounded-full border-4 border-white/50 backdrop-blur-md shadow-lg',
        fontFamily: "'Outfit', sans-serif",
        category: 'creative',
        isPro: true
    },
    // 5. Geometric Bauhaus 🟥
    {
        id: 'artistic-bauhaus',
        name: 'Bauhaus',
        backgroundClass: 'bg-[#f4f1ea]', // Off-white
        // Button: Geometric blocks
        buttonClass: 'bg-[#D22630] text-[#f4f1ea] border-none hover:bg-[#1a1a1a] transition-colors duration-300 w-full rounded-none py-4 px-6 flex items-center justify-between font-bold tracking-wide shadow-[5px_5px_0px_#1a1a1a]',
        buttonHex: '#D22630',
        textHex: '#1a1a1a',
        textClass: 'text-[#1a1a1a] font-sans font-bold tracking-tighter',
        avatarBorder: 'rounded-full border-[6px] border-[#005A9C] p-0',
        fontFamily: "'Archivo Black', sans-serif",
        category: 'creative',
        isPro: true
    }
];
