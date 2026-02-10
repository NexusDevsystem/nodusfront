import React from 'react';
import { UserProfile } from '../../types';
import { Palette, Trash2, Droplets } from 'lucide-react';

interface ColorsEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

const ColorsEditor: React.FC<ColorsEditorProps> = ({ profile, onChange }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                        <Palette size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Cores Personalizadas</h3>
                        <p className="text-xs text-slate-400">Sobrescrevem as cores do tema</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Font Color */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Cor da Fonte</label>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
                                <input
                                    type="color"
                                    value={profile.customTextColor || '#000000'}
                                    onChange={(e) => onChange({ ...profile, customTextColor: e.target.value })}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={profile.customTextColor || ''}
                                    onChange={(e) => onChange({ ...profile, customTextColor: e.target.value })}
                                    placeholder="#000000"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-brand-500 outline-none uppercase"
                                />
                            </div>
                            {(profile.customTextColor) && (
                                <button
                                    onClick={() => onChange({ ...profile, customTextColor: null })}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                    title="Remover cor personalizada"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* Button Color */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Cor dos Botões</label>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
                                <input
                                    type="color"
                                    value={profile.customButtonColor || '#ffffff'}
                                    onChange={(e) => onChange({ ...profile, customButtonColor: e.target.value })}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={profile.customButtonColor || ''}
                                    onChange={(e) => onChange({ ...profile, customButtonColor: e.target.value })}
                                    placeholder="#ffffff"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-brand-500 outline-none uppercase"
                                />
                            </div>
                            {(profile.customButtonColor) && (
                                <button
                                    onClick={() => onChange({ ...profile, customButtonColor: null })}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                    title="Remover cor personalizada"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Helper */}
            <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100 flex gap-3 text-brand-800 text-xs leading-relaxed">
                <Droplets size={16} className="shrink-0 mt-0.5" />
                <p>As cores personalizadas têm prioridade sobre as cores do tema selecionado.</p>
            </div>
        </div>
    );
};

export default ColorsEditor;
