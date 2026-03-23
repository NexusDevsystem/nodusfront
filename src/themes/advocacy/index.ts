
import { Theme } from '../../types';

export const advocacyThemes: Theme[] = [
    // 1. Juris Classic (Vintage Justice - Dark Brown & Antique Gold)
    {
        id: 'advocacy-juris-classic',
        name: 'Vintage Justice',
        backgroundClass: 'bg-[#1a120b]', // Deep Vintage Brown/Black
        // Antique Bronze Button
        buttonClass: 'bg-gradient-to-r from-[#2c2018] to-[#3e2d23] text-[#eaddcf] border border-[#b48a5f]/40 hover:border-[#b48a5f] hover:shadow-[0_4px_20px_rgba(180,138,95,0.15)] transition-all duration-300 w-full rounded-sm py-4 px-6 flex items-center justify-between font-serif tracking-widest uppercase text-xs',
        buttonHex: '#b48a5f',
        textHex: '#eaddcf',
        textClass: 'text-[#eaddcf] font-serif tracking-widest uppercase text-xs font-medium',
        avatarBorder: 'rounded-full border-[3px] border-[#b48a5f]/60 shadow-xl p-1 bg-[#1a120b]',
        fontFamily: "'Cinzel', serif", // More classic/engraved look
        category: 'advocacy',
        isPro: true
    },
    // 2. Modern Law (Bubble/3D Effect - Royal Blue)
    {
        id: 'advocacy-modern-law',
        name: 'Modern Bubble',
        backgroundClass: 'bg-[#0f172a]',
        // 3D Bubble Button: Royal Blue Gradient + Shine
        buttonClass: 'bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),inset_0px_-2px_4px_rgba(0,0,0,0.4),0px_8px_15px_rgba(0,0,0,0.3)] active:scale-[0.98] transition-all duration-300 w-full rounded-full py-4 px-6 flex items-center justify-between font-sans font-bold tracking-wide border-t border-white/20',
        buttonHex: '#2563eb',
        textHex: '#eff6ff',
        textClass: 'text-blue-50 font-sans font-bold tracking-wide shadow-black drop-shadow-md',
        avatarBorder: 'rounded-full border-[4px] border-blue-400/50 shadow-2xl p-0.5',
        fontFamily: "'Outfit', sans-serif",
        category: 'advocacy',
        isPro: true
    },
    // 3. Verdict (Authoritative Emerald)
    {
        id: 'advocacy-verdict',
        name: 'Verdict',
        backgroundClass: 'bg-[#022c22]',
        // Deep Green Soft Bevel
        buttonClass: 'bg-[#065f46] text-[#ecfdf5] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_6px_rgba(0,0,0,0.3)] hover:brightness-110 hover:-translate-y-0.5 transition-all duration-300 w-full rounded-xl py-4 px-6 flex items-center justify-between font-serif tracking-tight',
        buttonHex: '#059669',
        textHex: '#ecfdf5',
        textClass: 'text-emerald-50 font-serif font-medium',
        avatarBorder: 'rounded-[1.5rem] border-2 border-[#10b981]/50 shadow-lg',
        fontFamily: "'Playfair Display', serif",
        category: 'advocacy',
        isPro: true
    },
    // 4. Equity (Kept as requested)
    {
        id: 'advocacy-equity',
        name: 'Equity',
        backgroundClass: 'bg-[#e7e5e4]',
        // Warm Brown / Beige
        buttonClass: 'bg-[#fff] text-[#451a03] border border-[#a8a29e] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full rounded-2xl py-4 px-6 flex items-center justify-between font-serif',
        buttonHex: '#78350f',
        textHex: '#451a03',
        textClass: 'text-[#451a03] font-serif font-medium',
        avatarBorder: 'rounded-[2rem] border-4 border-white shadow-md',
        fontFamily: "'Lora', serif",
        category: 'advocacy',
        isPro: true
    },
    // 5. Justice Scale (High-End Minimalist)
    {
        id: 'advocacy-justice-scale',
        name: 'Justice Scale',
        backgroundClass: 'bg-black',
        // Matte Black & Red Glow
        buttonClass: 'bg-neutral-900/90 text-neutral-100 border border-neutral-800 hover:border-red-900/40 hover:shadow-[0_0_25px_rgba(153,27,27,0.15)] transition-all duration-500 w-full rounded-full py-4 px-6 flex items-center justify-between font-mono uppercase text-xs tracking-[0.15em]',
        buttonHex: '#991b1b',
        textHex: '#ffffff',
        textClass: 'text-white font-mono tracking-widest uppercase text-xs font-light',
        avatarBorder: 'rounded-full border border-neutral-800 ring-1 ring-red-900/50 p-1',
        fontFamily: "'Space Grotesk', sans-serif",
        category: 'advocacy',
        isPro: true
    }
];
