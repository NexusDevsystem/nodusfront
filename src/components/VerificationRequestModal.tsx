import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, XCircle, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { UserProfile } from '../types';

interface VerificationRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
}

type ModalState = 'form' | 'success' | 'pending' | 'rejected' | 'approved' | 'loading_status';

const CATEGORIES = [
    { value: 'creator', label: 'Criador de Conteúdo' },
    { value: 'brand', label: 'Negócios / Marca' },
    { value: 'music_art', label: 'Música / Arte' },
    { value: 'public_figure', label: 'Figura Pública' },
    { value: 'entertainment', label: 'Entretenimento' },
    { value: 'media_news', label: 'Mídia / Notícias' },
    { value: 'other', label: 'Outro' },
];

const VerificationRequestModal: React.FC<VerificationRequestModalProps> = ({ isOpen, onClose, profile }) => {
    const [modalState, setModalState] = useState<ModalState>('loading_status');
    const [existingRequest, setExistingRequest] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        nodus_link: `nodus.my/${profile.username || ''}`,
        display_name: profile.name || '',
        contact_email: '',
        category: '',
        social_link_1: '',
        social_link_2: '',
        social_link_3: '',
        has_verified_badge: false,
        press_link_1: '',
        press_link_2: '',
        press_link_3: '',
        declaration: false,
    });

    const loadStatus = useCallback(async () => {
        setModalState('loading_status');
        try {
            // Priority: if user is already verified via profile flag, show approved screen
            if (profile.isVerified) {
                setModalState('approved');
                return;
            }

            const existing = await apiClient.getMyVerificationRequest();
            if (!existing) {
                setModalState('form');
            } else {
                setExistingRequest(existing);
                if (existing.status === 'pending') setModalState('pending');
                else if (existing.status === 'approved') setModalState('approved');
                else if (existing.status === 'rejected') setModalState('rejected');
                else setModalState('form');
            }
        } catch {
            setModalState('form');
        }
    }, [onClose, profile.isVerified]);

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setStep(1);
        loadStatus();
    }, [isOpen, loadStatus]);

    const handleSubmit = async () => {
        if (!form.declaration) {
            setError('Confirme a Declaração de Veracidade para continuar.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            const result = await apiClient.submitVerificationRequest({
                nodus_link: form.nodus_link,
                display_name: form.display_name,
                contact_email: form.contact_email,
                category: form.category,
                social_link_1: form.social_link_1,
                social_link_2: form.social_link_2 || undefined,
                social_link_3: form.social_link_3 || undefined,
                has_verified_badge: form.has_verified_badge,
                press_link_1: form.press_link_1 || undefined,
                press_link_2: form.press_link_2 || undefined,
                press_link_3: form.press_link_3 || undefined,
            });
            setExistingRequest(result);
            setModalState('success');
            window.dispatchEvent(new CustomEvent('verification-request-submitted'));
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar solicitação.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canGoNext = () => {
        if (step === 1) return form.nodus_link && form.display_name && form.contact_email;
        if (step === 2) return form.category;
        if (step === 3) return form.social_link_1;
        if (step === 4) return true;
        if (step === 5) return form.declaration;
        return false;
    };

    if (!isOpen) return null;

    const content = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999999] flex items-end justify-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-white/40 backdrop-blur-md pointer-events-auto"
                />

                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative bg-white border-t-4 border-x-4 border-black w-full max-w-4xl max-h-[95vh] flex flex-col rounded-t-xl overflow-hidden z-10 pointer-events-auto"
                >
                    <div className="h-2 bg-[#ffdf00] shrink-0" />
                    <div className="px-8 pt-6 pb-4 border-b-2 border-black/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#ffdf00] border-2 border-black rounded-xl flex items-center justify-center shadow-[0_3px_0_0_#000]">
                                <ShieldCheck size={18} strokeWidth={3} className="text-black" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-black">Verificação</h2>
                                <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">Análise pela equipe Nodus</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded-lg group"
                        >
                            <X size={24} strokeWidth={4} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {modalState === 'approved' && (
                            <div className="flex flex-col items-center justify-center py-14 px-10 text-center gap-6">
                                <div className="w-20 h-20 bg-[#ffdf00] border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto shadow-[0_8px_0_0_#1a1a1a] animate-bounce">
                                    <ShieldCheck size={40} strokeWidth={3} className="text-black" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-black">Parabéns! 🎉</h3>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[#97cd7a]">Você agora é um Noders oficial</p>
                                </div>
                                <p className="text-[10px] font-bold text-black/40 uppercase max-w-xs mx-auto leading-relaxed">
                                    Seu perfil foi verificado com sucesso. O selo de autenticidade já está ativo no seu cabeçalho.
                                </p>
                                <button onClick={onClose} className="w-full py-4 bg-[#1a1a1a] text-[#97cd7a] border-2 border-[#1a1a1a] font-black uppercase tracking-[0.2em] text-[11px] rounded-lg shadow-[0_6px_0_0_#97cd7a] active:shadow-none active:translate-y-[2px] transition-all">
                                    Acessar meu Perfil Verificado
                                </button>
                            </div>
                        )}

                        {modalState === 'loading_status' && (
                            <div className="flex items-center justify-center py-24">
                                <div className="w-8 h-8 border-3 border-[#1a1a1a] border-t-transparent rounded-xl animate-spin" />
                            </div>
                        )}{modalState === 'success' && (
                            <div className="text-center py-10 space-y-6">
                                <div className="w-16 h-16 bg-[#97cd7a] border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto shadow-[0_4px_0_0_#1a1a1a]"><CheckCircle size={32} strokeWidth={3} /></div>
                                <h3 className="text-xl font-black uppercase">Solicitação Enviada!</h3>
                                <p className="text-[10px] uppercase font-bold text-black/40">Analisaremos em até 7 dias úteis.</p>
                                <button onClick={onClose} className="w-full py-3 bg-[#ffdf00] border-2 border-[#1a1a1a] font-black uppercase tracking-widest rounded-lg shadow-[0_4px_0_0_#1a1a1a]">Fechar</button>
                            </div>
                        )}

                        {modalState === 'pending' && (
                            <div className="text-center py-10 space-y-6">
                                <div className="w-16 h-16 bg-[#ffdf00] border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto shadow-[0_4px_0_0_#1a1a1a]"><Clock size={32} strokeWidth={3} /></div>
                                <h3 className="text-xl font-black uppercase">Em Análise</h3>
                                <p className="text-[10px] uppercase font-bold text-black/40">Sua solicitação está sendo processada.</p>
                                <button onClick={onClose} className="w-full py-3 bg-white border-2 border-[#1a1a1a] font-black uppercase tracking-widest rounded-lg shadow-[0_4px_0_0_#1a1a1a]">Fechar</button>
                            </div>
                        )}

                        {modalState === 'rejected' && (
                            <div className="text-center py-10 space-y-6">
                                <div className="w-16 h-16 bg-red-50 border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto shadow-[0_4px_0_0_#1a1a1a]"><XCircle size={32} strokeWidth={3} className="text-red-500" /></div>
                                <h3 className="text-xl font-black uppercase">Solicitação Reprovada</h3>
                                {existingRequest?.reason && <p className="p-4 bg-red-50 border-2 border-[#1a1a1a] rounded-xl text-[11px] font-bold">{existingRequest.reason}</p>}
                                <button onClick={() => setModalState('form')} className="w-full py-3 bg-[#ffdf00] border-2 border-[#1a1a1a] font-black uppercase tracking-widest rounded-lg shadow-[0_4px_0_0_#1a1a1a]">Solicitar Novamente</button>
                            </div>
                        )}

                        {modalState === 'form' && (
                            <div className="space-y-6">
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-black uppercase">Conta</h3>
                                        <input type="text" className="w-full p-4 border-2 border-black rounded-xl shadow-[0_4px_0_0_#1a1a1a]" placeholder="Link Nodus" value={form.nodus_link} onChange={e => setForm({...form, nodus_link: e.target.value})} />
                                        <input type="text" className="w-full p-4 border-black border-2 rounded-xl shadow-[0_4px_0_0_#1a1a1a]" placeholder="Nome de Exibição" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} />
                                        <input type="email" className="w-full p-4 border-black border-2 rounded-xl shadow-[0_4px_0_0_#1a1a1a]" placeholder="Email de Contato" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} />
                                    </div>
                                )}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-black uppercase">Categoria</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {CATEGORIES.map(cat => (
                                                <button key={cat.value} onClick={() => setForm({...form, category: cat.value})} className={`p-4 border-2 border-black rounded-lg text-left font-black uppercase text-[11px] transition-all shadow-[0_4px_0_0_#1a1a1a] ${form.category === cat.value ? 'bg-[#ffdf00] translate-y-[2px] shadow-none' : 'bg-white'}`}>{cat.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-black uppercase">Presença Digital</h3>
                                        <input type="url" className="w-full p-4 border-2 border-black rounded-xl shadow-[0_4px_0_0_#1a1a1a]" placeholder="Perfil 1 (Obrigatório)" value={form.social_link_1} onChange={e => setForm({...form, social_link_1: e.target.value})} />
                                        <div className="flex items-center gap-2 p-3 bg-[#fdfcf0] border-2 border-black rounded-xl">
                                            <AlertCircle size={14} /><span className="text-[10px] font-bold uppercase">Mínimo 1 link oficial</span>
                                        </div>
                                    </div>
                                )}{step >= 4 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-black uppercase">{step === 4 ? 'Relevância' : 'Termo'}</h3>
                                        {step === 4 ? (
                                            <input type="url" className="w-full p-4 border-2 border-black rounded-xl shadow-[0_4px_0_0_#1a1a1a]" placeholder="Link de Imprensa (Opcional)" value={form.press_link_1} onChange={e => setForm({...form, press_link_1: e.target.value})} />
                                        ) : (
                                            <button onClick={() => setForm({...form, declaration: !form.declaration})} className={`w-full p-6 border-2 border-black rounded-lg flex gap-4 items-center shadow-[0_4px_0_0_#1a1a1a] ${form.declaration ? 'bg-[#97cd7a]/20 border-[#97cd7a]' : 'bg-white'}`}>
                                                <div className={`w-6 h-6 border-2 border-black rounded-xl flex items-center justify-center ${form.declaration ? 'bg-[#97cd7a]' : 'bg-white'}`}>{form.declaration && <CheckCircle size={14}/>}</div>
                                                <span className="text-[10px] font-black uppercase">Declaro que os dados são verídicos</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {modalState === 'form' && (
                        <div className="px-8 py-6 border-t-2 border-black/5 flex gap-3">
                            <button onClick={() => step === 1 ? onClose() : setStep(s => s - 1)} className="px-6 py-3 border-2 border-black rounded-lg font-black uppercase tracking-widest text-[11px] shadow-[0_4px_0_0_#1a1a1a]">Voltar</button>
                            <button onClick={() => step === 5 ? handleSubmit() : setStep(s => s + 1)} disabled={!canGoNext() || isSubmitting} className="flex-1 py-3 bg-[#ffdf00] border-2 border-black rounded-lg font-black uppercase tracking-widest text-[11px] shadow-[0_4px_0_0_#1a1a1a] disabled:opacity-40">{step === 5 ? (isSubmitting ? 'Enviando...' : 'Enviar') : 'Próximo'}</button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};

export default VerificationRequestModal;
