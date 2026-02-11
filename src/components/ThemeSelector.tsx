import React from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES } from '../constants';
import { Zap, Check, Trash2 } from 'lucide-react';
import ProfileRenderer from './ProfileRenderer';

interface ThemeSelectorProps {
    profile: UserProfile;
    links: LinkItem[];
    products: Product[];
    onChange: (profile: UserProfile) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ profile, links, products, onChange }) => {
    const [activeCategory, setActiveCategory] = React.useState<'all' | 'solid' | 'pro'>('all');

    const handleThemeSelect = (themeId: string) => {
        onChange({ ...profile, themeId, customBackground: null });
    };

    const categories = [
        { id: 'all', label: 'Todos' },
        { id: 'solid', label: 'Cores Sólidas' },
        { id: 'pro', label: 'Temas Pro' }
    ] as const;

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 lg:p-8">
            <div className="flex flex-col gap-8 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Temas</h2>
                        <p className="text-sm text-slate-400 mt-1">Selecione um estilo para aplicar ao seu perfil</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Blur Toggle */}
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Blur Fade</span>
                            <button
                                onClick={() => onChange({ ...profile, enableBlur: !profile.enableBlur })}
                                className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${profile.enableBlur ? 'bg-brand-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${profile.enableBlur ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${activeCategory === cat.id
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-105'
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Custom Background Color Picker (Only for Solid Themes) */}
                {(() => {
                    const selectedTheme = THEMES.find(t => t.id === profile.themeId);
                    if (selectedTheme?.category === 'solid') {
                        return (
                            <div className="pt-6 border-t border-slate-50 animate-fade-in">
                                <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <div className="p-1 bg-brand-50 rounded text-brand-600">
                                        <Zap size={14} fill="currentColor" />
                                    </div>
                                    Cor de Fundo Personalizada
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group shrink-0">
                                        <input
                                            type="color"
                                            value={profile.customSolidColor || (selectedTheme.solidColor || '#FFFFFF')}
                                            onChange={(e) => onChange({ ...profile, customSolidColor: e.target.value })}
                                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={profile.customSolidColor || (selectedTheme.solidColor || '#FFFFFF')}
                                            onChange={(e) => onChange({ ...profile, customSolidColor: e.target.value })}
                                            placeholder="#FFFFFF"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-brand-500 outline-none uppercase"
                                        />
                                    </div>
                                    {profile.customSolidColor && (
                                        <button
                                            onClick={() => onChange({ ...profile, customSolidColor: null })}
                                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Resetar para o padrão do tema"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 italic">* Esta opção só está disponível para temas de cor sólida.</p>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-8">
                {(() => {
                    let displayThemes = [...THEMES];

                    // 1. Filter by category
                    if (activeCategory === 'solid') {
                        displayThemes = displayThemes.filter(t => t.category === 'solid');
                    } else if (activeCategory === 'pro') {
                        displayThemes = displayThemes.filter(t => t.isPro);
                    }

                    // 2. Filter 'animated-nodus-official' for non-noduscc users
                    if (profile.username !== 'noduscc') {
                        displayThemes = displayThemes.filter(t => t.id !== 'animated-nodus-official');
                    } else if (activeCategory === 'all' || activeCategory === 'pro') {
                        // 3. Move nodus theme to top if it should be visible
                        const nodusTheme = displayThemes.find(t => t.id === 'animated-nodus-official');
                        if (nodusTheme) {
                            displayThemes = displayThemes.filter(t => t.id !== 'animated-nodus-official');
                            displayThemes.unshift(nodusTheme);
                        }
                    }

                    return displayThemes.map((theme) => {
                        const isSelected = profile.themeId === theme.id && !profile.customBackground;

                        return (
                            <div key={theme.id} className="flex flex-col gap-3 group animate-in fade-in zoom-in duration-300">
                                <span className={`text-[11px] font-bold uppercase tracking-widest px-1 transition-colors ${isSelected ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                                    }`}>
                                    {theme.name}
                                </span>

                                <button
                                    onClick={() => {
                                        if (theme.isPro && (profile.planType === 'free' || !profile.planType)) {
                                            return;
                                        }
                                        handleThemeSelect(theme.id);
                                    }}
                                    className={`relative rounded-[2rem] overflow-hidden aspect-[9/16] border-2 transition-all duration-300 ${isSelected
                                        ? 'border-brand-600 shadow-2xl ring-4 ring-brand-50 z-10'
                                        : 'border-slate-100 hover:border-brand-200 hover:shadow-lg'
                                        } ${theme.isPro && (profile.planType === 'free' || !profile.planType) ? 'cursor-not-allowed grayscale-[0.5] opacity-80' : ''}`}
                                >
                                    {/* Profile Preview - Fixed Scaling to fill entire card */}
                                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-white rounded-[2rem]">
                                        <div className="absolute top-0 left-0 w-[300%] h-[300%] scale-[0.3333] origin-top-left">
                                            <ProfileRenderer
                                                profile={{ ...profile, themeId: theme.id, customBackground: null, customSolidColor: null }}
                                                links={links}
                                                products={products}
                                                isPreview={false}
                                                isStatic={true}
                                            />
                                        </div>
                                    </div>

                                    {/* Pro Badge */}
                                    {theme.isPro && (profile.planType === 'free' || !profile.planType) && (
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
                                            <div className="bg-brand-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
                                                <Zap size={10} fill="currentColor" />
                                                PRO
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected Badge */}
                                    {isSelected && (
                                        <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-lg animate-fade-in">
                                            <Check size={20} strokeWidth={3} />
                                        </div>
                                    )}

                                    {/* Selection Overlay */}
                                    {isSelected && <div className="absolute inset-0 border-[3px] border-brand-600/20 rounded-[2rem] pointer-events-none"></div>}
                                </button>
                            </div>
                        );
                    });
                })()}
            </div>
        </div>
    );
};

export default ThemeSelector;
