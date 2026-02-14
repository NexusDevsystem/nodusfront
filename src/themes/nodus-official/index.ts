import { Theme } from '../../types';
import Background from './Background';

export const nodusOfficialTheme: Theme = {
    id: 'animated-nodus-official',
    name: 'Nodus Official',
    backgroundClass: 'bg-black',
    buttonClass: 'bg-white text-black border-2 border-white font-black uppercase tracking-[0.2em] text-[12px] shadow-[6px_6px_0_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all',
    cardClass: 'bg-black text-white border-2 border-white/20 shadow-[8px_8px_0_rgba(255,255,255,0.05)] rounded-none',
    textClass: 'text-white',
    avatarBorder: 'border-white border-[3px] shadow-[10px_10px_0_rgba(255,255,255,0.05)]',
    isPro: true,
    solidColor: '#051a05',
    buttonHex: '#ffffff',
    category: 'animated',
    fontFamily: "'Chakra Petch', sans-serif"
};

export { Background };
