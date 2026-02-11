import React from 'react';
import { UserProfile } from '../../types';
import { FONTS } from '../../constants';
import { Type, Zap } from 'lucide-react';

interface TypographyEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

const TypographyEditor: React.FC<TypographyEditorProps> = ({ profile, onChange }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                        <Type size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Tipografia</h3>
                        <p className="text-xs text-slate-400">Escolha a fonte do seu perfil</p>
                    </div>
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
                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group relative ${isSelected
                                    ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                    } ${isProLocked ? 'cursor-not-allowed grayscale-[0.5] opacity-80' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span
                                        className="bg-white w-10 h-10 rounded-lg border border-slate-100 flex items-center justify-center text-slate-700"
                                        style={{
                                            fontFamily: font.family,
                                            fontWeight: profile.fontWeight || '400',
                                            fontStyle: profile.fontItalic ? 'italic' : 'normal',
                                            fontSize: '18px'
                                        }}
                                    >
                                        Aa
                                    </span>
                                    <div>
                                        <span
                                            className="text-slate-800 block"
                                            style={{
                                                fontFamily: font.family,
                                                fontWeight: profile.fontWeight || '400',
                                                fontStyle: profile.fontItalic ? 'italic' : 'normal'
                                            }}
                                        >
                                            {font.name}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{font.type}</span>
                                    </div>
                                </div>

                                {isProLocked ? (
                                    <div className="bg-brand-600 text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <Zap size={8} fill="currentColor" />
                                        PRO
                                    </div>
                                ) : isSelected && (
                                    <div className="w-3 h-3 rounded-full bg-brand-600 shadow-sm ring-2 ring-white"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Advanced Controls */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                {/* Font Size */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                            <div className="p-1.5 bg-brand-50 rounded-md text-brand-600">
                                <Type size={16} />
                            </div>
                            <span className="text-sm">Tamanho da Fonte</span>
                        </div>
                        <span className="text-sm font-black text-brand-600 bg-brand-50/50 px-3 py-1 rounded-xl border border-brand-100">
                            {profile.fontSize || 16}px
                        </span>
                    </div>
                    <input
                        type="range"
                        min="12"
                        max="32"
                        step="1"
                        value={profile.fontSize || 16}
                        onChange={(e) => onChange({ ...profile, fontSize: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">
                        <span>Pequeno</span>
                        <span>Grande</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                    {/* Font Weight */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                            <div className="p-1.5 bg-brand-50 rounded-md text-brand-600 font-black">
                                B
                            </div>
                            <span className="text-sm">Peso (Negrito)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['100', '400', '700', '900'].map((weight) => (
                                <button
                                    key={weight}
                                    onClick={() => onChange({ ...profile, fontWeight: weight })}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${(profile.fontWeight || '400') === weight
                                        ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-200'
                                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    {weight === '100' ? 'Light' : weight === '400' ? 'Regular' : weight === '700' ? 'Bold' : 'Black'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Style (Italic) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                            <div className="p-1.5 bg-brand-50 rounded-md text-brand-600 italic font-serif">
                                I
                            </div>
                            <span className="text-sm">Estilo Itálico</span>
                        </div>
                        <button
                            onClick={() => onChange({ ...profile, fontItalic: !profile.fontItalic })}
                            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all font-black text-sm w-full sm:w-auto ${profile.fontItalic
                                ? 'border-brand-600 bg-brand-50/50 text-brand-600 shadow-sm'
                                : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${profile.fontItalic ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                                }`}>
                                {profile.fontItalic && (
                                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white stroke-white stroke-[4px]">
                                        <path d="M20 6L9 17L4 12" />
                                    </svg>
                                )}
                            </div>
                            <span>Texto em Itálico</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypographyEditor;
