import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkItem, UserProfile } from '../types';
import { compressImage } from '../utils/imageUtils';
import { fetchMusicMetadata } from '../utils/musicUtils';
import {
  Trash2,
  GripVertical,
  Plus,
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

interface LinkEditorProps {
  links: LinkItem[];
  onChange: (links: LinkItem[] | ((prev: LinkItem[]) => LinkItem[])) => void;
  level?: number; // For nesting control
  profile: UserProfile;
}

const LinkEditor: React.FC<LinkEditorProps> = ({ links, onChange, level = 0, profile }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const [expandedLinks, setExpandedLinks] = useState<Record<string, boolean>>({});
  const [openAnimationMenu, setOpenAnimationMenu] = useState<string | null>(null);

  const isLimitReached = (profile.planType === 'free' || !profile.planType) && links.length >= 5;

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
    // Auto-expand the new link
    setExpandedLinks(prev => ({ ...prev, [newLink.id]: true }));
    // @ts-ignore
    onChange(prev => [newLink, ...prev]);
  };

  const addCollection = () => {
    const newCollection: LinkItem = {
      id: Date.now().toString(),
      title: 'Nova Coleção',
      url: '', // Not used for collections
      isActive: true,
      clicks: 0,
      layout: 'classic', // Not used
      type: 'collection',
      children: []
    };
    // Auto-expand the new collection
    setExpandedCollections(prev => ({ ...prev, [newCollection.id]: true }));
    // @ts-ignore
    onChange(prev => [newCollection, ...prev]);
  };

  // Helper for internal simple add (used inside collections)
  const addSimpleLink = () => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: 'Novo Link',
      url: '',
      isActive: true,
      clicks: 0,
      layout: 'classic',
      type: 'link'
    };
    // @ts-ignore
    onChange(prev => [newLink, ...prev]);
  };



  // ... rest of the update/remove functions ...
  const updateLink = (id: string, field: keyof LinkItem, value: any) => {
    // @ts-ignore - Handle both array and functional update
    onChange((prev: LinkItem[]) => prev.map(link => {
      if (link.id !== id) return link;

      // If a child (like a nested LinkEditor) passed a functional update, 
      // we need to evaluate it against the CURRENT value of this link's field.
      const newValue = typeof value === 'function' ? value(link[field] || []) : value;
      return { ...link, [field]: newValue };
    }));
  };

  const updateLinkFields = (id: string, updates: Partial<LinkItem>) => {
    // @ts-ignore - Handle both array and functional update
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

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null) return;
    if (draggedIndex === index) return;

    // Create a copy of the array to mutate
    const newLinks = [...links];
    // Remove the item from its old position
    const draggedItem = newLinks[draggedIndex];
    newLinks.splice(draggedIndex, 1);
    // Insert it into the new position
    newLinks.splice(index, 0, draggedItem);

    onChange(newLinks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div className={`space-y-4 ${level === 0 ? 'w-full' : ''}`}>

      {/* Top Actions Area - Only at root level or inside collection (but simpler) */}
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

            <div className="flex items-center justify-between px-1">
              <button
                onClick={addCollection}
                disabled={isLimitReached}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${isLimitReached
                  ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                  : 'text-slate-600 bg-white hover:bg-slate-100 border-slate-200'
                  }`}
              >
                <span className="text-lg"><FolderHeart size={18} /></span> Add collection
              </button>
              <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                <Archive size={16} /> View archive
              </button>
            </div>
          </>
        ) : (
          /* Simple Add Button for inside collections */
          <button
            onClick={addLink}
            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-semibold hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} /> Adicionar Link na Coleção
          </button>
        )}

      </div>

      {/* Links List */}
      <div className="space-y-4">
        {links.length === 0 && (
          <div className="text-center py-8 text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <p className="text-sm">Vazio</p>
          </div>
        )}

        {links.map((link, index) => (
          <div
            key={link.id}
            draggable
            onDragStart={(e) => {
              e.stopPropagation(); // Prevent parent drag
              handleDragStart(index);
            }}
            onDragEnter={(e) => {
              e.stopPropagation();
              handleDragEnter(index);
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              handleDragEnd();
            }}
            onDragOver={handleDragOver}
            className={`
              bg-white rounded-[20px] shadow-sm border border-slate-200 group transition-all relative
              ${draggedIndex === index ? 'opacity-40 border-dashed border-slate-400 scale-[0.98]' : 'hover:shadow-md'}
              cursor-default
            `}
          >
            {/* RENDER COLLECTION ITEM */}
            {link.type === 'collection' ? (
              <div className="overflow-hidden">
                <div className="flex bg-slate-50/50 border-b border-slate-100">
                  {/* Drag Handle */}
                  <div className="w-8 py-4 flex flex-col items-center justify-center cursor-move text-slate-300 hover:text-brand-600 active:text-brand-700">
                    <GripVertical size={20} />
                  </div>

                  {/* Header Content */}
                  <div className="flex-1 p-3 pl-2 flex items-center gap-3">
                    <div onClick={() => toggleCollection(link.id)} className="cursor-pointer text-slate-400 hover:text-brand-600 transition-colors">
                      {expandedCollections[link.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
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
                  {expandedCollections[link.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-slate-50/30 border-t border-slate-100 pl-8">
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
              /* RENDER STANDARD LINK ITEM - REDESIGNED (Collapsible) */
              <div className="flex flex-col transition-all">
                {/* Header Row (Always Visible) */}
                <div className="flex items-center w-full min-h-[72px]">
                  {/* Drag Handle */}
                  <div className="w-8 flex flex-col items-center justify-center cursor-move text-slate-300 hover:text-slate-500 active:text-brand-600 self-stretch py-2 pl-2">
                    <GripVertical size={20} />
                  </div>

                  {/* Image Thumbnail (Small in minimized, Large in expanded handled by conditional rendering below? No, let's keep it consistent in header) */}
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
                      className={`p-2 rounded-full transition-all ${expandedLinks[link.id] ? 'bg-slate-100 text-slate-600 rotate-180' : 'text-slate-400 hover:bg-slate-50 hover:text-brand-600'}`}
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
                  {expandedLinks[link.id] && (
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
                          </div>
                        </div>

                        {/* Settings & Config */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                          {/* Left Column */}
                          <div className="space-y-5">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Subtítulo</label>
                              <input
                                type="text"
                                value={link.subtitle || ''}
                                onChange={(e) => updateLink(link.id, 'subtitle', e.target.value)}
                                className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 focus:border-brand-300 rounded-lg px-3 py-2 outline-none transition-all placeholder:text-slate-300"
                                placeholder="Ex: Artista, Cargo, Detalhe..."
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Layout</label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateLink(link.id, 'layout', 'classic')}
                                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${link.layout === 'classic' ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                  <LayoutTemplate size={14} /> <span>Padrão</span>
                                </button>
                                <button
                                  onClick={() => updateLink(link.id, 'layout', 'card')}
                                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${link.layout === 'card' ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                  <CreditCard size={14} /> <span>Cartão</span>
                                </button>
                                <button
                                  onClick={() => updateLink(link.id, 'layout', 'social')}
                                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${link.layout === 'social' ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                  <MessageCircle size={14} /> <span>Social</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-5">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Embed</label>
                              <div className="grid grid-cols-4 gap-2">
                                <button
                                  onClick={() => updateLink(link.id, 'embedType', 'none')}
                                  className={`col-span-1 py-2 rounded-lg text-xs font-medium transition-all border flex items-center justify-center ${(!link.embedType || link.embedType === 'none') ? 'bg-slate-800 text-white border-slate-900 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                  title="Nenhum"
                                >
                                  <Ban size={18} />
                                </button>
                                <button
                                  onClick={() => updateLink(link.id, 'embedType', 'youtube')}
                                  className={`col-span-1 py-2 rounded-lg text-xs font-medium transition-all border flex items-center justify-center ${link.embedType === 'youtube' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                  title="Youtube"
                                >
                                  <Youtube size={18} />
                                </button>
                                <button
                                  onClick={() => updateLink(link.id, 'embedType', 'spotify')}
                                  className={`col-span-1 py-2 rounded-lg text-xs font-medium transition-all border flex items-center justify-center ${link.embedType === 'spotify' ? 'bg-green-50 text-green-600 border-green-200 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                  title="Spotify"
                                >
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.779-.6 13.5 1.62.42.239.6.84.3 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => updateLink(link.id, 'embedType', 'deezer')}
                                  className={`col-span-1 py-2 rounded-lg text-xs font-medium transition-all border flex items-center justify-center ${link.embedType === 'deezer' ? 'bg-pink-50 text-pink-600 border-pink-200 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                  title="Deezer"
                                >
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                                    <path d="M4 17h3v7H4v-7zm4.5 0h3v7h-3v-7zm5-4h3v11h-3V13zm4.5 0h3v11h-3V13zM4 12h3v2H4v-2zm4.5-5h3v7h-3V7zm5-5h3v9h-3V2zm4.5 5h3v4h-3V7z" />
                                  </svg>
                                </button>
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
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium py-1 px-3 rounded-md bg-slate-50 border border-slate-100">
                            <BarChart2 size={14} />
                            <span>{link.clicks || 0} cliques</span>
                          </div>

                          <button
                            onClick={() => removeLink(link.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-medium group/delete"
                          >
                            <Trash2 size={14} className="group-hover/delete:stroke-[2.5px]" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkEditor;