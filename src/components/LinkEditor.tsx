import React, { useState } from 'react';
// @ts-ignore
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { LinkItem, UserProfile } from '../types';
import { SiSpotify } from 'react-icons/si';
import { compressImage } from '../utils/imageUtils';
import { fetchMusicMetadata } from '../utils/musicUtils';
import {
  Trash2,
  GripVertical,
  Plus,
  Link as LinkIcon,
  Image as ImageIcon,
  BarChart2,
  Pencil,
  Archive,
  LayoutGrid,
  LayoutTemplate,
  MessageCircle,
  FolderHeart,
  Zap,
  ChevronRight,
  ChevronDown,
  Folder,
  Sparkles,
  CreditCard,
  Youtube,
  Ban,
  X,
  Share2
} from 'lucide-react';

const DeezerIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 1433 1431" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" fillRule="evenodd" d="M1201.8 218.3c13.2-76.7 32.7-125 54.2-125.1h.1c40.2.2 72.7 167.5 72.7 374.1 0 206.7-32.6 374.1-72.8 374.1-16.5 0-31.7-28.4-44-76.1-19.3 174.5-59.5 294.4-106 294.4-36 0-68.3-72-90-185.6-14.8 216-52.1 369.3-95.6 369.3-27.3 0-52.3-60.7-70.7-159.6-22.2 204.1-73.5 347.2-133.2 347.2-59.8 0-111.1-143-133.2-347.2-18.3 98.9-43.3 159.6-70.7 159.6-43.6 0-80.8-153.3-95.6-369.3-21.7 113.6-53.9 185.6-90 185.6-46.5 0-86.7-119.9-106.1-294.4-12.1 47.8-27.4 76.1-43.9 76.1-40.3 0-72.9-167.4-72.9-374.1 0-206.6 32.6-374.1 72.9-374.1 21.6 0 40.9 48.4 54.3 125.1C252.7 86 287.6 0 327 0c46.8 0 87.3 121.6 106.5 298.2 18.8-128.5 47.2-210.4 79.1-210.4 44.7 0 82.7 161.1 96.8 385.9 26.4-115.2 64.8-187.5 107.2-187.5s80.7 72.3 107.1 187.5c14.1-224.8 52.1-385.9 96.8-385.9 31.8 0 60.2 81.9 79.1 210.4C1018.7 121.6 1059.3 0 1106.1 0c39.2 0 74.2 86 95.7 218.3M41.3 597.8C18.5 597.8 0 523 0 430.5s18.5-167.2 41.3-167.2c22.9 0 41.4 74.7 41.4 167.2S64.2 597.8 41.3 597.8m1350.3 0c-22.9 0-41.3-74.8-41.3-167.3s18.4-167.2 41.3-167.2c22.8 0 41.3 74.7 41.3 167.2s-18.5 167.3-41.3 167.3" />
  </svg>
);

