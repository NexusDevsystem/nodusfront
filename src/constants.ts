
import { Theme, FontOption, Product } from './types';
import {
  Mail, Globe, Link as LinkIcon
} from 'lucide-react';
import {
  SiInstagram, SiFacebook, SiX, SiTiktok, SiThreads, SiLinkedin, SiWhatsapp, SiTelegram,
  SiYoutube, SiTwitch, SiVimeo, SiSpotify, SiSoundcloud, SiApplemusic, SiGithub,
  SiBehance, SiDribbble, SiPinterest, SiDiscord, SiSteam, SiShopee, SiAmazon
} from 'react-icons/si';

export const FONTS: FontOption[] = [
  { name: 'Modern Sans', family: "'Inter', sans-serif", type: 'sans' },
  { name: 'DM Sans', family: "'DM Sans', sans-serif", type: 'sans' },
  { name: 'Geometric', family: "'Poppins', sans-serif", type: 'sans' },
  { name: 'Classic Serif', family: "'Merriweather', serif", type: 'serif' },
  { name: 'Elegant', family: "'Playfair Display', serif", type: 'serif' },
  { name: 'Cinzel Decorative', family: "'Cinzel', serif", type: 'display' },
  { name: 'Coding Mono', family: "'Fira Code', monospace", type: 'mono' },
  { name: 'Space Tech', family: "'Space Grotesk', sans-serif", type: 'sans' },
  { name: 'Bold Impact', family: "'Oswald', sans-serif", type: 'display' },
  { name: 'Retro Gamer', family: "'Righteous', cursive", type: 'display' },
  { name: 'Handwritten', family: "'Dancing Script', cursive", type: 'handwriting' },
  { name: 'Comic Book', family: "'Bangers', system-ui", type: 'display' },
  { name: 'Poster', family: "'Abril Fatface', cursive", type: 'display' },
];

