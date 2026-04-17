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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-32">
      {createPortal(
        <AnimatePresence mode="wait">
          {editingPost && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingPost(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full sm:max-w-5xl h-full sm:h-auto bg-white sm:border-2 border-black sm:rounded-xl overflow-hidden flex flex-col sm:max-h-[92vh] shadow-[0_32px_0_0_#000]"
              >
                <div className="flex items-center justify-between px-6 sm:px-10 py-5 sm:py-7 border-b-4 border-black bg-white shrink-0 z-20">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-2.5 h-6 sm:w-3 sm:h-8 bg-[#ffdf00] border-2 border-black" />
                    <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter text-black">
                      {editingPost.id ? (lang === 'pt' ? 'EDITAR POST' : 'EDIT POST') : (lang === 'pt' ? 'NOVA PUBLICAÇÃO' : 'NEW PUBLICATION')}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setEditingPost(null)} 
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border-2 border-black shadow-[0_4px_0_0_#000] hover:translate-y-[2px] transition-all rounded-lg"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar-brutal bg-[#fafafa] flex flex-col">
                  <div className="p-4 sm:p-8 md:p-12 pb-0">
                    <div className="relative group/cover w-full h-[220px] sm:h-[400px] bg-white border-2 border-black rounded-lg overflow-hidden flex items-center justify-center transition-all shadow-[0_6px_0_0_#000] sm:shadow-[0_8px_0_0_#000]">
                      {isUploadingCover ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                      ) : editingPost.imageUrl ? (
                        <>
                          <img src={editingPost.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-all flex items-center justify-center gap-4">
                            <button 
                              onClick={() => document.getElementById('cover-upload')?.click()}
                              className="px-6 py-3 bg-white border-2 border-black rounded-lg font-black uppercase text-xs"
                            >
                              Trocar
                            </button>
                            <button 
                              onClick={() => setEditingPost({ ...editingPost, imageUrl: '' })}
                              className="px-6 py-3 bg-white border-2 border-black rounded-lg font-black uppercase text-xs text-red-500"
                            >
                              Remover
                            </button>
                          </div>
                        </>
                      ) : (
                        <button 
                          onClick={() => document.getElementById('cover-upload')?.click()}
                          className="flex flex-col items-center gap-4"
                        >
                          <div className="w-16 h-16 bg-[#ffdf00] border-2 border-black rounded-lg flex items-center justify-center shadow-[0_4px_0_0_#000]">
                            <ImageIcon size={32} />
                          </div>
                          <span className="font-black uppercase tracking-widest text-[10px]">Capa Principal</span>
                        </button>
                      )}
                    </div>
                    <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          setIsUploadingCover(true);
                          const res = await apiClient.uploadFile(file, 'blog');
                          if (res.file?.url) setEditingPost({ ...editingPost, imageUrl: res.file.url });
                        } catch (err) { console.error(err); } finally { setIsUploadingCover(false); }
                      }
                    }} />
                  </div>

                  <div className="p-6 sm:p-12 max-w-4xl mx-auto w-full space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/20">Título</label>
                      <textarea
                        placeholder="Título impactante..."
                        value={editingPost.title || ''}
                        onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                        className="text-3xl sm:text-6xl font-black text-black outline-none w-full bg-transparent tracking-tighter leading-none resize-none"
                        rows={2}
                      />
                      <div className="w-16 h-2 bg-black rounded-full" />
                    </div>

                    <div className="space-y-10 min-h-[400px]">
                      {(() => {
                        const content = editingPost.content || '';
                        const parts = content.split(/(!\[.*?\]\(.*?\)|\[video\]\(.*?\)|\[📎 .*?\]\(.*?\))/g);
                        return parts.map((part, index) => {
                          const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
                          const videoMatch = part.match(/\[video\]\((.*?)\)/);
                          const fileMatch = part.match(/\[📎 (.*?)\]\((.*?)\)/);
                          
                          if (imageMatch) return (
                            <div key={index} className="relative group/img my-8">
                              <div className="border-2 border-black rounded-lg overflow-hidden shadow-[0_8px_0_0_#000]">
                                <img src={imageMatch[2]} alt="" className="w-full" />
                              </div>
                              <button onClick={() => {
                                const np = [...parts]; np.splice(index, 1);
                                setEditingPost({ ...editingPost, content: np.join('') });
                              }} className="absolute -top-3 -right-3 w-10 h-10 bg-white border-2 border-black rounded-lg text-red-500 shadow-[0_4px_0_0_#000] opacity-0 group-hover/img:opacity-100 transition-all">
                                <Trash2 size={20} />
                              </button>
                            </div>
                          );
                          
                          if (videoMatch) return (
                            <div key={index} className="relative group/vid my-8">
                              <video src={videoMatch[1]} controls className="w-full rounded-lg border-2 border-black shadow-[0_8px_0_0_#000]" />
                              <button onClick={() => {
                                const np = [...parts]; np.splice(index, 1);
                                setEditingPost({ ...editingPost, content: np.join('') });
                              }} className="absolute -top-3 -right-3 w-10 h-10 bg-white border-2 border-black rounded-lg text-red-500 shadow-[0_4px_0_0_#000] opacity-0 group-hover/vid:opacity-100 transition-all">
                                <Trash2 size={20} />
                              </button>
                            </div>
                          );

                          if (fileMatch) return (
                            <div key={index} className="p-8 bg-white border-2 border-black rounded-lg flex items-center justify-between shadow-[0_8px_0_0_#000] my-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 border-2 border-black rounded-lg flex items-center justify-center">
                                  <FileText size={24} />
                                </div>
                                <span className="font-black truncate max-w-[200px]">{fileMatch[1]}</span>
                              </div>
                              <button onClick={() => {
                                const np = [...parts]; np.splice(index, 1);
                                setEditingPost({ ...editingPost, content: np.join('') });
                              }} className="text-red-500"><Trash2 size={20} /></button>
                            </div>
                          );

                          if (!part.trim() && index > 0 && index < parts.length - 1) return null;
                          return (
                            <textarea
                              key={index}
                              placeholder="Expanda sua ideia..."
                              value={part}
                              onChange={(e) => {
                                const target = e.target;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                                const np = [...parts]; 
                                np[index] = target.value;
                                setEditingPost({ ...editingPost, content: np.join('') });
                              }}
                              className="w-full text-xl font-bold text-black/70 outline-none bg-transparent resize-none leading-relaxed overflow-hidden"
                              style={{ height: 'auto', minHeight: '60px' }}
                              ref={(el) => { 
                                if (el && !el.style.height) { 
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

                {/* Footer */}
                <div className="border-t-2 border-black p-5 sm:p-10 flex flex-col lg:flex-row items-center justify-between bg-white gap-6 shrink-0 z-30">
                  <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 p-2 border-2 border-black rounded-lg w-full sm:w-auto justify-center">
                      <button onClick={() => document.getElementById('unified-upload-final')?.click()} className="flex items-center gap-2 px-6 py-3 bg-[#97cd7a] border-2 border-black rounded-lg shadow-[0_4px_0_0_#000] font-black uppercase text-[10px]">
                        <PlusCircle size={18} /> Arquivo
                      </button>
                      <button onClick={() => setEditingPost({ ...editingPost, content: (editingPost?.content || '') + '\n\n# ' })} className="w-12 h-12 flex items-center justify-center bg-white border-2 border-black rounded-lg shadow-[0_4px_0_0_#000]"><Hash size={20} /></button>
                      <button onClick={() => setEditingPost({ ...editingPost, content: (editingPost?.content || '') + '\n\n- ' })} className="w-12 h-12 flex items-center justify-center bg-white border-2 border-black rounded-lg shadow-[0_4px_0_0_#000]"><Layers size={20} /></button>
                    </div>

                    <div className="relative w-full sm:w-44">
                      <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className={`w-full px-4 py-3.5 rounded-lg border-2 border-black font-black uppercase text-[10px] flex items-center justify-between shadow-[0_4px_0_0_#000] ${editingPost.category === 'Atualização' ? 'bg-[#ff66b2]' : editingPost.category === 'Novidades' ? 'bg-[#ffdf00]' : 'bg-[#e6b3ff]'}`}>
                        {editingPost.category}
                        <ChevronDown size={14} />
                      </button>
                      <AnimatePresence>
                        {isCategoryOpen && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full mb-3 left-0 w-full bg-white border-2 border-black rounded-lg overflow-hidden shadow-[0_8px_0_0_#000] z-50">
                            {['Atualização', 'Novidades', 'Cultura', 'Off Topic'].map(cat => (
                              <button key={cat} onClick={() => { setEditingPost({ ...editingPost, category: cat }); setIsCategoryOpen(false); }} className="w-full text-left px-4 py-3 font-black uppercase text-[9px] hover:bg-slate-50 border-b border-black/5 last:border-0">{cat}</button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button onClick={handleSave} disabled={isSaving || !editingPost.title || !editingPost.content} className={`w-full lg:w-64 py-5 rounded-lg border-2 border-black font-black uppercase text-xs transition-all ${editingPost.title && editingPost.content ? 'bg-[#97cd7a] text-black shadow-[0_8px_0_0_#000] active:translate-y-1 active:shadow-none' : 'bg-slate-100 text-black/20 shadow-none'}`}>
                    {isSaving ? 'PROCESSANDO...' : (editingPost.id ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR AGORA')}
                  </button>
                </div>
                <input id="unified-upload-final" type="file" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      setIsUploadingBlock(true);
                      const res = await apiClient.uploadFile(file, 'blog');
                      if (res.file?.url) {
                        let tag = file.type.startsWith('image/') ? `\n\n![Image](${res.file.url})\n\n` : file.type.startsWith('video/') ? `\n\n[video](${res.file.url})\n\n` : `\n\n[📎 ${file.name}](${res.file.url})\n\n`;
                        setEditingPost({ ...editingPost, content: (editingPost.content || '') + tag });
                      }
                    } catch (err) { console.error(err); } finally { setIsUploadingBlock(false); }
                  }
                }} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div className="space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-0">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic border-l-8 border-[#ffdf00] pl-6 leading-none">Dashboard do Blog</h2>
            <p className="text-[10px] sm:text-xs text-black/40 font-black uppercase tracking-[0.3em] mt-3 ml-6">Gerencie o conteúdo editorial</p>
          </div>
          <button onClick={() => setEditingPost({ title: '', content: '', excerpt: '', category: 'Novidades', author: 'Nodus', isPublished: true, color: '#97cd7a', position: 0 })} className="flex items-center justify-center gap-3 bg-[#97cd7a] border-2 border-black rounded-lg px-10 py-5 font-black uppercase text-sm shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all group w-full sm:w-auto">
            <Plus size={20} />
            {lang === 'pt' ? 'Criar publicação' : 'Create Post'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {posts.length === 0 ? (
            <div className="border-2 border-black border-dashed rounded-lg p-24 text-center bg-slate-50/50">
              <div className="flex justify-center mb-4"><Layers size={48} className="text-slate-200" /></div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Sem publicações</h3>
            </div>
          ) : (
            <Reorder.Group axis="y" values={posts} onReorder={handleReorder} className="space-y-4">
              {posts.map(post => (
                <BlogListItem key={post.id} post={post} onEdit={setEditingPost} onDelete={handleDelete} deletingPostId={deletingPostId} setDeletingPostId={setDeletingPostId} lang={lang} blogT={blogT} />
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
      className={`
        bg-white border-2 border-black rounded-lg p-4 sm:p-5 
        flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 
        shadow-[0_6px_0_0_#000] group cursor-default relative overflow-hidden transition-all
        ${deletingPostId === post.id ? 'border-red-500' : 'border-black'}
      `}
      whileHover={{ boxShadow: '0 8px 0_0_#000' }}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: '0 12px 0_0_#000',
        zIndex: 100
      }}
      onClick={() => onEdit(post)}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Drag handle - Hidden on mobile for simplicity */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing text-slate-200 hover:text-black transition-colors hidden md:block shrink-0"
        >
          <GripVertical size={20} />
        </div>

        {/* Thumbnail */}
        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50 border-2 border-black rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-[0_4px_0_0_#000]">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="text-black/5" size={24} />
          )}
        </div>
        
        {/* Content Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[7px] sm:text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border border-black ${post.isPublished ? 'bg-[#97cd7a]' : 'bg-[#ffdf00]'}`}>
              {post.isPublished ? (lang === 'pt' ? 'PUBLICADO' : 'PUBLISHED') : (lang === 'pt' ? 'RASCUNHO' : 'DRAFT')}
            </span>
            <span className="text-[7px] sm:text-[8px] font-bold uppercase text-slate-400 tracking-tighter">
              {post.category === 'Atualização' ? blogT.categories.design : 
               post.category === 'Novidades' ? blogT.categories.updates : 
               post.category === 'Cultura' ? blogT.categories.culture :
               post.category === 'Off Topic' ? blogT.categories.mastery :
               post.category}
            </span>
          </div>

          <h4 className="font-black text-sm sm:text-xl uppercase tracking-tighter truncate sm:whitespace-normal sm:line-clamp-1 leading-tight mb-2">
            {post.title}
          </h4>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[8px] sm:text-[9px] font-black uppercase">
             <span className="flex items-center gap-1 text-black/30"><Clock size={10} /> {post.createdAt?.split('T')[0]}</span>
             <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-black/5 text-slate-500">
               <Eye size={10} strokeWidth={3} /> {post.viewsCount || 0}
             </span>
             <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-black/5 text-red-500">
               <Smile size={10} strokeWidth={3} /> {post.likesCount || 0}
             </span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-end gap-2 shrink-0 pt-3 sm:pt-0 border-t border-black/5 sm:border-0 mt-1 sm:mt-0">
        <AnimatePresence mode="wait">
          {deletingPostId === post.id ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 bg-red-50 p-1 rounded-lg border-2 border-black"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                className="p-2 sm:p-3 bg-red-500 text-white rounded-lg border-2 border-black active:scale-95 transition-all"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeletingPostId(null); }}
                className="p-2 sm:p-3 bg-white text-black rounded-lg border-2 border-black active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                className="p-3 sm:p-4 bg-white border-2 border-black rounded-lg shadow-[0_4px_0_0_#000] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#000] active:translate-y-[3px] active:shadow-none transition-all"
              >
                <Edit2 size={16} className="sm:size-[18px]" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeletingPostId(post.id); }}
                className="p-3 sm:p-4 bg-red-50 text-red-600 border-2 border-black rounded-lg shadow-[0_4px_0_0_#000] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#000] active:translate-y-[3px] active:shadow-none transition-all"
              >
                <Trash2 size={16} className="sm:size-[18px]" />
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Reorder.Item>
  );
}