interface SortableLinkItemProps {
  link: LinkItem;
  updateLink: (id: string, field: keyof LinkItem, value: any) => void;
  updateLinkFields: (id: string, updates: Partial<LinkItem>) => void;
  removeLink: (id: string) => void;
  toggleLink: (id: string) => void;
  isExpanded: boolean;
  toggleCollection: (id: string) => void;
  isCollectionExpanded: boolean;
  profile: UserProfile;
  level: number;
  expandedLinks: Record<string, boolean>;
  setExpandedLinks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedCollections: Record<string, boolean>;
  setExpandedCollections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

function SortableLinkItem({
  link,
  updateLink,
  updateLinkFields,
  removeLink,
  isCollectionExpanded,
  profile,
  level,
  expandedLinks,
  setExpandedLinks,
  expandedCollections,
  setExpandedCollections
}: SortableLinkItemProps) {
  const dragControls = useDragControls();
  const [openAnimationMenu, setOpenAnimationMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isExpanded = !!expandedLinks[link.id];
  const toggleLink = (id: string) => {
    setExpandedLinks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCollection = (id: string) => {
    setExpandedCollections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // LinkEditor is used recursively here. It must be hoisted or available.

  // Auto-detect music metadata when URL changes
  React.useEffect(() => {
    if (!link.url) return;

    const checkMusicMetadata = async () => {
      const url = link.url;
      const isSpotify = url.includes('open.spotify.com/') && (url.includes('/track/') || url.includes('/album/') || url.includes('/playlist/'));
      const isDeezer = url.includes('deezer.com/') || url.includes('deezer.page.link/');

      if ((isSpotify || isDeezer) && (!link.title || link.title === 'Novo Link' || link.title === 'Link sem título')) {
        const type = isSpotify ? 'spotify' : 'deezer';

        // Only update type if not set
        if (link.embedType !== type) {
          updateLinkFields(link.id, { embedType: type });
        }

        try {
          const metadata = await fetchMusicMetadata(url);
          if (metadata) {
            console.log('🎵 Metadata fetched via useEffect:', metadata);
            updateLinkFields(link.id, {
              title: metadata.title,
              subtitle: metadata.artist,
              image: metadata.thumbnailUrl,
              embedType: type
            });
          }
        } catch (error) {
          console.error('Error fetching metadata:', error);
        }
      }
    };

    const timeoutId = setTimeout(checkMusicMetadata, 800); // Debounce
    return () => clearTimeout(timeoutId);
  }, [link.url]);

  return (
    <Reorder.Item
      value={link}
      dragListener={false}
      dragControls={dragControls}
      id={link.id}
      layout
      className={`relative mb-4 overflow-hidden rounded-2xl border ${isExpanded ? 'border-[#32a800] ring-1 ring-[#32a800]/10' : 'border-slate-200'} bg-white`}
      whileDrag={{
        zIndex: 50
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white">
        {/* RENDER COLLECTION ITEM */}
        {link.type === 'collection' ? (
          <div className="overflow-hidden">
            <div className="flex border-b border-slate-100">
              {/* Drag Handle */}
              <div
                className="w-10 md:w-12 flex items-center justify-center cursor-move text-slate-300 hover:text-slate-500 touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical size={16} />
              </div>

              {/* Header Content */}
              <div className="flex-1 py-4 md:py-5 pr-3 md:pr-5 flex items-center gap-2 md:gap-4 overflow-hidden">
                <div onClick={() => toggleCollection(link.id)} className="cursor-pointer text-slate-400 hover:text-slate-900 transition-colors shrink-0">
                  {isCollectionExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                    className="w-full font-semibold text-slate-800 bg-transparent border-none focus:ring-0 p-0 text-sm placeholder:text-slate-300 truncate"
                    placeholder="Nome da Coleção"
                  />
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                    {link.children?.length || 0} {(link.children?.length === 1) ? 'item configurado' : 'itens configurados'}
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-6 shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.isActive}
                      onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#32a800]"></div>
                  </label>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Content (Nested Editor) */}
            <AnimatePresence>
              {isCollectionExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-slate-50/50"
                >
                  <div className="overflow-hidden bg-slate-50/50">
                    <div className="p-3 md:p-6 md:pl-12 border-t border-slate-100 space-y-5 md:space-y-8">
                      {/* Collection Layout Picker */}
                      <div className="space-y-3 pb-6 border-b border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Layout do Grupo</label>
                        <div className="flex flex-col gap-2">
                          {[
                            { id: 'stacked', label: 'Lista Empilhada', desc: 'Links um abaixo do outro', icon: <LayoutGrid size={16} /> },
                            { id: 'carousel', label: 'Carrossel', desc: 'Deslize lateral para ver', icon: <Sparkles size={16} /> }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => updateLink(link.id, 'layout', opt.id)}
                              className={`flex-1 p-3 rounded-xl border text-left flex items-center sm:items-start gap-3 transition-all ${((link.layout || 'stacked') === 'carousel' ? 'carousel' : 'stacked') === opt.id
                                ? 'bg-[#32a800]/5 border-[#32a800] ring-1 ring-[#32a800]/10'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                              <div className={`shrink-0 flex items-center justify-center p-2 rounded-lg ${((link.layout || 'stacked') === 'carousel' ? 'carousel' : 'stacked') === opt.id ? 'bg-[#32a800] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                {opt.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs truncate ${((link.layout || 'stacked') === 'carousel' ? 'carousel' : 'stacked') === opt.id ? 'text-[#32a800]' : 'text-slate-700'}`}>{opt.label}</div>
                                <div className="text-[9px] text-slate-400 font-medium leading-tight line-clamp-1">{opt.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="md:px-0">
                        <LinkEditor
                          links={link.children || []}
                          onChange={(newChildren) => updateLink(link.id, 'children', newChildren)}
                          level={level + 1}
                          profile={profile}
                          expandedLinks={expandedLinks}
                          setExpandedLinks={setExpandedLinks}
                          expandedCollections={expandedCollections}
                          setExpandedCollections={setExpandedCollections}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* RENDER STANDARD LINK ITEM */
          <div className="flex flex-col">
            {/* Header Row (Always Visible) */}
            <div className="flex items-center w-full min-h-[72px]">
              {/* Drag Handle */}
              <div
                className="w-10 md:w-12 flex items-center justify-center cursor-move text-slate-300 hover:text-[#32a800] hover:bg-[#32a800]/5 self-stretch touch-none border-r border-slate-50 transition-colors"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical size={16} />
              </div>

              {/* Image Thumbnail */}
              <div className="shrink-0 mx-4">
                <div className="relative">
                  <input
                    type="file"
                    id={`file-${link.id}`}
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const compressed = await compressImage(e.target.files[0], 400, 0.8);
                          updateLink(link.id, 'image', compressed);
                        } catch (error) {
                          console.error('Error processing image:', error);
                        }
                      }
                    }}
                  />
                  {link.image ? (
                    <div className="w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                      <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <button
                      onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                      className="w-11 h-11 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#32a800] hover:bg-white hover:border-[#32a800] transition-all"
                    >
                      <ImageIcon size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Chevron (Click to Expand) */}
              <div
                className="flex-1 min-w-0 pr-2 py-4 cursor-pointer group/title"
                onClick={() => toggleLink(link.id)}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="font-semibold text-slate-800 truncate text-xs md:text-sm flex items-center gap-2">
                    {link.title || 'Link sem título'}
                    {/* Schedule Badges */}
                    {link.scheduleStart && new Date(link.scheduleStart) > new Date() && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-50 text-[9px] font-bold text-blue-600 border border-blue-100 uppercase tracking-tighter flex items-center gap-1">
                        🕒 Agendado
                      </span>
                    )}
                    {link.scheduleEnd && new Date(link.scheduleEnd) < new Date() && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-red-50 text-[9px] font-bold text-red-600 border border-red-100 uppercase tracking-tighter flex items-center gap-1">
                        🔴 Expirado
                      </span>
                    )}
                  </div>
                  {link.layout === 'social' ? (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-emerald-50 text-[9px] font-bold text-emerald-600 border border-emerald-100 uppercase tracking-tighter">
                      Ícone do Topo
                    </span>
                  ) : (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-50 text-[9px] font-bold text-blue-600 border border-blue-100 uppercase tracking-tighter">
                      Botão na Lista
                    </span>
                  )}
                </div>
                <div className="text-[10px] md:text-xs text-slate-400 truncate">
                  {link.url || 'Suas redes ou site'}
                </div>
              </div>

              {/* Right Actions: Edit(Expand) & Switch */}
              <div className="flex items-center gap-2 md:gap-6 pr-3 md:pr-6 shrink-0">
                <button
                  onClick={() => toggleLink(link.id)}
                  className={`p-1.5 md:p-2 rounded-xl transition-all ${isExpanded ? 'text-[#32a800] bg-[#32a800]/5 rotate-180' : 'text-slate-300 hover:text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <ChevronDown size={18} />
                </button>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={link.isActive}
                    onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 md:w-9 h-4 md:h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 md:after:h-4 after:w-3 md:after:w-4 after:transition-all peer-checked:bg-[#32a800]"></div>
                </label>
              </div>
            </div>

            {/* Expanded Body Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-slate-50/20"
                >
                  <div className="px-4 md:px-10 pb-6 md:pb-10 pt-6 md:pt-8 border-t border-slate-100">
                    {/* Main Edit Form */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-8 md:mb-10">
                      {/* Expanded Image (Larger with controls) */}
                      <div className="relative shrink-0">
                        {link.image ? (
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-slate-200 relative group/img shadow-sm">
                            <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-white/90 opacity-100 md:opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button
                                onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                                className="p-2.5 bg-white rounded-full text-slate-600 hover:text-[#32a800] shadow-md border border-slate-100"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={() => updateLink(link.id, 'image', undefined)}
                                className="p-2.5 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-md border border-slate-100"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                            className="w-20 h-20 md:w-24 md:h-24 bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-[#32a800] hover:text-[#32a800] transition-all group/btn"
                          >
                            <ImageIcon size={20} className="mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Imagem</span>
                          </button>
                        )}
                      </div>

                      {/* Inputs */}
                      <div className="flex-1 min-w-0 space-y-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Título</label>
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                            className="w-full font-semibold text-xl text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:border-[#32a800] focus:ring-1 focus:ring-[#32a800]/5 outline-none transition-all placeholder:text-slate-200"
                            placeholder="Nome do link"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">URL / Link</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const newUrl = e.target.value;

                              // Create updates object
                              const updates: Partial<LinkItem> = { url: newUrl };

                              // Auto detection logic
                              const isSpotify = newUrl.includes('open.spotify.com/') && (newUrl.includes('/track/') || newUrl.includes('/album/') || newUrl.includes('/playlist/'));
                              const isDeezer = newUrl.includes('deezer.com/') || newUrl.includes('deezer.page.link/');
                              const isYoutube = newUrl.includes('youtube.com/') || newUrl.includes('youtu.be/');

                              let detectedType: 'none' | 'youtube' | 'spotify' | 'deezer' = 'none';

                              if (isSpotify) detectedType = 'spotify';
                              else if (isDeezer) detectedType = 'deezer';
                              else if (isYoutube) {
                                // Only set as youtube embed if it has a valid video ID
                                const videoId = newUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                                if (videoId) {
                                  detectedType = 'youtube';
                                }
                              }

                              // Update embedType based on detection
                              updates.embedType = detectedType;

                              if (isSpotify || isDeezer) {
                                // Call fetch intentionally without awaiting to not block UI
                                fetchMusicMetadata(newUrl).then(metadata => {
                                  if (metadata) {
                                    console.log('🎵 Metadata found:', metadata);

                                    // Check if it's an album with tracks
                                    if (metadata.type === 'album' && metadata.tracks && metadata.tracks.length > 0) {
                                      const newChildren = metadata.tracks.map((track: any) => ({
                                        id: self.crypto.randomUUID(),
                                        title: track.title,
                                        subtitle: track.artist,
                                        image: track.image, // Add image
                                        url: track.url,
                                        embedType: 'spotify' as const,
                                        layout: 'classic' as const, // Keeping conformant to LinkItem type, but parent is grid
                                        isActive: true,
                                        clicks: 0
                                      }));

                                      updateLinkFields(link.id, {
                                        title: metadata.title,
                                        subtitle: metadata.artist,
                                        image: metadata.thumbnailUrl,
                                        type: 'collection' as const,
                                        layout: 'grid' as const, // Provide grid layout for collection
                                        children: newChildren,
                                        url: ''
                                      });
                                    } else {
                                      // Normal single track update
                                      updateLinkFields(link.id, {
                                        title: metadata.title,
                                        subtitle: metadata.artist,
                                        image: metadata.thumbnailUrl,
                                        embedType: detectedType,
                                        url: newUrl
                                      });
                                    }
                                  }
                                }).catch(err => {
                                  console.error("Error fetching music metadata:", err);
                                });
                              }

                              // Apply immediate updates (URL + Type)
                              updateLinkFields(link.id, updates);
                            }}
                            className="w-full text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:border-[#32a800] focus:ring-1 focus:ring-[#32a800]/5 outline-none transition-all placeholder:text-slate-200"
                            placeholder="https://exemplo.com"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Descrição (Opcional)</label>
                          <input
                            type="text"
                            value={link.subtitle || ''}
                            onChange={(e) => updateLink(link.id, 'subtitle', e.target.value)}
                            className="w-full text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:border-[#32a800] focus:ring-1 focus:ring-[#32a800]/5 outline-none transition-all"
                            placeholder="Breve descrição ou subtítulo"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Settings & Config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-10 pt-6 md:pt-8 border-t border-slate-100/50">
                      <div className="space-y-6 md:space-y-8">

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Animação</label>
                          <div className="relative">
                            <button
                              onClick={() => setOpenAnimationMenu(prev => prev === link.id ? null : link.id)}
                              className={`flex items-center justify-between w-full h-11 px-4 text-sm font-medium border rounded-xl transition-all ${link.highlight && link.highlight !== 'none' ? 'border-[#32a800] text-[#32a800] bg-[#32a800]/5' : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'}`}
                            >
                              <span className="capitalize">{link.highlight === 'none' || !link.highlight ? 'Sem efeito' : link.highlight}</span>
                              <ChevronDown size={18} className={`transition-transform duration-300 ${openAnimationMenu === link.id ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {openAnimationMenu === link.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-2xl z-50 p-2 shadow-xl"
                                >
                                  {['none', 'pulse', 'bounce', 'shake', 'glow', 'wobble'].map((anim) => (
                                    <button
                                      key={anim}
                                      onClick={() => {
                                        updateLink(link.id, 'highlight', anim);
                                        setOpenAnimationMenu(null);
                                      }}
                                      className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${link.highlight === anim ? 'bg-[#32a800] text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[#32a800]'}`}
                                    >
                                      {anim === 'none' ? 'Nenhuma' : anim.charAt(0).toUpperCase() + anim.slice(1)}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 md:space-y-8">
                        {/* Layout Picker */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Layout do Botão</label>
                          <div className="flex flex-col gap-2">
                            {[
                              { id: 'classic', label: 'Botão Clássico', desc: 'Largura total com ícone', icon: <LayoutGrid size={16} /> },
                              { id: 'card', label: 'Card Moderno', desc: 'Arredondado e sombra', icon: <LayoutTemplate size={16} /> },
                              { id: 'social', label: 'Rede Social (Topo)', desc: 'Ícone pequeno no topo', icon: <Share2 size={16} /> }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => updateLink(link.id, 'layout', opt.id)}
                                className={`p-3 md:p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${link.layout === opt.id
                                  ? 'bg-[#32a800]/5 border-[#32a800] ring-1 ring-[#32a800]/10'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                                  }`}
                              >
                                <div className={`flex items-center justify-center p-2 rounded-lg ${link.layout === opt.id ? 'bg-[#32a800] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                  {opt.icon}
                                </div>
                                <div className="flex-1">
                                  <div className={`text-xs md:text-sm font-semibold mb-0.5 ${link.layout === opt.id ? 'text-[#32a800]' : 'text-slate-700'}`}>{opt.label}</div>
                                  <div className="text-[9px] md:text-[10px] text-slate-400 font-medium leading-tight">{opt.desc}</div>
                                </div>
                                {link.layout === opt.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#32a800] mt-2" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Scheduling Section (PRO) */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Agendamento (PRO)</label>
                            {(!profile.planType || profile.planType === 'free') && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-tight">Bloqueado</span>
                            )}
                          </div>

                          <div className={`p-4 rounded-xl border ${(!profile.planType || profile.planType === 'free') ? 'bg-slate-50 border-slate-200 opacity-70 pointer-events-none' : 'bg-white border-slate-200'}`}>
                            <div className="grid grid-cols-1 gap-4">
                              {/* Start Date */}
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                  <div className={`w-2 h-2 rounded-full ${(link.scheduleStart && new Date(link.scheduleStart) > new Date()) ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                  Início (Agendar para o futuro)
                                </div>
                                <input
                                  type="datetime-local"
                                  value={link.scheduleStart ? new Date(link.scheduleStart).toISOString().slice(0, 16) : ''}
                                  onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                                    updateLink(link.id, 'scheduleStart', date);
                                  }}
                                  disabled={!profile.planType || profile.planType === 'free'}
                                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-[#32a800] focus:ring-1 focus:ring-[#32a800]/5 outline-none transition-all"
                                />
                              </div>

                              {/* End Date */}
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                  <div className={`w-2 h-2 rounded-full ${(link.scheduleEnd && new Date(link.scheduleEnd) < new Date()) ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                                  Fim (Expirar automaticamente)
                                </div>
                                <input
                                  type="datetime-local"
                                  value={link.scheduleEnd ? new Date(link.scheduleEnd).toISOString().slice(0, 16) : ''}
                                  onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                                    updateLink(link.id, 'scheduleEnd', date);
                                  }}
                                  disabled={!profile.planType || profile.planType === 'free'}
                                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-[#32a800] focus:ring-1 focus:ring-[#32a800]/5 outline-none transition-all"
                                />
                              </div>

                              {/* Status Message */}
                              {(link.scheduleStart || link.scheduleEnd) && (
                                <div className="pt-2 border-t border-slate-100">
                                  {link.scheduleStart && new Date(link.scheduleStart) > new Date() ? (
                                    <div className="text-[10px] font-semibold text-blue-600 flex items-center gap-1.5">
                                      <Sparkles size={12} /> Link agendado para aparecer em {new Date(link.scheduleStart).toLocaleDateString()}
                                    </div>
                                  ) : link.scheduleEnd && new Date(link.scheduleEnd) < new Date() ? (
                                    <div className="text-[10px] font-semibold text-red-500 flex items-center gap-1.5">
                                      <Archive size={12} /> Link expirado e oculto do perfil
                                    </div>
                                  ) : (
                                    <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5">
                                      <Zap size={12} fill="currentColor" /> Atualmente visível (Dentro do agendamento)
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                        <BarChart2 size={16} className="text-[#32a800]" />
                        <span className="font-bold text-[#32a800]">{link.clicks || 0}</span>
                        <span>cliques no total</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateLink(link.id, 'isArchived', !link.isArchived)}
                          className={`px-4 h-10 rounded-xl text-xs font-semibold transition-all ${link.isArchived ? 'bg-slate-900 text-white shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                          {link.isArchived ? 'Restaurar' : 'Arquivar'}
                        </button>

                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 h-10 rounded-xl text-xs font-semibold bg-transparent text-red-500 hover:text-red-600 transition-all"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation Overlay */}
                    <AnimatePresence>
                      {showDeleteConfirm && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4"
                        >
                          <div className="pt-8 flex items-center justify-between border-t border-slate-100">
                            <div className="flex items-center gap-3 text-red-500">
                              <Trash2 size={18} />
                              <span className="text-sm font-bold">Tem certeza que deseja excluir?</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-5 h-10 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-all"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => {
                                  removeLink(link.id);
                                  setShowDeleteConfirm(false);
                                }}
                                className="px-6 h-10 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95 shadow-sm shadow-red-100"
                              >
                                Confirmar Exclusão
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

interface LinkEditorProps {
  links: LinkItem[];
  onChange: (links: LinkItem[] | ((prev: LinkItem[]) => LinkItem[])) => void;
  level?: number;
  profile: UserProfile;
  expandedLinks?: Record<string, boolean>;
  setExpandedLinks?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedCollections?: Record<string, boolean>;
  setExpandedCollections?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

function LinkEditor({
  links,
  onChange,
  level = 0,
  profile,
  expandedLinks: externalExpandedLinks,
  setExpandedLinks: externalSetExpandedLinks,
  expandedCollections: externalExpandedCollections,
  setExpandedCollections: externalSetExpandedCollections
}: LinkEditorProps) {
  const [internalExpandedCollections, setInternalExpandedCollections] = useState<Record<string, boolean>>({});
  const [internalExpandedLinks, setInternalExpandedLinks] = useState<Record<string, boolean>>({});

  const expandedCollections = externalExpandedCollections || internalExpandedCollections;
  const setExpandedCollections = externalSetExpandedCollections || setInternalExpandedCollections;
  const expandedLinks = externalExpandedLinks || internalExpandedLinks;
  const setExpandedLinks = externalSetExpandedLinks || setInternalExpandedLinks;
  const [showArchive, setShowArchive] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use effect to handle mounting state for Portals
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isLimitReached = (profile.planType === 'free' || !profile.planType) && links.length >= 5;

  const activeLinks = links.filter(l => !l.isArchived);
  const archivedLinks = links.filter(l => l.isArchived);

  const toggleCollection = (id: string) => {
    setExpandedCollections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleLink = (id: string) => {
    setExpandedLinks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const addLink = () => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      clientId: crypto.randomUUID(),
      title: 'Novo Link',
      url: '',
      isActive: true,
      clicks: 0,
      layout: 'classic',
      type: 'link'
    };
    setExpandedLinks(prev => ({ ...prev, [newLink.id]: true }));
    // @ts-ignore
    onChange(prev => [newLink, ...prev]);
  };

  const addCollection = () => {
    const newCollection: LinkItem = {
      id: Date.now().toString(),
      clientId: crypto.randomUUID(),
      title: 'Nova Coleção',
      url: '',
      isActive: true,
      clicks: 0,
      layout: 'stacked',
      type: 'collection',
      children: []
    };
    setExpandedCollections(prev => ({ ...prev, [newCollection.id]: true }));
    // @ts-ignore
    onChange(prev => [newCollection, ...prev]);
  };

  const updateLink = (id: string, field: keyof LinkItem, value: any) => {
    // @ts-ignore
    onChange((prev: LinkItem[]) => prev.map(link => {
      if (link.id !== id) return link;
      const newValue = typeof value === 'function' ? value(link[field] || []) : value;
      return { ...link, [field]: newValue };
    }));
  };

  const updateLinkFields = (id: string, updates: Partial<LinkItem>) => {
    // @ts-ignore
    onChange((prev: LinkItem[]) => prev.map(link => {
      if (link.id !== id) return link;
      const resolvedUpdates = { ...updates };
      Object.keys(resolvedUpdates).forEach((key) => {
        const field = key as keyof LinkItem;
        if (typeof resolvedUpdates[field] === 'function') {
          // @ts-ignore
          resolvedUpdates[field] = resolvedUpdates[field](link[field] || []);
        }
      });
      return { ...link, ...resolvedUpdates };
    }));
  };

  const removeLink = (id: string) => {
    // @ts-ignore
    onChange(prev => prev.filter(link => link.id !== id));
  };

  const handleReorder = (newActiveLinks: LinkItem[]) => {
    // Combine new active links with existing archived links to preserve full state
    onChange([...newActiveLinks, ...archivedLinks]);
  };

  return (
    <div className={`space-y-6 ${level === 0 ? 'bg-white border border-slate-100 p-6 md:p-8 pt-8 md:pt-10 rounded-[24px] md:rounded-[32px] shadow-sm' : ''}`}>
      <div className="space-y-6">
        {level === 0 ? (
          <>
            <div className="flex flex-col gap-8 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Meus Links</h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">Gerencie seu perfil e suas conexões</p>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={() => setShowArchive(true)}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                    title="Ver Arquivo"
                  >
                    <Archive size={20} className="md:w-6 md:h-6" />
                    {archivedLinks.length > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
                        {archivedLinks.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={addLink}
                    disabled={isLimitReached}
                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all active:scale-90 ${isLimitReached
                      ? 'text-slate-200 cursor-not-allowed'
                      : 'text-[#32a800] hover:text-[#32a800]/80'
                      }`}
                    title="Adicionar Novo Link"
                  >
                    <Plus size={20} className="md:w-6 md:h-6" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={addCollection}
                  disabled={isLimitReached}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 text-sm font-medium transition-all border border-slate-100 rounded-2xl ${isLimitReached
                    ? 'text-slate-200 cursor-not-allowed'
                    : 'text-slate-500 hover:border-[#32a800] hover:text-[#32a800] bg-slate-50/50'
                    }`}
                >
                  <FolderHeart size={16} />
                  <span>Adicionar Coleção</span>
                </button>
              </div>
            </div>

            {isLimitReached && (
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center gap-6 mb-8">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">Limite Atingido (5/5)</p>
                  <p className="text-sm text-amber-700 mt-0.5">Torne-se PRO para ter links ilimitados em seu perfil.</p>
                </div>
                <button className="text-xs font-bold text-amber-700 bg-white border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors shadow-sm">Ver Planos</button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={addLink}
            className="w-full py-4 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium hover:border-[#32a800] hover:text-[#32a800] transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} /> Novo Link na Coleção
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activeLinks.length === 0 && (
          <div className="text-center py-10 md:py-16 bg-slate-50/50 rounded-[24px] md:rounded-[32px] border border-dashed border-slate-200">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-200">
              <Ban size={24} />
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-400">Sua lista de links está vazia</p>
            <p className="text-[10px] md:text-xs text-slate-300 mt-1">Adicione seu primeiro link para começar</p>
          </div>
        )}

        <Reorder.Group
          axis="y"
          values={activeLinks}
          onReorder={handleReorder}
          className="space-y-4"
          transition={{ duration: 0 }}
        >
          {activeLinks.map((link) => (
            <SortableLinkItem
              key={link.clientId || link.id}
              link={link}
              updateLink={updateLink}
              updateLinkFields={updateLinkFields}
              removeLink={removeLink}
              toggleLink={toggleLink}
              isExpanded={!!expandedLinks[link.id]}
              toggleCollection={toggleCollection}
              isCollectionExpanded={!!expandedCollections[link.id]}
              profile={profile}
              level={level}
              expandedLinks={expandedLinks}
              setExpandedLinks={setExpandedLinks}
              expandedCollections={expandedCollections}
              setExpandedCollections={setExpandedCollections}
            />
          ))}
        </Reorder.Group>
      </div>

      {/* Archive Modal - Soft Corporate */}
      {mounted && createPortal(
        <AnimatePresence>
          {showArchive && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowArchive(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-14 transition-all flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="mb-10 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Itens Arquivados</h3>
                    <p className="text-sm text-slate-500 mt-1">{archivedLinks.length} links guardados no seu arquivo</p>
                  </div>
                  <button
                    onClick={() => setShowArchive(false)}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                  {archivedLinks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Archive size={32} className="text-slate-200" />
                      </div>
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest leading-none">Arquivo Vazio</p>
                    </div>
                  ) : (
                    archivedLinks.map((link) => (
                      <motion.div
                        key={link.id}
                        layout
                        className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] transition-all hover:border-[#32a800] group/item"
                      >
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                            {link.image ? (
                              <img src={link.image} alt="" className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all" />
                            ) : (
                              <LinkIcon size={20} className="text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-800 truncate mb-0.5">{link.title || 'Sem título'}</h4>
                            <p className="text-xs text-slate-400 truncate font-medium">{link.url || 'Sem URL'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={() => updateLink(link.id, 'isArchived', false)}
                            className="h-10 px-5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-[#32a800] hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            Restaurar
                          </button>
                          <button
                            onClick={() => removeLink(link.id)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="mt-10 pt-8 border-t border-slate-50 shrink-0">
                  <button
                    onClick={() => setShowArchive(false)}
                    className="w-full h-14 bg-slate-900 text-white rounded-[20px] font-bold text-sm tracking-wide hover:shadow-xl transition-all active:scale-[0.98]"
                  >
                    Voltar aos Meus Links
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default LinkEditor;