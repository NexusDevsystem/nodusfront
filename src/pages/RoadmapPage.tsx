import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { Heart, Plus, X, ArrowLeft, Loader2, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

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
  { id: 'backlog', label: 'Backlog', color: '#e0e0e0' },
  { id: 'planned', label: 'Faremos', color: '#fde68a' },
  { id: 'in_progress', label: 'Cozinhando', color: '#bfdbfe' },
  { id: 'done', label: 'Pronto', color: '#97cd7a' },
  { id: 'rejected', label: 'Não faremos', color: '#fee2e2' },
] as const;

export default function RoadmapPage() {
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('nodus_roadmap_votes') || '[]'));
    } catch { return new Set(); }
  });

  const [form, setForm] = useState({ title: '', description: '', author_name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fetchTasks = () => apiClient.getRoadmapTasks().then(setTasks);

  useEffect(() => {
    document.title = 'Lab — Nodus';
    fetchTasks().finally(() => setLoading(false));
  }, []);

  const handleVote = async (taskId: string) => {
    const isRemoving = votedIds.has(taskId);
    try {
      const newVoted = new Set(votedIds);
      if (isRemoving) newVoted.delete(taskId);
      else newVoted.add(taskId);

      setVotedIds(newVoted);
      localStorage.setItem('nodus_roadmap_votes', JSON.stringify(Array.from(newVoted)));

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, votes: Math.max(0, t.votes + (isRemoving ? -1 : 1)) } : t
      ));
      await apiClient.voteRoadmapTask(taskId, isRemoving ? 'down' : 'up');
    } catch (error) { fetchTasks(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title.trim().length < 3) {
      setSubmitError('O título deve ter pelo menos 3 caracteres.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const created = await apiClient.createRoadmapTask({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        author_name: form.author_name.trim() || undefined,
      });
      setTasks(prev => [created, ...prev]);
      setSubmitted(true);
      setForm({ title: '', description: '', author_name: '' });
      setTimeout(() => { setIsModalOpen(false); setSubmitted(false); }, 2000);
    } catch (err: any) { setSubmitError(err.message || 'Erro ao enviar.'); } finally { setSubmitting(false); }
  };

  const grouped = (status: string) => tasks.filter(t => t.status === status);

  return (
    <div className="min-h-screen bg-[#fdfcf0] text-[#1a1a1a] p-4 md:p-12 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 md:mb-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center justify-center w-12 h-12 border-2 border-[#1a1a1a] bg-white hover:bg-[#1a1a1a] hover:text-white transition-all shadow-[4px_4px_0_0_#1a1a1a] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0_0_#1a1a1a]"
          >
            <ArrowLeft size={22} strokeWidth={4} />
          </Link>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">Lab</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#97cd7a] border-2 border-[#1a1a1a] rounded-xl shadow-[0_4px_0_0_#1a1a1a] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all text-[#1a1a1a] w-fit font-black uppercase tracking-widest text-[11px]"
        >
          <FlaskConical size={18} strokeWidth={3} />
          Sugerir
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={40} className="animate-spin text-[#97cd7a]" strokeWidth={3} />
        </div>
      ) : (
        <div className="flex gap-4 md:gap-10 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className="w-[85vw] md:w-[350px] shrink-0 flex flex-col gap-6 snap-center snap-always"
              onDragOver={(e) => e.preventDefault()}
            >
              <div
                className="flex items-center justify-between px-6 py-4 border-2 border-[#1a1a1a] rounded-2xl shadow-[0_4px_0_0_#1a1a1a]"
                style={{ backgroundColor: col.color }}
              >
                <span className="text-[11px] md:text-[12px] font-black uppercase tracking-widest">{col.label}</span>
                <span className="text-[11px] md:text-[12px] font-black text-[#1a1a1a]/30">{grouped(col.id).length}</span>
              </div>

              <div className="flex flex-col gap-6">
                <AnimatePresence>
                  {grouped(col.id).sort((a, b) => b.votes - a.votes).map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="bg-white border-2 border-[#1a1a1a] rounded-2xl shadow-[0_5px_0_0_#1a1a1a] p-6 flex flex-col gap-4 group select-none"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-sm md:text-base font-black uppercase leading-tight break-words">{task.title}</h3>
                      </div>
                      {task.description && <p className="text-[11px] md:text-[12px] text-[#1a1a1a]/60 font-medium leading-relaxed">{task.description}</p>}
                      <div className="flex items-center justify-between pt-4 border-t-2 border-[#1a1a1a]/5 mt-auto">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-[#1a1a1a]/20 uppercase">{new Date(task.created_at).toLocaleDateString()}</span>
                          {task.author_name && <span className="text-[9px] font-bold text-[#1a1a1a]/30 uppercase truncate max-w-[120px]">por {task.author_name}</span>}
                        </div>
                        <button
                          onClick={() => handleVote(task.id)}
                          className={`flex items-center gap-2 px-4 py-2 border-2 border-[#1a1a1a] rounded-xl text-[11px] font-black uppercase transition-all ${votedIds.has(task.id) ? 'bg-[#ff7eb6] text-white' : 'bg-white text-[#1a1a1a]'}`}
                        >
                          <Heart size={16} strokeWidth={4} className={votedIds.has(task.id) ? 'fill-white' : ''} />
                          <span className="tabular-nums">{task.votes}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full md:max-w-xl bg-white border-t-4 md:border-4 border-[#1a1a1a] p-8 md:p-12 shadow-none md:shadow-[0_12px_0_0_#1a1a1a] md:rounded-3xl pointer-events-auto">
              {submitted ? (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="w-20 h-20 bg-[#97cd7a] border-4 border-[#1a1a1a] flex items-center justify-center mb-8 shadow-[0_6px_0_0_#1a1a1a]">
                    <Heart size={40} strokeWidth={4} fill="#1a1a1a" />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic">Ideia enviada!</h2>
                  <p className="text-sm font-black text-[#1a1a1a]/40 uppercase tracking-widest mt-4">Obrigado por ajudar o Nodus.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl md:text-4xl font-black uppercase italic flex items-center gap-4"><FlaskConical size={36} strokeWidth={4} /> Sugerir</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:rotate-90 transition-all"><X size={32} strokeWidth={4} /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/40 mb-3">Título *</label>
                      <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Sua ideia..." maxLength={150} className="w-full px-6 py-5 border-4 border-[#1a1a1a] bg-white text-base font-black focus:bg-[#fef08a] transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/40 mb-3">Detalhes</label>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} maxLength={500} className="w-full px-6 py-5 border-4 border-[#1a1a1a] bg-white text-base font-bold resize-none focus:bg-[#fef08a] transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/40 mb-3">Seu nome (opcional)</label>
                      <input type="text" value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} placeholder="Ex: @seuuser" maxLength={80} className="w-full px-6 py-5 border-4 border-[#1a1a1a] bg-white text-base font-black focus:bg-[#fef08a] transition-all" />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-5 bg-[#97cd7a] border-4 border-[#1a1a1a] shadow-[0_8px_0_0_#1a1a1a] text-sm font-black uppercase active:translate-y-2 active:shadow-none transition-all">
                      {submitting ? 'Enviando...' : 'Enviar para o Lab'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
