
import { Theme } from '../../types';

export const brutalistThemes: Theme[] = [
    {
        id: 'brutalist-bauhaus',
        name: 'Bauhaus Geometric',
        backgroundClass: 'bg-white',
        buttonClass: 'bg-white text-black border-[5px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-200 w-full rounded-none py-4 px-6 flex items-center justify-between font-black uppercase tracking-tighter',
        buttonHex: '#FFFFFF',
        textHex: '#000000',
        textClass: 'text-black font-black uppercase tracking-tighter',
        avatarBorder: 'rounded-none border-[6px] border-black p-1 bg-[#ff3b30]',
        fontFamily: "'Inter', sans-serif",
        category: 'creative',
        isPro: true
    },
    {
        id: 'brutalist-halftone',
        name: 'Pop Art Halftone',
        backgroundClass: 'bg-[#ff70a6]',
        buttonClass: 'bg-[#ffdf00] text-black border-4 border-black rounded-[2rem] shadow-[0_8px_0_0_#000000] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#000000] active:translate-y-[8px] active:shadow-none transition-all duration-150 w-full py-4 px-6 flex items-center justify-between font-black uppercase italic tracking-widest',
        buttonHex: '#ffdf00',
        textHex: '#000000',
        textClass: 'text-black font-black italic uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]',
        avatarBorder: 'rounded-full border-4 border-black p-1 bg-white shadow-[0_10px_0_0_#000000]',
        fontFamily: "'Space Grotesk', sans-serif",
        category: 'creative',
        isPro: true
    },
    {
        id: 'brutalist-swiss',
        name: 'Swiss Typeface',
        backgroundClass: 'bg-[#ff4d00]',
        buttonClass: 'bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors duration-300 w-full rounded-none py-5 px-8 flex items-center justify-between font-bold text-lg tracking-tight',
        buttonHex: '#000000',
        textHex: '#000000',
        textClass: 'text-black font-black uppercase tracking-tighter leading-none',
        avatarBorder: 'rounded-none border-t-[20px] border-black bg-white p-2',
        fontFamily: "'archivo black', sans-serif",
        category: 'creative',
        isPro: true
    },
    {
        id: 'brutalist-schematic',
        name: 'Schematic Block',
        backgroundClass: 'bg-[#f0f0f0]',
        buttonClass: 'bg-white text-black border-2 border-black shadow-[4px_4px_0_0_#000,8px_8px_0_0_#888,12px_12px_0_0_#ccc] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 w-full rounded-none py-4 px-6 flex items-center justify-between font-mono uppercase font-bold',
        buttonHex: '#FFFFFF',
        textHex: '#000000',
        textClass: 'text-black font-mono uppercase font-black tracking-widest',
        avatarBorder: 'rounded-none border-2 border-black p-2 bg-white shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]',
        fontFamily: "'Space Mono', monospace",
        category: 'creative',
        isPro: true
    },
    {
        id: 'brutalist-marker',
        name: 'Marker Sketch',
        backgroundClass: 'bg-white',
        buttonClass: 'bg-white text-black border-[3px] border-black rounded-[15px_5px_22px_4px] hover:scale-[1.02] transform transition-transform duration-200 w-full py-4 px-6 flex items-center justify-between font-bold text-xl',
        buttonHex: '#FFFFFF',
        textHex: '#000000',
        textClass: 'text-black font-bold tracking-tight',
        avatarBorder: 'rounded-[45%_55%_70%_30%_/_30%_60%_40%_70%] border-[3px] border-black p-1 overflow-hidden',
        fontFamily: "'Shadows Into Light', cursive",
        category: 'creative',
        isPro: true
    }
];
