import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { EventItem, LinkItem } from '../types';
import {
    Plus,
    Trash2,
    GripVertical,
    ExternalLink,
    MapPin,
    Calendar as CalendarIcon,
    Clock,
    Tag,
    ChevronDown,
    ChevronRight,
    PlusCircle,
    AlertCircle,
    X,
    Pencil
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { useTranslation } from 'react-i18next';


interface AgendaEditorProps {
    link: LinkItem;
    onEventsChange: (events: EventItem[]) => void;
}

// Sub-component for each event row to handle drag controls
interface EventItemRowProps {
    event: EventItem;
    onEdit: (event: EventItem) => void;
    setDeletingEventId: (id: string | null) => void;
    deletingEventId: string | null;
    removeEvent: (id: string) => void;
    t: any;
    i18n: any;
}

function EventItemRow({ event, onEdit, setDeletingEventId, deletingEventId, removeEvent, t, i18n }: EventItemRowProps) {
    const dragControls = useDragControls();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = date.toLocaleString(i18n.language || 'pt-BR', { month: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', '');
        return { day, month };
    };

    const { day, month } = formatDate(event.date);

    return (
        <Reorder.Item
            value={event}
            dragListener={false}
            dragControls={dragControls}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileDrag={{
                zIndex: 50
            }}
            className="relative bg-white border-2 border-[#1a1a1a] shadow-[0_4px_0_0_#1a1a1a] flex flex-col select-none touch-none overflow-hidden"
        >
            <div className="flex items-stretch min-h-[70px] bg-white group">
                <div
                    className="w-10 flex items-center justify-center cursor-move text-black/20 hover:text-black hover:bg-[#ffdf00]/5 border-r border-[#1a1a1a]/10 transition-colors touch-none"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        dragControls.start(e);
                    }}
                >
                    <GripVertical size={18} strokeWidth={3} />
                </div>

                {/* Date Summary */}
                <div className="w-16 flex flex-col items-center justify-center border-r border-[#1a1a1a]/10 bg-slate-50/50">
                    <span className="text-[9px] font-black text-black/40 uppercase leading-none mb-0.5">{month}</span>
                    <span className="text-xl font-black text-black leading-none">{day}</span>
                </div>

                <div className="flex-1 p-3 flex items-center justify-between min-w-0" onClick={() => onEdit(event)}>
                    <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-[11px] font-black text-black uppercase tracking-tight truncate mb-0.5">{event.title}</h4>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-black/40 uppercase tracking-widest truncate">
                            {event.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={10} strokeWidth={3} />
                                    {event.location}
                                </span>
                            )}
                            {event.time && (
                                <span className="flex items-center gap-1">
                                    <Clock size={10} strokeWidth={3} />
                                    {event.time}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                            className="p-2 bg-white text-black border-2 border-[#1a1a1a] hover:bg-[#ffdf00] shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[1px] active:shadow-none transition-all"
                        >
                            <Pencil size={14} strokeWidth={3} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setDeletingEventId(event.id!); }}
                            className="p-2 bg-white text-black border-2 border-[#1a1a1a] hover:text-white hover:bg-red-500 shadow-[0_2px_0_0_#1a1a1a] active:translate-y-[1px] active:shadow-none transition-all"
                        >
                            <Trash2 size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Deletion Confirm Inline */}
            <AnimatePresence>
                {deletingEventId === event.id && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 border-t-2 border-[#1a1a1a] overflow-hidden"
                    >
                        <div className="p-4 flex items-center justify-between gap-4">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-red-600">{t('links.deleteConfirm') || 'Excluir este evento?'}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setDeletingEventId(null)} className="px-3 py-1.5 bg-white text-black border-2 border-[#1a1a1a] text-[8px] font-bold uppercase shadow-[0_2px_0_0_#1a1a1a]">{t('common.no') || 'Não'}</button>
                                <button onClick={() => removeEvent(event.id!)} className="px-3 py-1.5 bg-red-600 text-white border-2 border-[#1a1a1a] text-[8px] font-bold uppercase shadow-[0_2px_0_0_#1a1a1a]">{t('common.yes') || 'Sim, Excluir'}</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Reorder.Item>
    );
}

export default function AgendaEditor({ link, onEventsChange }: AgendaEditorProps) {
    const { t, i18n } = useTranslation();
    const events = link.events || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

    const handleReorder = (newOrder: EventItem[]) => {
        const updatedEvents = newOrder.map((e, index) => ({
            ...e,
            position: index
        }));
        onEventsChange(updatedEvents);
    };

    const handleOpenAddModal = () => {
        setEditingEvent({
            status: 'Tickets',
            date: new Date().toISOString()
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (event: EventItem) => {
        setEditingEvent({ ...event });
        setIsModalOpen(true);
    };

    const handleSaveEvent = () => {
        if (!editingEvent?.title || !editingEvent?.date) return;

        if (editingEvent.id) {
            // Edit existing
            onEventsChange(events.map(e => e.id === editingEvent.id ? (editingEvent as EventItem) : e));
        } else {
            // Add new
            const newEvent: EventItem = {
                id: crypto.randomUUID(),
                clientId: crypto.randomUUID(),
                userId: '',
                collectionId: link.id,
                title: editingEvent.title as string,
                date: editingEvent.date as string,
                time: editingEvent.time,
                location: editingEvent.location || '',
                url: editingEvent.url || '',
                status: editingEvent.status || 'Tickets',
                position: events.length,
                scheduleStart: editingEvent.scheduleStart,
                scheduleEnd: editingEvent.scheduleEnd
            };
            onEventsChange([...events, newEvent]);
        }

        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const removeEvent = (id: string) => {
        onEventsChange(events.filter(e => e.id !== id));
        setDeletingEventId(null);
    };

    return (
        <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] pb-2.5">
                <div className="flex items-center gap-2.5">
                    <CalendarIcon size={18} strokeWidth={3} className="text-black" />
                    <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-black">{t('agenda.title') || 'Lista de Eventos / Agenda'}</h2>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-black text-[#97cd7a] hover:bg-[#ffdf00] hover:text-white border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none text-[9px] font-medium uppercase tracking-widest transition-all"
                >
                    <Plus size={16} strokeWidth={3} />
                    <span className="hidden sm:inline">{t('agenda.newEvent') || 'Novo Evento'}</span>
                </button>
            </div>

            <div className="space-y-3">
                {events.length === 0 && (
                    <div className="text-center py-10 bg-white border-2 border-dashed border-[#1a1a1a]">
                        <p className="text-[10px] text-black/50 uppercase tracking-widest">{t('agenda.noEvents') || 'Nenhum evento adicionado ainda.'}</p>
                    </div>
                )}

                <Reorder.Group
                    axis="y"
                    values={events}
                    onReorder={handleReorder}
                    className="space-y-3"
                >
                    {events.map((event) => (
                        <EventItemRow
                            key={event.id}
                            event={event}
                            onEdit={handleOpenEditModal}
                            setDeletingEventId={setDeletingEventId}
                            deletingEventId={deletingEventId}
                            removeEvent={removeEvent}
                            t={t}
                            i18n={i18n}
                        />
                    ))}
                </Reorder.Group>
            </div>

            {/* Event Form Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence shadow-none>
                    {isModalOpen && editingEvent && (
                        <div className="fixed inset-0 z-[20000] flex items-end justify-center p-0 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                className="relative w-full max-w-2xl bg-white border-t-2 border-x-2 border-[#1a1a1a] rounded-t-[32px] overflow-hidden flex flex-col max-h-[92vh] pb-safe pointer-events-auto shadow-[0_-8px_0_0_#1a1a1a]"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-8 pt-10 pb-6 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-[#97cd7a] border-2 border-[#1a1a1a] shadow-[0_2px_0_0_#1a1a1a] rounded-full"></div>
                                        <h2 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight leading-none group">
                                            {editingEvent.id ? t('agenda.editEvent') || 'Editar Evento' : t('agenda.addEvent') || 'Novo Evento'}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center text-black bg-white border-2 border-black transition-all active:translate-y-[2px] active:shadow-none shadow-[0_4px_0_0_#1a1a1a] rounded-md"
                                    >
                                        <X size={20} strokeWidth={4} />
                                    </button>
                                </div>

                                {/* Form Content */}
                                <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/40 px-1">{t('agenda.titleLabel') || 'Título do Evento'}</label>
                                            <input
                                                type="text"
                                                placeholder={t('agenda.titlePlaceholder') || 'Ex: Show em São Paulo'}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-[#1a1a1a] text-xs font-bold uppercase tracking-widest outline-none focus:bg-white focus:shadow-[0_4px_0_0_#1a1a1a] transition-all rounded-md"
                                                value={editingEvent.title || ''}
                                                onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/40 px-1">{t('agenda.urlLabel') || 'Link de Ingressos/Mais Info'}</label>
                                            <div className="flex items-center bg-slate-50 border-2 border-[#1a1a1a] px-5 focus-within:bg-white focus-within:shadow-[0_4px_0_0_#1a1a1a] transition-all rounded-md overflow-hidden">
                                                <ExternalLink size={18} strokeWidth={3} className="text-[#1a1a1a] mr-3 shrink-0" />
                                                <input
                                                    type="url"
                                                    placeholder="https://..."
                                                    className="w-full bg-transparent py-4 text-xs font-bold tracking-widest text-[#1a1a1a] outline-none truncate"
                                                    value={editingEvent.url || ''}
                                                    onChange={e => setEditingEvent({ ...editingEvent, url: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/40 px-1">{t('agenda.dateLabel') || 'Data'}</label>
                                            <div className="flex items-center bg-slate-50 border-2 border-[#1a1a1a] px-5 focus-within:bg-white focus-within:shadow-[0_4px_0_0_#1a1a1a] transition-all rounded-md">
                                                <CalendarIcon size={18} strokeWidth={3} className="text-[#1a1a1a] mr-3 shrink-0" />
                                                <input
                                                    type="date"
                                                    className="w-full bg-transparent py-4 text-xs font-bold uppercase tracking-widest text-[#1a1a1a] outline-none"
                                                    value={editingEvent.date ? new Date(editingEvent.date).toISOString().slice(0, 10) : ''}
                                                    onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/40 px-1">{t('agenda.timeLabel') || 'Horário (Opcional)'}</label>
                                            <div className="flex items-center bg-slate-50 border-2 border-[#1a1a1a] px-5 focus-within:bg-white focus-within:shadow-[0_4px_0_0_#1a1a1a] transition-all rounded-md">
                                                <Clock size={18} strokeWidth={3} className="text-[#1a1a1a] mr-3 shrink-0" />
                                                <input
                                                    type="time"
                                                    className="w-full bg-transparent py-4 text-xs font-bold uppercase tracking-widest text-[#1a1a1a] outline-none"
                                                    value={editingEvent.time || ''}
                                                    onChange={e => setEditingEvent({ ...editingEvent, time: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/40 px-1">{t('agenda.locationLabel') || 'Localização'}</label>
                                            <div className="flex items-center bg-slate-50 border-2 border-[#1a1a1a] px-5 focus-within:bg-white focus-within:shadow-[0_4px_0_0_#1a1a1a] transition-all rounded-md">
                                                <MapPin size={18} strokeWidth={3} className="text-[#1a1a1a] mr-3 shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder={t('agenda.locationPlaceholder') || 'Ex: Allianz Parque, SP'}
                                                    className="w-full bg-transparent py-4 text-xs font-bold uppercase tracking-widest text-[#1a1a1a] outline-none"
                                                    value={editingEvent.location || ''}
                                                    onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/40 px-1">{t('agenda.statusLabel') || 'Status do Botão'}</label>
                                            <div className="flex items-center bg-slate-50 border-2 border-[#1a1a1a] px-5 focus-within:bg-white focus-within:shadow-[0_4px_0_0_#1a1a1a] transition-all rounded-md overflow-hidden">
                                                <Tag size={18} strokeWidth={3} className="text-[#1a1a1a] mr-3 shrink-0" />
                                                <select
                                                    className="w-full bg-transparent py-4 text-xs font-black uppercase tracking-widest text-[#1a1a1a] outline-none appearance-none"
                                                    value={editingEvent.status || 'Tickets'}
                                                    onChange={e => setEditingEvent({ ...editingEvent, status: e.target.value })}
                                                >
                                                    <option value="Tickets">{t('agenda.statusTickets') || 'Tickets'}</option>
                                                    <option value="Sold Out">{t('agenda.statusSoldOut') || 'Sold Out'}</option>
                                                    <option value="Free">{t('agenda.statusFree') || 'Grátis / Free'}</option>
                                                    <option value="RSVP">RSVP</option>
                                                    <option value="Buy">{t('agenda.statusBuy') || 'Comprar'}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PRO Scheduling Section */}
                                    <div className="pt-8 border-t-2 border-[#1a1a1a]/10 mt-4">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Clock size={20} strokeWidth={3} className="text-[#1a1a1a]" />
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">
                                                {t('links.schedule') || 'Agendar Exibição'} (PRO)
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 px-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!editingEvent.scheduleStart}
                                                        onChange={(e) => setEditingEvent({ ...editingEvent, scheduleStart: e.target.checked ? new Date().toISOString() : null })}
                                                        className="w-5 h-5 border-2 border-[#1a1a1a] rounded-sm appearance-none checked:bg-[#97cd7a] cursor-pointer"
                                                    />
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/60">{t('links.scheduleStart') || 'Início (Agendar)'}</label>
                                                </div>
                                                {editingEvent.scheduleStart && (
                                                    <input
                                                        type="datetime-local"
                                                        value={editingEvent.scheduleStart ? new Date(new Date(editingEvent.scheduleStart).getTime() - new Date(editingEvent.scheduleStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => setEditingEvent({ ...editingEvent, scheduleStart: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                                        className="w-full bg-slate-50 border-2 border-[#1a1a1a] p-4 text-xs font-bold uppercase tracking-widest text-[#1a1a1a] focus:bg-white rounded-md transition-all shadow-[0_4px_0_0_#1a1a1a]"
                                                    />
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 px-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!editingEvent.scheduleEnd}
                                                        onChange={(e) => setEditingEvent({ ...editingEvent, scheduleEnd: e.target.checked ? new Date(Date.now() + 86400000).toISOString() : null })}
                                                        className="w-5 h-5 border-2 border-[#1a1a1a] rounded-sm appearance-none checked:bg-red-400 cursor-pointer"
                                                    />
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/60">{t('links.scheduleEnd') || 'Fim (Expirar)'}</label>
                                                </div>
                                                {editingEvent.scheduleEnd && (
                                                    <input
                                                        type="datetime-local"
                                                        value={editingEvent.scheduleEnd ? new Date(new Date(editingEvent.scheduleEnd).getTime() - new Date(editingEvent.scheduleEnd).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => setEditingEvent({ ...editingEvent, scheduleEnd: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                                        className="w-full bg-slate-50 border-2 border-[#1a1a1a] p-4 text-xs font-bold uppercase tracking-widest text-[#1a1a1a] focus:bg-white rounded-md transition-all shadow-[0_4px_0_0_#1a1a1a]"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-8 border-t-2 border-[#1a1a1a]/10 shrink-0 bg-slate-50/30">
                                    <button
                                        onClick={handleSaveEvent}
                                        disabled={!editingEvent.title || !editingEvent.date}
                                        className="w-full py-5 bg-[#97cd7a] text-black border-2 border-black rounded-[18px] text-xs font-black uppercase tracking-[0.2em] shadow-[0_6px_0_0_#1a1a1a] active:translate-y-[2px] active:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Plus size={20} strokeWidth={4} />
                                        <span>{editingEvent.id ? t('agenda.saveEvent') || 'Atualizar Evento' : t('agenda.saveEvent') || 'Salvar Novo Evento'}</span>
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

