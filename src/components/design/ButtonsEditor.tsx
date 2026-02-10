import React from 'react';
import { UserProfile } from '../../types';
import { MousePointer2, Trash2 } from 'lucide-react';
import { THEMES } from '../../constants';

interface ButtonsEditorProps {
    profile: UserProfile;
    onChange: (profile: UserProfile) => void;
}

const ButtonsEditor: React.FC<ButtonsEditorProps> = ({ profile, onChange }) => {

    const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
    const themeButtonColor = currentTheme.buttonHex || '#000000';
    const themeTextColor = currentTheme.textHex || '#000000'; // We might need this too

    // Default values
    const currentStyle = profile.buttonStyleType || 'solid';
    const currentRoundness = profile.buttonRoundness || (profile.buttonStyle === 'soft-rect' ? 'rounder' : 'full');

    const styles = [
        { id: 'solid', label: 'Sólido' },
        { id: 'glass', label: 'Vidro' },
        { id: 'outline', label: 'Contorno' }
    ] as const;

    const roundnessOptions = [
        { id: 'square', label: 'Quadrado', radius: '0px' },
        { id: 'round', label: 'Padrão', radius: '6px' },
        { id: 'rounder', label: 'Arredondado', radius: '14px' },
        { id: 'full', label: 'Pílula', radius: '999px' },
    ] as const;

    const handleStyleChange = (style: 'solid' | 'glass' | 'outline') => {
        onChange({ ...profile, buttonStyleType: style });
    };

    const handleRoundnessChange = (round: 'square' | 'round' | 'rounder' | 'full') => {
        onChange({ ...profile, buttonRoundness: round });
    };

    return (
        <div className="space-y-8 animate-fade-in p-1">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                    <MousePointer2 size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Estilo dos Botões</h3>
                    <p className="text-xs text-slate-400">Personalize a aparência dos links</p>
                </div>
            </div>

            {/* Button Style */}
            <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Estilo do Botão</label>
                <div className="grid grid-cols-3 gap-3">
                    {styles.map(style => (
                        <button
                            key={style.id}
                            onClick={() => handleStyleChange(style.id)}
                            className={`group flex flex-col items-center gap-2 p-1 rounded-xl transition-all ${currentStyle === style.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                        >
                            <div className={`w-full h-14 rounded-xl flex items-center justify-center border-2 transition-all ${currentStyle === style.id ? 'border-brand-600 ring-2 ring-brand-50' : 'border-transparent bg-slate-100 group-hover:bg-slate-200'
                                }`}>
                                <div className={`w-3/4 h-1/3 rounded-full ${style.id === 'solid' ? 'bg-slate-300' :
                                    style.id === 'glass' ? 'bg-slate-200/50 border border-white/50 shadow-sm' :
                                        style.id === 'outline' ? 'border-2 border-slate-300' : ''
                                    }`}></div>
                            </div>
                            <span className="text-xs font-medium text-slate-600">{style.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Corner Roundness */}
            <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Arredondamento</label>
                <div className="grid grid-cols-4 gap-3">
                    {roundnessOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => handleRoundnessChange(option.id)}
                            className={`group flex flex-col items-center gap-2 p-1 rounded-xl transition-all ${currentRoundness === option.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                        >
                            <div className={`w-full h-12 flex items-center justify-center rounded-xl border-2 transition-all ${currentRoundness === option.id ? 'border-brand-600 ring-2 ring-brand-50 bg-white' : 'border-transparent bg-slate-100 group-hover:bg-slate-200'
                                }`}>
                                <div
                                    className="w-4 h-4 border-t-2 border-l-2 border-slate-600"
                                    style={{ borderTopLeftRadius: option.radius }}
                                ></div>
                            </div>
                            <span className="text-xs font-medium text-slate-600">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            {/* Color Pickers */}
            <div className="space-y-6">
                {/* Button Color */}
                <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Cor do Botão</label>
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border border-slate-200 group shrink-0">
                            <input
                                type="color"
                                value={profile.customButtonColor || themeButtonColor}
                                onChange={(e) => onChange({ ...profile, customButtonColor: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={profile.customButtonColor || themeButtonColor}
                                onChange={(e) => onChange({ ...profile, customButtonColor: e.target.value })}
                                placeholder={themeButtonColor}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-brand-500 outline-none uppercase"
                            />
                        </div>
                        {(profile.customButtonColor) && (
                            <button
                                onClick={() => onChange({ ...profile, customButtonColor: null })}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Button Text Color */}
                <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Cor do Texto</label>
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border border-slate-200 group shrink-0">
                            <input
                                type="color"
                                value={profile.customTextColor || themeTextColor}
                                onChange={(e) => onChange({ ...profile, customTextColor: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={profile.customTextColor || themeTextColor}
                                onChange={(e) => onChange({ ...profile, customTextColor: e.target.value })}
                                placeholder={themeTextColor}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-brand-500 outline-none uppercase"
                            />
                        </div>
                        {(profile.customTextColor) && (
                            <button
                                onClick={() => onChange({ ...profile, customTextColor: null })}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ButtonsEditor;
