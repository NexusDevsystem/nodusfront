import React, { useState } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Tooltip from './Tooltip';

interface AgendaEditorProps {
    link: LinkItem;
    onEventsChange: (events: EventItem[]) => void;
}

// Sub-component for each event row to handle drag controls
interface EventItemRowProps {
    event: EventItem;
    updateEvent: (id: string, field: keyof EventItem, value: any) => void;
    setDeletingEventId: (id: string | null) => void;
    deletingEventId: string | null;
    removeEvent: (id: string) => void;
    t: any;
}

function EventItemRow({ event, updateEvent, setDeletingEventId, deletingEventId, removeEvent, t }: EventItemRowProps) {
    const dragControls = useDragControls();

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
                scale: 1,
                boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
                zIndex: 50
            }}
            className="relative bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col select-none touch-none"
        >
            <div className="flex border-b border-black items-stretch min-h-[50px] bg-white">
                <div
                    className="w-8 md:w-10 flex items-center justify-center cursor-move text-black hover:bg-black hover:text-white border-r border-black transition-colors touch-none"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        dragControls.start(e);
                    }}
                >
                    <GripVertical size={18} strokeWidth={3} />
                </div>

                <div className="flex-1 p-3 md:p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.titleLabel') || 'Título'}</label>
                                <input
                                    type="text"
                                    value={event.title}
                                    onChange={(e) => updateEvent(event.id!, 'title', e.target.value)}
                                    className="w-full bg-white border-2 border-black py-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-black focus:bg-white outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                    placeholder={t('agenda.titlePlaceholder') || 'Ex: Show em São Paulo'}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.dateLabel') || 'Data'}</label>
                                <input
                                    type="date"
                                    value={event.date ? new Date(event.date).toISOString().slice(0, 10) : ''}
                                    onChange={(e) => updateEvent(event.id!, 'date', e.target.value)}
                                    className="w-full bg-white border-2 border-black py-1.5 px-3 text-[11px] font-medium uppercase tracking-widest text-black focus:bg-white outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.locationLabel') || 'Localização'}</label>
                                <input
                                    type="text"
                                    value={event.location}
                                    onChange={(e) => updateEvent(event.id!, 'location', e.target.value)}
                                    className="w-full bg-white border-2 border-black py-1.5 px-3 text-[11px] font-medium uppercase tracking-widest text-black focus:bg-white outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                    placeholder={t('agenda.locationPlaceholder') || 'Cidade, Local...'}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setDeletingEventId(event.id!)}
                                className="p-2 bg-white text-black border-2 border-black hover:text-white hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                            >
                                <Trash2 size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {/* Extended fields row */}
                    <div className="flex flex-col md:flex-row gap-4 border-t border-black/10 pt-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.urlLabel') || 'URL / Link'}</label>
                            <div className="flex items-center bg-white border-2 border-black px-3 focus-within:bg-white transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                <ExternalLink size={12} strokeWidth={3} className="text-black/40 mr-2" />
                                <input
                                    type="url"
                                    value={event.url}
                                    onChange={(e) => updateEvent(event.id!, 'url', e.target.value)}
                                    className="w-full bg-transparent py-2 text-[10px] font-normal tracking-widest text-black outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-32 space-y-1">
                            <label className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.timeLabel') || 'Horário'}</label>
                            <input
                                type="time"
                                value={event.time || ''}
                                onChange={(e) => updateEvent(event.id!, 'time', e.target.value)}
                                className="w-full bg-white border-2 border-black py-2 px-3 text-[10px] font-medium uppercase tracking-widest text-black focus:bg-white outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                            />
                        </div>

                        <div className="w-full md:w-40 space-y-1">
                            <label className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.statusLabel') || 'Status Botão'}</label>
                            <select
                                value={event.status}
                                onChange={(e) => updateEvent(event.id!, 'status', e.target.value)}
                                className="w-full bg-white border-2 border-black py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-black focus:bg-white outline-none transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] appearance-none"
                            >
                                <option value="Tickets">{t('agenda.statusTickets') || 'Tickets'}</option>
                                <option value="Sold Out">{t('agenda.statusSoldOut') || 'Sold Out'}</option>
                                <option value="Free">{t('agenda.statusFree') || 'Free'}</option>
                                <option value="RSVP">RSVP</option>
                                <option value="Buy">{t('agenda.statusBuy') || 'Buy'}</option>
                            </select>
                        </div>
                    </div>

                    {/* PRO Scheduling Section for Existing Event */}
                    <div className="pt-4 border-t border-black border-dashed">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={14} strokeWidth={3} className="text-black" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-black">
                                {t('links.schedule') || 'Agendar Exibição'} (PRO)
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 px-1">
                                    <input
                                        type="checkbox"
                                        checked={!!event.scheduleStart}
                                        onChange={(e) => updateEvent(event.id!, 'scheduleStart', e.target.checked ? new Date().toISOString() : null)}
                                        className="w-3 h-3 border-2 border-black rounded-none appearance-none checked:bg-[#97cd7a] cursor-pointer"
                                    />
                                    <label className="text-[8px] font-black uppercase tracking-widest text-black/60">{t('links.scheduleStart') || 'Início (Agendar)'}</label>
                                </div>
                                <input
                                    type="datetime-local"
                                    value={event.scheduleStart ? new Date(new Date(event.scheduleStart).getTime() - new Date(event.scheduleStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => updateEvent(event.id!, 'scheduleStart', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                    className="w-full bg-white border-2 border-black p-2 text-[10px] font-bold uppercase tracking-widest text-black focus:bg-white outline-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 px-1">
                                    <input
                                        type="checkbox"
                                        checked={!!event.scheduleEnd}
                                        onChange={(e) => updateEvent(event.id!, 'scheduleEnd', e.target.checked ? new Date(Date.now() + 86400000).toISOString() : null)}
                                        className="w-3 h-3 border-2 border-black rounded-none appearance-none checked:bg-red-400 cursor-pointer"
                                    />
                                    <label className="text-[8px] font-black uppercase tracking-widest text-black/60">{t('links.scheduleEnd') || 'Fim (Expirar)'}</label>
                                </div>
                                <input
                                    type="datetime-local"
                                    value={event.scheduleEnd ? new Date(new Date(event.scheduleEnd).getTime() - new Date(event.scheduleEnd).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => updateEvent(event.id!, 'scheduleEnd', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                    className="w-full bg-white border-2 border-black p-2 text-[10px] font-bold uppercase tracking-widest text-black focus:bg-white outline-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Deletion Confirm */}
                    <AnimatePresence>
                        {deletingEventId === event.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 border-t-2 border-black overflow-hidden -m-3 md:-m-4 mt-2"
                            >
                                <div className="p-4 flex items-center justify-between gap-4">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-600">{t('links.deleteConfirm') || 'Excluir este evento?'}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setDeletingEventId(null)} className="px-3 py-1.5 bg-white text-black border-2 border-black text-[8px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{t('common.no') || 'Não'}</button>
                                        <button onClick={() => removeEvent(event.id!)} className="px-3 py-1.5 bg-red-600 text-white border-2 border-black text-[8px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{t('common.yes') || 'Sim, Excluir'}</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Reorder.Item>
    );
}

export default function AgendaEditor({ link, onEventsChange }: AgendaEditorProps) {
    const { t } = useTranslation();
    const events = link.events || [];
    const [addingEvent, setAddingEvent] = useState(false);
    const [newEvent, setNewEvent] = useState<Partial<EventItem>>({
        status: 'Tickets'
    });
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

    const handleReorder = (newOrder: EventItem[]) => {
        // Update positions based on new order
        const updatedEvents = newOrder.map((e, index) => ({
            ...e,
            position: index
        }));
        onEventsChange(updatedEvents);
    };

    const handleAddEvent = () => {
        if (!newEvent.title || !newEvent.date) return;

        const event: EventItem = {
            id: crypto.randomUUID(),
            clientId: crypto.randomUUID(),
            userId: '', // Will be handled by backend or parent
            collectionId: link.id,
            title: newEvent.title as string,
            date: newEvent.date as string,
            time: newEvent.time,
            location: newEvent.location || '',
            url: newEvent.url || '',
            status: newEvent.status || 'Tickets',
            position: events.length,
            scheduleStart: newEvent.scheduleStart,
            scheduleEnd: newEvent.scheduleEnd
        };

        onEventsChange([...events, event]);
        setNewEvent({ status: 'Tickets' });
        setAddingEvent(false);
    };

    const updateEvent = (id: string, field: keyof EventItem, value: any) => {
        onEventsChange(events.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeEvent = (id: string) => {
        onEventsChange(events.filter(e => e.id !== id));
        setDeletingEventId(null);
    };

    const renderEventForm = () => (
        <div className="bg-white p-4 md:p-6 border-2 border-black border-dashed mt-4 animate-fade-in space-y-4 md:space-y-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-black border-b border-black/10 pb-3">
                <Plus size={18} strokeWidth={3} />
                <span>{t('agenda.addEvent') || 'Novo Evento'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.titleLabel') || 'Título do Evento'}</label>
                    <input
                        type="text"
                        placeholder={t('agenda.titlePlaceholder') || 'Ex: Show em São Paulo'}
                        className="w-full px-4 py-3 bg-white border-2 border-black text-xs font-medium uppercase tracking-widest outline-none focus:bg-white transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        value={newEvent.title || ''}
                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.urlLabel') || 'Link de Ingressos/Mais Info'}</label>
                    <div className="flex items-center bg-white border-2 border-black px-4 focus-within:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <ExternalLink size={14} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="url"
                            placeholder="https://..."
                            className="w-full bg-transparent py-3 text-xs font-normal tracking-widest text-black outline-none truncate"
                            value={newEvent.url || ''}
                            onChange={e => setNewEvent({ ...newEvent, url: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.dateLabel') || 'Data'}</label>
                    <div className="flex items-center bg-white border-2 border-black px-4 focus-within:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <CalendarIcon size={14} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="date"
                            className="w-full bg-transparent py-3 text-xs font-medium uppercase tracking-widest text-black outline-none"
                            value={newEvent.date ? new Date(newEvent.date).toISOString().slice(0, 10) : ''}
                            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.timeLabel') || 'Horário (Opcional)'}</label>
                    <div className="flex items-center bg-white border-2 border-black px-4 focus-within:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Clock size={14} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="time"
                            className="w-full bg-transparent py-3 text-xs font-medium uppercase tracking-widest text-black outline-none"
                            value={newEvent.time || ''}
                            onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.locationLabel') || 'Localização'}</label>
                    <div className="flex items-center bg-white border-2 border-black px-4 focus-within:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <MapPin size={14} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder={t('agenda.locationPlaceholder') || 'Ex: Allianz Parque, SP'}
                            className="w-full bg-transparent py-3 text-xs font-medium uppercase tracking-widest text-black outline-none"
                            value={newEvent.location || ''}
                            onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/70 block px-1">{t('agenda.statusLabel') || 'Status do Botão'}</label>
                    <div className="flex items-center bg-white border-2 border-black px-4 focus-within:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Tag size={14} strokeWidth={3} className="text-black mr-2 shrink-0" />
                        <select
                            className="w-full bg-transparent py-3 text-[10px] font-bold uppercase tracking-widest text-black outline-none appearance-none"
                            value={newEvent.status || 'Tickets'}
                            onChange={e => setNewEvent({ ...newEvent, status: e.target.value })}
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

            {/* PRO Scheduling Section for New Event */}
            <div className="pt-4 border-t border-black border-dashed mt-4">
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={14} strokeWidth={3} className="text-black" />
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-black">
                        {t('links.schedule') || 'Agendar Exibição'} (PRO)
                    </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-1">
                            <input
                                type="checkbox"
                                checked={!!newEvent.scheduleStart}
                                onChange={(e) => setNewEvent({ ...newEvent, scheduleStart: e.target.checked ? new Date().toISOString() : null })}
                                className="w-3 h-3 border-2 border-black rounded-none appearance-none checked:bg-[#97cd7a] cursor-pointer"
                            />
                            <label className="text-[8px] font-black uppercase tracking-widest text-black/60">{t('links.scheduleStart') || 'Início (Agendar)'}</label>
                        </div>
                        {newEvent.scheduleStart && (
                            <input
                                type="datetime-local"
                                value={newEvent.scheduleStart ? new Date(new Date(newEvent.scheduleStart).getTime() - new Date(newEvent.scheduleStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                onChange={(e) => setNewEvent({ ...newEvent, scheduleStart: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                className="w-full bg-white border-2 border-black p-2 text-[10px] font-bold uppercase tracking-widest text-black focus:bg-white outline-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-1">
                            <input
                                type="checkbox"
                                checked={!!newEvent.scheduleEnd}
                                onChange={(e) => setNewEvent({ ...newEvent, scheduleEnd: e.target.checked ? new Date(Date.now() + 86400000).toISOString() : null })}
                                className="w-3 h-3 border-2 border-black rounded-none appearance-none checked:bg-red-400 cursor-pointer"
                            />
                            <label className="text-[8px] font-black uppercase tracking-widest text-black/60">{t('links.scheduleEnd') || 'Fim (Expirar)'}</label>
                        </div>
                        {newEvent.scheduleEnd && (
                            <input
                                type="datetime-local"
                                value={newEvent.scheduleEnd ? new Date(new Date(newEvent.scheduleEnd).getTime() - new Date(newEvent.scheduleEnd).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                onChange={(e) => setNewEvent({ ...newEvent, scheduleEnd: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                className="w-full bg-white border-2 border-black p-2 text-[10px] font-bold uppercase tracking-widest text-black focus:bg-white outline-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-black/10">
                <button
                    onClick={() => { setAddingEvent(false); setNewEvent({ status: 'Tickets' }); }}
                    className="px-6 py-2.5 bg-white border-2 border-black text-[9px] font-medium uppercase tracking-widest text-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    {t('common.cancel')}
                </button>
                <button
                    onClick={handleAddEvent}
                    disabled={!newEvent.title || !newEvent.date}
                    className="px-6 py-2.5 bg-[#97cd7a] border-2 border-black text-black text-[9px] font-medium uppercase tracking-widest hover:bg-black hover:text-[#97cd7a] disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    {t('agenda.saveEvent') || 'Salvar Evento'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between gap-4 border-b border-black pb-2.5">
                <div className="flex items-center gap-2.5">
                    <CalendarIcon size={18} strokeWidth={3} className="text-black" />
                    <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-black">{t('agenda.title') || 'Lista de Eventos / Agenda'}</h2>
                </div>
                <button
                    onClick={() => setAddingEvent(true)}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-black text-[#97cd7a] hover:bg-black hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none text-[9px] font-medium uppercase tracking-widest transition-all"
                >
                    <Plus size={16} strokeWidth={3} />
                    <span className="hidden sm:inline">{t('agenda.newEvent') || 'Novo Evento'}</span>
                </button>
            </div>

            <div className="space-y-3">
                {events.length === 0 && !addingEvent && (
                    <div className="text-center py-10 bg-white border-2 border-dashed border-black">
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
                            updateEvent={updateEvent}
                            setDeletingEventId={setDeletingEventId}
                            deletingEventId={deletingEventId}
                            removeEvent={removeEvent}
                            t={t}
                        />
                    ))}
                </Reorder.Group>

                {addingEvent && renderEventForm()}
            </div>
        </div>
    );
}

