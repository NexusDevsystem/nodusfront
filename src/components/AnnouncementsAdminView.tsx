import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Image as ImageIcon, 
  CheckCircle, Megaphone, AlertCircle, Sparkles
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface Announcement {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    targetUserEmail?: string;
    isActive: boolean;
    createdAt?: string;
}

export default function AnnouncementsAdminView() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [userEmails, setUserEmails] = useState<string[]>([]);

    useEffect(() => {
        fetchAnnouncements();
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            const emails = await apiClient.listUserEmails();
            setUserEmails(emails);
        } catch (err) { console.error('Error fetching emails:', err); }
    };

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getAdminAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingAnnouncement?.title || !editingAnnouncement?.content) return;
        
        setIsSaving(true);
        try {
            if (editingAnnouncement.id) {
                await apiClient.updateAnnouncement(editingAnnouncement.id, editingAnnouncement);
            } else {
                await apiClient.createAnnouncement(editingAnnouncement);
            }
            setEditingAnnouncement(null);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error saving announcement:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar este anúncio?')) return;
        try {
            await apiClient.deleteAnnouncement(id);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    const handleToggleStatus = async (ann: Announcement) => {
        try {
            await apiClient.updateAnnouncement(ann.id, { isActive: !ann.isActive });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error toggling status:', error);
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-0">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic border-l-8 border-[#ffdf00] pl-6 leading-none">
                        Gestão de Anúncios
                    </h2>
                    <p className="text-[10px] sm:text-xs text-black/40 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-3 ml-6">
                        Broadcast global para todos os usuários
                    </p>
                </div>
                <button
                    onClick={() => setEditingAnnouncement({ 
                        title: '', 
                        content: '', 
                        imageUrl: '',
                        targetUserEmail: '',
                        isActive: true
                    })}
                    className="flex items-center justify-center gap-3 bg-black text-[#ffdf00] border-2 border-black rounded-md px-6 sm:px-10 py-4 sm:py-5 font-black uppercase text-xs sm:text-sm shadow-[0_6px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all group w-full sm:w-auto"
                >
                    <Plus size={20} />
                    Criar Anúncio
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {announcements.length === 0 ? (
                    <div className="md:col-span-2 border-2 border-black border-dashed rounded-[40px] p-24 text-center bg-slate-50/50">
                        <Megaphone size={48} className="mx-auto text-black/10 mb-4" />
                        <h3 className="text-xl font-black text-black/20 uppercase tracking-widest">
                            Nenhum anúncio criado
                        </h3>
                    </div>
                ) : (
                    announcements.map(ann => (
                        <div 
                            key={ann.id} 
                            className={`relative bg-white border-2 border-black rounded-xl overflow-hidden flex flex-col shadow-[0_8px_0_0_#000] hover:translate-y-[-2px] transition-all ${!ann.isActive ? 'opacity-60 saturate-50' : ''}`}
                        >
                            {ann.imageUrl && (
                                <div className="h-40 border-b-2 border-black bg-slate-100 overflow-hidden">
                                    <img src={ann.imageUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                            )}
                            <div className="p-8 flex-1 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border-2 border-black ${ann.isActive ? 'bg-[#97cd7a]' : 'bg-slate-200'}`}>
                                        {ann.isActive ? 'Ativo' : 'Rascunho'}
                                    </span>
                                    {ann.isActive && (
                                        <div className="flex items-center gap-1.5 text-black/60">
                                            <Sparkles size={14} className={ann.targetUserEmail ? "text-blue-500" : "text-[#ffdf00]"} fill="currentColor" />
                                            <span className="text-[9px] font-black uppercase">
                                                {ann.targetUserEmail ? `Exclusivo: ${ann.targetUserEmail}` : 'Público: Todos os Usuários'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter italic">{ann.title}</h4>
                                <p className="text-sm font-bold text-black/40 line-clamp-3">{ann.content}</p>
                                
                                <div className="mt-auto pt-6 flex items-center justify-between border-t-2 border-black/5">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setEditingAnnouncement(ann)}
                                            className="p-3 bg-white border-2 border-black rounded-xl hover:bg-slate-50 shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ann.id)}
                                            className="p-3 bg-red-50 text-red-500 border-2 border-black rounded-xl hover:bg-red-100 shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => handleToggleStatus(ann)}
                                        className={`px-6 py-3 border-2 border-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_4px_0_0_#000] active:translate-y-[2px] active:shadow-none transition-all ${ann.isActive ? 'bg-[#ffdf00]' : 'bg-[#97cd7a]'}`}
                                    >
                                        {ann.isActive ? 'Desativar' : 'Ativar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Edição */}
            {createPortal(
                <AnimatePresence>
                    {editingAnnouncement && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => !isSaving && setEditingAnnouncement(null)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-xl bg-white border-2 border-black rounded-lg shadow-[0_12px_0_0_#000] overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="px-8 py-5 border-b-2 border-black flex items-center justify-between bg-white shrink-0">
                                    <div className="flex items-center gap-3">
                                        <Megaphone size={20} strokeWidth={3} />
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic">
                                            {editingAnnouncement.id ? 'Editar Anúncio' : 'Novo Anúncio'}
                                        </h3>
                                    </div>
                                    <button 
                                        onClick={() => setEditingAnnouncement(null)} 
                                        className="w-10 h-10 flex items-center justify-center border-2 border-black hover:bg-black hover:text-white transition-all rounded-sm shadow-[0_3px_0_0_#000] active:translate-y-[2px] active:shadow-none"
                                    >
                                        <X size={20} strokeWidth={4} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fafafa]">
                                    {/* Upload de Imagem */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Imagem de Destaque</label>
                                        <div 
                                            className="relative group w-full h-44 border-2 border-black border-dashed rounded-xl overflow-hidden flex items-center justify-center bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                                            onClick={() => document.getElementById('ann-upload')?.click()}
                                        >
                                            {isUploading ? (
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                            ) : editingAnnouncement.imageUrl ? (
                                                <img src={editingAnnouncement.imageUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="text-center">
                                                    <ImageIcon size={32} className="mx-auto mb-2 text-black/10" />
                                                    <span className="font-black uppercase text-[10px] tracking-widest text-black/20">Clique para carregar</span>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            id="ann-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        setIsUploading(true);
                                                        const res = await apiClient.uploadFile(file, 'internal');
                                                        if (res.file?.url) {
                                                            setEditingAnnouncement({ ...editingAnnouncement, imageUrl: res.file.url });
                                                        }
                                                    } catch (err) { console.error(err); } finally { setIsUploading(false); }
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Título */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Título do Anúncio</label>
                                        <input 
                                            type="text"
                                            value={editingAnnouncement.title}
                                            onChange={e => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                                            className="w-full bg-white border-2 border-black rounded-xl px-5 py-3.5 text-base font-black uppercase tracking-tighter outline-none focus:bg-[#ffdf00]/10 transition-colors"
                                            placeholder="Ex: GRANDE ATUALIZAÇÃO CHEGOU!"
                                        />
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Mensagem</label>
                                        <textarea 
                                            rows={4}
                                            value={editingAnnouncement.content}
                                            onChange={e => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                                            className="w-full bg-white border-2 border-black rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:bg-[#ffdf00]/10 transition-colors resize-none"
                                            placeholder="O que você quer anunciar para a comunidade?"
                                        />
                                    </div>
                                    {/* Segmentação */}
                                    {/* Segmentação */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Público Alvo</label>
                                        <div className="relative group">
                                            <select 
                                                value={editingAnnouncement.targetUserEmail || ''}
                                                onChange={e => setEditingAnnouncement({ ...editingAnnouncement, targetUserEmail: e.target.value })}
                                                className="w-full bg-white border-2 border-black rounded-xl px-5 py-3.5 text-xs font-black uppercase outline-none focus:bg-[#ffdf00]/10 transition-colors appearance-none cursor-pointer"
                                            >
                                                <option value="">📢 ENVIAR PARA TODOS (GLOBAL)</option>
                                                {userEmails.map(email => (
                                                    <option key={email} value={email}>👤 {email}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                <Megaphone size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <label className="flex items-center gap-4 p-5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input 
                                            type="checkbox"
                                            checked={editingAnnouncement.isActive}
                                            onChange={e => setEditingAnnouncement({ ...editingAnnouncement, isActive: e.target.checked })}
                                            className="w-5 h-5 border-2 border-black rounded-md accent-black"
                                        />
                                        <div>
                                            <span className="font-black uppercase text-xs block">Publicar Imediatamente</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="p-6 border-t-2 border-black bg-white flex items-center gap-4">
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving || !editingAnnouncement.title || !editingAnnouncement.content}
                                        className="flex-1 py-4 bg-black text-[#ffdf00] border-2 border-black rounded-xl font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_5px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_3px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar Anúncio'}
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
