
import { Theme, FontOption, Product } from './types';
import {
  Mail, Globe, Link as LinkIcon, Phone
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
  { name: 'Montserrat', family: "'Montserrat', sans-serif", type: 'sans' },
  { name: 'Tech Outfit', family: "'Outfit', sans-serif", type: 'sans' },
  { name: 'Space Tech', family: "'Space Grotesk', sans-serif", type: 'sans' },
  { name: 'Modern Organic', family: "'Bricolage Grotesque', sans-serif", type: 'sans' },
  { name: 'Art Display', family: "'Syne', sans-serif", type: 'display' },
  { name: 'Classic Serif', family: "'Merriweather', serif", type: 'serif' },
  { name: 'Elegant', family: "'Playfair Display', serif", type: 'serif' },
  { name: 'Soft Serif', family: "'Lora', serif", type: 'serif', isPro: true },
  { name: 'High-End Serif', family: "'Cormorant Garamond', serif", type: 'serif', isPro: true },
  { name: 'Cinzel Decorative', family: "'Cinzel', serif", type: 'display', isPro: true },
  { name: 'Coding Mono', family: "'Fira Code', monospace", type: 'mono', isPro: true },
  { name: 'Bold Impact', family: "'Oswald', sans-serif", type: 'display', isPro: true },
  { name: 'Retro Gamer', family: "'Righteous', cursive", type: 'display', isPro: true },
  { name: 'Impact Title', family: "'Bebas Neue', sans-serif", type: 'display', isPro: true },
  { name: 'Comic Book', family: "'Bangers', system-ui", type: 'display', isPro: true },
  { name: 'Poster', family: "'Abril Fatface', cursive", type: 'display', isPro: true },
  { name: 'Beach Vibe', family: "'Pacifico', cursive", type: 'handwriting', isPro: true },
  { name: '8-Bit Retro', family: "'Press Start 2P', cursive", type: 'display', isPro: true },
  { name: 'Neon Line', family: "'Monoton', display", type: 'display', isPro: true },
  { name: 'Horror Fun', family: "'Creepster', cursive", type: 'display', isPro: true },
  { name: 'Soft Round', family: "'Fredoka', sans-serif", type: 'sans', isPro: true },
  { name: 'Marker Street', family: "'Permanent Marker', cursive", type: 'handwriting', isPro: true },
  { name: 'Fancy Fun', family: "'Lobster', cursive", type: 'display', isPro: true },
  { name: 'Wild Beast', family: "'Rubik Beastly', display", type: 'display', isPro: true },
  { name: 'Highlight Slab', family: "'Zilla Slab Highlight', serif", type: 'serif', isPro: true },
  { name: 'Balloon thick', family: "'Modak', display", type: 'display', isPro: true },
  { name: 'Explosive Fun', family: "'Honk', display", type: 'display', isPro: true },
  { name: 'Editorial Serif', family: "'Caudex', serif", type: 'serif', isPro: true },
  { name: 'Italiana Display', family: "'Italiana', serif", type: 'display', isPro: true },
  { name: 'Indie Variable', family: "'Fraunces', serif", type: 'serif', isPro: true },
  { name: 'Brutalist Mono', family: "'Space Mono', monospace", type: 'mono', isPro: true },
  { name: 'Clean Handwriting', family: "'Shadows Into Light', cursive", type: 'handwriting', isPro: true },
  { name: 'Grunge Style', family: "'Rock Salt', cursive", type: 'handwriting', isPro: true },
  { name: 'Typewriter', family: "'Special Elite', cursive", type: 'mono', isPro: true },
  { name: 'Unbounded Bold', family: "'Unbounded', display", type: 'display', isPro: true },
  { name: 'Neo-Grotesk', family: "'Schibsted Grotesk', sans-serif", type: 'sans', isPro: true },
  { name: 'Liquid Crisis', family: "'Climate Crisis', display", type: 'display', isPro: true },
  { name: 'Isometric Nabla', family: "'Nabla', display", type: 'display', isPro: true },
  { name: 'Drip Puddles', family: "'Rubik Puddles', display", type: 'display', isPro: true },
  { name: 'Dot Matrix', family: "'DotGothic16', monospace", type: 'mono', isPro: true },
  { name: 'CRT Terminal', family: "'VT323', monospace", type: 'mono', isPro: true },
  { name: 'Pixel Game', family: "'Silkscreen', cursive", type: 'display', isPro: true },
  { name: 'Abstract Moirai', family: "'Moirai One', display", type: 'display', isPro: true },
  { name: 'Heavy Bakbak', family: "'Bakbak One', display", type: 'display', isPro: true },
  { name: 'Tech Chakra', family: "'Chakra Petch', sans-serif", type: 'sans', isPro: true },
  { name: 'Space Michroma', family: "'Michroma', sans-serif", type: 'sans', isPro: true },
  { name: 'Fashion Tenor', family: "'Tenor Sans', sans-serif", type: 'sans', isPro: true },
  { name: 'Medieval Display', family: "'Almendra Display', serif", type: 'display', isPro: true },
  { name: 'Fairytale Fun', family: "'Henny Penny', display", type: 'display', isPro: true },
  { name: 'Metal Mania', family: "'Metal Mania', display", type: 'display', isPro: true },
  { name: 'Dripping Horror', family: "'Nosifer', display", type: 'display', isPro: true },
  { name: 'Elegant Script', family: "'Pinyon Script', cursive", type: 'handwriting', isPro: true },
  { name: 'Gothic Fraktur', family: "'UnifrakturMaguntia', serif", type: 'display', isPro: true },
  { name: 'Sci-Fi Grid', family: "'Wallpoet', display", type: 'display', isPro: true },
  { name: 'Shadow Jacques', family: "'Jacques Francois Shadow', serif", type: 'display', isPro: true },
  { name: 'Victorian Shadow', family: "'Vast Shadow', display", type: 'display', isPro: true },
  { name: 'Antique Glass', family: "'Glass Antiqua', display", type: 'display', isPro: true },
  { name: 'Classic Calligraphy', family: "'Fondamento', cursive", type: 'handwriting', isPro: true },
  { name: 'Lucky Clover', family: "'Irish Grover', display", type: 'display', isPro: true },
  { name: 'Modern Lexend', family: "'Lexend', sans-serif", type: 'sans', isPro: true },
  { name: 'Simple Questrial', family: "'Questrial', sans-serif", type: 'sans', isPro: true },
  { name: 'Josefin Elegant', family: "'Josefin Sans', sans-serif", type: 'sans', isPro: true },
  { name: 'Urbanist Clean', family: "'Urbanist', sans-serif", type: 'sans', isPro: true },
  { name: 'Kumbh Geometric', family: "'Kumbh Sans', sans-serif", type: 'sans', isPro: true },
  { name: 'Lustria Serif', family: "'Lustria', serif", type: 'serif', isPro: true },
  { name: 'Editorial Spectral', family: "'Spectral', serif", type: 'serif', isPro: true },
  { name: 'Crimson Premium', family: "'Crimson Pro', serif", type: 'serif', isPro: true },
  { name: 'Alice Classic', family: "'Alice', serif", type: 'serif', isPro: true },
  { name: 'Academic Cardo', family: "'Cardo', serif", type: 'serif', isPro: true },
  { name: 'Chunky Bagel', family: "'Bagel Fat One', display", type: 'display', isPro: true },
  { name: 'Tactical Stencil', family: "'Black Ops One', display", type: 'display', isPro: true },
  { name: 'Speed Faster', family: "'Faster One', display", type: 'display', isPro: true },
  { name: 'Glitch Megrim', family: "'Megrim', display", type: 'display', isPro: true },
  { name: 'Cyber Orbitron', family: "'Orbitron', sans-serif", type: 'display', isPro: true },
  { name: 'Pirate Display', family: "'Pirata One', display", type: 'display', isPro: true },
  { name: 'Stencil Classic', family: "'Stardos Stencil', display", type: 'display', isPro: true },
];

import { nodusOfficialTheme } from './themes/nodus-official';
import { kawaiiSakuraTheme } from './themes/kawaii-sakura';
import { businessThemes } from './themes/business';
import { kawaiiThemes } from './themes/kawaii';
import { modernThemes } from './themes/modern';
import { artisticThemes } from './themes/artistic';
import { socialThemes } from './themes/social';

export const THEMES: Theme[] = [
  {
    id: 'custom',
    name: 'Personalizado',
    backgroundClass: 'bg-white',
    buttonClass: 'bg-slate-950 text-white rounded-2xl font-bold',
    textClass: 'text-slate-950',
    avatarBorder: 'border-slate-200 border-2',
    category: 'solid',
    solidColor: '#ffffff',
    buttonHex: '#020617',
    cardClass: 'bg-white border border-slate-200 shadow-sm rounded-2xl',
    fontFamily: "'Questrial', sans-serif"
  },
  nodusOfficialTheme,
  kawaiiSakuraTheme,
  ...businessThemes,
  ...kawaiiThemes,
  ...modernThemes,
  ...artisticThemes,
  ...socialThemes
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
  { id: 'telefone', name: 'Telefone', icon: Phone, baseUrl: 'tel:', placeholder: '55999999999' },
];
