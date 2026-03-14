import React from 'react';
import { LinkItem } from '../types';
import { MapPin, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MapEditorProps {
    link: LinkItem;
    updateLink: (id: string, field: keyof LinkItem, value: any) => void;
}

export default function MapEditor({ link, updateLink }: MapEditorProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <div className="p-4 border-2 border-[#1a1a1a] bg-[#f1f1f1] shadow-[3px_3px_0px_0px_#1a1a1a] flex gap-3">
                <Info size={18} strokeWidth={2.5} className="text-black shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-[11px] text-black uppercase tracking-widest leading-none mb-1">
                        {t('mapEditor.addAddress', 'Add Your Address')}
                    </h4>
                    <p className="text-[10px] font-normal text-black/70 uppercase tracking-widest leading-tight">
                        {t('mapEditor.addressInstruction', 'Paste your business address. Nodus will create a card highlighting your location and directing customers to Google Maps.')}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('mapEditor.locationName', 'Location Name')}</label>
                    <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        className="w-full bg-white border-2 border-[#1a1a1a] px-4 py-3 text-sm font-bold uppercase tracking-tight text-black focus:bg-white outline-none transition-all shadow-[3px_3px_0px_0px_#1a1a1a] placeholder:text-black/30"
                        placeholder={t('mapEditor.locationInputPlaceholder', 'Ex: Main Store')}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/60 px-1">Endereço Completo</label>
                    <textarea
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        className="w-full bg-white border-2 border-[#1a1a1a] px-4 py-3 text-sm font-medium text-black focus:bg-white outline-none transition-all shadow-[3px_3px_0px_0px_#1a1a1a] resize-none"
                        placeholder="Rua Exemplo, 123 - São Paulo, SP"
                        rows={3}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('mapEditor.instructions', 'Description / Instructions (Optional)')}</label>
                    <input
                        type="text"
                        value={link.subtitle || ''}
                        onChange={(e) => updateLink(link.id, 'subtitle', e.target.value)}
                        className="w-full font-normal text-xs text-black bg-white border-2 border-[#1a1a1a] px-3 py-2.5 outline-none focus:bg-white transition-colors shadow-[3px_3px_0px_0px_#1a1a1a] placeholder:text-black/30"
                        placeholder={t('mapEditor.instructionsPlaceholder', 'Ex: Landmark, across the park')}
                    />
                </div>

                {/* Map Preview */}
                {link.url && (
                    <div className="space-y-3">
                        <div className="bg-[#fefcbf] border-2 border-[#1a1a1a] p-4 shadow-[3px_3px_0px_0px_#1a1a1a]">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-white border-2 border-[#1a1a1a] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1a1a1a]">
                                    <MapPin size={20} className="text-black" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-black uppercase tracking-tighter text-black truncate">{link.title || 'Sem título'}</h4>
                                    <p className="text-[10px] font-medium text-black/60 line-clamp-2 mt-0.5 leading-tight">{link.url || 'Nenhum endereço definido'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#97cd7a]/20 border-2 border-dashed border-[#1a1a1a]/30 p-4 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                                O mapa será renderizado automaticamente no seu perfil
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
