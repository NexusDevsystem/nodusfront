import React from 'react';
import { UserProfile, LinkItem, Product } from '../types';
import { THEMES } from '../constants';
import { Zap, Check, Trash2, Paintbrush } from 'lucide-react';
import ProfileRenderer from './ProfileRenderer';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface ThemeSelectorProps {
    profile: UserProfile;
    links: LinkItem[];
    products: Product[];
    onChange: (profile: UserProfile) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ profile, links, products, onChange }) => {
    const [activeCategory, setActiveCategory] = React.useState<string>('all');

    const handleThemeSelect = (themeId: string) => {
        // Find the selected theme
        const theme = THEMES.find(t => t.id === themeId);

        // Reset ALL custom overrides when selecting a preset theme
        // This ensures the theme "soul" is preserved and pure
        onChange({
            ...profile,
            themeId,
            // Reset background
            customBackground: null,
            customSolidColor: null,
            customSecondaryColor: null,
            // Reset text & button colors
            customTextColor: null,
            customButtonColor: null,
            customButtonTextColor: null,
            // Reset fonts & button styling
            fontFamily: theme?.fontFamily || "'Inter', sans-serif",
            buttonRoundness: null, // Force NULL to clear DB value
            fontWeight: null,
            fontItalic: false,
            fontSize: null,
            // Reset layout
            headerLayout: 'classic',
            headerStyle: 'text'
        });
    };

    const categories = [
        { id: 'all', label: 'Todos' },
        { id: 'gradient', label: 'Gradientes' },
        { id: 'music', label: 'Música' },
        { id: 'creative', label: 'Criativo' },
        { id: 'kawaii', label: 'Kawaii' },
        { id: 'pro', label: 'Temas Pro' }
    ] as const;

    const filteredThemes = THEMES.filter(theme => {
        // Filter official theme
        if (theme.id === 'custom') return false;
        if (theme.id === 'animated-nodus-official' && profile.username !== 'noduscc') return false;

        if (activeCategory === 'all') return true;
        if (activeCategory === 'pro') return theme.isPro;
        return theme.category === activeCategory;
    }).sort((a, b) => {
        // Prioritize Free themes (isPro: false) over Pro themes (isPro: true)
        if (a.isPro === b.isPro) return 0;
        return a.isPro ? 1 : -1;
    });

    return (
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 p-6 md:p-10 shadow-sm">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Temas</h2>
                        <p className="text-xs text-slate-500 mt-1">Escolha uma identidade visual</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blur Fade</span>
                        <button
                            onClick={() => onChange({ ...profile, enableBlur: !profile.enableBlur })}
                            className={`relative w-10 h-5 rounded-full transition-colors ${profile.enableBlur ? 'bg-[#32a800]' : 'bg-slate-200'}`}
                        >
                            <motion.div
                                animate={{ x: profile.enableBlur ? 20 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>
                </div>

                {/* Categories Scrollable */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? 'bg-[#32a800] text-white shadow-md'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
                {/* Custom Theme Card */}
                {activeCategory === 'all' && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                        onClick={() => onChange({ ...profile, themeId: 'custom' })}
                    >
                        <div
                            className={`relative aspect-[4/5] w-full rounded-xl border-2 transition-all flex flex-col items-center justify-center ${profile.themeId === 'custom' ? 'border-[#32a800] ring-2 ring-[#32a800]/20' : 'border-slate-200 group-hover:border-slate-300'}`}
                            style={{ backgroundColor: profile.customSolidColor || '#f8fafc' }}
                        >
                            {profile.customBackground ? (
                                <img src={profile.customBackground} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <Paintbrush
                                    className={profile.customSolidColor ? 'mix-blend-difference' : 'text-slate-400 group-hover:text-slate-500'}
                                    size={20}
                                    strokeWidth={1.5}
                                    style={{ color: profile.customSolidColor ? '#fff' : undefined }}
                                />
                            )}

                            {profile.themeId === 'custom' && (
                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10">
                                    <div className="w-6 h-6 rounded-full bg-[#32a800] flex items-center justify-center text-white shadow-lg border-2 border-white">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className={`text-[10px] font-bold ${profile.themeId === 'custom' ? 'text-[#32a800]' : 'text-slate-500'}`}>Custom</span>
                    </motion.div>
                )}

                {filteredThemes.map((theme) => {
                    const isSelected = profile.themeId === theme.id && !profile.customBackground;
                    const isLocked = theme.isPro && profile.planType === 'free';
                    const isActive = isSelected; // Alias for clarity

                    // Extract button visual styles (strip layout)
                    const buttonVisuals = theme.buttonClass
                        .replace(/\b(w-full|flex|items-center|justify-between|py-\d+|px-\d+|gap-\d+)\b/g, '')
                        .trim();

                    return (
                        <motion.div
                            layout
                            key={theme.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col gap-2 group cursor-pointer relative"
                            onClick={() => {
                                if (isLocked) {
                                    (window as any).dispatchEvent(new CustomEvent('open-billing-modal'));
                                    return;
                                }
                                handleThemeSelect(theme.id);
                            }}
                        >
                            {/* Card Container */}
                            <div className={`relative aspect-[3/4] w-full rounded-2xl overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-[#32a800] ring-offset-2 shadow-md' : 'border border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>

                                {/* 1. Background Layer */}
                                <div
                                    className={`absolute inset-0 ${theme.backgroundClass}`}
                                    style={{ backgroundColor: theme.solidColor }}
                                />

                                {/* 2. Content Abstraction Layer */}
                                <div className="absolute inset-0 p-4 flex flex-col items-center justify-center gap-4">

                                    {/* Typography Preview */}
                                    <div className="flex-1 flex items-center justify-center w-full">
                                        <div
                                            className={`${theme.textClass} text-4xl font-bold opacity-90`}
                                            style={{ fontFamily: theme.fontFamily }}
                                        >
                                            Aa
                                        </div>
                                    </div>

                                    {/* Button Preview (Pill) */}
                                    <div className="w-full h-10 flex items-center justify-center">
                                        <div className={`h-8 w-16 ${buttonVisuals} flex items-center justify-center shadow-sm`}>
                                            <div className="w-6 h-1 bg-current opacity-20 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Status Overlays */}
                                {isActive && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#32a800] text-white rounded-full flex items-center justify-center shadow-sm z-10">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                )}

                                {/* Pro Badge */}
                                {theme.isPro && (
                                    <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider z-10 ${isLocked ? 'bg-slate-900 text-white' : 'bg-black/10 text-black/50'}`}>
                                        Pro
                                    </div>
                                )}

                                {/* Lock Overlay */}
                                {isLocked && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                                        <div className="bg-white p-2 rounded-full shadow-lg">
                                            <Zap size={16} className="text-slate-400 fill-slate-400" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <span className={`text-xs font-medium text-center truncate px-1 transition-colors ${isActive ? 'text-[#32a800]' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                {theme.name}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Custom Background Section */}
            {profile.themeId === 'custom' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 pt-8 border-t border-slate-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Paintbrush size={16} className="text-[#32a800]" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fundo Personalizado</h3>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gradiente</span>
                                <button
                                    onClick={() => {
                                        if (profile.customSecondaryColor) {
                                            onChange({ ...profile, customSecondaryColor: null });
                                        } else {
                                            onChange({ ...profile, customSecondaryColor: '#6366f1', customBackground: null });
                                        }
                                    }}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${profile.customSecondaryColor ? 'bg-[#32a800]' : 'bg-slate-200'}`}
                                >
                                    <motion.div
                                        animate={{ x: profile.customSecondaryColor ? 20 : 2 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Primary Color */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                {profile.customSecondaryColor ? 'Cor Primária' : 'Cor Sólida'}
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-md">
                                    <input
                                        type="color"
                                        value={profile.customSolidColor || '#ffffff'}
                                        onChange={(e) => onChange({ ...profile, customSolidColor: e.target.value, customBackground: null })}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={profile.customSolidColor || ''}
                                        onChange={(e) => onChange({ ...profile, customSolidColor: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`, customBackground: null })}
                                        placeholder="#FFFFFF"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#32a800] outline-none transition-all text-sm font-mono uppercase font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Secondary Color (Visible only if gradient is active) */}
                        <AnimatePresence>
                            {profile.customSecondaryColor && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-2"
                                >
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Cor Secundária</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-md">
                                            <input
                                                type="color"
                                                value={profile.customSecondaryColor || '#6366f1'}
                                                onChange={(e) => onChange({ ...profile, customSecondaryColor: e.target.value, customBackground: null })}
                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={profile.customSecondaryColor || ''}
                                                onChange={(e) => onChange({ ...profile, customSecondaryColor: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`, customBackground: null })}
                                                placeholder="#6366F1"
                                                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#32a800] outline-none transition-all text-sm font-mono uppercase font-bold"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Presets */}
                    <div className="mt-8">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-3 block">Sugestões</label>
                        <div className="grid grid-cols-6 gap-3">
                            {(profile.customSecondaryColor ? [
                                ['#6366f1', '#ec4899'], // Indigo to Pink
                                ['#3b82f6', '#10b981'], // Blue to Green
                                ['#f59e0b', '#ef4444'], // Orange to Red
                                ['#8b5cf6', '#3b82f6'], // Violet to Blue
                                ['#000000', '#333333'], // Black to Dark Grey
                                ['#acc8a2', '#4d634d']  // Nodus palette
                            ] : ['#000000', '#FFFFFF', '#6366f1', '#ec4899', '#f59e0b', '#10b981']).map((preset) => (
                                <button
                                    key={Array.isArray(preset) ? preset.join('-') : preset}
                                    onClick={() => {
                                        if (Array.isArray(preset)) {
                                            onChange({ ...profile, customSolidColor: preset[0], customSecondaryColor: preset[1], customBackground: null });
                                        } else {
                                            onChange({ ...profile, customSolidColor: preset, customSecondaryColor: null, customBackground: null });
                                        }
                                    }}
                                    className="aspect-square rounded-xl border border-slate-100 transition-transform hover:scale-105 active:scale-95 shadow-sm overflow-hidden"
                                    style={{
                                        background: Array.isArray(preset)
                                            ? `linear-gradient(135deg, ${preset[0]}, ${preset[1]})`
                                            : preset
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={() => onChange({ ...profile, customSolidColor: null, customSecondaryColor: null })}
                            className="flex-1 h-12 flex items-center justify-center gap-2 text-slate-500 hover:text-red-500 rounded-xl border border-slate-100 hover:bg-red-50 transition-all active:scale-95 font-bold text-xs uppercase tracking-wider"
                        >
                            <Trash2 size={16} />
                            Limpar Customização
                        </button>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-6 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                        * O modo customizado permite criar fundos únicos. Ative o <b>Gradiente</b> para misturar duas cores ou use uma <b>Cor Sólida</b> para minimalismo.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default ThemeSelector;
