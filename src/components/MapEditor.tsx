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
            <div className="p-4 border-[1.5px] border-black bg-[#f1f1f1] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex gap-3">
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
                        className="w-full font-medium text-sm text-black bg-white border border-black px-3 py-2.5 outline-none focus:bg-white transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/30"
                        placeholder={t('mapEditor.locationInputPlaceholder', 'Ex: Main Store')}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('mapEditor.fullAddress', 'Full Address')}</label>
                    <div className="flex items-start bg-white border border-black focus-within:bg-white transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        <div className="p-3 shrink-0">
                            <MapPin size={16} strokeWidth={2.5} className="text-black" />
                        </div>
                        <textarea
                            rows={2}
                            value={link.url}
                            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                            className="w-full bg-transparent py-3 pr-3 text-xs font-medium text-black outline-none placeholder:text-black/30 resize-none"
                            placeholder={t('mapEditor.addressPlaceholder', '123 Example Street, Neighborhood, City - State')}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('mapEditor.instructions', 'Description / Instructions (Optional)')}</label>
                    <input
                        type="text"
                        value={link.subtitle || ''}
                        onChange={(e) => updateLink(link.id, 'subtitle', e.target.value)}
                        className="w-full font-normal text-xs text-black bg-white border border-black px-3 py-2.5 outline-none focus:bg-white transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/30"
                        placeholder={t('mapEditor.instructionsPlaceholder', 'Ex: Landmark, across the park')}
                    />
                </div>

                {/* Map Preview */}
                {link.url && (
                    <div className="mt-4 space-y-2">
                        <label className="text-[9px] font-medium text-black uppercase tracking-[0.2em] px-1">{t('mapEditor.mapPreview', 'Map Preview')}</label>
                        <div className="w-full aspect-video border-2 border-black bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://www.google.com/maps?q=${encodeURIComponent(link.url)}&output=embed`}
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
