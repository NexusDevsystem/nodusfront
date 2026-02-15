
import { Theme } from '../../types';

export const kawaiiThemes: Theme[] = [
    {
        id: 'kawaii-cotton-candy',
        name: 'Cotton Candy Sky',
        backgroundClass: 'bg-gradient-to-b from-[#FFDEE9] to-[#B5FFFC]', // Soft Pink to Blue
        buttonClass: 'bg-white/90 backdrop-blur-sm text-[#2B4C59] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 w-full rounded-[40px] px-6 py-4 flex items-center justify-between border-2 border-[#B5FFFC]/50',
        buttonHex: '#ffffff', // Semantic color for "button base"
        cardClass: '', // Left empty to force buttonClass inheritance
        textClass: 'text-[#2B4C59]',
        avatarBorder: 'border-white border-4 shadow-lg ring-4 ring-[#B5FFFC]/50',
        fontFamily: "'Quicksand', sans-serif",
        category: 'kawaii',
        isPro: false
    },
    {
        id: 'kawaii-minty-fresh',
        name: 'Minty Fresh',
        backgroundClass: 'bg-[#E0F7FA]', // Mint Pastel
        buttonClass: 'bg-[#A7F3D0] text-[#064E3B] border-2 border-dashed border-[#064E3B]/30 hover:border-[#064E3B]/60 hover:-translate-y-1 transition-all duration-300 w-full rounded-2xl px-6 py-4 flex items-center justify-between',
        buttonHex: '#A7F3D0',
        cardClass: '',
        textClass: 'text-[#064E3B]',
        avatarBorder: 'border-[#A7F3D0] border-4 border-dashed shadow-none',
        fontFamily: "'Varela Round', sans-serif",
        category: 'kawaii',
        isPro: false
    },
    {
        id: 'kawaii-honey-bee',
        name: 'Honey Bee',
        backgroundClass: 'bg-[#FFFDE7]', // Cannary Yellow Pastel
        buttonClass: 'bg-[#FDD835] text-[#5D4037] border-b-[6px] border-[#F9A825] active:border-b-0 active:translate-y-[6px] hover:brightness-110 transition-all duration-100 w-full rounded-2xl px-6 py-4 flex items-center justify-between',
        buttonHex: '#FDD835',
        cardClass: '',
        textClass: 'text-[#5D4037]',
        avatarBorder: 'border-[#FDD835] border-4 shadow-xl',
        fontFamily: "'Fredoka', sans-serif", // Rounded & Bouncy
        category: 'kawaii',
        isPro: false
    },
    {
        id: 'kawaii-lavender-soft',
        name: 'Lavender Soft',
        backgroundClass: 'bg-[#F3E5F5]', // Lavender
        buttonClass: 'bg-[#E1BEE7] text-[#4A148C] shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] border border-white/50 hover:scale-[1.02] transition-all duration-500 w-full rounded-3xl px-6 py-4 flex items-center justify-between',
        buttonHex: '#E1BEE7',
        cardClass: '',
        textClass: 'text-[#4A148C]',
        avatarBorder: 'border-[#E1BEE7] border-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
        fontFamily: "'Comfortaa', sans-serif",
        category: 'kawaii',
        isPro: false
    },
    {
        id: 'kawaii-peach-milk',
        name: 'Peach Milk',
        backgroundClass: 'bg-[#FFF3E0]', // Peach Light
        buttonClass: 'bg-[#FFCCBC] text-[#BF360C] shadow-[6px_6px_0px_0px_rgba(191,54,12,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(191,54,12,0.15)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 w-full rounded-xl px-6 py-4 flex items-center justify-between border-2 border-[#BF360C]/10',
        buttonHex: '#FFCCBC',
        cardClass: '',
        textClass: 'text-[#BF360C]',
        avatarBorder: 'border-[#FFCCBC] border-4 shadow-[4px_4px_0px_0px_rgba(191,54,12,0.2)]',
        fontFamily: "'Sniglet', 'Fredoka', sans-serif",
        category: 'kawaii',
        isPro: false
    }
];
