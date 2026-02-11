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
  Ban
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
}

function SortableLinkItem({
  link,
  updateLink,
  updateLinkFields,
  removeLink,
  toggleLink,
  isExpanded,
  toggleCollection,
  isCollectionExpanded,
  profile,
  level
}: SortableLinkItemProps) {
  const dragControls = useDragControls();
  const [openAnimationMenu, setOpenAnimationMenu] = useState<string | null>(null);

  // LinkEditor is used recursively here. It must be hoisted or available.

  return (
    <Reorder.Item
      value={link}
      dragListener={false}
      dragControls={dragControls}
      className="relative"
    >
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 group transition-all relative hover:shadow-md">
        {/* RENDER COLLECTION ITEM */}
        {link.type === 'collection' ? (
          <div className="overflow-hidden">
            <div className="flex bg-slate-50/50 border-b border-slate-100">
              {/* Drag Handle */}
              <div
                className="w-8 py-4 flex flex-col items-center justify-center cursor-move text-slate-300 hover:text-brand-600 active:text-brand-700 touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical size={20} />
              </div>

              {/* Header Content */}
              <div className="flex-1 p-3 pl-2 flex items-center gap-3">
                <div onClick={() => toggleCollection(link.id)} className="cursor-pointer text-slate-400 hover:text-brand-600 transition-colors">
                  {isCollectionExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                    className="w-full font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 text-base placeholder:text-slate-400"
                    placeholder="Nome da Coleção"
                  />
                  <span className="text-xs text-slate-400 font-medium">{link.children?.length || 0} itens</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={link.isActive}
                      onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir Coleção"
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
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-slate-50/30 border-t border-slate-100 pl-8">
                    {/* Recursive Call to Main Editor */}
                    <LinkEditor
                      links={link.children || []}
                      onChange={(newChildren) => updateLink(link.id, 'children', newChildren)}
                      level={level + 1}
                      profile={profile}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* RENDER STANDARD LINK ITEM */
          <div className="flex flex-col transition-all">
            {/* Header Row (Always Visible) */}
            <div className="flex items-center w-full min-h-[72px]">
              {/* Drag Handle */}
              <div
                className="w-8 flex flex-col items-center justify-center cursor-move text-slate-300 hover:text-slate-500 active:text-brand-600 self-stretch py-2 pl-2 touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <GripVertical size={20} />
              </div>

              {/* Image Thumbnail */}
              <div className="shrink-0 mr-3 py-2 pl-2">
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
                          alert('Erro ao processar imagem.');
                        }
                      }
                    }}
                  />
                  {link.image ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 relative group/img shadow-sm">
                      <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <button
                      onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                      className="w-10 h-10 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50 transition-all"
                    >
                      <ImageIcon size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Chevron (Click to Expand) */}
              <div
                className="flex-1 min-w-0 pr-4 py-3 cursor-pointer group/title"
                onClick={() => toggleLink(link.id)}
              >
                <div className="font-bold text-slate-700 truncate group-hover/title:text-brand-700 transition-colors text-base flex items-center gap-2">
                  {link.title || 'Sem título'}
                </div>
                <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                  {link.url || 'Sem URL'}
                </div>
              </div>

              {/* Right Actions: Edit(Expand) & Switch */}
              <div className="flex items-center gap-3 pr-5">
                <button
                  onClick={() => toggleLink(link.id)}
                  className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-slate-100 text-slate-600 rotate-180' : 'text-slate-400 hover:bg-slate-50 hover:text-brand-600'}`}
                >
                  <ChevronDown size={20} />
                </button>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={link.isActive}
                    onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500 shadow-inner"></div>
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
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0">
                    {/* Main Edit Form */}
                    <div className="flex items-start gap-4 mb-6 pt-4">
                      {/* Expanded Image (Larger with controls) */}
                      <div className="relative shrink-0 pt-1">
                        {link.image ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 relative group/img shadow-sm">
                            <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity gap-2">
                              <button
                                onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                                className="text-white hover:scale-110 transition-transform p-1.5 rounded-full bg-white/20 hover:bg-white/30"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => updateLink(link.id, 'image', undefined)}
                                className="text-white hover:text-red-200 hover:scale-110 transition-transform p-1.5 rounded-full bg-white/20 hover:bg-red-500/50"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                            className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50 transition-all group/btn"
                          >
                            <ImageIcon size={24} className="group-hover/btn:scale-110 transition-transform mb-1" />
                            <span className="text-[10px] font-bold uppercase">Add</span>
                          </button>
                        )}
                      </div>

                      {/* Inputs */}
                      <div className="flex-1 min-w-0 space-y-3 pt-1">
                        <div>
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                            className="w-full font-bold text-xl text-slate-800 bg-transparent border-b border-slate-200 focus:border-brand-500 rounded-none px-0 py-1 outline-none transition-all placeholder:text-slate-300"
                            placeholder="Título do Link"
                          />
                        </div>

                        <div className="relative group/url">
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const newUrl = e.target.value;
                              const updates: Partial<LinkItem> = { url: newUrl };

                              // Auto detection logic
                              const isSpotify = newUrl.includes('open.spotify.com/') && (newUrl.includes('/track/') || newUrl.includes('/album/') || newUrl.includes('/playlist/'));
                              const isDeezer = newUrl.includes('deezer.com/') || newUrl.includes('deezer.page.link/');

                              if (isSpotify || isDeezer) {
                                updates.embedType = isSpotify ? 'spotify' : 'deezer';
                                fetchMusicMetadata(newUrl).then(metadata => {
                                  if (metadata) {
                                    updateLinkFields(link.id, {
                                      title: metadata.title,
                                      subtitle: metadata.artist,
                                      image: metadata.thumbnailUrl,
                                      embedType: isSpotify ? 'spotify' : 'deezer',
                                      url: newUrl
                                    });
                                  }
                                });
                              }
                              updateLinkFields(link.id, updates);
                            }}
                            className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 focus:border-brand-300 focus:bg-white rounded-lg px-3 py-2 outline-none transition-all placeholder:text-slate-400"
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            value={link.subtitle || ''}
                            onChange={(e) => updateLink(link.id, 'subtitle', e.target.value)}
                            className="w-full text-sm text-slate-500 bg-transparent border-b border-slate-100 focus:border-brand-300 rounded-none px-0 py-1 outline-none transition-all placeholder:text-slate-300"
                            placeholder="Subtítulo ou descrição curta"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Settings & Config (New Section) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-5">
                        {/* Plataforma / Embed */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                            <Zap size={10} className="text-amber-500" />
                            Integração Especial
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'none', label: 'Padrão', icon: LinkIcon },
                              { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
                              { id: 'spotify', label: 'Spotify', icon: SiSpotify, color: 'text-green-600' },
                              { id: 'deezer', label: 'Deezer', icon: DeezerIcon, color: 'text-purple-600' },
                            ].map((plat) => (
                              <button
                                key={plat.id}
                                onClick={() => updateLinkFields(link.id, { embedType: plat.id as any })}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${(link.embedType || 'none') === plat.id
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                  }`}
                              >
                                <plat.icon size={14} className={plat.color} />
                                {plat.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Destaque</label>
                          <div className="relative">
                            <button
                              onClick={() => setOpenAnimationMenu(prev => prev === link.id ? null : link.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all border ${link.highlight && link.highlight !== 'none' ? 'bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-500/10' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles size={14} className={link.highlight && link.highlight !== 'none' ? 'text-amber-500' : 'text-slate-400'} />
                                <span className="capitalize">{link.highlight === 'none' || !link.highlight ? 'Sem Destaque' : link.highlight}</span>
                              </div>
                              <ChevronDown size={14} />
                            </button>

                            {openAnimationMenu === link.id && (
                              <div className="absolute top-full right-0 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                                {['none', 'pulse', 'bounce', 'shake', 'glow', 'wobble'].map((anim) => (
                                  <button
                                    key={anim}
                                    onClick={() => {
                                      updateLink(link.id, 'highlight', anim);
                                      setOpenAnimationMenu(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg capitalize transition-colors flex items-center justify-between ${link.highlight === anim ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                  >
                                    {anim === 'none' ? 'Nenhum' : anim}
                                    {link.highlight === anim && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {/* Layout Picker */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Visualização</label>
                          <div className="flex gap-2">
                            {[
                              { id: 'classic', label: 'Lista', icon: GripVertical },
                              { id: 'card', label: 'Card Grande', icon: LayoutTemplate }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => updateLink(link.id, 'layout', opt.id)}
                                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${link.layout === opt.id ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                              >
                                <opt.icon size={18} />
                                <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium py-1 px-3 rounded-md bg-slate-50 border border-slate-100">
                        <BarChart2 size={14} />
                        <span>{link.clicks || 0} cliques</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateLink(link.id, 'isArchived', !link.isArchived)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${link.isArchived ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                          <Archive size={14} />
                          <span>{link.isArchived ? 'Arquivado' : 'Arquivar'}</span>
                        </button>

                        <button
                          onClick={() => removeLink(link.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-medium group/delete"
                        >
                          <Trash2 size={14} className="group-hover/delete:stroke-[2.5px]" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
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
  level?: number; // For nesting control
  profile: UserProfile;
}

function LinkEditor({ links, onChange, level = 0, profile }: LinkEditorProps) {
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const [expandedLinks, setExpandedLinks] = useState<Record<string, boolean>>({});
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
      title: 'Nova Coleção',
      url: '',
      isActive: true,
      clicks: 0,
      layout: 'classic',
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
    <div className={`space-y-4 ${level === 0 ? 'w-full' : ''}`}>
      <div className="space-y-4">
        {level === 0 ? (
          <>
            <div className="flex flex-col gap-2">
              <button
                onClick={addLink}
                disabled={isLimitReached}
                className={`w-full h-14 rounded-[22px] font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${isLimitReached
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-brand-300 text-brand-950 hover:bg-brand-400 hover:-translate-y-0.5 active:translate-y-0 shadow-brand-950/10'
                  }`}
              >
                <Plus size={22} /> Adicionar Link
              </button>
              {isLimitReached && (
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <Zap size={16} fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-brand-900 leading-tight">Limite de links atingido (5/5)</p>
                    <p className="text-[10px] text-brand-600 font-medium">Faça upgrade para adicionar links ilimitados.</p>
                  </div>
                  <button className="text-[10px] font-bold text-white bg-brand-600 px-3 py-1.5 rounded-full hover:bg-brand-700 transition-colors">PRO</button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-1 py-1">
              <button
                onClick={addCollection}
                disabled={isLimitReached}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-[11px] sm:text-sm font-bold transition-all border ${isLimitReached
                  ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                  : 'text-slate-600 bg-white hover:bg-slate-100 border-slate-200 active:scale-[0.98]'
                  }`}
              >
                <FolderHeart size={18} />
                <span>Add collection</span>
              </button>
              <button
                onClick={() => setShowArchive(true)}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-[11px] sm:text-sm font-bold transition-all bg-slate-50/50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-100 hover:border-slate-200 group active:scale-[0.98]"
              >
                <Archive size={18} />
                <span>View archive</span>
                {archivedLinks.length > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-lg font-black transition-transform group-hover:scale-110">
                    {archivedLinks.length}
                  </span>
                )}
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={addLink}
            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-semibold hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} /> Adicionar Link na Coleção
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activeLinks.length === 0 && (
          <div className="text-center py-8 text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <p className="text-sm">Vazio</p>
          </div>
        )}

        <Reorder.Group axis="y" values={activeLinks} onReorder={handleReorder} className="space-y-4">
          {activeLinks.map((link) => (
            <SortableLinkItem
              key={link.id}
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
            />
          ))}
        </Reorder.Group>
      </div>

      {/* Archive Modal - Clean Minimalist Design */}
      {mounted && createPortal(
        <AnimatePresence>
          {showArchive && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowArchive(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl h-[500px] bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Itens Arquivados</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{archivedLinks.length} no total</p>
                  </div>
                  <button
                    onClick={() => setShowArchive(false)}
                    className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
                  {archivedLinks.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <Archive size={32} className="text-slate-200" />
                      </div>
                      <p className="text-slate-500 font-medium">Nenhum item arquivado</p>
                    </div>
                  ) : (
                    archivedLinks.map((link) => (
                      <motion.div
                        key={link.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group hover:border-slate-300 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {link.image ? (
                              <img src={link.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <LinkIcon size={20} className="text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 truncate leading-tight mb-0.5">{link.title || 'Sem título'}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{link.url || 'Sem URL'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <button
                            onClick={() => updateLink(link.id, 'isArchived', false)}
                            className="h-10 px-4 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                          >
                            Restaurar
                          </button>
                          <button
                            onClick={() => removeLink(link.id)}
                            className="w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
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