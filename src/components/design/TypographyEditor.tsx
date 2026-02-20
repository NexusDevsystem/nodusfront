import React from 'react';
import { UserProfile } from '../../types';
import { FONTS } from '../../constants';
import { Type, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface TypographyEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
    updateProfile?: (updates: Partial<UserProfile>) => void;
}

const TypographyEditor: React.FC<TypographyEditorProps> = ({ profile, onChange, updateProfile }) => {
    return (
        <div className="space-y-6 animate-fade-in pb-10">

            {/* Advanced Controls (Moved to Top) */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-8 text-slate-500">
                    <Zap size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Ajustes Finos</h3>
                </div>

                <div className="space-y-10">
                    {/* Font Size */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tamanho da Fonte</span>
                            <span className="text-xs font-bold text-[#32a800] bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
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
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#32a800]"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase tracking-widest px-1">
                            <span>12px</span>
                            <span>32px</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                        {/* Font Weight */}
                        <div className="space-y-4">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Peso do Texto</span>
                            <div className="flex gap-1.5">
                                {['100', '400', '700', '900'].map((weight) => (
                                    <button
                                        key={weight}
                                        onClick={() => {
                                            if (updateProfile) updateProfile({ fontWeight: weight });
                                            else onChange({ ...profile, fontWeight: weight });
                                        }}
                                        className={`flex-1 py-2 rounded text-[10px] font-bold transition-all border ${(profile.fontWeight || '400') === weight
                                            ? 'bg-slate-50 border-[#32a800] text-[#32a800]'
                                            : 'bg-white border-slate-100 text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {weight === '100' ? 'LIGHT' : weight === '400' ? 'REGULAR' : weight === '700' ? 'BOLD' : 'BLACK'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Style (Italic) */}
                        <div className="space-y-4">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Estilo</span>
                            <button
                                onClick={() => {
                                    const val = !profile.fontItalic;
                                    if (updateProfile) updateProfile({ fontItalic: val });
                                    else onChange({ ...profile, fontItalic: val });
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-md border transition-all w-full ${profile.fontItalic
                                    ? 'border-[#32a800] bg-slate-50 text-[#32a800]'
                                    : 'border-slate-100 text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <span className="text-[11px] font-bold uppercase tracking-wide">Texto em Itálico</span>
                                <div className={`w-8 h-4 rounded-full transition-colors relative ${profile.fontItalic ? 'bg-[#32a800]' : 'bg-slate-200'}`}>
                                    <motion.div
                                        animate={{ x: profile.fontItalic ? 18 : 2 }}
                                        className="absolute top-0.5 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Colors (Moved Up) */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-8 text-slate-500">
                    <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-purple-500 to-pink-500"></div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Cores do Texto</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Header/Main Text Color */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cabeçalhos e Texto</span>
                            {profile.customTextColor && (
                                <button
                                    onClick={() => {
                                        if (updateProfile) updateProfile({ customTextColor: null });
                                        else onChange({ ...profile, customTextColor: null });
                                    }}
                                    className="text-[10px] text-red-500 font-bold uppercase hover:underline"
                                >
                                    Resetar
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                                <input
                                    type="color"
                                    value={profile.customTextColor || '#000000'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (updateProfile) updateProfile({ themeId: 'custom', customTextColor: val });
                                        else onChange({ ...profile, themeId: 'custom', customTextColor: val });
                                    }}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={profile.customTextColor || ''}
                                onChange={(e) => {
                                    const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                                    if (updateProfile) updateProfile({ themeId: 'custom', customTextColor: val });
                                    else onChange({ ...profile, themeId: 'custom', customTextColor: val });
                                }}
                                placeholder="#000000"
                                className="flex-1 h-12 px-4 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#32a800] outline-none transition-all text-sm font-mono uppercase font-bold"
                            />
                        </div>
                    </div>

                    {/* Button Text Color */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Texto do Botão</span>
                            {profile.customButtonTextColor && (
                                <button
                                    onClick={() => {
                                        if (updateProfile) updateProfile({ customButtonTextColor: null });
                                        else onChange({ ...profile, customButtonTextColor: null });
                                    }}
                                    className="text-[10px] text-red-500 font-bold uppercase hover:underline"
                                >
                                    Resetar
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                                <input
                                    type="color"
                                    value={profile.customButtonTextColor || '#ffffff'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (updateProfile) updateProfile({ customButtonTextColor: val });
                                        else onChange({ ...profile, customButtonTextColor: val });
                                    }}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
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
                                className="flex-1 h-12 px-4 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#32a800] outline-none transition-all text-sm font-mono uppercase font-bold"
                            />
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-6 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    * A <b>cor do texto no botão</b> agora é aplicada em todos os temas. Alterar a cor dos <b>cabeçalhos e textos principais</b> ainda ativará o modo <b>Custom</b> para garantir a visibilidade.
                </p>
            </div>

            {/* Font Library */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                    <Type size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Biblioteca de Fontes</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FONTS.map((font) => {
                        const isSelected = profile.fontFamily === font.family;
                        const isLocked = font.isPro && profile.planType === 'free';

                        return (
                            <button
                                key={font.name}
                                onClick={() => {
                                    if (isLocked) {
                                        (window as any).dispatchEvent(new CustomEvent('open-billing-modal'));
                                        return;
                                    }
                                    if (updateProfile) updateProfile({ fontFamily: font.family });
                                    else onChange({ ...profile, fontFamily: font.family });
                                }}
                                className={`flex items-center justify-between p-4 rounded-md border transition-all text-left relative ${isSelected
                                    ? 'border-[#32a800] bg-slate-50'
                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                                    } ${isLocked ? 'opacity-60 grayscale' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span
                                        className="bg-white w-10 h-10 rounded border border-slate-100 flex items-center justify-center text-slate-700 font-medium relative overflow-hidden"
                                        style={{
                                            fontFamily: font.family,
                                            fontWeight: profile.fontWeight || '400',
                                            fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                            fontSize: '16px'
                                        }}
                                    >
                                        Aa
                                        {isLocked && (
                                            <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center">
                                                <Zap size={14} className="text-slate-400 fill-slate-400" />
                                            </div>
                                        )}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-sm font-semibold text-slate-900 block"
                                                style={{
                                                    fontFamily: font.family,
                                                    fontWeight: profile.fontWeight || '400',
                                                    fontStyle: profile.fontItalic ? 'italic' : 'normal'
                                                }}
                                            >
                                                {font.name}
                                            </span>
                                            {font.isPro && (
                                                <span className="text-[9px] font-black uppercase tracking-wider bg-black/5 text-black/40 px-1.5 py-0.5 rounded">
                                                    PRO
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{font.type}</span>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="w-4 h-4 rounded-full bg-[#32a800] flex items-center justify-center">
                                        <Check size={10} className="text-white" strokeWidth={4} />
                                    </div>
                                )}

                                {isLocked && !isSelected && (
                                    <Zap size={14} className="text-slate-300 fill-slate-300" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TypographyEditor;
