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
    const isDarkTheme = currentTheme.textClass?.includes('text-white') || currentTheme.id.includes('dark') || currentTheme.id.includes('black');
    const themeButtonColor = currentTheme.buttonHex || '#000000';
    const themeTextColor = currentTheme.textHex || '#000000'; // We might need this too

    // Default values
    const currentStyle = profile.buttonStyleType || 'solid';
    const currentRoundness = profile.buttonRoundness || (profile.buttonStyle === 'soft-rect' ? 'rounder' : 'full');

    const styles = [
        { id: 'solid', label: 'Sólido' },
        { id: 'outline', label: 'Contorno' },
        { id: 'soft', label: 'Suave' },
        { id: 'glass', label: 'Vidro' },
        { id: 'hard-shadow', label: 'Sombra Dura' },
        { id: 'push', label: '3D Push' },
        { id: 'gradient', label: 'Gradiente' },
        { id: 'cyber', label: 'Cyber' },
        { id: 'neon', label: 'Neon' },
        { id: 'skeuo', label: 'Old School' },
        { id: 'minimal-hover', label: 'Minimal' },
        { id: 'paper', label: 'Paper' },
        { id: 'liquid', label: 'Liquid' },
    ] as const;

    const roundnessOptions = [
        { id: 'square', label: 'Quadrado', radius: '0px' },
        { id: 'round', label: 'Padrão', radius: '6px' },
        { id: 'rounder', label: 'Arredondado', radius: '14px' },
        { id: 'full', label: 'Pílula', radius: '999px' },
    ] as const;

    const handleStyleChange = (style: any) => {
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
            <style>{`
                @keyframes wobble {
                    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                }
            `}</style>
            {/* Button Style */}
            <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Estilo do Botão</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {styles.map(style => {
                        // Logic adapted from ProfileRenderer.tsx to ensure 1:1 match
                        const getPreviewStyle = () => {
                            // 1. Determine Base Color
                            const defaultBaseColor = currentTheme.buttonHex || ((isDarkTheme || currentTheme.id === 'glass') ? '#ffffff' : '#0f172a');
                            const baseColor = profile.customButtonColor || defaultBaseColor;

                            // 2. Determine Text Color
                            let textColor = profile.customTextColor;
                            if (!textColor) {
                                if (['solid', 'push', 'gradient', 'cyber', 'skeuo'].includes(style.id)) {
                                    if (profile.customButtonColor) {
                                        textColor = '#ffffff'; // Fill buttons with custom color -> White text
                                    } else if (currentTheme.textHex && !profile.customButtonColor) {
                                        textColor = currentTheme.textHex;
                                    } else {
                                        textColor = (isDarkTheme || currentTheme.id === 'glass') ? '#000000' : '#ffffff';
                                    }
                                } else if (style.id === 'neon') {
                                    textColor = baseColor;
                                } else {
                                    // Outline, Soft, Glass, Hard-Shadow: Match text to base color
                                    textColor = baseColor;
                                }
                            }

                            // 3. Construct CSS
                            const css: React.CSSProperties = {
                                borderRadius: roundnessOptions.find(r => r.id === currentRoundness)?.radius || '999px',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            };

                            switch (style.id) {
                                case 'solid':
                                    css.backgroundColor = baseColor;
                                    css.color = textColor;
                                    css.border = '2px solid transparent';
                                    break;

                                case 'outline':
                                    css.backgroundColor = 'transparent';
                                    css.color = textColor;
                                    css.border = `2px solid ${baseColor}`;
                                    break;

                                case 'soft':
                                    css.backgroundColor = `${baseColor}26`;
                                    css.color = baseColor;
                                    css.fontWeight = 600;
                                    break;

                                case 'glass':
                                    css.backgroundColor = `${baseColor}33`;
                                    css.backdropFilter = 'blur(12px)';
                                    css.WebkitBackdropFilter = 'blur(12px)';
                                    css.color = textColor;
                                    css.border = `1px solid ${baseColor}4D`;
                                    css.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.05)';
                                    break;

                                case 'hard-shadow':
                                    css.backgroundColor = isDarkTheme ? '#000000' : '#ffffff';
                                    css.color = baseColor;
                                    css.border = `2px solid ${baseColor}`;
                                    css.boxShadow = `4px 4px 0px ${baseColor}`;
                                    break;

                                case 'push':
                                    css.backgroundColor = baseColor;
                                    css.color = textColor;
                                    css.borderBottom = `6px solid rgba(0,0,0,0.2)`;
                                    break;

                                case 'gradient':
                                    css.background = `linear-gradient(135deg, ${baseColor}, ${baseColor}88)`;
                                    css.color = textColor;
                                    css.border = 'none';
                                    css.boxShadow = `0 4px 15px ${baseColor}66`;
                                    break;

                                case 'cyber':
                                    css.backgroundColor = baseColor;
                                    css.color = textColor;
                                    css.clipPath = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';
                                    css.borderRadius = '0px';
                                    css.borderLeft = '2px solid rgba(255,255,255,0.2)';
                                    css.fontFamily = 'monospace';
                                    css.letterSpacing = '1px';
                                    break;

                                case 'neon':
                                    css.backgroundColor = 'transparent';
                                    css.color = baseColor;
                                    css.border = `2px solid ${baseColor}`;
                                    css.boxShadow = `0 0 10px ${baseColor}, inset 0 0 5px ${baseColor}`;
                                    css.textShadow = `0 0 5px ${baseColor}`;
                                    break;

                                case 'skeuo':
                                    css.backgroundColor = baseColor;
                                    css.color = textColor;
                                    css.borderTop = '2px solid rgba(255,255,255,0.5)';
                                    css.borderLeft = '2px solid rgba(255,255,255,0.5)';
                                    css.borderRight = '2px solid rgba(0,0,0,0.3)';
                                    css.borderBottom = '2px solid rgba(0,0,0,0.3)';
                                    css.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
                                    break;

                                case 'minimal-hover':
                                    css.backgroundColor = 'transparent';
                                    css.color = baseColor;
                                    css.border = 'none';
                                    css.borderBottom = `1px solid ${baseColor}`;
                                    css.borderRadius = '0px';
                                    css.boxShadow = 'none';
                                    break;

                                case 'paper':
                                    css.backgroundColor = baseColor;
                                    css.color = textColor;
                                    css.clipPath = 'polygon(3% 0, 7% 1%, 11% 0%, 16% 2%, 20% 0, 23% 2%, 28% 2%, 32% 1%, 35% 1%, 39% 3%, 41% 1%, 45% 0%, 47% 2%, 50% 2%, 53% 0, 58% 2%, 60% 2%, 63% 1%, 65% 0%, 69% 2%, 72% 2%, 75% 1%, 79% 1%, 82% 1%, 85% 0, 88% 1%, 91% 0, 93% 2%, 96% 0, 98% 1%, 100% 0, 100% 7%, 99% 11%, 100% 13%, 100% 22%, 99% 23%, 100% 27%, 100% 30%, 100% 36%, 99% 40%, 100% 43%, 100% 50%, 99% 55%, 100% 60%, 100% 66%, 99% 68%, 100% 71%, 100% 77%, 100% 80%, 99% 83%, 100% 89%, 100% 96%, 98% 98%, 95% 99%, 92% 99%, 89% 100%, 86% 99%, 83% 100%, 78% 99%, 74% 99%, 70% 100%, 66% 99%, 63% 100%, 59% 99%, 56% 100%, 53% 99%, 49% 100%, 46% 99%, 42% 100%, 39% 99%, 36% 100%, 31% 99%, 27% 100%, 24% 99%, 21% 100%, 18% 99%, 13% 100%, 9% 99%, 6% 100%, 3% 99%, 0 100%, 1% 97%, 0% 94%, 1% 89%, 0% 84%, 1% 81%, 0 76%, 0 73%, 1% 69%, 0% 64%, 1% 60%, 0% 55%, 0 51%, 1% 47%, 0% 44%, 1% 40%, 0% 36%, 0 31%, 1% 27%, 0% 23%, 1% 18%, 0% 15%, 0 10%, 1% 6%, 0% 0)';
                                    css.borderRadius = '0px';
                                    css.boxShadow = '4px 4px 0px rgba(0,0,0,0.1)';
                                    break;

                                case 'liquid':
                                    css.backgroundColor = baseColor;
                                    css.color = textColor;
                                    css.borderRadius = '60% 40% 30% 70% / 60% 30% 70% 40%';
                                    css.animation = 'wobble 4s ease-in-out infinite';
                                    css.boxShadow = `0 10px 20px ${baseColor}4D`;
                                    css.border = 'none';
                                    break;
                            }

                            return css;
                        };

                        const previewStyle = getPreviewStyle();

                        return (
                            <button
                                key={style.id}
                                onClick={() => handleStyleChange(style.id)}
                                className={`group relative h-16 w-full flex items-center justify-center text-sm font-bold transition-all duration-300 select-none ${currentStyle === style.id
                                    ? 'ring-2 ring-offset-2 ring-brand-600 scale-[1.02]'
                                    : 'hover:scale-[1.01] hover:opacity-90'
                                    }`}
                                style={previewStyle}
                            >
                                {style.label}
                            </button>
                        );
                    })}
                </div>
            </div >

            {/* Corner Roundness */}
            < div >
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
            </div >

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
        </div >
    );
};

export default ButtonsEditor;
