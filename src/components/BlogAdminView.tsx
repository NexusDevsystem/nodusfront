import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, Save, X, Image as ImageIcon, 
  CheckCircle, Clock, Maximize2, Hash, Paperclip, 
  PlayCircle, StickyNote, Smile, BarChart2, Mic, 
  ChevronDown, PlusCircle, Search, Layers, ShieldAlert, FileText, Video,
  GripVertical
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useLanguage } from './landing/i18n/LanguageContext';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { createPortal } from 'react-dom';
import { BlogPost } from '../types';

export default function BlogAdminView() {
  const { t, lang } = useLanguage();
  const blogT = t.blog;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingBlock, setIsUploadingBlock] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);



  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminBlogPosts();
      setPosts(response);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPost?.title || !editingPost?.content) return;
    
    setIsSaving(true);
    try {
      if (editingPost.id) {
        await apiClient.updateBlogPost(editingPost.id, editingPost);
      } else {
        await apiClient.createBlogPost(editingPost);
      }
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteBlogPost(id);
      setDeletingPostId(null);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleReorder = async (newOrder: BlogPost[]) => {
    setPosts(newOrder);
    try {
      await apiClient.reorderBlogPosts(newOrder);
    } catch (error) {
      console.error('Error reordering posts:', error);
    }
  };

  const handleCancel = () => {
    setEditingPost(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-32">
      {createPortal(
        <AnimatePresence mode="wait">
          {editingPost && (
            <div key="blog-post-modal" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancel}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl bg-white border-4 border-black rounded-[40px] overflow-hidden flex flex-col max-h-[92vh] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"
              >
                {/* Header: Criar publicação */}
                <div className="flex items-center justify-between px-10 py-7 border-b-4 border-black bg-white shrink-0 z-20">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-8 bg-[#ffdf00] border-2 border-black" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-black">
                      {editingPost.id ? (lang === 'pt' ? 'EDITAR POST' : 'EDIT POST') : (lang === 'pt' ? 'NOVA PUBLICAÇÃO' : 'NEW PUBLICATION')}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleCancel} 
                      className="w-12 h-12 flex items-center justify-center bg-white border-2 border-black shadow-[0_4px_0_0_#000] hover:translate-y-[2px] hover:shadow-none transition-all rounded-md group"
                    >
                      <X size={24} strokeWidth={3} className="text-black group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar-brutal bg-[#fafafa] flex flex-col">
                  {/* HERO AREA: Cover Image */}
                  <div className="p-8 md:p-12 pb-0">
                    <div className="relative group/cover w-full h-[400px] bg-white border-4 border-black rounded-[40px] overflow-hidden flex items-center justify-center transition-all shadow-[0_12px_0_0_rgba(0,0,0,0.05)] hover:shadow-[0_12px_0_0_rgba(255,223,0,0.2)]">
                      {isUploadingCover ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-black uppercase tracking-widest text-xs">Carregando Mídia...</span>
                        </div>
                      ) : editingPost.imageUrl ? (
                        <>
                          <img src={editingPost.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-all flex items-center justify-center gap-6 backdrop-blur-[2px]">
                            <button 
                              onClick={() => document.getElementById('cover-upload')?.click()}
                              className="px-8 py-4 bg-white border-4 border-black rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-3"
                            >
                              <ImageIcon size={20} strokeWidth={3} />
                              Trocar Capa
                            </button>
                            <button 
                              onClick={() => setEditingPost({ ...editingPost, imageUrl: '' })}
                              className="px-8 py-4 bg-white border-4 border-black rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all text-red-500 flex items-center gap-3"
                            >
                              <Trash2 size={20} strokeWidth={3} />
                              Remover
                            </button>
                          </div>
                        </>
                      ) : (
                        <button 
                          onClick={() => document.getElementById('cover-upload')?.click()}
                          className="flex flex-col items-center gap-5 text-black hover:scale-105 transition-all duration-500"
                        >
                          <div className="w-24 h-24 bg-[#ffdf00] border-4 border-black rounded-[32px] flex items-center justify-center shadow-[0_8px_0_0_#000]">
                            <ImageIcon size={40} strokeWidth={2.5} />
                          </div>
                          <div className="text-center">
                            <span className="font-black uppercase tracking-[0.2em] text-xs block mb-1">Upload Capa Principal</span>
                            <span className="text-[10px] font-bold uppercase opacity-30 tracking-widest">Formatos: JPG, PNG, WEBP</span>
                          </div>
                        </button>
                      )}
                      <input 
                        id="cover-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setIsUploadingCover(true);
                              setUploadError(null);
                              const res = await apiClient.uploadFile(file);
                              if (res.file?.url) {
                                setEditingPost({ ...editingPost, imageUrl: res.file.url });
                              }
                            } catch (err) {
                              console.error('Upload failed:', err);
                              setUploadError('Erro ao carregar imagem de capa');
                            } finally {
                              setIsUploadingCover(false);
                            }
                          }
                        }}
                      />

                    </div>
                  </div>

                  {/* EDITORIAL FLOW */}
                  <div className="p-8 md:p-24 pt-12 max-w-4xl mx-auto w-full space-y-12">
                    {/* Title Input */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/20 ml-1">Título da Publicação</label>
                      <textarea
                        placeholder="Insira um título impactante..."
                        value={editingPost.title || ''}
                        onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                        rows={2}
                        className="text-4xl md:text-6xl font-black text-black placeholder:text-black/5 outline-none w-full bg-transparent tracking-tighter leading-[0.9] resize-none"
                        style={{ height: 'auto' }}
                        ref={(el) => {
                          if (el) {
                            el.style.height = 'auto';
                            el.style.height = el.scrollHeight + 'px';
                          }
                        }}
                      />
                      <div className="w-20 h-2 bg-black rounded-full" />
                    </div>

                    {/* Body Content - Block Based Editor */}
                    <div className="space-y-10 min-h-[400px] relative">
                      {uploadError && (
                        <div className="bg-red-50 border-4 border-red-500 p-6 rounded-[20px] flex items-center justify-between text-red-700 animate-in fade-in slide-in-from-top-4 duration-300">
                           <div className="flex items-center gap-4">
                             <ShieldAlert size={28} />
                             <div>
                               <span className="font-black uppercase text-xs tracking-widest block">Erro de Upload</span>
                               <p className="text-sm font-bold opacity-60 leading-tight">{uploadError}</p>
                             </div>
                           </div>
                           <button onClick={() => setUploadError(null)} className="p-2 hover:bg-red-100 rounded-md transition-all">
                             <X size={20} />
                           </button>
                        </div>
                      )}

                      {isUploadingBlock && (
                        <div className="p-10 border-4 border-black border-dashed rounded-[40px] flex flex-col items-center justify-center gap-5 bg-white shadow-xl animate-pulse">
                          <div className="w-12 h-12 border-4 border-black border-t-[#ffdf00] rounded-full animate-spin"></div>
                          <span className="font-black uppercase text-xs tracking-[0.2em]">Processando Arquivo...</span>
                        </div>
                      )}

                      {(() => {

                        const content = editingPost.content || '';
                        const parts = content.split(/(!\[.*?\]\(.*?\)|\[video\]\(.*?\)|\[📎 .*?\]\(.*?\))/g);
                        
                        return parts.map((part, index) => {
                          const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
                          const videoMatch = part.match(/\[video\]\((.*?)\)/);
                          const fileMatch = part.match(/\[📎 (.*?)\]\((.*?)\)/);
                          
                          if (imageMatch) {
                            const [full, alt, url] = imageMatch;
                            return (
                              <div key={index} className="relative group/img-block my-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="border-4 border-black rounded-[40px] overflow-hidden shadow-[0_20px_0_0_rgba(0,0,0,0.05)]">
                                  <img src={url} alt={alt} className="w-full" />
                                </div>
                                <button
                                  onClick={() => {
                                    const newParts = [...parts];
                                    newParts.splice(index, 1);
                                    setEditingPost({ ...editingPost, content: newParts.join('') });
                                  }}
                                  className="absolute -top-4 -right-4 w-12 h-12 bg-white border-2 border-black rounded-md flex items-center justify-center text-red-500 opacity-0 group-hover/img-block:opacity-100 transition-all shadow-[0_4px_0_0_#000] hover:translate-y-[2px]"
                                >
                                  <Trash2 size={20} strokeWidth={3} />
                                </button>
                              </div>
                            );
                          }

                          if (videoMatch) {
                            const [full, url] = videoMatch;
                            return (
                              <div key={index} className="relative group/vid-block my-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="w-full aspect-video rounded-[40px] border-4 border-black overflow-hidden shadow-[0_20px_0_0_rgba(0,0,0,0.05)] bg-black">
                                  <video src={url} controls className="w-full h-full" />
                                </div>
                                <button
                                  onClick={() => {
                                    const newParts = [...parts];
                                    newParts.splice(index, 1);
                                    setEditingPost({ ...editingPost, content: newParts.join('') });
                                  }}
                                  className="absolute -top-4 -right-4 w-12 h-12 bg-white border-2 border-black rounded-md flex items-center justify-center text-red-500 opacity-0 group-hover/vid-block:opacity-100 transition-all shadow-[0_4px_0_0_#000] hover:translate-y-[2px] z-10"
                                >
                                  <Trash2 size={20} strokeWidth={3} />
                                </button>
                              </div>
                            );
                          }

                          if (fileMatch) {
                            const [full, name, url] = fileMatch;
                            return (
                              <div key={index} className="relative group/file-block my-8 p-10 bg-white border-4 border-black rounded-[32px] flex items-center justify-between shadow-[0_12px_0_0_rgba(0,0,0,0.05)] hover:shadow-[0_12px_0_0_#97cd7a] transition-all">
                                <div className="flex items-center gap-6">
                                  <div className="w-16 h-16 bg-[#fafafa] border-2 border-black rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#000]">
                                    <FileText size={32} />
                                  </div>
                                  <div>
                                    <span className="font-black text-xl text-black block leading-none mb-1">{name}</span>
                                    <span className="text-[10px] font-black uppercase text-black/30 tracking-widest">Arquivo Seguro</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const newParts = [...parts];
                                    newParts.splice(index, 1);
                                    setEditingPost({ ...editingPost, content: newParts.join('') });
                                  }}
                                  className="w-12 h-12 flex items-center justify-center text-red-500 hover:bg-red-50 border-2 border-black rounded-md shadow-[0_4px_0_0_#000] hover:translate-y-[1px] transition-all"
                                >
                                  <Trash2 size={20} strokeWidth={3} />
                                </button>
                              </div>
                            );
                          }

                          if (!part.trim() && index > 0 && index < parts.length - 1) return null;

                          return (
                            <textarea
                              key={index}
                              placeholder="Expanda sua ideia aqui..."
                              value={part}
                              onChange={(e) => {
                                const newParts = [...parts];
                                newParts[index] = e.target.value;
                                setEditingPost({ ...editingPost, content: newParts.join('') });
                              }}
                              className="w-full text-xl md:text-2xl font-bold text-black/70 placeholder:text-black/5 outline-none bg-transparent resize-none leading-relaxed overflow-hidden py-2"
                              style={{ height: 'auto', minHeight: '60px' }}
                              ref={(el) => {
                                if (el) {
                                  el.style.height = 'auto';
                                  el.style.height = el.scrollHeight + 'px';
                                }
                              }}
                            />
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Footer Toolbar - Refined Tool Belt */}
                <div className="border-t-4 border-black p-8 px-10 flex flex-col lg:flex-row items-center justify-between bg-white gap-8 shrink-0 relative z-30">
                  <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                    {/* Media Tools */}
                    <div className="flex items-center gap-3 bg-[#fafafa] p-2 border-2 border-black rounded-xl">
                      <button 
                        onClick={() => document.getElementById('unified-upload')?.click()}
                        className="px-6 py-3 bg-[#97cd7a] border-2 border-black rounded-lg shadow-[0_4px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-3 text-black font-black uppercase text-[10px] tracking-widest"
                      >
                        <PlusCircle size={20} strokeWidth={3} />
                        Arquivo
                      </button>
                      <button 
                        onClick={() => setEditingPost({ ...editingPost, content: (editingPost.content || '') + '\n\n# ' })}
                        className="w-12 h-12 flex items-center justify-center bg-white border-2 border-black rounded-lg shadow-[0_4px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000] transition-all text-black" 
                        title="Adicionar Título (H1)"
                      >
                        <Hash size={20} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => setEditingPost({ ...editingPost, content: (editingPost.content || '') + '\n\n- ' })}
                        className="w-12 h-12 flex items-center justify-center bg-white border-2 border-black rounded-lg shadow-[0_4px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000] transition-all text-black" 
                        title="Lista de Marcadores"
                      >
                        <Layers size={20} strokeWidth={3} />
                      </button>
                    </div>
                    
                    <input 
                      id="unified-upload"
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsUploadingBlock(true);
                            setUploadError(null);
                            const res = await apiClient.uploadFile(file);
                            if (res.file?.url) {
                              let tag = '';
                              if (file.type.startsWith('image/')) {
                                tag = `\n\n![Image](${res.file.url})\n\n`;
                              } else if (file.type.startsWith('video/')) {
                                tag = `\n\n[video](${res.file.url})\n\n`;
                              } else {
                                tag = `\n\n[📎 ${file.name}](${res.file.url})\n\n`;
                              }
                              setEditingPost({ ...editingPost, content: (editingPost.content || '') + tag });
                            }
                          } catch (err) { 
                            console.error(err); 
                            setUploadError(`Falha ao carregar ${file.type.includes('video') ? 'o vídeo' : 'o arquivo'}. Tente novamente.`);
                          } finally {
                            setIsUploadingBlock(false);
                          }
                        }
                      }}
                    />


                    <div className="hidden h-10 w-[2px] bg-black/10 mx-2 lg:block" />

                    {/* Category Selection */}
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] whitespace-nowrap">Canal de Publicação</span>
                      
                      <div className="relative">
                        <motion.button
                          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                          className={`
                            w-52 px-5 py-3.5 rounded-xl border-2 border-black font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-between
                            shadow-[0_4px_0_0_#000] hover:translate-y-[-1px] hover:shadow-[0_5px_0_0_#000] active:translate-y-[2px] active:shadow-none
                            ${(editingPost.category === 'Atualização') ? 'bg-[#ff66b2]' : 
                              (editingPost.category === 'Novidades') ? 'bg-[#ffdf00]' : 'bg-[#e6b3ff]'}
                            text-black outline-none
                          `}
                        >
                          <span className="truncate">{editingPost.category === 'Atualização' ? blogT.categories.design : editingPost.category === 'Novidades' ? blogT.categories.updates : editingPost.category === 'Cultura' ? blogT.categories.culture : blogT.categories.mastery}</span>
                          <motion.div
                            animate={{ rotate: isCategoryOpen ? 180 : 0 }}
                            transition={{ type: 'spring', damping: 20 }}
                          >
                            <ChevronDown size={18} strokeWidth={4} />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {isCategoryOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute bottom-full mb-3 left-0 w-full bg-white border-2 border-black rounded-xl overflow-hidden shadow-[0_8px_0_0_#000] z-50"
                            >
                              {[
                                { id: 'Atualização', label: blogT.categories.design, color: '#ff66b2' },
                                { id: 'Novidades', label: blogT.categories.updates, color: '#ffdf00' },
                                { id: 'Cultura', label: blogT.categories.culture, color: '#e6b3ff' },
                                { id: 'Off Topic', label: blogT.categories.mastery, color: '#97cd7a' }
                              ].map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    setEditingPost({ ...editingPost, category: cat.id });
                                    setIsCategoryOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#fafafa] transition-colors border-b border-black/5 last:border-0"
                                >
                                  <span className="font-black uppercase text-[10px] tracking-widest text-black/70">{cat.label}</span>
                                  <div className="w-3 h-3 rounded-full border border-black shadow-[0_1px_0_0_#000]" style={{ backgroundColor: cat.color }} />
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-5 w-full lg:w-auto">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !editingPost.title || !editingPost.content}
                      className={`
                        flex-1 lg:flex-none px-16 py-5 rounded-[20px] border-4 border-black font-extrabold uppercase tracking-[0.2em] transition-all text-xs
                        ${(editingPost.title && editingPost.content) 
                          ? 'bg-black text-[#ffdf00] shadow-[0_8px_0_0_#ffdf00] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#ffdf00] active:translate-y-1 active:shadow-none' 
                          : 'bg-white text-black/10 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] cursor-not-allowed'}
                      `}
                    >
                      {isSaving ? 'PROCESSANDO...' : (editingPost.id ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR AGORA')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

        </AnimatePresence>,
        document.body
      )}

      <div className="space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-0">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic border-l-8 border-[#ffdf00] pl-6 leading-none">
              Dashboard do Blog
            </h2>
            <p className="text-[10px] sm:text-xs text-black/40 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-3 ml-6">
              Gerencie o conteúdo editorial do sistema
            </p>
          </div>
          <button
            onClick={() => setEditingPost({ 
              title: '', 
              content: '', 
              excerpt: '', 
              category: 'Novidades', 
              author: 'Nodus',
              isPublished: true,
              color: '#97cd7a',
              position: 0
            })}
            className="flex items-center justify-center gap-3 bg-[#97cd7a] border-2 border-black rounded-md px-6 sm:px-10 py-4 sm:py-5 font-black uppercase text-xs sm:text-sm shadow-[0_6px_0_0_#000] sm:shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all group w-full sm:w-auto"
          >
            <Plus size={20} className="transition-transform duration-300" />
            {lang === 'pt' ? 'Criar publicação' : 'Create Post'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {posts.length === 0 ? (
            <div className="border-2 border-black border-dashed rounded-md p-24 text-center bg-slate-50/50">
              <div className="flex justify-center mb-4">
                <Layers size={48} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">
                Sem publicações
              </h3>
            </div>
          ) : (
            <Reorder.Group axis="y" values={posts} onReorder={handleReorder} className="space-y-4">
              {posts.map(post => (
                <BlogListItem
                  key={post.id}
                  post={post}
                  onEdit={setEditingPost}
                  onDelete={handleDelete}
                  deletingPostId={deletingPostId}
                  setDeletingPostId={setDeletingPostId}
                  lang={lang}
                  blogT={blogT}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  );
}

function BlogListItem({ post, onEdit, onDelete, deletingPostId, setDeletingPostId, lang, blogT }: any) {
  const dragControls = useDragControls();
  
  return (
    <Reorder.Item 
      value={post}
      dragListener={false}
      dragControls={dragControls}
      className="bg-white border-2 border-black rounded-md p-5 flex items-center justify-between gap-4 shadow-[0_6px_0_0_#000] group cursor-default relative overflow-hidden"
      whileHover={{ boxShadow: '0 8px 0 0 #000' }}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: '0 12px 0 0 #000',
        zIndex: 100
      }}
      onClick={() => onEdit(post)}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing text-slate-200 hover:text-black transition-colors hidden sm:block shrink-0"
        >
          <GripVertical size={20} />
        </div>

        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border-2 border-black rounded-md flex items-center justify-center shrink-0 overflow-hidden shadow-[0_4px_0_0_#000]">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="text-black/5" size={20} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border border-black ${post.isPublished ? 'bg-[#97cd7a]' : 'bg-[#ffdf00]'}`}>
              {post.isPublished ? (lang === 'pt' ? 'PUBLICADO' : 'PUBLISHED') : (lang === 'pt' ? 'RASCUNHO' : 'DRAFT')}
            </span>
            <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">
              {post.category === 'Atualização' ? blogT.categories.design : 
               post.category === 'Novidades' ? blogT.categories.updates : 
               post.category === 'Cultura' ? blogT.categories.culture :
               post.category === 'Off Topic' ? blogT.categories.mastery :
               post.category}
            </span>
          </div>
          <h4 className="font-black text-lg sm:text-xl uppercase tracking-tighter truncate leading-tight mb-2 sm:mb-1">{post.title}</h4>
          <div className="flex items-center gap-4 text-[9px] font-black uppercase whitespace-nowrap">
             <span className="flex items-center gap-1 text-black/20"><Clock size={12} /> {post.createdAt?.split('T')[0]}</span>
             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500">
               <Eye size={12} strokeWidth={3} /> {post.viewsCount || 0} {lang === 'pt' ? 'VISUALIZAÇÕES' : 'VIEWS'}
             </span>
             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-500">
               <Smile size={12} strokeWidth={3} /> {post.likesCount || 0} {lang === 'pt' ? 'CURTIDAS' : 'LIKES'}
             </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <AnimatePresence mode="wait">
          {deletingPostId === post.id ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 bg-red-50 p-1.5 rounded-md border-2 border-black shadow-[0_4px_0_0_#000]"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                className="p-2 bg-red-500 text-white rounded-md border-2 border-black active:scale-95"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeletingPostId(null); }}
                className="p-2 bg-white text-black rounded-md border-2 border-black active:scale-95"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                className="p-3 bg-white border-2 border-black rounded-md shadow-[0_4px_0_0_#000] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#000] active:translate-y-[3px] active:shadow-none transition-all"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeletingPostId(post.id); }}
                className="p-3 bg-red-50 text-red-600 border-2 border-black rounded-md shadow-[0_4px_0_0_#000] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#000] active:translate-y-[3px] active:shadow-none transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Reorder.Item>
  );
}
