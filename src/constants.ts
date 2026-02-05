
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
  // Basics
  {
    id: 'default',
    name: 'Clean White',
    backgroundClass: 'bg-white',
    buttonClass: 'bg-slate-100 text-slate-900 font-semibold hover:bg-slate-200 hover:scale-[1.02] shadow-sm',
    textClass: 'text-slate-900',
    avatarBorder: 'border-slate-200'
  },
  {
    id: 'minimal-grey',
    name: 'Air Grey',
    backgroundClass: 'bg-slate-50',
    buttonClass: 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md',
    textClass: 'text-slate-800',
    avatarBorder: 'border-slate-300'
  },
  {
    id: 'dark',
    name: 'Midnight',
    backgroundClass: 'bg-slate-950',
    buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800',
    textClass: 'text-white',
    avatarBorder: 'border-slate-800'
  },

  // Gradients
  {
    id: 'gradient-sunset',
    name: 'Sunset Blvd',
    backgroundClass: 'bg-gradient-to-b from-orange-400 via-rose-500 to-brand-600',
    buttonClass: 'bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/40 shadow-lg',
    textClass: 'text-white drop-shadow-md',
    avatarBorder: 'border-white/50'
  },
  {
    id: 'gradient-ocean',
    name: 'Deep Ocean',
    backgroundClass: 'bg-gradient-to-tr from-cyan-600 via-blue-700 to-slate-900',
    buttonClass: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm hover:from-cyan-500/30 hover:to-blue-500/30 text-white border border-white/20',
    textClass: 'text-cyan-50',
    avatarBorder: 'border-cyan-200/30'
  },
  {
    id: 'gradient-aurora',
    name: 'Aurora',
    backgroundClass: 'bg-gradient-to-bl from-green-400 via-teal-500 to-emerald-600',
    buttonClass: 'bg-white text-teal-800 font-bold hover:bg-teal-50 shadow-xl shadow-teal-900/20',
    textClass: 'text-white drop-shadow',
    avatarBorder: 'border-white'
  },

  // Colors & Styles
  {
    id: 'pastel-pink',
    name: 'Cotton Candy',
    backgroundClass: 'bg-pink-100',
    buttonClass: 'bg-white text-pink-500 font-bold rounded-xl border-b-4 border-pink-200 hover:border-pink-300 hover:-translate-y-0.5 active:border-b-0 active:translate-y-0.5 transition-all',
    textClass: 'text-pink-800',
    avatarBorder: 'border-pink-200'
  },
  {
    id: 'retro-pop',
    name: 'Retro Pop',
    backgroundClass: 'bg-yellow-400',
    buttonClass: 'bg-white text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none',
    textClass: 'text-black font-black',
    avatarBorder: 'border-black border-4'
  },
  {
    id: 'leafy',
    name: 'Forest',
    backgroundClass: 'bg-[#1a3c30]',
    buttonClass: 'bg-[#2d5a49] text-[#e8f5e9] border border-[#407a63] hover:bg-[#407a63] font-serif italic',
    textClass: 'text-[#e8f5e9]',
    avatarBorder: 'border-[#407a63]'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    backgroundClass: 'bg-black',
    buttonClass: 'bg-black text-[#00ff41] border border-[#00ff41] hover:bg-[#00ff41] hover:text-black font-mono shadow-[0_0_10px_rgba(0,255,65,0.3)] hover:shadow-[0_0_20px_rgba(0,255,65,0.6)] rounded-sm',
    textClass: 'text-[#00ff41]',
    avatarBorder: 'border-[#00ff41]'
  },
  {
    id: 'luxury-gold',
    name: 'Luxury',
    backgroundClass: 'bg-[#121212]',
    buttonClass: 'bg-transparent text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#121212] tracking-widest uppercase text-xs',
    textClass: 'text-[#D4AF37]',
    avatarBorder: 'border-[#D4AF37]'
  },
  {
    id: 'neumorphism',
    name: 'Soft Plastic',
    backgroundClass: 'bg-[#e0e5ec]',
    buttonClass: 'bg-[#e0e5ec] text-slate-600 font-bold shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)] hover:shadow-[inset_9px_9px_16px_rgb(163,177,198),inset_-9px_-9px_16px_rgba(255,255,255,0.5)] border-none',
    textClass: 'text-slate-600',
    avatarBorder: 'border-[#e0e5ec] shadow-[5px_5px_10px_rgb(163,177,198),-5px_-5px_10px_rgba(255,255,255,0.5)]'
  },
  {
    id: 'outline-blue',
    name: 'Blueprint',
    backgroundClass: 'bg-[#0044cc]',
    buttonClass: 'bg-transparent text-white border-2 border-white/30 hover:bg-white hover:text-[#0044cc] hover:border-white rounded-full dashed',
    textClass: 'text-white',
    avatarBorder: 'border-white border-dashed border-2'
  },
  {
    id: 'mono-light',
    name: 'Magazine',
    backgroundClass: 'bg-[#f5f5f0]',
    buttonClass: 'bg-transparent text-black border-b border-black rounded-none hover:pl-4 transition-all',
    textClass: 'text-black',
    avatarBorder: 'border-black'
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    backgroundClass: 'bg-[#e6e6fa]',
    buttonClass: 'bg-white text-[#9370db] font-medium border border-[#dcd0ff] hover:bg-[#f3e5f5] shadow-sm rounded-xl',
    textClass: 'text-[#4b0082]',
    avatarBorder: 'border-[#dcd0ff]'
  },
  {
    id: 'vampire',
    name: 'Vampire',
    backgroundClass: 'bg-[#2a0a10]',
    buttonClass: 'bg-[#4a0e1c] text-[#ffb3b3] border border-[#800020] hover:bg-[#800020] hover:text-white hover:shadow-[0_0_15px_#800020]',
    textClass: 'text-[#ffcccc]',
    avatarBorder: 'border-[#800020]'
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    backgroundClass: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
    buttonClass: 'glass-effect', // We will handle this specifically in the Preview component
    textClass: 'text-white',
    avatarBorder: 'border-white/30'
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
