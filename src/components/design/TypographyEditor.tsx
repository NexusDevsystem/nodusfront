import React from 'react';
import { UserProfile } from '../../types';
import { FONTS } from '../../constants';
import { Type, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface TypographyEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

const TypographyEditor: React.FC<TypographyEditorProps> = ({ profile, onChange }) => {
    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                    <Type size={18} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Tipografia</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FONTS.map((font) => {
                        const isProLocked = font.isPro && (profile.planType === 'free' || !profile.planType);
                        const isSelected = profile.fontFamily === font.family;

                        return (
                            <button
                                key={font.name}
                                onClick={() => {
                                    if (isProLocked) return;
                                    onChange({ ...profile, fontFamily: font.family });
                                }}
                                className={`flex items-center justify-between p-4 rounded-md border transition-all text-left relative ${isSelected
                                    ? 'border-[#32a800] bg-slate-50'
                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                                    } ${isProLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span
                                        className="bg-white w-10 h-10 rounded border border-slate-100 flex items-center justify-center text-slate-700 font-medium"
                                        style={{
                                            fontFamily: font.family,
                                            fontWeight: profile.fontWeight || '400',
                                            fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                            fontSize: '16px'
                                        }}
                                    >
                                        Aa
                                    </span>
                                    <div>
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
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{font.type}</span>
                                    </div>
                                </div>

                                {isProLocked ? (
                                    <div className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Zap size={8} fill="currentColor" />
                                        PRO
                                    </div>
                                ) : isSelected && (
                                    <div className="w-4 h-4 rounded-full bg-[#32a800] flex items-center justify-center">
                                        <Check size={10} className="text-white" strokeWidth={4} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Advanced Controls */}
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
                            onChange={(e) => onChange({ ...profile, fontSize: parseInt(e.target.value) })}
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
                                        onClick={() => onChange({ ...profile, fontWeight: weight })}
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
                                onClick={() => onChange({ ...profile, fontItalic: !profile.fontItalic })}
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
        </div>
    );
};

export default TypographyEditor;
