import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '../../types';
import { FONTS } from '../../constants';
import { Type, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Tooltip from '../Tooltip';

interface TypographyEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    updateProfile?: (updates: Partial<UserProfile>) => void;
}

const TypographyEditor: React.FC<TypographyEditorProps> = ({ profile, onChange, updateProfile }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-5 animate-fade-in pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {/* Advanced Controls */}
                <div className="bg-white p-4 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] h-full rounded-3xl">
                    <div className="flex items-center gap-2 mb-4 text-black border-b border-[#1a1a1a] pb-2">
                        <Zap size={16} strokeWidth={3} />
                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.fineAdjustments')}</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Font Sizes - Title & Subtitle */}
                        <div className="space-y-4">
                            {/* Main Title / Links Size */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-medium text-black uppercase tracking-widest">{t('design.titleFontSize', 'Title Font Size')}</span>
                                    <span className="text-[10px] font-medium text-black bg-[#97cd7a] px-2 py-1 border border-[#1a1a1a] uppercase shadow-[1.5px_1.5px_0px_0px_rgba(26,26,26,1)] rounded-lg">
                                        {profile.fontSize || 16}PX
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="12"
                                    max="32"
                                    step="1"
                                    value={profile.fontSize || 16}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (updateProfile) updateProfile({ fontSize: val });
                                        else onChange({ ...profile, fontSize: val });
                                    }}
                                    className="w-full h-1.5 bg-white border border-[#1a1a1a] appearance-none cursor-pointer accent-[#1a1a1a]"
                                />
                                <div className="flex justify-between text-[8px] font-medium text-black/50 uppercase tracking-widest px-1">
                                    <span>12PX</span>
                                    <span>32PX</span>
                                </div>
                            </div>

                            {/* Subtitle / Bio Size */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-medium text-black uppercase tracking-widest">{t('design.subtitleFontSize', 'Subtitle Font Size')}</span>
                                    <span className="text-[10px] font-medium text-black bg-[#97cd7a] px-2 py-1 border border-[#1a1a1a] uppercase shadow-[1.5px_1.5px_0px_0px_rgba(26,26,26,1)] rounded-lg">
                                        {profile.bioFontSize || 16}PX
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="12"
                                    max="32"
                                    step="1"
                                    value={profile.bioFontSize || 16}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (updateProfile) updateProfile({ bioFontSize: val });
                                        else onChange({ ...profile, bioFontSize: val });
                                    }}
                                    className="w-full h-1.5 bg-white border border-[#1a1a1a] appearance-none cursor-pointer accent-[#1a1a1a]"
                                />
                                <div className="flex justify-between text-[8px] font-medium text-black/50 uppercase tracking-widest px-1">
                                    <span>12PX</span>
                                    <span>32PX</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#1a1a1a] border-dashed">
                            {/* Font Weight */}
                            <div className="space-y-2">
                                <span className="text-[9px] font-medium text-black uppercase tracking-widest block px-1">{t('design.fontWeight')}</span>
                                <div className="flex bg-white border border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] overflow-hidden rounded-xl">
                                    {[
                                        { label: t('design.thin'), val: '100' },
                                        { label: t('design.regular'), val: '400' },
                                        { label: t('design.bold'), val: '700' },
                                        { label: t('design.black'), val: '900' }
                                    ].map((w, idx) => (
                                        <button
                                            key={w.val}
                                            onClick={() => {
                                                if (updateProfile) updateProfile({ fontWeight: w.val });
                                                else onChange({ ...profile, fontWeight: w.val });
                                            }}
                                            className={`flex-1 py-2 text-[10px] font-medium transition-all ${idx !== 0 ? 'border-l border-[#1a1a1a]' : ''} ${(profile.fontWeight || '400') === w.val
                                                ? 'bg-[#1a1a1a] text-[#97cd7a]'
                                                : 'bg-white text-black hover:bg-[#1a1a1a] hover:text-white'
                                                }`}
                                        >
                                            {w.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Style (Italic) */}
                            <div className="space-y-2">
                                <span className="text-[9px] font-medium text-black uppercase tracking-widest block px-1">{t('design.style')}</span>
                                <Tooltip text={profile.fontItalic ? t('design.disableItalic', 'Desativar Itálico') : t('design.enableItalic', 'Ativar Itálico')} position="top" className="w-full">
                                    <button
                                        onClick={() => {
                                            const val = !profile.fontItalic;
                                            if (updateProfile) updateProfile({ fontItalic: val });
                                            else onChange({ ...profile, fontItalic: val });
                                        }}
                                        className={`flex items-center justify-between px-3 py-2 border border-[#1a1a1a] transition-all w-full shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] rounded-xl ${profile.fontItalic
                                            ? 'bg-[#1a1a1a] text-[#97cd7a]'
                                            : 'bg-white text-black hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="text-[9px] font-medium uppercase tracking-widest">{t('design.italicText')}</span>
                                        <div className={`w-8 h-4 border border-[#1a1a1a] transition-colors relative rounded-full overflow-hidden ${profile.fontItalic ? 'bg-[#97cd7a]' : 'bg-white'}`}>
                                            <motion.div
                                                animate={{ x: profile.fontItalic ? 16 : 0 }}
                                                className="absolute top-0 bottom-0 left-0 w-3.5 h-full bg-[#1a1a1a] border-r border-[#1a1a1a]"
                                            />
                                        </div>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colors Section */}
                <div className="bg-white p-4 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] h-full rounded-3xl">
                    <div className="flex items-center gap-2 mb-4 text-black border-b border-[#1a1a1a] pb-2">
                        <div className="w-4 h-4 border border-[#1a1a1a] bg-[#97cd7a] shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]"></div>
                        <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.textColors')}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Header/Main Text Color */}
                        <div className="space-y-2">
                            <span className="text-[9px] font-medium text-black uppercase tracking-widest block px-1">{t('design.headersAndText')}</span>
                            <div className="flex items-center gap-2">
                                <div className="relative w-10 h-10 overflow-hidden border border-[#1a1a1a] shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] bg-white rounded-xl">
                                    <input
                                        type="color"
                                        value={profile.customTextColor || '#000000'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (updateProfile) updateProfile({ customTextColor: val });
                                            else onChange({ ...profile, customTextColor: val });
                                        }}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-none p-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={profile.customTextColor || ''}
                                    onChange={(e) => {
                                        const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                        if (updateProfile) updateProfile({ customTextColor: val });
                                        else onChange({ ...profile, customTextColor: val });
                                    }}
                                    placeholder="#000000"
                                    className="flex-1 h-10 px-3 border border-[#1a1a1a] bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[11px] font-medium uppercase text-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] tracking-widest rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Collection Title Color */}
                        <div className="space-y-2">
                            <span className="text-[9px] font-medium text-black uppercase tracking-widest block px-1">{t('design.collectionTitle')}</span>
                            <div className="flex items-center gap-2">
                                <div className="relative w-10 h-10 overflow-hidden border border-[#1a1a1a] shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] bg-white rounded-xl">
                                    <input
                                        type="color"
                                        value={profile.customCollectionTextColor || profile.customTextColor || '#000000'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (updateProfile) updateProfile({ customCollectionTextColor: val });
                                            else onChange({ ...profile, customCollectionTextColor: val });
                                        }}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-none p-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={profile.customCollectionTextColor || ''}
                                    onChange={(e) => {
                                        const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                        if (updateProfile) updateProfile({ customCollectionTextColor: val });
                                        else onChange({ ...profile, customCollectionTextColor: val });
                                    }}
                                    placeholder={profile.customTextColor || "#000000"}
                                    className="flex-1 h-10 px-3 border border-[#1a1a1a] bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[11px] font-medium uppercase text-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] tracking-widest rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Button Text Color */}
                        <div className="space-y-2">
                            <span className="text-[9px] font-medium text-black uppercase tracking-widest block px-1">{t('design.buttonText')}</span>
                            <div className="flex items-center gap-2">
                                <div className="relative w-10 h-10 overflow-hidden border border-[#1a1a1a] shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] bg-white rounded-xl">
                                    <input
                                        type="color"
                                        value={profile.customButtonTextColor || '#ffffff'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (updateProfile) updateProfile({ customButtonTextColor: val });
                                            else onChange({ ...profile, customButtonTextColor: val });
                                        }}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-none p-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={profile.customButtonTextColor || ''}
                                    onChange={(e) => {
                                        const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                        if (updateProfile) updateProfile({ customButtonTextColor: val });
                                        else onChange({ ...profile, customButtonTextColor: val });
                                    }}
                                    placeholder="#FFFFFF"
                                    className="flex-1 h-10 px-3 border border-[#1a1a1a] bg-white focus:bg-[#f1f1f1] outline-none transition-all text-[11px] font-medium uppercase text-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] tracking-widest rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Font Library */}
            <div className="bg-white p-4 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] mt-2 rounded-3xl">
                <div className="flex items-center gap-2 mb-4 text-black border-b border-[#1a1a1a] pb-2">
                    <Type size={16} strokeWidth={3} />
                    <h3 className="text-xs font-medium uppercase tracking-widest text-black">{t('design.fontLibrary')}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FONTS.map((font) => {
                        const isSelected = profile.fontFamily === font.family;
                        const isProForFree = font.isPro && (!profile.planType || profile.planType === 'free');

                        return (
                            <button
                                key={font.name}
                                onClick={() => {
                                    if (updateProfile) updateProfile({ fontFamily: font.family });
                                    else onChange({ ...profile, fontFamily: font.family });
                                }}
                                className={`flex items-center justify-between p-2.5 border-2 transition-all text-left relative group rounded-2xl ${isSelected
                                    ? 'border-[#1a1a1a] bg-[#97cd7a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'
                                    : 'border-[#1a1a1a] bg-white hover:bg-[#1a1a1a] hover:text-[#97cd7a] shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div
                                        className={`w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center font-medium shrink-0 transition-colors rounded-xl ${isSelected ? 'bg-white text-black' : 'bg-white text-black group-hover:bg-[#1a1a1a] group-hover:text-white'}`}
                                        style={{
                                            fontFamily: font.family,
                                            fontWeight: profile.fontWeight || '400',
                                            fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Aa
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span
                                                className={`text-[11px] font-medium uppercase tracking-widest truncate transition-colors ${isSelected ? 'text-black' : 'text-black group-hover:text-[#ffdf00]'}`}
                                                style={{
                                                    fontFamily: font.family,
                                                }}
                                            >
                                                {font.name}
                                            </span>
                                            {font.isPro && (
                                                <div className="flex items-center gap-1">
                                                    {isProForFree && isSelected && (
                                                        <span className="text-[6px] font-black bg-[#1a1a1a] text-[#ffdf00] px-1 py-0.5 border border-[#1a1a1a] uppercase tracking-widest animate-pulse">
                                                            Preview
                                                        </span>
                                                    )}
                                                    <Zap size={10} className="text-[#ffdf00] fill-[#ffdf00] shrink-0" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[8px] font-normal uppercase tracking-widest block transition-colors ${isSelected ? 'text-black/50' : 'text-black/40 group-hover:text-white/60'}`}>{font.type}</span>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="w-5 h-5 border border-[#1a1a1a] bg-[#1a1a1a] flex items-center justify-center shrink-0 ml-2 rounded-lg">
                                        <Check size={12} className="text-[#97cd7a]" strokeWidth={4} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div >
    );
};

export default TypographyEditor;
