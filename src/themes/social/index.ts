
import { Theme } from '../../types';

export const socialThemes: Theme[] = [
    // 1. TikTok Creative (Modern & Glass)
    {
        id: 'social-tiktok',
        name: 'TikTok Creative',
        backgroundClass: 'bg-[#121212]',
        // Button: Unique Asymmetric Shape with "Glitch" Shadow
        buttonClass: 'bg-[#1a1a1a] text-white border border-white/10 hover:bg-[#252525] transition-all duration-300 w-full py-4 px-6 flex items-center justify-between font-bold shadow-[4px_4px_0px_0px_#00f2ea,-4px_-4px_0px_0px_#ff0050] hover:shadow-[2px_2px_0px_0px_#00f2ea,-2px_-2px_0px_0px_#ff0050] hover:translate-y-[1px] rounded-tl-[24px] rounded-br-[24px] rounded-tr-[4px] rounded-bl-[4px]',
        buttonHex: '#1a1a1a', // Dark background for correct contrast logic (was cyan)
        textHex: '#ffffff',
        textClass: 'text-white font-sans font-bold tracking-wide antialiased',
        avatarBorder: 'rounded-full border-[3px] border-transparent bg-clip-border bg-gradient-to-tr from-[#00f2ea] to-[#ff0050] p-[3px] shadow-[0_0_15px_rgba(0,242,234,0.3)]',
        fontFamily: "'Inter', sans-serif",
        category: 'creative',
        isPro: true
    },
    // 2. Twitch Ultra (Pro Streamer)
    {
        id: 'social-twitch',
        name: 'Twitch Ultra',
        backgroundClass: 'bg-[#0e0e10]',
        // Button: "Gamer" blocky shape (Sharp TL/BR, Round TR/BL) with heavy 3D shadow
        buttonClass: 'bg-[#9146FF] text-white border-2 border-[#9146FF] hover:bg-[#772ce8] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#ffffff] active:translate-y-[2px] active:shadow-none transition-all duration-150 w-full py-4 px-6 flex items-center justify-between font-bold shadow-[6px_6px_0px_0px_#000000] rounded-tr-[24px] rounded-bl-[24px] rounded-tl-[4px] rounded-br-[4px]',
        buttonHex: '#9146FF',
        textHex: '#ffffff',
        textClass: 'text-white font-sans font-bold tracking-tight',
        avatarBorder: 'rounded-full border-[3px] border-[#9146FF] ring-2 ring-[#0e0e10] ring-offset-2 ring-offset-[#9146FF]',
        fontFamily: "'Roobert', sans-serif",
        category: 'creative',
        isPro: true
    },
    // 3. YouTube Studio (Dark Mode)
    {
        id: 'social-youtube',
        name: 'YouTube Studio',
        backgroundClass: 'bg-[#0f0f0f]', // True Dark Mode
        // Button: "Tactile 3D" - Rounded with heavy bottom border (Physical Press feel)
        buttonClass: 'bg-[#272727] text-white border-b-[6px] border-[#FF0000] hover:bg-[#333333] hover:border-[#ff3333] active:border-b-0 active:translate-y-[6px] transition-all duration-100 w-full py-4 px-6 flex items-center justify-between font-bold shadow-lg rounded-2xl',
        buttonHex: '#FF0000',
        textHex: '#ffffff',
        textClass: 'text-white font-sans font-medium tracking-normal',
        avatarBorder: 'rounded-full border-[2px] border-[#FF0000] p-[2px]',
        fontFamily: "'Roboto Condensed', sans-serif",
        category: 'creative',
        isPro: true
    }
];
