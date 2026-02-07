import React, { useState } from 'react';
import { LinkItem } from '../types';
import { compressImage } from '../utils/imageUtils';
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
  Sparkles
} from 'lucide-react';

interface LinkEditorProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
  level?: number; // For nesting control
}

const LinkEditor: React.FC<LinkEditorProps> = ({ links, onChange, level = 0 }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const [openAnimationMenu, setOpenAnimationMenu] = useState<string | null>(null);

  const toggleCollection = (id: string) => {
    setExpandedCollections(prev => ({
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
    onChange([newLink, ...links]);
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
    onChange([newCollection, ...links]);
  };

  const updateLink = (id: string, field: keyof LinkItem, value: any) => {
    onChange(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const removeLink = (id: string) => {
    onChange(links.filter(link => link.id !== id));
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
      {/* We want "Add URL" everywhere, but "Add Collection" only at root (level 0) to avoid deep nesting complexity for now */}
      <div className="space-y-4">
        {level === 0 ? (
          <>
            <button
              onClick={addLink}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-sm flex items-center justify-center gap-2 text-base"
            >
              <Plus size={20} strokeWidth={3} /> Add URL
            </button>

            <div className="flex items-center justify-between px-1">
              <button
                onClick={addCollection}
                className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-slate-200"
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
              bg-white rounded-[20px] shadow-sm border border-slate-200 group transition-all 
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
                {expandedCollections[link.id] && (
                  <div className="p-4 bg-slate-50/30 border-t border-slate-100 pl-8">
                    <LinkEditor
                      links={link.children || []}
                      onChange={(newChildren) => updateLink(link.id, 'children', newChildren)}
                      level={level + 1}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* RENDER STANDARD LINK ITEM */
              <div className="flex">
                {/* Drag Handle */}
                <div className="w-8 py-6 flex flex-col items-center justify-center cursor-move text-slate-300 hover:text-slate-500 border-r border-transparent active:text-brand-600">
                  <GripVertical size={20} />
                </div>

                {/* Card Content */}
                <div className="flex-1 p-5 pl-2">

                  {/* Top Row: Title & Toggle */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 mr-4 group/input">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                          className="w-full font-bold text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-300 focus:bg-slate-50 rounded px-2 py-1 outline-none transition-all placeholder:text-slate-400"
                          placeholder="Título do Link"
                        />
                        <Pencil size={12} className="absolute right-2 text-slate-400 opacity-0 group-hover/input:opacity-100 pointer-events-none" />
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={link.isActive}
                        onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                    </label>
                  </div>

                  {/* Second Row: URL */}
                  <div className="mb-4 group/input">
                    <div className="relative flex items-center">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        className="w-full text-sm text-slate-600 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-300 focus:bg-slate-50 rounded px-2 py-1 outline-none transition-all placeholder:text-slate-400"
                        placeholder="http://url..."
                      />
                      <Pencil size={12} className="absolute right-2 text-slate-400 opacity-0 group-hover/input:opacity-100 pointer-events-none" />
                    </div>
                  </div>

                  {/* Type Selection (Button vs Social Icon) */}
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => updateLink(link.id, 'layout', 'classic')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${link.layout === 'classic' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <LayoutTemplate size={14} /> Botão
                    </button>
                    <button
                      onClick={() => updateLink(link.id, 'layout', 'social')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${link.layout === 'social' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <MessageCircle size={14} /> Ícone Social
                    </button>
                  </div>

                  {/* Embed Selection */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Embed de Mídia</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateLink(link.id, 'embedType', 'none')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${(!link.embedType || link.embedType === 'none') ? 'bg-slate-800 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        Nenhum
                      </button>
                      <button
                        onClick={() => updateLink(link.id, 'embedType', 'youtube')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${link.embedType === 'youtube' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        YouTube
                      </button>
                      <button
                        onClick={() => updateLink(link.id, 'embedType', 'spotify')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${link.embedType === 'spotify' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        Spotify
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Actions & Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">

                    {/* Left Icons */}
                    <div className="flex items-center gap-1">
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
                        <button
                          onClick={() => document.getElementById(`file-${link.id}`)?.click()}
                          className={`p-2 rounded-lg transition-colors relative flex items-center justify-center ${link.image ? 'text-brand-600 bg-brand-50 hover:bg-brand-100' : 'text-slate-400 hover:bg-slate-100'}`}
                          title="Adicionar miniatura"
                        >
                          <ImageIcon size={18} />
                          {link.image && <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full border border-white"></span>}
                        </button>
                      </div>

                      {/* Image Preview if exists */}
                      {link.image && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 relative group/img">
                          <img src={link.image} alt="Thumbnail" className="w-full h-full object-cover" />
                          <button
                            onClick={() => updateLink(link.id, 'image', undefined)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-white"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}

                      {/* Highlight Animation Selector */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setOpenAnimationMenu(prev => prev === link.id ? null : link.id);
                          }}
                          className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${link.highlight && link.highlight !== 'none' ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:bg-slate-100'}`}
                          title="Destaque e Animação"
                        >
                          <Sparkles size={18} />
                        </button>

                        {/* Click Toggle Menu */}
                        {openAnimationMenu === link.id && (
                          <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-20 animate-fade-in">
                            <div className="flex items-center justify-between px-2 py-1 mb-1">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destaque</div>
                              <button onClick={() => setOpenAnimationMenu(null)} className="text-slate-400 hover:text-slate-600"><Trash2 size={10} /></button>
                            </div>
                            {['none', 'pulse', 'bounce', 'shake', 'glow', 'wobble'].map((anim) => (
                              <button
                                key={anim}
                                onClick={() => {
                                  updateLink(link.id, 'highlight', anim);
                                  setOpenAnimationMenu(null);
                                }}
                                className={`w-full text-left px-2 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors flex items-center justify-between ${link.highlight === anim ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}
                              >
                                {anim === 'none' ? 'Nenhum' : anim}
                                {link.highlight === anim && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1" title="Análise">
                        <BarChart2 size={18} />
                        <span className="text-xs font-medium ml-1">{link.clicks} clicks</span>
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeLink(link.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir link"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Banner - Only at Root Level */}
      {level === 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">LINK footer</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center text-white text-[10px]"><Zap size={14} fill="white" /></div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" checked readOnly className="sr-only peer" />
              <div className="w-11 h-6 bg-green-500 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkEditor;