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
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-32">
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
                className="relative w-full max-w-5xl bg-white border-2 border-black rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"
              >
                {/* Header: Criar publicação */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white shrink-0">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {editingPost.id ? (lang === 'pt' ? 'Editar publicação' : 'Edit Post') : (lang === 'pt' ? 'Criar publicação' : 'Create Post')}
                  </h3>
                  <div className="flex items-center gap-6 text-slate-400">
                    <button className="hover:text-black transition-colors"><Maximize2 size={20} /></button>
                    <button onClick={handleCancel} className="hover:text-black transition-colors"><X size={26} /></button>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-10 space-y-8 bg-white">
                  {/* Cover Image Section - Refined Brutalist Style */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Foto de Destaque (Capa)</label>
                    <div className="relative group/cover w-full h-80 bg-slate-50 border-2 border-black border-dashed rounded-[40px] overflow-hidden flex items-center justify-center transition-all hover:bg-slate-100/50 hover:border-solid group">
                      {editingPost.imageUrl ? (
                        <>
                          <img src={editingPost.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-all flex items-center justify-center gap-6">
                            <button 
                              onClick={() => document.getElementById('cover-upload')?.click()}
                              className="p-5 bg-white border-2 border-black rounded-2xl shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all"
                            >
                              <ImageIcon size={28} />
                            </button>
                            <button 
                              onClick={() => setEditingPost({ ...editingPost, imageUrl: '' })}
                              className="p-5 bg-white border-2 border-black rounded-2xl shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all text-red-500"
                            >
                              <Trash2 size={28} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button 
                          onClick={() => document.getElementById('cover-upload')?.click()}
                          className="flex flex-col items-center gap-4 text-slate-300 hover:text-black transition-all"
                        >
                          <div className="p-8 bg-white border-2 border-slate-100 rounded-[32px] shadow-sm group-hover:border-black group-hover:shadow-[0_12px_0_0_#000] transition-all">
                            <ImageIcon size={48} strokeWidth={1.5} />
                          </div>
                          <span className="font-black uppercase tracking-[0.2em] text-[10px]">Upload Imagem de Capa</span>
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
                              const res = await apiClient.uploadFile(file);
                              if (res.file?.url) {
                                setEditingPost({ ...editingPost, imageUrl: res.file.url });
                              }
                            } catch (err) {
                              console.error('Upload failed:', err);
                              alert('Erro ao carregar imagem');
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Title Input */}
                  <input
                    type="text"
                    placeholder="Título (opcional)"
                    value={editingPost.title || ''}
                    onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="text-5xl font-black text-slate-900 placeholder:text-slate-200 outline-none w-full bg-transparent tracking-tighter"
                  />

                  {/* Body Content - Block Based Editor */}
                  <div className="space-y-6">
                    {(() => {
                      const content = editingPost.content || '';
                      // Split by images, videos and file attachments
                      const parts = content.split(/(!\[.*?\]\(.*?\)|\[video\]\(.*?\)|\[📎 .*?\]\(.*?\))/g);
                      
                      return parts.map((part, index) => {
                        const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
                        const videoMatch = part.match(/\[video\]\((.*?)\)/);
                        const fileMatch = part.match(/\[📎 (.*?)\]\((.*?)\)/);
                        
                        if (imageMatch) {
                          const [full, alt, url] = imageMatch;
                          return (
                            <div key={index} className="relative group/img-block my-10">
                              <img src={url} alt={alt} className="w-full rounded-[40px] border-2 border-black shadow-[0_15px_0_0_#000]" />
                              <button
                                onClick={() => {
                                  const newParts = [...parts];
                                  newParts.splice(index, 1);
                                  setEditingPost({ ...editingPost, content: newParts.join('') });
                                }}
                                className="absolute top-6 right-6 p-4 bg-red-500 text-white border-2 border-black rounded-2xl opacity-0 group-hover/img-block:opacity-100 transition-all shadow-[0_6px_0_0_#000] hover:translate-y-[2px]"
                              >
                                <Trash2 size={24} />
                              </button>
                            </div>
                          );
                        }

                        if (videoMatch) {
                          const [full, url] = videoMatch;
                          return (
                            <div key={index} className="relative group/vid-block my-10">
                              <div className="w-full aspect-video rounded-[40px] border-2 border-black overflow-hidden shadow-[0_15px_0_0_#000] bg-black">
                                <video src={url} controls className="w-full h-full" />
                              </div>
                              <button
                                onClick={() => {
                                  const newParts = [...parts];
                                  newParts.splice(index, 1);
                                  setEditingPost({ ...editingPost, content: newParts.join('') });
                                }}
                                className="absolute top-6 right-6 p-4 bg-red-500 text-white border-2 border-black rounded-2xl opacity-0 group-hover/vid-block:opacity-100 transition-all shadow-[0_6px_0_0_#000] hover:translate-y-[2px] z-10"
                              >
                                <Trash2 size={24} />
                              </button>
                            </div>
                          );
                        }

                        if (fileMatch) {
                          const [full, name, url] = fileMatch;
                          return (
                            <div key={index} className="relative group/file-block my-6 p-8 bg-slate-50 border-2 border-black rounded-[32px] flex items-center justify-between shadow-[0_8px_0_0_#000]">
                              <div className="flex items-center gap-4">
                                <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[0_4px_0_0_#000]">
                                  <FileText size={32} />
                                </div>
                                <div>
                                  <span className="font-black text-slate-900 block">{name}</span>
                                  <span className="text-[10px] font-black uppercase text-slate-400">Arquivo Anexado</span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const newParts = [...parts];
                                  newParts.splice(index, 1);
                                  setEditingPost({ ...editingPost, content: newParts.join('') });
                                }}
                                className="p-4 text-red-500 hover:bg-white border-2 border-transparent hover:border-black rounded-2xl transition-all"
                              >
                                <Trash2 size={24} />
                              </button>
                            </div>
                          );
                        }

                        if (!part.trim() && index > 0 && index < parts.length - 1) return null;

                        return (
                          <textarea
                            key={index}
                            placeholder="Comece a escrever aqui..."
                            value={part}
                            onChange={(e) => {
                              const newParts = [...parts];
                              newParts[index] = e.target.value;
                              setEditingPost({ ...editingPost, content: newParts.join('') });
                            }}
                            className="w-full text-2xl font-bold text-slate-700 placeholder:text-slate-100 outline-none bg-transparent resize-none leading-relaxed overflow-hidden py-4"
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

                {/* Footer Toolbar */}
                <div className="border-t border-slate-100 p-8 flex flex-col sm:flex-row items-center justify-between bg-white gap-6 shrink-0">
                  <div className="flex items-center gap-6 text-slate-600">
                    <button 
                      onClick={() => document.getElementById('unified-upload')?.click()}
                      className="p-5 bg-[#97cd7a] border-2 border-black rounded-2xl shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-4 group text-black"
                    >
                      <PlusCircle size={32} className="group-hover:rotate-90 transition-transform duration-500 text-black" />
                      <span className="font-black uppercase text-xs tracking-widest pr-4 text-black">Adicionar Arquivo</span>
                    </button>
                    <input 
                      id="unified-upload"
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
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
                          } catch (err) { console.error(err); }
                        }
                      }}
                    />
                    
                    <div className="h-10 w-[2px] bg-black/10 mx-4" />
                    
                    <button 
                      onClick={() => setEditingPost({ ...editingPost, content: (editingPost.content || '') + '\n\n# ' })}
                      className="text-black hover:text-black transition-colors p-3 hover:bg-slate-50 rounded-2xl border-2 border-transparent hover:border-black" title="Adicionar Título"
                    >
                      <Hash size={28} />
                    </button>
                  </div>

                  <div className="flex items-center gap-8 w-full sm:w-auto">
                    <div className="hidden lg:flex items-center gap-3 text-xs text-black font-black uppercase tracking-widest whitespace-nowrap">
                      Publicando em: 
                      <div className="relative group/cat">
                        <select 
                          value={editingPost.category || 'Novidades'}
                          onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                          className={`
                            pl-4 pr-10 py-3 rounded-2xl border-2 border-black font-black uppercase tracking-tighter cursor-pointer appearance-none transition-all
                            shadow-[0_4px_0_0_#000] hover:translate-y-[-2px] hover:shadow-[0_6px_0_0_#000] active:translate-y-[2px] active:shadow-none
                            ${(editingPost.category === 'Atualização') ? 'bg-brand' : 
                              (editingPost.category === 'Novidades') ? 'bg-[#ffdf00]' : 'bg-slate-100'}
                            text-black outline-none
                          `}
                        >
                          <option value="Atualização">{blogT.categories.design}</option>
                          <option value="Novidades">{blogT.categories.updates}</option>
                          <option value="Cultura">{blogT.categories.culture}</option>
                          <option value="Off Topic">{blogT.categories.mastery}</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black stroke-[3]" />
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={isSaving || !editingPost.title || !editingPost.content}
                      className={`px-12 py-4 rounded-full font-black uppercase tracking-[0.1em] transition-all text-sm w-full sm:w-auto
                        ${(editingPost.title && editingPost.content) 
                          ? 'bg-[#1a1a1a] text-white hover:bg-black shadow-xl active:scale-95' 
                          : 'bg-slate-50 text-slate-300 cursor-not-allowed border-2 border-slate-100'}`}
                    >
                      {isSaving ? 'PUBLICANDO...' : 'PUBLICAR'}
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
            className="flex items-center justify-center gap-3 bg-[#97cd7a] border-2 border-black rounded-2xl px-6 sm:px-10 py-4 sm:py-5 font-black uppercase text-xs sm:text-sm shadow-[0_6px_0_0_#000] sm:shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all group w-full sm:w-auto"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            {lang === 'pt' ? 'Criar publicação' : 'Create Post'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {posts.length === 0 ? (
            <div className="border-2 border-black border-dashed rounded-[32px] p-24 text-center bg-slate-50/50">
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
      className="bg-white border-2 border-black rounded-[32px] p-5 flex items-center justify-between gap-4 shadow-[0_6px_0_0_#000] group cursor-default relative overflow-hidden"
      whileHover={{ scale: 1.005, boxShadow: '0 8px 0 0 #000' }}
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

        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border-2 border-black rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-[0_4px_0_0_#000]">
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
              className="flex items-center gap-2 bg-red-50 p-1.5 rounded-2xl border-2 border-black shadow-[0_4px_0_0_#000]"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                className="p-2 bg-red-500 text-white rounded-xl border-2 border-black active:scale-95"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeletingPostId(null); }}
                className="p-2 bg-white text-black rounded-xl border-2 border-black active:scale-95"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                className="p-3 bg-white border-2 border-black rounded-xl shadow-[0_4px_0_0_#000] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#000] active:translate-y-[3px] active:shadow-none transition-all"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeletingPostId(post.id); }}
                className="p-3 bg-red-50 text-red-600 border-2 border-black rounded-xl shadow-[0_4px_0_0_#000] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#000] active:translate-y-[3px] active:shadow-none transition-all"
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