export const THEMES: Theme[] = [
  // Basics & Solids
  {
    id: 'default',
    name: 'Clean White',
    backgroundClass: 'bg-white',
    buttonClass: 'bg-slate-100 text-slate-900 font-semibold hover:bg-slate-200 hover:scale-[1.02] shadow-sm',
    textClass: 'text-slate-900',
    avatarBorder: 'border-slate-200',
    solidColor: '#ffffff'
  },
  {
    id: 'minimal-grey',
    name: 'Air Grey',
    backgroundClass: 'bg-slate-50',
    buttonClass: 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md',
    textClass: 'text-slate-800',
    avatarBorder: 'border-slate-300',
    solidColor: '#f8fafc'
  },
  {
    id: 'dark',
    name: 'Midnight',
    backgroundClass: 'bg-slate-950',
    buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800',
    textClass: 'text-white',
    avatarBorder: 'border-slate-800',
    isPro: true,
    solidColor: '#020617'
  },
  {
    id: 'nordic-ice',
    name: 'Nordic Ice',
    backgroundClass: 'bg-[#f0f9ff]',
    buttonClass: 'bg-white text-sky-800 border border-sky-100 hover:border-sky-200 shadow-sm',
    textClass: 'text-sky-900',
    avatarBorder: 'border-sky-100',
    isPro: true,
    solidColor: '#f0f9ff'
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    backgroundClass: 'bg-[#1a0b2e]',
    buttonClass: 'bg-[#3d1d6d] text-white border border-[#5a2e91] hover:bg-[#4c2486] shadow-lg',
    textClass: 'text-[#e0b0ff]',
    avatarBorder: 'border-[#5a2e91]',
    isPro: true,
    solidColor: '#1a0b2e'
  },
  {
    id: 'evergreen',
    name: 'Evergreen',
    backgroundClass: 'bg-[#0f1f1a]',
    buttonClass: 'bg-[#2d4a3e] text-[#d1e8e2] border border-[#1a332a] hover:bg-[#345c4d]',
    textClass: 'text-[#d1e8e2]',
    avatarBorder: 'border-[#2d4a3e]',
    isPro: true,
    solidColor: '#0f1f1a'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    backgroundClass: 'bg-[#0a0a0a]',
    buttonClass: 'bg-[#C5A059] text-black font-bold border border-[#d4af37] hover:bg-[#d4af37]',
    textClass: 'text-[#C5A059]',
    avatarBorder: 'border-[#C5A059]',
    isPro: true,
    solidColor: '#0a0a0a'
  },
  {
    id: 'berry-blast',
    name: 'Berry Blast',
    backgroundClass: 'bg-[#4a0e2e]',
    buttonClass: 'bg-[#8b2b5a] text-white border border-[#a63d71] hover:bg-[#a63d71]',
    textClass: 'text-[#ffd1dc]',
    avatarBorder: 'border-[#8b2b5a]',
    isPro: true,
    solidColor: '#4a0e2e'
  },
  {
    id: 'steel-blue',
    name: 'Steel Blue',
    backgroundClass: 'bg-[#24292e]',
    buttonClass: 'bg-[#39414a] text-[#b0c4de] border border-[#4a555e] hover:bg-[#4a555e]',
    textClass: 'text-[#f0f8ff]',
    avatarBorder: 'border-[#4a555e]',
    isPro: true,
    solidColor: '#24292e'
  },
  {
    id: 'matcha',
    name: 'Matcha',
    backgroundClass: 'bg-[#f1f8e9]',
    buttonClass: 'bg-[#8bc34a] text-white font-bold hover:bg-[#9ccc65] shadow-md',
    textClass: 'text-[#33691e]',
    avatarBorder: 'border-[#c5e1a5]',
    isPro: true,
    solidColor: '#f1f8e9'
  },
  {
    id: 'leafy',
    name: 'Forest',
    backgroundClass: 'bg-[#1a2517]',
    buttonClass: 'bg-[#acc8a2] text-[#1a2517] font-bold hover:scale-[1.02] shadow-lg transition-all',
    textClass: 'text-[#acc8a2]',
    avatarBorder: 'border-[#acc8a2]',
    isPro: true,
    solidColor: '#1a2517'
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    backgroundClass: 'bg-[#e6e6fa]',
    buttonClass: 'bg-white text-[#9370db] font-medium border border-[#dcd0ff] hover:bg-[#f3e5f5] shadow-sm rounded-xl',
    textClass: 'text-[#4b0082]',
    avatarBorder: 'border-[#dcd0ff]',
    isPro: true,
    solidColor: '#e6e6fa'
  },
  {
    id: 'pastel-pink',
    name: 'Cotton Candy',
    backgroundClass: 'bg-pink-100',
    buttonClass: 'bg-white text-pink-500 font-bold rounded-xl border-b-4 border-pink-200 hover:border-pink-300 hover:-translate-y-0.5 active:border-b-0 active:translate-y-0.5 transition-all',
    textClass: 'text-pink-800',
    avatarBorder: 'border-pink-200',
    isPro: true,
    solidColor: '#fce7f3'
  },
  {
    id: 'vampire',
    name: 'Vampire',
    backgroundClass: 'bg-[#2a0a10]',
    buttonClass: 'bg-[#4a0e1c] text-[#ffb3b3] border border-[#800020] hover:bg-[#800020] hover:text-white hover:shadow-[0_0_15px_#800020]',
    textClass: 'text-[#ffcccc]',
    avatarBorder: 'border-[#800020]',
    isPro: true,
    solidColor: '#2a0a10'
  },

  // Special Effects & Gradients
  {
    id: 'glass',
    name: 'Glassmorphism',
    backgroundClass: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
    buttonClass: 'glass-effect',
    textClass: 'text-white',
    avatarBorder: 'border-white/30',
    isPro: true,
    solidColor: '#ec4899' // Pink bottom
  },
  {
    id: 'solaris',
    name: 'Solaris',
    backgroundClass: 'bg-gradient-to-br from-orange-400 via-amber-500 to-rose-600',
    buttonClass: 'bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20',
    textClass: 'text-white drop-shadow-md',
    avatarBorder: 'border-white/40',
    isPro: true,
    solidColor: '#e11d48' // Rose bottom
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset Blvd',
    backgroundClass: 'bg-gradient-to-b from-orange-400 via-rose-500 to-brand-600',
    buttonClass: 'bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/40 shadow-lg',
    textClass: 'text-white drop-shadow-md',
    avatarBorder: 'border-white/50',
    isPro: true,
    solidColor: '#4f46e5' // Brand 600 indigo? Wait brand-600 is usually indigo/purple. Assuming default tailwind indigo-600 #4f46e5
  },
  {
    id: 'gradient-ocean',
    name: 'Deep Ocean',
    backgroundClass: 'bg-gradient-to-tr from-cyan-600 via-blue-700 to-slate-900',
    buttonClass: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm hover:from-cyan-500/30 hover:to-blue-500/30 text-white border border-white/20',
    textClass: 'text-cyan-50',
    avatarBorder: 'border-cyan-200/30',
    isPro: true,
    solidColor: '#0f172a' // Slate 900
  },
  {
    id: 'gradient-aurora',
    name: 'Aurora',
    backgroundClass: 'bg-gradient-to-bl from-green-400 via-teal-500 to-emerald-600',
    buttonClass: 'bg-white text-teal-800 font-bold hover:bg-teal-50 shadow-xl shadow-teal-900/20',
    textClass: 'text-white drop-shadow',
    avatarBorder: 'border-white',
    isPro: true,
    solidColor: '#4ade80' // Green 400 bottom left? Actually gradient to BL means top-right to bottom-left. So Green is top-right, Emerald is bottom-left. Emerald-600: #059669
  },
  {
    id: 'retro-pop',
    name: 'Retro Pop',
    backgroundClass: 'bg-yellow-400',
    buttonClass: 'bg-white text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none',
    textClass: 'text-black font-black',
    avatarBorder: 'border-black border-4',
    isPro: true,
    solidColor: '#facc15'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    backgroundClass: 'bg-black',
    buttonClass: 'bg-black text-[#00ff41] border border-[#00ff41] hover:bg-[#00ff41] hover:text-black font-mono shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:shadow-[0_0_20px_rgba(0,255,65,0.6)] rounded-sm',
    textClass: 'text-[#00ff41]',
    avatarBorder: 'border-[#00ff41]',
    isPro: true,
    solidColor: '#000000'
  },
  {
    id: 'luxury-gold',
    name: 'Luxury',
    backgroundClass: 'bg-[#121212]',
    buttonClass: 'bg-transparent text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#121212] tracking-widest uppercase text-xs',
    textClass: 'text-[#D4AF37]',
    avatarBorder: 'border-[#D4AF37]',
    isPro: true,
    solidColor: '#121212'
  },
  {
    id: 'neumorphism',
    name: 'Soft Plastic',
    backgroundClass: 'bg-[#e0e5ec]',
    buttonClass: 'bg-[#e0e5ec] text-slate-600 font-bold shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)] hover:shadow-[inset_9px_9px_16px_rgb(163,177,198),inset_-9px_-9px_16px_rgba(255,255,255,0.5)] border-none',
    textClass: 'text-slate-600',
    avatarBorder: 'border-[#e0e5ec] shadow-[5px_5px_10px_rgb(163,177,198),-5px_-5px_10px_rgba(255,255,255,0.5)]',
    isPro: true,
    solidColor: '#e0e5ec'
  },
  {
    id: 'outline-blue',
    name: 'Blueprint',
    backgroundClass: 'bg-[#0044cc]',
    buttonClass: 'bg-transparent text-white border-2 border-white/30 hover:bg-white hover:text-[#0044cc] hover:border-white rounded-full dashed',
    textClass: 'text-white',
    avatarBorder: 'border-white border-dashed border-2',
    isPro: true,
    solidColor: '#0044cc'
  },
  {
    id: 'mono-light',
    name: 'Magazine',
    backgroundClass: 'bg-[#f5f5f0]',
    buttonClass: 'bg-transparent text-black border-b border-black rounded-none hover:pl-4 transition-all',
    textClass: 'text-black',
    avatarBorder: 'border-black',
    isPro: true,
    solidColor: '#f5f5f0'
  },

  // Animated Themes
  {
    id: 'animated-hologram',
    name: 'Hologram',
    backgroundClass: 'bg-black',
    buttonClass: 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20',
    textClass: 'text-white',
    avatarBorder: 'border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.5)]',
    isPro: true,
    solidColor: '#000000'
  },
  {
    id: 'animated-aurora',
    name: 'Aurora Borealis',
    backgroundClass: 'bg-[#0a0a0a]',
    buttonClass: 'bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/15',
    textClass: 'text-white',
    avatarBorder: 'border-purple-400/30',
    isPro: true,
    solidColor: '#0a0a0a'
  },
  {
    id: 'animated-starfield',
    name: 'Starfield',
    backgroundClass: 'bg-slate-950',
    buttonClass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-lg shadow-white/5',
    textClass: 'text-white',
    avatarBorder: 'border-white/20',
    isPro: true,
    solidColor: '#020617'
  },
  {
    id: 'animated-matrix',
    name: 'Matrix Digital',
    backgroundClass: 'bg-black',
    buttonClass: 'bg-black text-[#00ff41] border border-[#00ff41] hover:bg-[#00ff41]/20 font-mono shadow-[0_0_10px_rgba(0,255,65,0.2)]',
    textClass: 'text-[#00ff41]',
    avatarBorder: 'border-[#00ff41]',
    isPro: true,
    solidColor: '#000000'
  },
  {
    id: 'animated-glitch',
    name: 'Cyber Glitch',
    backgroundClass: 'bg-[#050505]',
    buttonClass: 'bg-transparent text-[#ff00ff] border-2 border-[#ff00ff] hover:bg-[#ff00ff] hover:text-black font-black italic shadow-[4px_4px_0px_#00ffff]',
    textClass: 'text-white drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]',
    avatarBorder: 'border-[#ff00ff] shadow-[0_0_10px_#00ffff]',
    isPro: true,
    solidColor: '#050505'
  },
  {
    id: 'animated-nodus-official',
    name: 'Nodus Official',
    backgroundClass: 'bg-[#0f1f1a]',
    buttonClass: 'bg-white text-slate-900 border border-white hover:bg-slate-50 font-bold shadow-[0_0_20px_rgba(172,200,162,0.2)]',
    textClass: 'text-[#e8f5e9]',
    avatarBorder: 'border-[#acc8a2] shadow-[0_0_20px_rgba(172,200,162,0.4)]',
    isPro: true,
    solidColor: '#0f1f1a'
  },
  {
    id: 'animated-mesh',
    name: 'Liquid Mesh',
    backgroundClass: 'bg-slate-900',
    buttonClass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-lg',
    textClass: 'text-white',
    avatarBorder: 'border-white/20',
    isPro: true,
    solidColor: '#0f172a'
  },
  {
    id: 'animated-cybergrid',
    name: 'Retro Grid',
    backgroundClass: 'bg-[#050510]',
    buttonClass: 'bg-[#050510]/80 backdrop-blur-sm text-fuchsia-400 border border-fuchsia-500/50 hover:bg-fuchsia-500/20 hover:text-white',
    textClass: 'text-fuchsia-100',
    avatarBorder: 'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]',
    isPro: true,
    solidColor: '#050510'
  },
  {
    id: 'animated-shapes',
    name: 'Zen Shapes',
    backgroundClass: 'bg-slate-50',
    buttonClass: 'bg-white/60 backdrop-blur-md text-indigo-900 border border-white/40 hover:bg-white/80 shadow-sm',
    textClass: 'text-indigo-950',
    avatarBorder: 'border-indigo-100',
    isPro: true,
    solidColor: '#f8fafc'
  },
  {
    id: 'animated-neon-city',
    name: 'Pixel City',
    backgroundClass: 'bg-[#0d0221]',
    buttonClass: 'bg-[#2e1065] text-yellow-300 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#2e1065] font-black shadow-[4px_4px_0px_#c026d3]',
    textClass: 'text-white drop-shadow-[2px_2px_0px_#4c1d95]',
    avatarBorder: 'border-yellow-400 shadow-[4px_4px_0px_#c026d3]',
    isPro: true,
    solidColor: '#0d0221'
  },
  {
    id: 'animated-geo-flow',
    name: 'Pastel Flow',
    backgroundClass: 'bg-[#fffdf5]',
    buttonClass: 'bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-200 rounded-3xl hover:rounded-xl transition-all duration-500 shadow-sm',
    textClass: 'text-slate-800',
    avatarBorder: 'border-white',
    isPro: true,
    solidColor: '#fffdf5'
  },
  {
    id: 'animated-space-warp',
    name: 'Hyperdrive',
    backgroundClass: 'bg-black',
    buttonClass: 'bg-black/50 backdrop-blur-md text-white border border-white/50 hover:bg-white hover:text-black transition-colors skew-x-[-10deg] rounded-none',
    textClass: 'text-white tracking-widest uppercase',
    avatarBorder: 'border-white/50',
    isPro: true,
    solidColor: '#000000'
  },
  {
    id: 'animated-waves',
    name: 'Ocean Breeze',
    backgroundClass: 'bg-[#E0F7FA]',
    buttonClass: 'bg-white/90 text-[#006064] border-none shadow-[0_4px_15px_rgba(0,188,212,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(0,188,212,0.4)] rounded-xl',
    textClass: 'text-[#006064]',
    avatarBorder: 'border-white ring-4 ring-[#4DD0E1]/30',
    isPro: true,
    solidColor: '#E0F7FA'
  }
];

