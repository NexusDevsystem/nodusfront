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
        onChange({ ...profile, themeId, customBackground: null, customSolidColor: null });
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
        if (theme.id === 'animated-nodus-official' && profile.username !== 'noduscc') return false;

        if (activeCategory === 'all') return true;
        if (activeCategory === 'pro') return theme.isPro;
        return theme.category === activeCategory;
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
                        onClick={() => onChange({ ...profile, themeId: 'custom', customBackground: profile.customBackground || null, customSolidColor: profile.customSolidColor || null })}
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

                    return (
                        <motion.div
                            layout
                            key={theme.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-1.5 group cursor-pointer"
                            onClick={() => {
                                if (isLocked) {
                                    // Let parent component know we want to upgrade
                                    // We can use a custom event or a specific themeId to signal this, 
                                    // but better to just call onChange with something that triggers the modal or use a prop
                                    (window as any).dispatchEvent(new CustomEvent('open-billing-modal'));
                                    return;
                                }
                                handleThemeSelect(theme.id);
                            }}
                        >
                            <div className={`relative aspect-[4/5] w-full rounded-xl border overflow-hidden transition-all ${isSelected ? 'border-[#32a800] ring-2 ring-[#32a800]/20 border-2' : 'border-slate-100 group-hover:border-slate-200'}`}>
                                {/* Theme Preview */}
                                <div className={`absolute inset-0 z-0 pointer-events-none origin-top-left scale-[0.3] w-[333%] h-[333%] ${isLocked ? 'blur-[2px] opacity-80' : ''}`}>
                                    <ProfileRenderer
                                        profile={{ ...profile, themeId: theme.id, customBackground: null, customSolidColor: null }}
                                        links={links}
                                        products={products}
                                        isPreview={false}
                                        isStatic={true}
                                    />
                                </div>

                                {/* Aa Text & Button Preview Overlay */}
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-2 pointer-events-none">
                                    <div className="w-full flex justify-end">
                                        {theme.isPro && (
                                            <div className={`w-4 h-4 rounded-full ${isLocked ? 'bg-orange-500 shadow-orange-500/20 shadow-lg' : 'bg-slate-900/80backdrop-blur-sm'} flex items-center justify-center text-white`}>
                                                <Zap size={8} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    {!isLocked && (
                                        <span className="text-lg font-bold mt-1" style={{ color: theme.textClass.includes('white') ? '#fff' : '#000' }}>
                                            Aa
                                        </span>
                                    )}

                                    {isLocked && (
                                        <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-800">Pro</span>
                                        </div>
                                    )}

                                    {!isLocked && (
                                        <div className={`w-full h-2.5 mt-auto rounded-md shadow-sm border border-white/10 ${theme.buttonClass.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('border-')).join(' ')} opacity-90`} />
                                    )}
                                </div>

                                {isSelected && (
                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-20">
                                        <div className="w-6 h-6 rounded-full bg-[#32a800] flex items-center justify-center text-white shadow-lg border-2 border-white">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold truncate w-full text-center ${isSelected ? 'text-[#32a800]' : 'text-slate-500'}`}>
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
