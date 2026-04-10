import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Trash2, Heart, FlaskConical, Sparkles, AlertTriangle, X, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface RoadmapTask {
  id: string;
  title: string;
  description?: string;
  author_name?: string;
  is_admin?: boolean;
  status: 'backlog' | 'planned' | 'in_progress' | 'done' | 'rejected';
  votes: number;
  created_at: string;
}

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#e0e0e0', text: '#1a1a1a' },
  { id: 'planned', label: 'Analisando', color: '#fde68a', text: '#b45309' },
  { id: 'in_progress', label: 'Desenvolvendo', color: '#bfdbfe', text: '#1d4ed8' },
  { id: 'done', label: 'Pronto', color: '#97cd7a', text: '#15803d' },
  { id: 'rejected', label: 'Não faremos', color: '#fee2e2', text: '#991b1b' },
];

interface Props {
  isOwner?: boolean;
  view?: 'kanban' | 'kanban-admin' | 'list';
}

export default function RoadmapAdminView({ isOwner = false, view = 'kanban' }: Props) {
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<RoadmapTask | null>(null);

  const fetchTasks = () => {
    setLoading(true);
    apiClient.getRoadmapTasks()
      .then((data) => setTasks(data as RoadmapTask[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const updated = await apiClient.updateRoadmapTaskStatus(id, status);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch { /* silent */ } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    try {
      await apiClient.deleteRoadmapTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmId(null);
    } catch { /* silent */ } finally {
      setSubmitting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      handleStatusChange(taskId, status);
    }
  };

  const handleVote = async (taskId: string) => {
    try {
      const updated = await apiClient.voteRoadmapTask(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setVotedIds(prev => {
        const next = new Set(prev);
        if (next.has(taskId)) next.delete(taskId);
        else next.add(taskId);
        return next;
      });
    } catch { /* silent */ }
  };

  const grouped = (status: string) => tasks.filter(t => t.status === status);
  const isNew = (createdAt: string) => (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000;

  const { isAdmin: isAuthAdmin, user } = useAuth();
  // isAdmin requer: ser admin pelo AuthContext E estar na view de admin
  const isAdmin = isAuthAdmin && view === 'kanban-admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#97cd7a]" />
      </div>
    );
  }

  function renderModals() {
    return createPortal(
      <>
        <AnimatePresence mode="wait">
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#1a1a1a]/80 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: 20, opacity: 0 }} 
                className="relative w-full md:max-w-md bg-white border-2 border-black p-6 md:p-8 shadow-[0_12px_0_0_#000] rounded-2xl pointer-events-auto"
              >
                <div className="mb-8 border-b-2 border-black/10 pb-4">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-black leading-none">Sugerir</h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mt-1">Nodus Lab</p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!form.title.trim()) return;
                  setSubmitting(true);
                  try {
                    const created = await apiClient.createRoadmapTask({ 
                      ...form, 
                      is_admin: isAdmin,
                      author_name: user?.name || user?.username || 'Anônimo'
                    });
                    setTasks(prev => [created, ...prev]);
                    setIsModalOpen(false);
                    setForm({ title: '', description: '' });
                  } catch (err: any) { 
                    // Silent fail but logged for dev
                  } finally { setSubmitting(false); }
                }} className="flex flex-col gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] mb-2">Título do Card *</label>
                    <input 
                      type="text" 
                      value={form.title} 
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                      placeholder="Ex: Checkout Direto na Bio"
                      className="w-full px-5 py-4 border-2 border-black bg-[#fafafa] rounded-xl text-base font-black placeholder:text-black/20 focus:bg-[#fef08a] transition-all outline-none" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] mb-2">Descrição Detalhada</label>
                    <textarea 
                      value={form.description} 
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                      rows={3} 
                      placeholder="Explique como essa funcionalidade ajudaria..."
                      className="w-full px-5 py-4 border-2 border-black bg-[#fafafa] rounded-xl text-sm font-bold placeholder:text-black/20 resize-none focus:bg-[#fef08a] transition-all outline-none" 
                    />
                  </div>

                  <div className="flex gap-4 mt-2">
                    <button 
                      type="submit" 
                      disabled={submitting || !form.title.trim()} 
                      className="flex-1 py-5 bg-[#97cd7a] border-2 border-black rounded-xl shadow-[0_6px_0_0_#000] text-[11px] font-black uppercase tracking-widest hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#000] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Enviando...' : 'Adicionar ao Lab'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-16 shrink-0 flex items-center justify-center bg-white border-2 border-black rounded-xl shadow-[0_6px_0_0_#000] text-black hover:bg-red-500 hover:text-white hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#000] active:translate-y-[6px] active:shadow-none transition-all"
                    >
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {deleteConfirmId && (
            <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center p-0 md:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setDeleteConfirmId(null)} />
                <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} className="relative w-full md:max-w-md bg-white border-t-4 border-[#1a1a1a] md:border-b-4 md:rounded-2xl p-6 md:p-8 shadow-none md:shadow-[0_12px_0_0_#1a1a1a] pointer-events-auto">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#ffdddd] border-4 border-[#1a1a1a] flex items-center justify-center mb-6 shadow-[0_4px_0_0_#1a1a1a] rounded-xl">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black uppercase text-black mb-3 italic">Deletar Task?</h2>
                        <p className="text-[10px] font-bold text-black/50 uppercase leading-relaxed mb-6 md:mb-8">Esta ação não pode ser desfeita.</p>
                        <div className="grid grid-cols-1 w-full gap-4">
                            <button onClick={() => handleDelete(deleteConfirmId)} disabled={submitting} className="w-full py-3 md:py-4 bg-red-500 border-2 border-black text-white font-black text-[10px] uppercase shadow-[0_4px_0_0_#000] transition-all">
                                {submitting ? 'Deletando...' : 'Confirmar'}
                            </button>
                            <button onClick={() => setDeleteConfirmId(null)} className="w-full py-3 md:py-4 bg-white border-2 border-black text-black font-black text-[10px] uppercase shadow-[0_4px_0_0_#000] transition-all">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
          )}

          {selectedTask && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: 20, opacity: 0 }} 
                className="relative w-full max-w-xl bg-white border-2 border-black p-6 md:p-8 shadow-[0_12px_0_0_#000] rounded-2xl pointer-events-auto flex flex-col max-h-[85vh]"
              >
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div className="flex flex-col gap-3 min-w-0">
                    <span 
                        className="text-[9px] uppercase font-black tracking-widest px-2.5 py-1.5 border-2 border-black rounded-lg w-fit shadow-[0_2px_0_0_#000]" 
                        style={{ backgroundColor: COLUMNS.find(c => c.id === selectedTask.status)?.color || '#eee' }}
                    >
                        {COLUMNS.find(c => c.id === selectedTask.status)?.label}
                    </span>
                    <h2 className="text-2xl font-black uppercase text-black leading-tight break-words">{selectedTask.title}</h2>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="shrink-0 w-10 h-10 flex items-center justify-center bg-white border-2 border-black rounded-xl text-black hover:bg-[#ffdf00] transition-colors shadow-[0_4px_0_0_#000] hover:translate-y-[2px] hover:shadow-none active:translate-y-[4px] active:shadow-none">
                    <X size={20} strokeWidth={4} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto mb-8 pr-2 custom-scrollbar min-h-[100px]">
                    {selectedTask.description ? (
                        <p className="text-sm font-bold text-black/70 whitespace-pre-wrap leading-relaxed">{selectedTask.description}</p>
                    ) : (
                        <p className="text-sm font-bold text-black/40 italic">Nenhuma descrição fornecida.</p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-5 border-t-2 border-black/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase text-black/40 tracking-widest">Data da Sugestão</span>
                    <span className="text-xs font-black uppercase text-black">{new Date(selectedTask.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                      {isAdmin && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(selectedTask.id); setSelectedTask(null); }} 
                            className="w-12 h-12 flex items-center justify-center border-2 border-black rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-[0_4px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000] active:translate-y-[4px] active:shadow-none"
                        >
                            <Trash2 size={16} strokeWidth={3} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleVote(selectedTask.id); }} 
                        className={`flex items-center gap-2 px-6 h-12 border-2 border-black rounded-xl text-[11px] tracking-widest font-black uppercase transition-all shadow-[0_4px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#000] active:translate-y-[4px] active:shadow-none ${votedIds.has(selectedTask.id) ? 'bg-[#ff7eb6] text-white' : 'bg-white text-black hover:bg-[#ffdf00]'}`}
                      >
                        <Heart size={16} strokeWidth={4} className={votedIds.has(selectedTask.id) ? 'fill-white' : ''} />
                        <span className="tabular-nums font-black">{tasks.find(t => t.id === selectedTask.id)?.votes} Voto{tasks.find(t => t.id === selectedTask.id)?.votes !== 1 && 's'}</span>
                      </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>,
      document.body
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-full overflow-hidden">
      <div className="mb-6 md:mb-10 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1a1a1a] italic leading-none truncate">
            Laboratório
          </h2>
          {isAdmin && <p className="hidden md:block text-[9px] font-black text-[#1a1a1a]/30 uppercase tracking-[0.2em] mt-3">Gestão de sugestões</p>}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 flex items-center gap-2 px-6 py-3 bg-[#97cd7a] border-2 border-black rounded-xl shadow-[0_4px_0_0_#000] hover:translate-y-[2px] transition-all text-black font-black uppercase tracking-widest text-[11px]"
        >
          <FlaskConical size={16} strokeWidth={3} />
          <span>Sugerir</span>
        </button>
      </div>

      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 min-h-[600px] w-full scrollbar-hide snap-x snap-mandatory">
        {COLUMNS.map(col => (
          <div 
            key={col.id} 
            className="w-[85vw] md:flex-1 shrink-0 flex flex-col gap-4 snap-center snap-always"
            onDragOver={(e) => isAdmin && e.preventDefault()}
            onDrop={(e) => isAdmin && handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between px-5 py-3 border-2 border-black rounded-2xl shadow-[0_4px_0_0_#000] mb-1" style={{ backgroundColor: col.color }}>
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-black">{col.label}</span>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-black/10 animate-pulse" />
                 <span className="text-[10px] font-black text-[#1a1a1a]/30">{grouped(col.id).length}</span>
              </div>
            </div>

            <div className={`flex flex-col gap-5 min-h-[500px] rounded-2xl transition-colors p-1 ${isAdmin ? 'hover:bg-[#1a1a1a]/[0.02] border-2 border-dashed border-transparent hover:border-[#1a1a1a]/10' : ''}`}>
              {/* Quick Suggest Button (Backlog Only) */}
              {col.id === 'backlog' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 px-6 border-2 border-dashed border-[#1a1a1a]/10 rounded-2xl text-[#1a1a1a]/30 text-[10px] font-black uppercase tracking-widest hover:border-[#1a1a1a]/20 hover:text-[#1a1a1a]/50 hover:bg-[#1a1a1a]/[0.02] transition-all flex items-center justify-center gap-2 mb-2"
                >
                  <PlusCircle size={14} />
                  Sugerir
                </button>
              )}
              {grouped(col.id).sort((a,b)=>b.votes - a.votes).map(task => (
                <div 
                  key={task.id} 
                  draggable={isAdmin}
                  onDragStart={(e) => isAdmin && handleDragStart(e, task.id)}
                  onClick={() => setSelectedTask(task)}
                  className={`bg-white border-2 border-[#1a1a1a] rounded-2xl shadow-[0_5px_0_0_#1a1a1a] p-5 md:p-6 flex flex-col gap-4 relative group transition-all cursor-pointer ${isAdmin ? 'active:cursor-grabbing hover:translate-y-[-2px] hover:shadow-[0_6px_0_0_#1a1a1a]' : 'hover:translate-y-[-2px] hover:shadow-[0_6px_0_0_#1a1a1a]'}`}
                >
                  {updating === task.id && (
                    <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-[2px] flex items-center justify-center rounded-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-[#97cd7a]" strokeWidth={4} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-black/40">Sincronizando...</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5 md:gap-2">
                       {isAdmin && isNew(task.created_at) && (
                         <span className="flex items-center gap-1 w-fit px-1.5 py-0.5 bg-[#ffdf00] border border-[#1a1a1a] rounded-md text-[7px] font-black uppercase tracking-widest">
                           <Sparkles size={8} /> Novo
                         </span>
                       )}
                       <h3 className="text-[12px] md:text-[13px] font-black text-[#1a1a1a] uppercase leading-tight break-words">{task.title}</h3>
                    </div>
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(task.id); }} className="shrink-0 text-[#1a1a1a]/20 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  {task.description && <p className="text-[10px] md:text-[11px] text-[#1a1a1a]/50 font-medium line-clamp-3">{task.description}</p>}
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t-2 border-[#1a1a1a]/5 mt-auto">
                    <span className="text-[8px] md:text-[9px] font-black text-[#1a1a1a]/40">{new Date(task.created_at).toLocaleDateString()}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleVote(task.id); }} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] md:text-[11px] font-black uppercase transition-all ${votedIds.has(task.id) ? 'bg-[#ff7eb6] text-white' : 'bg-black/5 text-[#1a1a1a]/50 hover:bg-black/10'}`}>
                      <Heart size={14} className={votedIds.has(task.id) ? 'fill-white' : ''} strokeWidth={3} />
                      <span className="tabular-nums">{task.votes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {renderModals()}
    </div>
  );
}