export const SOCIAL_NETWORKS = [
  // Redes Sociais Gerais
  { id: 'custom', name: 'Link Personalizado', icon: LinkIcon, baseUrl: '', placeholder: 'https://seu-site.com' },
  { id: 'instagram', name: 'Instagram', icon: SiInstagram, baseUrl: 'https://instagram.com/', placeholder: '@usuario' },
  { id: 'facebook', name: 'Facebook', icon: SiFacebook, baseUrl: 'https://facebook.com/', placeholder: 'usuario' },
  { id: 'twitter', name: 'X (Twitter)', icon: SiX, baseUrl: 'https://x.com/', placeholder: '@usuario' },
  { id: 'tiktok', name: 'TikTok', icon: SiTiktok, baseUrl: 'https://tiktok.com/@', placeholder: '@usuario' },
  { id: 'threads', name: 'Threads', icon: SiThreads, baseUrl: 'https://threads.net/@', placeholder: '@usuario' },
  { id: 'linkedin', name: 'LinkedIn', icon: SiLinkedin, baseUrl: 'https://linkedin.com/in/', placeholder: 'usuario' },
  { id: 'whatsapp', name: 'WhatsApp', icon: SiWhatsapp, baseUrl: 'https://wa.me/', placeholder: '55999999999' },
  { id: 'telegram', name: 'Telegram', icon: SiTelegram, baseUrl: 'https://t.me/', placeholder: 'usuario' },

  // Vídeo / Streaming
  { id: 'youtube', name: 'YouTube', icon: SiYoutube, baseUrl: 'https://youtube.com/@', placeholder: '@canal' },
  { id: 'twitch', name: 'Twitch', icon: SiTwitch, baseUrl: 'https://twitch.tv/', placeholder: 'usuario' },
  { id: 'vimeo', name: 'Vimeo', icon: SiVimeo, baseUrl: 'https://vimeo.com/', placeholder: 'usuario' },

  // Música / Áudio
  { id: 'spotify', name: 'Spotify', icon: SiSpotify, baseUrl: 'https://open.spotify.com/user/', placeholder: 'usuario' },
  { id: 'soundcloud', name: 'SoundCloud', icon: SiSoundcloud, baseUrl: 'https://soundcloud.com/', placeholder: 'usuario' },
  { id: 'applemusic', name: 'Apple Music', icon: SiApplemusic, baseUrl: 'https://music.apple.com/profile/', placeholder: 'usuario' },

  // Profissional / Portfólio
  { id: 'github', name: 'GitHub', icon: SiGithub, baseUrl: 'https://github.com/', placeholder: 'usuario' },
  { id: 'behance', name: 'Behance', icon: SiBehance, baseUrl: 'https://behance.net/', placeholder: 'usuario' },
  { id: 'dribbble', name: 'Dribbble', icon: SiDribbble, baseUrl: 'https://dribbble.com/', placeholder: 'usuario' },
  { id: 'pinterest', name: 'Pinterest', icon: SiPinterest, baseUrl: 'https://pinterest.com/', placeholder: 'usuario' },

  // Games / Comunidades
  { id: 'discord', name: 'Discord', icon: SiDiscord, baseUrl: 'https://discord.gg/', placeholder: 'convite' },
  { id: 'steam', name: 'Steam', icon: SiSteam, baseUrl: 'https://steamcommunity.com/id/', placeholder: 'usuario' },

  // Vendas / Monetização
  { id: 'shopee', name: 'Shopee', icon: SiShopee, baseUrl: 'https://shopee.com.br/', placeholder: 'loja' },
  { id: 'amazon', name: 'Amazon Store', icon: SiAmazon, baseUrl: 'https://amazon.com/shop/', placeholder: 'storefront' },

  // Contato
  { id: 'email', name: 'Email', icon: Mail, baseUrl: 'mailto:', placeholder: 'seu@email.com' },
  { id: 'site', name: 'Site / Blog', icon: Globe, baseUrl: 'https://', placeholder: 'seusite.com' },
];
