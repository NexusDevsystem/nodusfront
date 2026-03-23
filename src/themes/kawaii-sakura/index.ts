import { Theme } from '../../types';
import Background from './Background';

export const kawaiiSakuraTheme: Theme = {
    id: 'kawaii-sakura',
    name: 'Sakura Dreams',

    // Configurações de Fundo (mantém fallback sólido mas o componente Background assume)
    backgroundClass: 'bg-[#FFF0F5]',
    solidColor: '#FFF0F5',

    // Botões: Rosa pastel moderno com hover vibrante e sombra colorida
    buttonClass: 'bg-[#FFCAD4] text-[#9D5C63] hover:bg-[#FFB7C5] rounded-[32px] font-bold shadow-[0_8px_20px_-6px_rgba(255,180,195,0.6)] px-8 border border-white/40 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(255,150,170,0.7)]',

    // Cards: Estilo Unificado - Rosa Pastel (mesma cor dos botões) com leve transparência
    cardClass: 'bg-[#FFCAD4]/80 backdrop-blur-md border border-white/40 rounded-[32px] shadow-[0_4px_20px_-8px_rgba(255,183,197,0.4)] hover:bg-[#FFCAD4]/90 transition-all text-[#9D5C63]',

    // Texto: Cor Marsala para leitura confortável
    textClass: 'text-[#9D5C63] font-semibold tracking-wide',

    // Avatar: Borda dupla fofa
    avatarBorder: 'ring-4 ring-[#FFCAD4] ring-offset-4 ring-offset-[#FFF0F5] rounded-full shadow-lg',

    isPro: false,
    buttonHex: '#9D5C63', // Definido como a cor do TEXTO/ÍCONES para garantir contraste (já que o bg do botão é definido por classe)
    category: 'kawaii',
    fontFamily: "'Fredoka', sans-serif" // Mantendo a fonte arredondada que combina com o tema
};

export { Background };
